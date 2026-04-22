import { useEffect, useMemo, useState, useCallback } from "react";
import styled, { css } from "styled-components";
import { pulse } from "../../shared/styles/animations";
import logger from "../../shared/utils/logger";
import {
  FaCheck,
  FaMapMarkerAlt,
  FaCreditCard,
  FaMobileAlt,
  FaUniversity,
  FaStore,
  FaTruck,
  FaSearchLocation,
  FaTimes,
} from "react-icons/fa";
import { useGetUserAddress, useCreateAddress } from "../../shared/hooks/useAddress";
import { useCreateOrder } from "../../shared/hooks/useOrder";
import { useNavigate } from "react-router-dom";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import {
  useGetCart,
  getCartStructure,
  useCartActions,
  useCartTotals,
} from "../../shared/hooks/useCart";
import { useApplyCoupon } from "../../shared/hooks/useCoupon";
import useAuth from "../../shared/hooks/useAuth";
import { useWalletBalance } from "../../shared/hooks/useWallet";
import storage from "../../shared/utils/storage";
import { usePaystackPayment } from "../../shared/hooks/usePaystackPayment";
import { useValidateCart } from "../../shared/hooks/useCartValidation";
import {
  sanitizeCouponCode,
  sanitizeText,
  sanitizePhone,
  validateQuantity,
  isValidPaystackUrl,
} from "../../shared/utils/sanitize";
import { useGetPickupCenters, useCalculateShippingQuote } from "../../shared/hooks/useShipping";
import ShippingOptions from "./ShippingOptions";
import Button from "../../shared/components/Button";
import { PrimaryButton, GhostButton } from "../../shared/components/ui/Buttons";
import { Card } from "../../shared/components/ui/Cards";
import { ErrorState, LoadingState } from "../../components/loading";
import useDynamicPageTitle from "../../shared/hooks/useDynamicPageTitle";
import seoConfig from "../../shared/config/seoConfig";
import NeighborhoodAutocomplete from "../../shared/components/NeighborhoodAutocomplete";
import LoadingSpinner from "../../shared/components/LoadingSpinner";
import locationApi from "../../shared/services/locationApi";
import neighborhoodService from "../../shared/services/neighborhoodApi";
import { isEazShopProduct } from "../../shared/utils/isEazShopProduct";
import { orderService } from "../../shared/services/orderApi";
import shippingApi from "../../shared/services/shippingApi";
import {
  FREE_SHIPPING_MIN_FALLBACK_GHS,
  CHECKOUT_BANK_TRANSFER,
} from "../../shared/config/appConfig";

// ────────────────────────────────────────────────
// Helper functions
// ────────────────────────────────────────────────

/**
 * Resolve SKU from cart item
 * CRITICAL: Variants are identified by SKU - never by object, never by ID
 * 
 * @param {Object} cartItem - Cart item with product and variant information
 * @returns {string|null} - SKU string or null if not found
 */
const resolveSkuFromCartItem = (cartItem) => {
  // Case 1: variantSku field (preferred - new contract)
  if (cartItem.variantSku) {
    return cartItem.variantSku.trim().toUpperCase();
  }

  // Case 2: variant object with SKU (backward compatibility)
  if (cartItem.variant?.sku) {
    return cartItem.variant.sku.trim().toUpperCase();
  }

  // Case 3: variant ID → resolve from product variants (backward compatibility)
  if (cartItem.variant && Array.isArray(cartItem.product?.variants)) {
    const variantId = typeof cartItem.variant === 'string'
      ? cartItem.variant
      : (cartItem.variant._id || cartItem.variant.id);

    if (variantId) {
      const found = cartItem.product.variants.find(
        (v) => {
          const vId = v._id?.toString ? v._id.toString() : String(v._id);
          const searchId = variantId.toString ? variantId.toString() : String(variantId);
          return vId === searchId;
        }
      );
      if (found?.sku) {
        return found.sku.trim().toUpperCase();
      }
    }
  }

  // Case 4: variantId field (string ID) - backward compatibility
  if (cartItem.variantId && Array.isArray(cartItem.product?.variants)) {
    const found = cartItem.product.variants.find(
      (v) => {
        const vId = v._id?.toString ? v._id.toString() : String(v._id);
        const searchId = cartItem.variantId.toString ? cartItem.variantId.toString() : String(cartItem.variantId);
        return vId === searchId;
      }
    );
    if (found?.sku) {
      return found.sku.trim().toUpperCase();
    }
  }

  // Case 5: single-variant product auto-assignment
  if (Array.isArray(cartItem.product?.variants) && cartItem.product.variants.length === 1) {
    const sku = cartItem.product.variants[0].sku;
    if (sku) {
      return sku.trim().toUpperCase();
    }
  }

  return null;
};

const normalizeApiResponse = (response) => {
  // Handle null/undefined
  if (!response) {
    logger.warn("[normalizeApiResponse] Response is null/undefined");
    return null;
  }

  // Try multiple normalization paths
  let payload = null;

  // Path 1: response.data.data (double nested)
  if (response?.data?.data) {
    payload = response.data.data;
  }
  // Path 2: response.data (single nested)
  else if (response?.data) {
    payload = response.data;
  }
  // Path 3: response directly
  else {
    payload = response;
  }

  return payload;
};

const getShippingItems = (rawItems) => {
  if (!rawItems || !Array.isArray(rawItems) || rawItems.length === 0) {
    if (!import.meta.env.PROD) logger.warn("⚠️ getShippingItems: rawItems is empty or not an array");
    return [];
  }

  const mapped = rawItems
    .map((item) => {
      // Handle different seller formats:
      // 1. seller is an object with _id: { _id: "...", name: "..." }
      // 2. seller is just an ID string: "507f1f77bcf86cd799439011"
      // 3. seller is in product.seller field
      let sellerId = null;

      if (item.product?.seller) {
        if (typeof item.product.seller === 'string') {
          sellerId = item.product.seller;
        } else if (item.product.seller._id) {
          sellerId = item.product.seller._id;
        } else if (item.product.seller.id) {
          sellerId = item.product.seller.id;
        }
      }

      // Also check if seller is directly on the product
      if (!sellerId && item.product?.sellerId) {
        sellerId = item.product.sellerId;
      }

      return {
        productId: item.product?._id || item.product?.id || item.productId,
        sellerId: sellerId,
        quantity: item.quantity || 1,
      };
    });

  const filtered = mapped.filter((item) => {
    const isValid = item.productId && item.sellerId;
    if (!isValid && !import.meta.env.PROD) {
      logger.warn("⚠️ Filtering out item - missing productId or sellerId:", item);
    }
    return isValid;
  });

  return filtered;
};

const validateNewAddress = (newAddress) => {
  const errors = {};
  // Core required fields for Ghana delivery
  const requiredFields = [
    "fullName",
    "streetAddress",
    "area",
    "city",
    "region",
    "contactPhone",
    "landmark",
  ];

  requiredFields.forEach((field) => {
    if (!newAddress[field] || !String(newAddress[field]).trim()) {
      if (field === "landmark") {
        errors[field] =
          "Please add a nearby landmark to help our rider find your location.";
      } else if (field === "contactPhone") {
        errors[field] = "A delivery contact phone number is required.";
      } else {
        errors[field] = "This field is required";
      }
    }
  });

  // Validate city (Ghana delivery scope)
  if (
    newAddress.city &&
    !["ACCRA", "TEMA"].includes(newAddress.city.toUpperCase())
  ) {
    errors.city = "Saiisai currently delivers only in Accra and Tema.";
  }

  // Ghana phone validation
  if (newAddress.contactPhone) {
    const digits = newAddress.contactPhone.replace(/\D/g, "");
    const pattern =
      /^(020|023|024|025|026|027|028|029|050|054|055|056|057|059)\d{7}$/;
    if (!pattern.test(digits)) {
      errors.contactPhone = "Please enter a valid Ghana mobile number (e.g. 0241234567).";
    }
  }

  // GhanaPost format if provided (optional but encouraged)
  if (
    newAddress.digitalAddress &&
    !/^[A-Z]{2}-\d{3}-\d{4}$/.test(newAddress.digitalAddress.trim().toUpperCase())
  ) {
    errors.digitalAddress = "Invalid GhanaPost GPS format. Use AA-123-4567 (e.g. GA-123-4567).";
  }

  return errors;
};

// ────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────

const CheckoutPage = () => {
  // SEO - Set page title and meta tags
  useDynamicPageTitle(seoConfig.checkout);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Auth & data hooks
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { data: addressData, isLoading: isAddressLoading } = useGetUserAddress();
  const { mutate: createAddress, isPending: isAddressCreating, error: createAddressError } =
    useCreateAddress();
  const { data: cartData, isLoading: isCartLoading } = useGetCart();
  const { mutate: applyCoupon, isPending: isApplyingCoupon, error: couponError } =
    useApplyCoupon();
  const { clearCart } = useCartActions();
  const { total: subTotal } = useCartTotals();
  const { mutate: createOrder, isPending: isCreatingOrder, error: createOrderError } =
    useCreateOrder();
  const { initializePaystackPayment } = usePaystackPayment();
  const { data: walletData, isLoading: isCreditBalanceLoading } = useWalletBalance();
  const { mutate: validateCart, isPending: isValidatingCart } = useValidateCart();

  // ────────────────────────────────────────────────
  // Local state
  // ────────────────────────────────────────────────

  const [couponCode, setCouponCode] = useState("");
  // SECURITY: Discount should come from backend, not frontend calculation
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState("");
  // SECURITY: Backend-calculated totals (replaces frontend calculations)
  const [backendTotals, setBackendTotals] = useState(null);
  const [activeTab, setActiveTab] = useState("existing");
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("payment_on_delivery");
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [couponData, setCouponData] = useState(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  // Delivery method states
  const [deliveryMethod, setDeliveryMethod] = useState("dispatch");
  const [hasChosenDelivery, setHasChosenDelivery] = useState(false);
  const [deliverySpeed, setDeliverySpeed] = useState("standard");
  const [isFragileItem, setIsFragileItem] = useState(false); // "standard" or "same_day"
  const [selectedPickupCenterId, setSelectedPickupCenterId] = useState(null);
  const [shippingFee, setShippingFee] = useState(0);
  const [shippingQuote, setShippingQuote] = useState(null);

  // Credit balance data
  const creditBalance = useMemo(() => {
    // Use availableBalance first (what user can actually spend), then fallback to balance
    const availableBalance = walletData?.data?.wallet?.availableBalance ??
      walletData?.data?.wallet?.balance ??
      0;

    if (import.meta.env.DEV && walletData) {
      logger.debug('[CheckoutPage] 💰 Wallet balance details:', {
        availableBalance: walletData?.data?.wallet?.availableBalance,
        balance: walletData?.data?.wallet?.balance,
        holdAmount: walletData?.data?.wallet?.holdAmount,
        calculatedAvailableBalance: walletData?.data?.wallet?.balance
          ? Math.max(0, (walletData.data.wallet.balance || 0) - (walletData.data.wallet.holdAmount || 0))
          : 0,
        finalCreditBalance: availableBalance,
      });
    }

    return availableBalance;
  }, [walletData]);

  // Address form state
  const [newAddress, setNewAddress] = useState({
    fullName: "",
    streetAddress: "",
    area: "",
    landmark: "",
    city: "",
    region: "",
    digitalAddress: "",
    contactPhone: "",
  });

  // Location detection state
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");
  // Auto-detected neighborhoods (from GPS → reverse geocode → neighborhood search)
  // When populated, we show a <select> so user can pick the exact neighborhood from the matches
  const [autoNeighborhoodOptions, setAutoNeighborhoodOptions] = useState([]);

  // ────────────────────────────────────────────────
  // Derived data
  // ────────────────────────────────────────────────

  const address = useMemo(
    () =>
      addressData?.data?.addresses ||
      addressData?.data?.data?.addresses ||
      [],
    [addressData]
  );

  const defaultAddress = useMemo(
    () => address.find((addr) => addr.isDefault),
    [address]
  );

  const rawItems = useMemo(() => {
    const items = getCartStructure(cartData);
    return items || [];
  }, [cartData]);

  const products = useMemo(
    () =>
      (rawItems || []).map((item) => ({
        product: item.product,
        quantity: item.quantity,
        sku: item.sku || item.variantSku || resolveSkuFromCartItem(item),
        unitPrice: item.unitPrice,
        originalUnitPrice: item.originalUnitPrice,
      })),
    [rawItems]
  );

  const hasPreorderItem = useMemo(
    () => products.some((item) => item.product?.isPreOrder),
    [products],
  );

  const { data: freeDeliveryResponse, isError: freeDeliveryError, isLoading: freeDeliveryLoading } =
    useQuery({
      queryKey: ["shipping", "free-delivery"],
      queryFn: () => shippingApi.getFreeDeliveryInfo(),
      staleTime: 5 * 60 * 1000,
    });

  const freeShippingMinGhs = useMemo(() => {
    const raw = freeDeliveryResponse?.data?.freeDeliveryThreshold;
    if (raw != null && Number(raw) > 0) return Number(raw);
    if (freeDeliveryError) return FREE_SHIPPING_MIN_FALLBACK_GHS;
    if (freeDeliveryLoading) return null;
    return null;
  }, [freeDeliveryResponse, freeDeliveryError, freeDeliveryLoading]);

  const showFreeShippingPromo =
    freeShippingMinGhs != null && freeShippingMinGhs > 0 && !hasPreorderItem;

  const qualifiesForFreeShipping =
    showFreeShippingPromo && subTotal >= freeShippingMinGhs;

  // Derive origin country from pre-order products.
  // If pre-order product exists but no origin specified, default to "China"
  const preorderOriginCountry = useMemo(() => {
    const origins = Array.from(
      new Set(
        products
          .filter((item) => item.product?.isPreOrder)
          .map((item) => {
            const origin = item.product?.preOrderOriginCountry;
            return origin ? String(origin).trim() : null;
          })
          .filter(Boolean),
      ),
    );

    // If we have a single origin, use it
    if (origins.length === 1) {
      return origins[0];
    }

    // If pre-order exists but no origin specified, default to "China"
    // (all pre-orders are assumed to be international from China/USA)
    if (hasPreorderItem && origins.length === 0) {
      return "China"; // Default for pre-orders without specified origin
    }

    return null;
  }, [products, hasPreorderItem]);

  const supplierCountry = preorderOriginCountry || (hasPreorderItem ? "China" : null);

  // Pre-orders are ALWAYS international (from China/USA)
  // If origin not specified, default to "China"
  const isInternationalPreorderEnabled = hasPreorderItem && supplierCountry;

  // EazShop products detection
  const hasEazShopProducts = useMemo(
    () =>
      products.some(
        (item) =>
          isEazShopProduct(item.product)
      ),
    [products]
  );

  // Selected address
  const selectedAddress = address.find((addr) => addr._id === selectedAddressId);

  const buyerCity = selectedAddress?.city?.toUpperCase() || null;

  // Shipping hooks based on buyer city
  const {
    data: pickupCentersData,
    isLoading: isPickupCentersLoading,
  } = useGetPickupCenters(buyerCity);

  // Extract pickup centers from response - handle different response structures
  const pickupCenters = useMemo(() => {
    if (!pickupCentersData) return [];
    if (Array.isArray(pickupCentersData)) return pickupCentersData;
    if (pickupCentersData?.data?.pickupCenters) return pickupCentersData.data.pickupCenters;
    if (pickupCentersData?.data?.data?.pickupCenters) return pickupCentersData.data.data.pickupCenters;
    if (Array.isArray(pickupCentersData?.data)) return pickupCentersData.data;
    return [];
  }, [pickupCentersData]);
  // Main shipping calculation for selected delivery method
  const { mutate: calculateShipping, isPending: isCalculatingShipping } =
    useCalculateShippingQuote();

  // SECURITY: Use backend-calculated totals instead of frontend calculations
  // Frontend calculations are for display only - backend must validate all amounts
  const round = (val) => Math.round(val * 100) / 100;

  // Use backend totals if available, otherwise fallback to frontend calculation for display
  const backendTotal = backendTotals?.totalAmount ?? backendTotals?.total ?? null;
  const backendDiscount = backendTotals?.discount || discount;
  const backendSubtotal = backendTotals?.subtotal || subTotal;
  const internationalBreakdown = backendTotals?.internationalBreakdown || null;

  // For international: use backend shipping; else use local shipping
  const effectiveShippingFee = isInternationalPreorderEnabled && internationalBreakdown
    ? (backendTotals?.shipping ?? 0)
    : shippingFee;
  const computedTotal = Math.round(round(Math.max(0, (backendSubtotal ?? subTotal) - (backendDiscount ?? discount) + effectiveShippingFee)));
  const total = backendTotal != null
    ? (computedTotal > backendTotal ? computedTotal : backendTotal)
    : computedTotal;

  // Credit balance calculations
  const hasInsufficientBalance = useMemo(() => {
    if (paymentMethod !== "credit_balance") return false;
    const isInsufficient = creditBalance < total;

    if (import.meta.env.DEV) {
      logger.debug('[CheckoutPage] 💰 Balance check:', {
        creditBalance,
        total,
        isInsufficient,
        shortfall: total - creditBalance,
        paymentMethod,
      });
    }

    return isInsufficient;
  }, [paymentMethod, creditBalance, total]);

  const shippingItems = useMemo(
    () => getShippingItems(rawItems),
    [rawItems]
  );

  const isValidBuyerCity = buyerCity && ["accra", "tema"].includes(buyerCity.toLowerCase());

  // Memoize the onSelect callback to prevent infinite loops in ShippingOptions
  const handleShippingSelect = useCallback((shippingData) => {
    setDeliverySpeed(shippingData.shippingType);
    // Set the selected shipping fee directly
    setShippingFee(shippingData.shippingFee);
    // Update shipping quote for order summary (simplified)
    setShippingQuote({
      totalShippingFee: shippingData.shippingFee,
      deliveryEstimate: shippingData.deliveryEstimate,
      shippingType: shippingData.shippingType,
    });
  }, []);

  useEffect(() => {
    if (!qualifiesForFreeShipping || deliveryMethod !== "dispatch") {
      return;
    }
    setDeliverySpeed("standard");
    setShippingFee(0);
    setShippingQuote({
      totalShippingFee: 0,
      deliveryEstimate: "",
      shippingType: "standard",
    });
    setIsFragileItem(false);
  }, [qualifiesForFreeShipping, deliveryMethod]);

  // ────────────────────────────────────────────────
  // Effects
  // ────────────────────────────────────────────────

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      const checkoutState = {
        selectedAddressId,
        paymentMethod,
        couponCode,
        couponData,
      };
      storage.saveCheckoutState(checkoutState);
      storage.saveRedirect("/checkout");
      navigate("/login?redirectTo=/checkout");
    }
  }, [
    isAuthenticated,
    isAuthLoading,
    navigate,
    selectedAddressId,
    paymentMethod,
    couponCode,
    couponData,
  ]);

  // Restore saved checkout state after login
  useEffect(() => {
    if (isAuthenticated) {
      const savedState = storage.restoreCheckoutState();
      if (!savedState) return;

      if (savedState.selectedAddressId)
        setSelectedAddressId(savedState.selectedAddressId);
      if (savedState.paymentMethod) setPaymentMethod(savedState.paymentMethod);
      if (savedState.couponCode) setCouponCode(savedState.couponCode);
      if (savedState.couponData) setCouponData(savedState.couponData);
    }
  }, [isAuthenticated]);

  // Stable cache key for cart contents — prevents unnecessary validateCart calls on background refetches
  const cartItemsKey = useMemo(() => {
    const list = getCartStructure(cartData);
    if (!list?.length) return "";
    return list.map((item) => `${item.product?._id || item.productId}:${item.quantity}:${item.sku || item.variantSku || ""}`).join(",");
  }, [cartData]);

  // Fetch backend totals (including tax from admin platform-settings) when cart or options change
  useEffect(() => {
    if (!isAuthenticated || !cartData) return;

    const list = getCartStructure(cartData);
    if (!list?.length) return;

    const orderItems = list.map((item) => ({
      product: item.product?._id || item.product,
      quantity: Math.max(1, Math.min(item.quantity || 1, item.product?.stock || 999)),
      sku: resolveSkuFromCartItem(item) || undefined,
    })).filter((item) => item.product);

    if (orderItems.length === 0) return;

    validateCart(
      {
        orderItems,
        couponCode: couponCode || undefined,
        deliveryMethod,
        address: selectedAddressId || undefined,
      },
      {
        onSuccess: (data) => {
          if (data?.data?.totals) {
            setBackendTotals(data.data.totals);
          }
        },
        onError: () => {
          // Keep existing backendTotals or null; display will use fallback
        },
      }
    );
  }, [
    isAuthenticated,
    cartItemsKey,
    couponCode,
    deliveryMethod,
    selectedAddressId,
    validateCart,
  ]);

  // Auto-select default or first address
  useEffect(() => {
    if (isAddressLoading || address.length === 0) return;

    if (defaultAddress) {
      setSelectedAddressId(defaultAddress._id);
    } else {
      setSelectedAddressId(address[0]._id);
    }
  }, [isAddressLoading, address, defaultAddress]);

  // If user has no addresses, prompt address creation modal by default
  useEffect(() => {
    if (!isAddressLoading && address.length === 0) {
      setActiveTab("existing");
      setIsAddressModalOpen(true);
    }
  }, [isAddressLoading, address]);

  useEffect(() => {
    if (!isAddressModalOpen) return undefined;

    const handleEscape = (event) => {
      if (event.key === "Escape" && !isAddressCreating) {
        setIsAddressModalOpen(false);
        setActiveTab("existing");
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isAddressModalOpen, isAddressCreating]);

  // Ensure dispatch method is used (seller delivery removed)
  // useEffect(() => {
  //   if (deliveryMethod === "seller_delivery") {
  //     setDeliveryMethod("dispatch");
  //   }
  // }, [deliveryMethod]);

  // NOTE: For dispatch delivery, shipping fee is set by ShippingOptions.onSelect
  // Removed redundant dispatch preview calculation - ShippingOptions component handles this

  // Actual shipping fee based on selected delivery method + pickup center
  // NOTE: For dispatch delivery, shipping fee is set by ShippingOptions.onSelect
  // This effect only handles pickup_center calculations
  useEffect(() => {
    // Skip this effect for dispatch - ShippingOptions handles it
    if (deliveryMethod === "dispatch") {
      return;
    }

    if (!isValidBuyerCity || shippingItems.length === 0) {
      setShippingFee(0);
      setShippingQuote(null);
      return;
    }

    if (deliveryMethod === "pickup_center" && !selectedPickupCenterId) {
      setShippingFee(0);
      return;
    }

    calculateShipping(
      {
        buyerCity,
        items: shippingItems,
        method: deliveryMethod,
        pickupCenterId:
          deliveryMethod === "pickup_center" ? selectedPickupCenterId : null,
        deliverySpeed: "standard", // Pickup centers always use standard
      },
      {
        onSuccess: (response) => {
          const payload = normalizeApiResponse(response);
          const totalFee =
            payload?.totalShippingFee ?? payload?.total_shipping_fee ?? 0;

          setShippingFee(totalFee);
          setShippingQuote(payload);
        },
        onError: (error) => {
          logger.error("Shipping calculation error:", error);
          setShippingFee(0);
          setShippingQuote(null);
        },
      }
    );
  }, [
    buyerCity,
    deliveryMethod,
    selectedPickupCenterId,
    shippingItems,
    calculateShipping,
    activeTab,
    selectedAddressId,
    isValidBuyerCity,
    // Removed deliverySpeed - not needed for pickup_center
  ]);

  // ────────────────────────────────────────────────
  // Handlers
  // ────────────────────────────────────────────────

  const handleDeliveryMethodChange = (method) => {
    setDeliveryMethod(method);
    setHasChosenDelivery(true);
    // Reset delivery speed when switching away from dispatch
    if (method !== "dispatch") {
      setDeliverySpeed("standard");
    }
    // Shipping calculation will happen automatically via useEffect when deliveryMethod changes
  };

  const handleAddressSelect = (addressId) => {
    if (!addressId) return;
    // SECURITY: Store only the ID, ensuring absolute separation of concerns
    setSelectedAddressId(addressId);
    setActiveTab("existing");
    setFormError("");
  };

  const openAddressModal = () => {
    setActiveTab("new");
    setFormError("");
    setLocationError("");
    setIsAddressModalOpen(true);
  };

  const closeAddressModal = () => {
    if (isAddressCreating) return;
    setActiveTab("existing");
    setFormError("");
    setErrors({});
    setLocationError("");
    setAutoNeighborhoodOptions([]);
    setIsAddressModalOpen(false);
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setErrors((prev) => { const next = { ...prev }; delete next[name]; return next; });
    setFormError("");

    // SECURITY: Basic sanitization while typing (no HTML, limited length)
    // Trim and normalization happen on submission to avoid UI cursor jump issues
    const baseSanitized = value.replace(/<[^>]*>/g, '')
      .substring(0, 500);

    if (name === "contactPhone") {
      const digits = value.replace(/\D/g, "").substring(0, 10);
      let formatted = digits;
      if (digits.length > 3) {
        formatted = `${digits.substring(0, 3)} ${digits.substring(3, 6)}`;
        if (digits.length > 6) {
          formatted += ` ${digits.substring(6, 10)}`;
        }
      }
      setNewAddress((prev) => ({ ...prev, [name]: formatted }));
      return;
    }

    if (name === "digitalAddress") {
      const cleaned = value
        .replace(/[^a-zA-Z0-9]/g, "")
        .toUpperCase()
        .substring(0, 9);

      let formatted = cleaned;
      if (cleaned.length > 2) {
        formatted = `${cleaned.substring(0, 2)}-${cleaned.substring(
          2,
          5
        )}`;
        if (cleaned.length > 5) {
          formatted += `-${cleaned.substring(5, 9)}`;
        }
      }
      setNewAddress((prev) => ({ ...prev, [name]: formatted }));
      return;
    }

    if (name === "city") {
      setNewAddress((prev) => ({ ...prev, [name]: baseSanitized.toUpperCase() }));
      return;
    }

    setNewAddress((prev) => ({ ...prev, [name]: baseSanitized }));
  };

  const getCurrentLocation = () => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }

    setIsFetchingLocation(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          // Call backend reverse geocoding endpoint (avoids CSP violations)
          // This gives us the physical address (street, town, city, region)
          const reverseGeocodeResponse = await locationApi.reverseGeocode(latitude, longitude);

          // Extract address data from response
          // Response format: { status: 'success', data: { street, town, city, region, ... } }
          const addressData = reverseGeocodeResponse?.data || reverseGeocodeResponse;

          // Debug: log full geocoded address payload for inspection
          logger.info("[Checkout getCurrentLocation] Full reverse geocode address data:", {
            rawResponse: reverseGeocodeResponse,
            parsedAddress: addressData,
          });

          if (!addressData) {
            throw new Error("No address data received from server");
          }

          // Convert GPS coordinates to GhanaPost GPS digital address
          // This gives us the proper digital address format (e.g., GA-123-4567)
          let digitalAddress = "";
          try {
            // Try hybrid lookup first (combines GhanaPostGPS + Google Maps)
            const hybridResponse = await locationApi.hybridLocationLookup(latitude, longitude);
            const hybridData = hybridResponse?.data || hybridResponse;
            digitalAddress = hybridData?.digitalAddress || "";
          } catch {
            // Hybrid failed — fall back to direct GhanaPostGPS conversion
            try {
              const digitalAddressResponse = await locationApi.convertCoordinatesToDigitalAddress(latitude, longitude);
              const digitalAddressData = digitalAddressResponse?.data || digitalAddressResponse;
              digitalAddress = digitalAddressData?.digitalAddress || "";
            } catch (digitalError) {
              // Both failed — leave empty so the user can fill it in manually
              logger.warn("Failed to get GhanaPost GPS digital address:", digitalError);
              digitalAddress = "";
            }
          }

          // Extract address fields from reverse geocoding
          const extractedStreet = (addressData.street || addressData.streetAddress || "").trim();
          const extractedTown = (addressData.town || addressData.neighborhood || addressData.area || "").trim();
          const extractedCityRaw = addressData.city || "";
          // Normalize city: backend expects "Accra" or "Tema" (capitalized), form uses "ACCRA"/"TEMA" (uppercase)
          const extractedCityNormalized = extractedCityRaw
            ? extractedCityRaw.trim().charAt(0).toUpperCase() + extractedCityRaw.trim().slice(1).toLowerCase()
            : "";
          const extractedCityUppercase = extractedCityRaw
            ? extractedCityRaw.toUpperCase().trim()
            : "";
          const extractedRegion = addressData.region
            ? addressData.region.toLowerCase().trim()
              .split(' ')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ')
            : "";

          // Search for matching neighborhood in the database
          // This ensures the neighborhood is selected from the Neighborhood model, not just text
          let matchedNeighborhood = null;
          let hadNeighborhoodResults = false;
          if (extractedTown && extractedCityNormalized) {
            try {
              // Search for neighborhoods matching the town/area name in the detected city
              // Use normalized city format (Accra/Tema) for API search
              const neighborhoodResponse = await neighborhoodService.searchNeighborhoods(
                extractedTown,
                extractedCityNormalized
              );

              const neighborhoods = neighborhoodResponse?.data?.neighborhoods ||
                neighborhoodResponse?.neighborhoods || [];

              if (neighborhoods.length > 0) {
                hadNeighborhoodResults = true;
                // Store all matching neighborhoods so user can select from a list
                setAutoNeighborhoodOptions(neighborhoods);
                // Find the best match (exact match first, then first result)
                // Prioritize exact name match, then fuzzy match
                matchedNeighborhood = neighborhoods.find(
                  n => n.name.toLowerCase().trim() === extractedTown.toLowerCase().trim()
                ) || neighborhoods.find(
                  n => n.name.toLowerCase().includes(extractedTown.toLowerCase()) ||
                    extractedTown.toLowerCase().includes(n.name.toLowerCase())
                ) || neighborhoods[0];

                logger.info('[Auto-detect] Found matching neighborhood:', {
                  searchTerm: extractedTown,
                  city: extractedCityNormalized,
                  matched: matchedNeighborhood.name,
                  neighborhoodId: matchedNeighborhood._id,
                  totalMatches: neighborhoods.length,
                });
              } else {
                // No neighborhood matches at all for this town/city
                setAutoNeighborhoodOptions([]);
                logger.warn('[Auto-detect] No matching neighborhood found:', {
                  searchTerm: extractedTown,
                  city: extractedCityNormalized,
                });
              }
            } catch (neighborhoodError) {
              // If neighborhood search fails, continue with text value
              setAutoNeighborhoodOptions([]);
              logger.warn('[Auto-detect] Neighborhood search failed:', neighborhoodError);
            }
          }

          // Map backend response to form fields
          // Backend returns: { street, town, city, region, country, formattedAddress }
          // Form expects: { streetAddress, area, city, region, digitalAddress }
          // If neighborhood name matches a record, use it.
          // If only municipality matches (e.g., "Ayawaso" → multiple neighborhoods), do NOT auto-fill neighborhood.
          // Instead, leave the field for the user to choose via the NeighborhoodAutocomplete.
          const areaValue =
            matchedNeighborhood
              ? matchedNeighborhood.name
              : hadNeighborhoodResults
                ? ""
                : extractedTown;

          setNewAddress((prev) => ({
            ...prev,
            // Map street from backend (street field) to streetAddress
            // Do NOT overwrite if user has already typed a value
            streetAddress: prev.streetAddress || extractedStreet,
            // Neighborhood/Area:
            // - Exact neighborhood match → fill with that name
            // - Only municipality match (e.g. "Ayawaso") → keep existing so user selects a neighborhood
            // - No matches at all → fall back to extracted town/area text
            area: prev.area || areaValue,
            // Keep existing landmark or leave empty (never overwrite)
            landmark: prev.landmark || "",
            // Map city from backend (normalize to uppercase for ACCRA/TEMA) if empty
            city: prev.city || extractedCityUppercase,
            // Map region from backend (normalize to lowercase, then capitalize first letter) if empty
            region: prev.region || extractedRegion,
            // Set digital address (proper GhanaPost GPS format) if empty
            digitalAddress: prev.digitalAddress || digitalAddress,
          }));
        } catch (error) {
          logger.error("Reverse geocoding error:", error);

          // Provide user-friendly error messages
          if (error.response?.status === 400) {
            setLocationError(
              error.response?.data?.message || "Invalid location. Please try again or enter address manually."
            );
          } else if (error.response?.status === 404) {
            setLocationError(
              "Address not found for this location. Please enter address manually."
            );
          } else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
            setLocationError(
              "Request timed out. Please check your connection and try again."
            );
          } else if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
            setLocationError(
              "Network error. Please check your connection and try again."
            );
          } else {
            setLocationError(
              "Failed to get address details. Please enter manually."
            );
          }
        } finally {
          setIsFetchingLocation(false);
        }
      },
      (error) => {
        // Downgrade from error to warn since this is a common, expected failure (e.g. user denied permission or Mac disabled location)
        logger.warn("Geolocation warning:", error.message || error);

        // Handle different geolocation error codes
        let errorMessage = "Location access denied. Please enable location services.";
        const errorMsgStr = error.message ? error.message.toLowerCase() : "";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied. Please enable location services in your browser settings.";
            break;
          case error.POSITION_UNAVAILABLE:
            if (errorMsgStr.includes("kclerrorlocationunknown")) {
              errorMessage = "Safari cannot detect location (CoreLocation Error). Please enter address manually.";
            } else {
              errorMessage = "Location information is unavailable. Please enter your address manually.";
            }
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out. Please try again.";
            break;
          default:
            if (errorMsgStr.includes("kclerrorlocationunknown")) {
              errorMessage = "Safari cannot detect location (CoreLocation Error). Please enter address manually.";
            } else {
              errorMessage = "Failed to get your location. Please enter address manually.";
            }
            break;
        }

        setLocationError(errorMessage);
        setIsFetchingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleNewAddress = (e) => {
    e.preventDefault();

    const validationErrors = validateNewAddress(newAddress);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setFormError("Please fix the errors in the form");
      return;
    }

    // SECURITY: Aggressive sanitization of all address fields before submission
    const formattedAddress = {
      fullName: sanitizeText(newAddress.fullName, 100),
      streetAddress: sanitizeText(newAddress.streetAddress, 255),
      area: sanitizeText(newAddress.area, 100),
      landmark: sanitizeText(newAddress.landmark, 255),
      city: sanitizeText(newAddress.city, 50).toUpperCase(),
      region: sanitizeText(newAddress.region, 50),
      digitalAddress: newAddress.digitalAddress, // Already sanitized in onChange
      contactPhone: newAddress.contactPhone.replace(/\D/g, ""),
    };

    createAddress(formattedAddress, {
      onSuccess: () => {
        setNewAddress({
          fullName: "",
          streetAddress: "",
          area: "",
          landmark: "",
          city: "",
          region: "",
          digitalAddress: "",
          contactPhone: "",
        });
        setActiveTab("existing");
        setErrors({});
        setFormError("");
        setLocationError("");
        setAutoNeighborhoodOptions([]);
        setIsAddressModalOpen(false);
      },
      onError: (error) => {
        setFormError(
          error.response?.data?.message || "Failed to create address"
        );
      },
    });
  };

  const handleApplyCoupon = () => {
    // SECURITY: Sanitize coupon code input
    const sanitizedCode = sanitizeCouponCode(couponCode);
    if (!sanitizedCode) {
      setCouponMessage("Please enter a valid coupon code");
      return;
    }

    // Extract product and seller IDs for validation
    const productIds = products.map(p => p.product._id);
    const categoryIds = products.reduce((acc, p) => {
      if (p.product.parentCategory) acc.push(p.product.parentCategory);
      if (p.product.subCategory) acc.push(p.product.subCategory);
      return acc;
    }, []);
    const sellerIds = [...new Set(products.map(p => p.product.seller?._id || p.product.seller).filter(Boolean))];

    // SECURITY: Use backend-calculated subtotal, not frontend
    applyCoupon(
      {
        couponCode: sanitizedCode, // SECURITY: Sanitized coupon code
        orderAmount: backendSubtotal || subTotal, // Use backend subtotal if available
        productIds,
        categoryIds,
        sellerIds,
      },
      {
        onSuccess: (data) => {
          if (data.status === "success" && data.data.valid) {
            // SECURITY: Use backend-calculated discount amount (NO frontend calculation)
            const discountAmount = data.data.discountAmount || 0;

            setDiscount(discountAmount);
            // SECURITY: Update backend totals if provided
            if (data.data.totals) {
              setBackendTotals(data.data.totals);
            }
            setCouponMessage(
              data?.data.discountType === "percentage"
                ? `Coupon applied: ${data.data.discountValue}% off (GH₵${discountAmount.toFixed(2)})`
                : `Coupon applied! GH₵${discountAmount.toFixed(2)} discount`
            );
            setCouponData({
              couponId: data.data.couponId,
              batchId: data.data.batchId,
            });
          } else {
            setDiscount(0);
            setCouponMessage(data.message || "Invalid coupon code");
            setCouponData(null);
          }
        },
        onError: (error) => {
          setDiscount(0);
          const backendMessage = error?.response?.data?.message || error?.message || "";
          // Friendlier, human-readable message for users
          if (backendMessage.toLowerCase().includes("invalid or expired coupon")) {
            setCouponMessage(
              "This coupon is invalid or has expired. Please check the code or try a different coupon."
            );
          } else {
            setCouponMessage(
              "We couldn’t apply this coupon to your cart. Please verify the code or try another coupon."
            );
          }
          setCouponData(null);
        },
      }
    );
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();

    if (!products || products.length === 0) {
      setFormError("Please add items to cart");
      return;
    }

    if (!selectedAddressId && activeTab === "existing") {
      setFormError("Please select a shipping address");
      return;
    }

    if (deliveryMethod === "pickup_center" && !selectedPickupCenterId) {
      setFormError("Please select a pickup center");
      return;
    }

    // CH-1: Block order submission if backendTotals is not yet calculated
    if (!backendTotals) {
      setFormError("Please wait for your order totals to be calculated before submitting.");
      return;
    }

    setFormError("");

    // SECURITY: Send product IDs, SKUs, and quantities only - backend MUST fetch prices from database
    // Frontend prices are for display only and MUST NOT be trusted
    let orderItems;
    try {
      orderItems = products.map((product) => {
        // SECURITY: Validate quantity
        const validatedQuantity = validateQuantity(product.quantity, product.product.stock || 999);

        // CRITICAL: Use sku directly from cart item - NO resolution logic
        const sku = product.sku || null;

        // Guardrail: If product has variants and SKU is missing, show error
        const hasVariants = product.product.variants && product.product.variants.length > 0;
        if (hasVariants && !sku) {
          logger.error("SKU missing for variant product:", {
            productId: product.product._id,
            productName: product.product.name,
            variantCount: product.product.variants.length,
          });
          throw new Error(`Please re-select product options for "${product.product.name}" before checkout`);
        }

        // SECURITY: Do NOT send price from frontend - backend will fetch from database
        // Price here is only for reference/logging, backend ignores it
        const displayPrice = sku
          ? product.product.variants?.find((v) => v.sku && v.sku.toUpperCase() === sku.toUpperCase())?.price
          : (product.product.defaultPrice || product.product.price || 0);

        if (!displayPrice || displayPrice === 0) {
          logger.warn("Product price not found (backend will fetch):", {
            productId: product.product._id,
            productName: product.product.name,
            sku: sku || 'N/A',
          });
        }

        return {
          product: product.product._id,
          quantity: validatedQuantity,
          sku: sku || undefined, // Only include SKU if it exists
        };
      });
    } catch (skuError) {
      logger.error("SKU validation error:", skuError);
      setFormError(skuError.message || "Please re-select product options before checkout");
      return;
    }

    const orderData = {
      address: selectedAddressId,
      paymentMethod,
      orderItems,
      ...(couponData && {
        couponCode,
        couponId: couponData.couponId,
        batchId: couponData.batchId,
        // ✅ DO NOT send discountAmount - backend calculates it
      }),
      deliveryMethod,
      // Backend expects shippingFee; for international, backend recalculates from config
      shippingFee: isInternationalPreorderEnabled && internationalBreakdown
        ? (backendTotals?.shipping ?? 0)
        : shippingFee,
      ...(deliveryMethod === "pickup_center" &&
        selectedPickupCenterId && {
        pickupCenterId: selectedPickupCenterId,
      }),
      ...(deliveryMethod === "dispatch" && {
        deliverySpeed:
          deliverySpeed === "same_day" || deliverySpeed === "express"
            ? deliverySpeed
            : "standard",
        shippingType:
          deliverySpeed === "same_day" || deliverySpeed === "express"
            ? deliverySpeed
            : "standard",
      }),
      ...(isInternationalPreorderEnabled && {
        orderType: "preorder_international",
        supplierCountry,
      }),
    };

    createOrder(orderData, {
      onSuccess: async (orderResponse) => {
        const responseData = orderResponse?.data || orderResponse;
        const order = responseData?.data?.order || responseData?.order;

        if (!order) {
          setFormError("Failed to create order");
          return;
        }

        // NOTE: Cart will be cleared after order confirmation (in OrderConfirmationPage)
        // This ensures cart is only cleared after payment is verified

        if (paymentMethod === "mobile_money") {
          try {
            // SECURITY: Backend calculates payment amount from order total
            // Frontend MUST NOT send amount - backend validates order and calculates payment
            const { redirectTo } = await initializePaystackPayment({
              orderId: order._id,
              // SECURITY: Do NOT send amount - backend calculates from order.total
              email: order.user?.email || "",
            });

            // SECURITY: Validate redirect URL before redirecting to prevent open redirects
            if (!isValidPaystackUrl(redirectTo)) {
              logger.error("[CheckoutPage] Invalid redirect URL:", redirectTo);
              setFormError('Invalid payment redirect URL. Please contact support.');
              return;
            }

            // Use window.location.href for full page redirect to Paystack
            // After payment, Paystack will redirect back to our callback URL
            window.location.href = redirectTo;
          } catch (paymentError) {
            logger.error("[CheckoutPage] Payment initialization error:", paymentError);

            // Roll back the newly created unpaid order to avoid orphan pending orders
            // when Paystack initialization/redirect fails before buyer completes payment.
            try {
              await orderService.deleteOrder(order._id);
              queryClient.invalidateQueries({ queryKey: ["orders"] });
              queryClient.invalidateQueries({ queryKey: ["order"] });
            } catch (rollbackError) {
              logger.error(
                "[CheckoutPage] Failed to rollback order after payment init failure:",
                rollbackError
              );
            }

            navigate("/cart", {
              replace: true,
              state: {
                checkoutError:
                  paymentError?.response?.data?.message ||
                  "Payment could not be initialized. Please review your cart and try again.",
              },
            });
            return;
          }
        } else if (paymentMethod === "credit_balance") {
          // Credit balance payment is handled on the backend
          // Invalidate wallet balance immediately for UI update
          queryClient.invalidateQueries({ queryKey: ['wallet', 'balance'] });
          queryClient.invalidateQueries({ queryKey: ['creditBalance'] });
          queryClient.refetchQueries({ queryKey: ['wallet', 'balance'] });
          // Navigate to order confirmation page
          const confirmationPath = `/order-confirmation?orderId=${order._id}`;
          navigate(confirmationPath);
        } else {
          // For non-Paystack payments (COD, bank transfer), navigate directly with order data
          // Use the same URL structure as Paystack: /order-confirmation?orderId=xxx
          // This ensures consistency between payment methods

          const confirmationPath = `/order-confirmation?orderId=${order._id}`;

          // Navigate with both URL query param and state (for backward compatibility)
          navigate(confirmationPath, {
            state: {
              orderId: order._id,
              orderNumber: order.orderNumber,
              totalAmount: order.totalPrice,
              orderDate: order.createdAt,
              paymentMethod,
              shippingAddress: order.shippingAddress,
              shippingCost: shippingFee,
              tax: 0, // Tax removed - no longer charged
              deliveryMethod: order.deliveryMethod,
              pickupCenter: order.pickupCenterId,
              subTotal,
              discount,
              orderItems: order.orderItems.map((p) => ({
                id: p.product._id,
                name: p.product.name,
                image: p.product.imageCover,
                price: p.price,
                quantity: p.quantity,
              })),
              status: order.orderStatus,
              contactEmail: order.user.email,
            },
            // Replace current history entry to prevent back button issues
            replace: true,
          });
        }
      },
      onError: (error) => {
        logger.error("Order creation error:", error);
        setFormError(
          error.response?.data?.message || "Failed to place order"
        );
      },
    });
  };

  // ────────────────────────────────────────────────
  // Loading state
  // ────────────────────────────────────────────────

  if (isAddressLoading || isCartLoading) {
    return <LoadingState message="Loading checkout data..." />;
  }

  // ────────────────────────────────────────────────
  // Render
  // ────────────────────────────────────────────────

  return (
    <CheckoutContainer>

      {/* ── Checkout Header with Progress Steps ── */}
      <CheckoutHeader>
        <CheckoutTitle>Secure Checkout</CheckoutTitle>
        <ProgressSteps>
          <StepItem>
            <StepBubble $done={!!selectedAddressId} $active>
              {selectedAddressId ? <FaCheck /> : "1"}
            </StepBubble>
            <StepLabel>Address</StepLabel>
          </StepItem>
          <StepConnector $done={!!selectedAddressId} />
          <StepItem>
            <StepBubble $done={hasChosenDelivery} $active={!!selectedAddressId}>
              {hasChosenDelivery ? <FaCheck /> : "2"}
            </StepBubble>
            <StepLabel>Delivery</StepLabel>
          </StepItem>
          <StepConnector $done={hasChosenDelivery} />
          <StepItem>
            <StepBubble $active={!!deliveryMethod}>3</StepBubble>
            <StepLabel>Payment</StepLabel>
          </StepItem>
        </ProgressSteps>
      </CheckoutHeader>

      <CheckoutGrid>
        {/* ── LEFT: Sequential Steps ── */}
        <CheckoutLeft>

          {/* STEP 1: Shipping Address */}
          <StepCard>
            <StepCardHeader>
              <StepBadge $done={!!selectedAddressId}>
                {selectedAddressId ? <FaCheck /> : "1"}
              </StepBadge>
              <StepCardTitle>Shipping Address</StepCardTitle>
            </StepCardHeader>

            <TabToggleWrap>
              <TabToggle
                $active={activeTab === "existing"}
                onClick={() => setActiveTab("existing")}
                type="button"
              >
                <FaMapMarkerAlt />
                My Addresses
              </TabToggle>
              <TabToggle
                $active={isAddressModalOpen}
                onClick={openAddressModal}
                type="button"
              >
                + New Address
              </TabToggle>
            </TabToggleWrap>

            <TabContent>
            {address.length > 0 ? (
              <AddressList>
                {address.map((addr) => (
                  <AddressItem
                    key={addr._id}
                    $selected={selectedAddressId === addr._id}
                    onClick={() => handleAddressSelect(addr._id)}
                  >
                    <AddressContent>
                      <AddressIcon $selected={selectedAddressId === addr._id}>
                        <FaMapMarkerAlt />
                      </AddressIcon>
                      <AddressInfo>
                        <AddressName $selected={selectedAddressId === addr._id}>
                          {addr.streetAddress}
                        </AddressName>
                        {addr.area && (
                          <AddressText>{addr.area}</AddressText>
                        )}
                        {addr.landmark && (
                          <AddressText>{addr.landmark}</AddressText>
                        )}
                        <AddressLocation>
                          <AddressText>
                            {addr.city}, {addr.region}
                          </AddressText>
                        </AddressLocation>
                        <AddressText>{addr.contactPhone}</AddressText>
                        {addr.isDefault && (
                          <DefaultBadge>Default Address</DefaultBadge>
                        )}
                      </AddressInfo>
                      {selectedAddressId === addr._id && (
                        <SelectionCheckmark>
                          <FaCheck />
                        </SelectionCheckmark>
                      )}
                    </AddressContent>
                    <RadioInput
                      hidden
                      type="radio"
                      name="address"
                      checked={selectedAddressId === addr._id}
                      onChange={() => handleAddressSelect(addr._id)}
                    />
                  </AddressItem>
                ))}
              </AddressList>
            ) : (
              <EmptyAddressState>
                <p>No saved address found yet.</p>
                <Button type="button" variant="primary" size="sm" onClick={openAddressModal}>
                  Add Your First Address
                </Button>
              </EmptyAddressState>
            )}
            </TabContent>
          </StepCard>

          {isAddressModalOpen && (
            <AddressModalOverlay
              role="dialog"
              aria-modal="true"
              aria-labelledby="checkout-new-address-title"
              onClick={(event) => {
                if (event.target === event.currentTarget) {
                  closeAddressModal();
                }
              }}
            >
              <AddressModalCard>
                <AddressModalHeader>
                  <AddressModalTitle id="checkout-new-address-title">
                    Add New Address
                  </AddressModalTitle>
                  <AddressModalClose
                    type="button"
                    onClick={closeAddressModal}
                    aria-label="Close address form"
                  >
                    <FaTimes />
                  </AddressModalClose>
                </AddressModalHeader>
                <AddressModalBody>
                  <AddressForm onSubmit={handleNewAddress}>
                    {(formError || createAddressError) && (
                      <ErrorState
                        message={
                          formError ||
                          createAddressError?.message ||
                          "Failed to create address"
                        }
                      />
                    )}

                    <AddressFormSection>
                      <AddressFormSectionLabel>Contact</AddressFormSectionLabel>
                      <FormRow>
                        <FormGroup>
                          <Label>Full Name *</Label>
                          <Input
                            type="text"
                            name="fullName"
                            value={newAddress.fullName}
                            onChange={handleAddressChange}
                            placeholder="e.g. Kwame Mensah"
                            required
                          />
                          {errors.fullName && <ErrorText>{errors.fullName}</ErrorText>}
                        </FormGroup>
                        <FormGroup>
                          <Label>Contact Number *</Label>
                          <Input
                            type="tel"
                            name="contactPhone"
                            value={newAddress.contactPhone}
                            onChange={handleAddressChange}
                            placeholder="020 123 4567"
                            required
                          />
                          {errors.contactPhone && <ErrorText>{errors.contactPhone}</ErrorText>}
                          <HintText>MTN / Telecel / AirtelTigo — 10 digits</HintText>
                        </FormGroup>
                      </FormRow>
                    </AddressFormSection>

                    <AddressFormSection>
                      <AddressFormSectionLabel>Location</AddressFormSectionLabel>
                      <FormGroup>
                        <Label>Street Address *</Label>
                        <Input
                          type="text"
                          name="streetAddress"
                          value={newAddress.streetAddress}
                          onChange={handleAddressChange}
                          placeholder="e.g. 15 Liberation Road"
                          required
                        />
                        {errors.streetAddress && <ErrorText>{errors.streetAddress}</ErrorText>}
                      </FormGroup>

                      <FormRow>
                        <FormGroup>
                          <Label>Neighborhood / Area *</Label>
                          {autoNeighborhoodOptions.length > 0 ? (
                            <>
                              <Select
                                name="area"
                                value={newAddress.area}
                                onChange={(e) => {
                                  const selectedName = e.target.value;
                                  setNewAddress((prev) => ({ ...prev, area: selectedName }));
                                }}
                              >
                                <option value="">Select neighborhood</option>
                                {autoNeighborhoodOptions.map((n) => (
                                  <option key={n._id || n.name} value={n.name}>
                                    {n.name}{n.municipality ? ` (${n.municipality})` : ""}
                                  </option>
                                ))}
                              </Select>
                              <HintText>Multiple matches found — pick the correct one</HintText>
                            </>
                          ) : (
                            <>
                              <NeighborhoodAutocomplete
                                value={newAddress.area}
                                onChange={handleAddressChange}
                                city={newAddress.city}
                                placeholder="e.g. Nima, Cantonments, Tema Comm. 1"
                                onSelect={(neighborhood) => {
                                  setNewAddress((prev) => ({ ...prev, area: neighborhood.name }));
                                }}
                              />
                              <HintText>Start typing to search your neighborhood</HintText>
                            </>
                          )}
                          {errors.area && <ErrorText>{errors.area}</ErrorText>}
                        </FormGroup>
                        <FormGroup>
                          <Label>
                            Landmark{" "}
                            <span
                              style={{
                                fontWeight: 400,
                                color: "var(--color-grey-400)",
                              }}
                            >
                              (optional)
                            </span>
                          </Label>
                          <Input
                            type="text"
                            name="landmark"
                            value={newAddress.landmark}
                            onChange={handleAddressChange}
                            placeholder="e.g. Near Osu Castle"
                          />
                        </FormGroup>
                      </FormRow>

                      <FormRow>
                        <FormGroup>
                          <Label>City *</Label>
                          <Select
                            name="city"
                            value={newAddress.city}
                            onChange={handleAddressChange}
                            required
                          >
                            <option value="">Select City</option>
                            <option value="ACCRA">Accra</option>
                            <option value="TEMA">Tema</option>
                          </Select>
                          {errors.city && <ErrorText>{errors.city}</ErrorText>}
                          <HintText>Delivery available in Accra and Tema only</HintText>
                        </FormGroup>
                        <FormGroup>
                          <Label>Region *</Label>
                          <Input
                            type="text"
                            name="region"
                            value={newAddress.region}
                            onChange={handleAddressChange}
                            placeholder="e.g. Greater Accra"
                            required
                          />
                          {errors.region && <ErrorText>{errors.region}</ErrorText>}
                        </FormGroup>
                      </FormRow>

                      <FormGroup>
                        <Label>
                          Ghana Post Digital Address
                          <LocationButton
                            type="button"
                            onClick={getCurrentLocation}
                            disabled={isFetchingLocation}
                          >
                            <FaSearchLocation />
                            {isFetchingLocation ? "Detecting…" : "Auto-detect"}
                          </LocationButton>
                        </Label>
                        <Input
                          type="text"
                          name="digitalAddress"
                          value={newAddress.digitalAddress}
                          onChange={handleAddressChange}
                          placeholder="GA-123-4567"
                        />
                        {errors.digitalAddress && <ErrorText>{errors.digitalAddress}</ErrorText>}
                        {locationError && <ErrorText>{locationError}</ErrorText>}
                        <HintText>Format: AA-123-4567 (e.g., GA-123-4567)</HintText>
                      </FormGroup>
                    </AddressFormSection>

                    <ButtonGroup>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={closeAddressModal}
                        disabled={isAddressCreating}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="success"
                        size="sm"
                        loading={isAddressCreating}
                      >
                        Save Address
                      </Button>
                    </ButtonGroup>
                  </AddressForm>
                </AddressModalBody>
              </AddressModalCard>
            </AddressModalOverlay>
          )}

          {/* STEP 2: Delivery Method - Hide for pre-orders */}
          {!hasPreorderItem && (
          <StepCard>
            <StepCardHeader>
              <StepBadge $done={hasChosenDelivery}>
                {hasChosenDelivery ? <FaCheck /> : "2"}
              </StepBadge>
              <StepCardTitle>Delivery Method</StepCardTitle>
              <DeliveryNote>Accra &amp; Tema only</DeliveryNote>
            </StepCardHeader>

            <DeliveryOptions>
              {/* Pickup Center */}
              <DeliveryOption
                $selected={deliveryMethod === "pickup_center"}
                onClick={() => {
                  setDeliveryMethod("pickup_center");
                  setHasChosenDelivery(true);
                  setSelectedPickupCenterId(null);
                }}
              >
                <DeliveryContent>
                  <DeliveryIcon $selected={deliveryMethod === "pickup_center"}>
                    <FaStore />
                  </DeliveryIcon>
                  <DeliveryInfo>
                    <DeliveryTitle $selected={deliveryMethod === "pickup_center"}>
                      Pickup from Saiisai Center
                    </DeliveryTitle>
                    <DeliveryDescription>
                      Collect your order from one of our pickup centers. Free or
                      minimal fee.
                    </DeliveryDescription>
                    <DispatchFeeDisplay>
                      {buyerCity ? (
                        <strong>Shipping Fee: Free</strong>
                      ) : (
                        <span>Select address to see shipping fee</span>
                      )}
                    </DispatchFeeDisplay>
                  </DeliveryInfo>
                  {deliveryMethod === "pickup_center" && (
                    <SelectionCheckmark>
                      <FaCheck />
                    </SelectionCheckmark>
                  )}
                </DeliveryContent>
                <RadioInput
                  type="radio"
                  name="deliveryMethod"
                  checked={deliveryMethod === "pickup_center"}
                  onChange={() => {
                    setDeliveryMethod("pickup_center");
                    setHasChosenDelivery(true);
                    setSelectedPickupCenterId(null);
                  }}
                />
              </DeliveryOption>

              {deliveryMethod === "pickup_center" && (
                <PickupCenterSelector>
                  {isPickupCentersLoading ? (
                    <LoadingState message="Loading pickup centers..." />
                  ) : pickupCenters.length === 0 ? (
                    <ErrorState message="No pickup centers available for this city" />
                  ) : (
                    <>
                      <Label>Select Pickup Center *</Label>
                      <PickupCenterList>
                        {pickupCenters.map((center) => (
                          <PickupCenterItem
                            key={center._id}
                            $selected={selectedPickupCenterId === center._id}
                            onClick={() =>
                              setSelectedPickupCenterId(center._id)
                            }
                          >
                            <PickupCenterContent>
                              <PickupCenterName
                                $selected={
                                  selectedPickupCenterId === center._id
                                }
                              >
                                {center.pickupName}
                              </PickupCenterName>
                              <PickupCenterAddress>
                                <strong>Address:</strong> {center.address}
                              </PickupCenterAddress>
                              {center.area && (
                                <PickupCenterAddress>
                                  <strong>Area:</strong> {center.area},{" "}
                                  {center.city}
                                </PickupCenterAddress>
                              )}
                              {center.openingHours && (
                                <PickupCenterHours>
                                  <strong>Opening Hours:</strong>{" "}
                                  {center.openingHours}
                                </PickupCenterHours>
                              )}
                              {center.googleMapLink && (
                                <MapLink
                                  href={center.googleMapLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  View on Google Maps →
                                </MapLink>
                              )}
                            </PickupCenterContent>
                            {selectedPickupCenterId === center._id && (
                              <SelectionCheckmark>
                                <FaCheck />
                              </SelectionCheckmark>
                            )}
                            <RadioInput
                              type="radio"
                              name="pickupCenter"
                              checked={selectedPickupCenterId === center._id}
                              onChange={() =>
                                setSelectedPickupCenterId(center._id)
                              }
                            />
                          </PickupCenterItem>
                        ))}
                      </PickupCenterList>
                    </>
                  )}
                </PickupCenterSelector>
              )}

              {/* Dispatch */}
              <DeliveryOption
                $selected={deliveryMethod === "dispatch"}
                onClick={() => handleDeliveryMethodChange("dispatch")}
              >
                <DeliveryContent>
                  <DeliveryIcon $selected={deliveryMethod === "dispatch"}>
                    <FaTruck />
                  </DeliveryIcon>
                  <DeliveryInfo>
                    <DeliveryTitle $selected={deliveryMethod === "dispatch"}>
                      Saiisai Dispatch Rider
                    </DeliveryTitle>
                    <DeliveryDescription>
                      Fast delivery by Saiisai&apos;s own dispatch riders.
                      Calculated based on location and item type.
                    </DeliveryDescription>
                  </DeliveryInfo>
                  {deliveryMethod === "dispatch" && (
                    <SelectionCheckmark>
                      <FaCheck />
                    </SelectionCheckmark>
                  )}
                </DeliveryContent>
                <RadioInput
                  type="radio"
                  name="deliveryMethod"
                  checked={deliveryMethod === "dispatch"}
                  onChange={() => handleDeliveryMethodChange("dispatch")}
                />
              </DeliveryOption>

              {/* Shipping speed options — hidden when cart qualifies for platform free shipping */}
              {deliveryMethod === "dispatch" && buyerCity && (
                <>
                  {qualifiesForFreeShipping ? (
                    <DispatchShippingSection>
                      <FreeShippingCheckoutNote>
                        Free shipping applies to this order (minimum GH₵
                        {freeShippingMinGhs != null ? freeShippingMinGhs.toFixed(2) : ""}).
                      </FreeShippingCheckoutNote>
                    </DispatchShippingSection>
                  ) : (
                    <>
                      <DispatchShippingSection>
                        <ShippingOptions
                          weight={null}
                          city={buyerCity}
                          neighborhoodName={
                            selectedAddress
                              ? (
                                selectedAddress.area ||
                                selectedAddress.landmark ||
                                selectedAddress.streetAddress
                              )
                              : null
                          }
                          fragile={isFragileItem}
                          items={shippingItems}
                          selectedShippingType={deliverySpeed || "standard"}
                          onSelect={handleShippingSelect}
                        />
                      </DispatchShippingSection>

                      <FragileCheckboxContainer>
                        <FragileCheckboxLabel>
                          <input
                            type="checkbox"
                            checked={isFragileItem}
                            onChange={(e) => setIsFragileItem(e.target.checked)}
                          />
                          <span>Fragile Item (Additional handling required)</span>
                        </FragileCheckboxLabel>
                        {isFragileItem && (
                          <FragileHint>
                            Fragile items require special handling and may incur additional charges.
                          </FragileHint>
                        )}
                      </FragileCheckboxContainer>
                    </>
                  )}
                </>
              )}

            </DeliveryOptions>

            {isCalculatingShipping && (
              <LoadingState message="Calculating shipping..." />
            )}
          </StepCard>
          )}

          {/* Pre-order Info Message */}
          {hasPreorderItem && (
            <StepCard>
              <StepCardHeader>
                <StepBadge>2</StepBadge>
                <StepCardTitle>International Pre-Order</StepCardTitle>
              </StepCardHeader>
              <InfoText>
                This is an international pre-order. Shipping charges include international shipping, customs, and local delivery fees.
              </InfoText>
            </StepCard>
          )}

          {/* STEP 3: Payment Method */}
          <StepCard>
            <StepCardHeader>
              <StepBadge>3</StepBadge>
              <StepCardTitle>Payment Method</StepCardTitle>
              <SecurityBadge>
                <ShieldIcon>🔒</ShieldIcon>
                <span>Secure</span>
              </SecurityBadge>
            </StepCardHeader>

          <PaymentOptions>
            {/* Payment on Delivery */}
            <PaymentOption
              $selected={paymentMethod === "payment_on_delivery"}
              onClick={() => setPaymentMethod("payment_on_delivery")}
            >
              <PaymentContent>
                <PaymentIcon $selected={paymentMethod === "payment_on_delivery"}>
                  <FaCreditCard />
                </PaymentIcon>
                <PaymentInfo>
                  <PaymentTitle $selected={paymentMethod === "payment_on_delivery"}>
                    Payment on Delivery
                  </PaymentTitle>
                  <PaymentDescription>
                    Pay with cash when your order arrives or pay with mobile
                    money.
                    <br />
                    <PaymentNote>
                      * You can easily update your payment method when the rider arrives at your location.
                    </PaymentNote>
                  </PaymentDescription>
                </PaymentInfo>
                {paymentMethod === "payment_on_delivery" && (
                  <SelectionCheckmark>
                    <FaCheck />
                  </SelectionCheckmark>
                )}
              </PaymentContent>
              <RadioInput
                type="radio"
                name="payment"
                checked={paymentMethod === "payment_on_delivery"}
                onChange={() => setPaymentMethod("payment_on_delivery")}
                id="payment-delivery"
              />
            </PaymentOption>

            {/* Mobile Money */}
            <PaymentOption
              $selected={paymentMethod === "mobile_money"}
              onClick={() => setPaymentMethod("mobile_money")}
            >
              <PaymentContent>
                <PaymentIcon $selected={paymentMethod === "mobile_money"}>
                  <FaMobileAlt />
                </PaymentIcon>
                <PaymentInfo>
                  <PaymentTitle $selected={paymentMethod === "mobile_money"}>
                    Mobile Money
                  </PaymentTitle>
                  <PaymentDescription>
                    Pay via MTN Mobile Money, Vodafone Cash, etc. You will be
                    redirected to Paystack to complete your payment.
                  </PaymentDescription>
                </PaymentInfo>
                {paymentMethod === "mobile_money" && (
                  <SelectionCheckmark>
                    <FaCheck />
                  </SelectionCheckmark>
                )}
              </PaymentContent>
              <RadioInput
                type="radio"
                name="payment"
                checked={paymentMethod === "mobile_money"}
                onChange={() => setPaymentMethod("mobile_money")}
                id="payment-mobile"
              />
            </PaymentOption>

            {/* Bank Transfer */}
            <PaymentOption
              $selected={paymentMethod === "bank"}
              onClick={() => setPaymentMethod("bank")}
            >
              <PaymentContent>
                <PaymentIcon $selected={paymentMethod === "bank"}>
                  <FaUniversity />
                </PaymentIcon>
                <PaymentInfo>
                  <PaymentTitle $selected={paymentMethod === "bank"}>
                    Bank Transfer
                  </PaymentTitle>
                  <PaymentDescription>Direct bank transfer</PaymentDescription>

                  {paymentMethod === "bank" && (
                    <PaymentDetails>
                      <BankDetails>
                        <BankInfo>
                          <strong>Bank Name:</strong> {CHECKOUT_BANK_TRANSFER.bankName}
                        </BankInfo>
                        <BankInfo>
                          <strong>Branch:</strong> {CHECKOUT_BANK_TRANSFER.branch}
                        </BankInfo>
                        <BankInfo>
                          <strong>Account Name:</strong> {CHECKOUT_BANK_TRANSFER.accountName}
                        </BankInfo>
                        <BankInfo>
                          <strong>Account Number:</strong> {CHECKOUT_BANK_TRANSFER.accountNumber}
                        </BankInfo>
                        <BankInfo>
                          <strong>Reference:</strong> {CHECKOUT_BANK_TRANSFER.reference}
                        </BankInfo>
                      </BankDetails>
                      <BankNote>
                        Please use the reference number when making your
                        payment
                      </BankNote>
                    </PaymentDetails>
                  )}
                </PaymentInfo>
                {paymentMethod === "bank" && (
                  <SelectionCheckmark>
                    <FaCheck />
                  </SelectionCheckmark>
                )}
              </PaymentContent>
              <RadioInput
                type="radio"
                name="payment"
                checked={paymentMethod === "bank"}
                onChange={() => setPaymentMethod("bank")}
                id="payment-bank"
              />
            </PaymentOption>

            {/* Account Balance (Credit Balance) */}
            <PaymentOption
              $selected={paymentMethod === "credit_balance"}
              onClick={() => setPaymentMethod("credit_balance")}
              $disabled={hasInsufficientBalance}
            >
              <PaymentContent>
                <PaymentIcon $selected={paymentMethod === "credit_balance"}>
                  <FaCreditCard />
                </PaymentIcon>
                <PaymentInfo>
                  <PaymentTitle $selected={paymentMethod === "credit_balance"}>
                    Account Balance
                  </PaymentTitle>
                  <PaymentDescription>
                    Pay using your account credit balance
                  </PaymentDescription>

                  {paymentMethod === "credit_balance" && (
                    <PaymentDetails>
                      <BalanceDetails>
                        <BalanceInfo>
                          <strong>Current Balance:</strong> GH₵{creditBalance.toFixed(2)}
                        </BalanceInfo>
                        <BalanceInfo>
                          <strong>Order Total:</strong> GH₵{total.toFixed(2)}
                        </BalanceInfo>
                        {hasInsufficientBalance && (
                          <InsufficientBalanceWarning>
                            ⚠️ Insufficient Balance. You need GH₵{(total - creditBalance).toFixed(2)} more.
                          </InsufficientBalanceWarning>
                        )}
                      </BalanceDetails>
                    </PaymentDetails>
                  )}
                </PaymentInfo>
                {paymentMethod === "credit_balance" && (
                  <SelectionCheckmark>
                    <FaCheck />
                  </SelectionCheckmark>
                )}
              </PaymentContent>
              <RadioInput
                type="radio"
                name="payment"
                checked={paymentMethod === "credit_balance"}
                onChange={() => setPaymentMethod("credit_balance")}
                id="payment-credit-balance"
                disabled={hasInsufficientBalance}
              />
            </PaymentOption>
          </PaymentOptions>
          </StepCard>

        </CheckoutLeft>

        {/* ── RIGHT: Sticky Order Summary ── */}
        <CheckoutRight>
          <SummaryCard>
            <SummaryHeader>
              <h3>Order Summary</h3>
              <span>{rawItems.length} item{rawItems.length !== 1 ? "s" : ""}</span>
            </SummaryHeader>

            {/* Cart Item Thumbnails */}
            <CartItemsList>
              {products.map((item, idx) => (
                <CartItemRow key={idx}>
                  <CartItemImgWrap>
                    {item.product?.imageCover ? (
                      <CartItemImg
                        src={item.product.imageCover}
                        alt={item.product?.name || "Product"}
                        onError={(e) => { e.currentTarget.style.display = "none"; }}
                      />
                    ) : (
                      <CartItemImgPlaceholder />
                    )}
                    <CartItemQtyBadge>{item.quantity}</CartItemQtyBadge>
                  </CartItemImgWrap>
                  <CartItemInfo>
                    <CartItemName>{item.product?.name || "Product"}</CartItemName>
                    {item.sku && <CartItemVariant>{item.sku}</CartItemVariant>}
                  </CartItemInfo>
                  <CartItemPrice>
                    {(() => {
                      const variantPrice = item.sku
                        ? item.product?.variants?.find(
                          (v) =>
                            v.sku &&
                            v.sku.toUpperCase() === item.sku.toUpperCase()
                        )?.price
                        : null;
                      const baseUnitPrice =
                        variantPrice ??
                        item.product?.defaultPrice ??
                        item.product?.price ??
                        0;

                      // Prefer promo-aware backend unit price from cart when available.
                      const effectiveUnitPrice =
                        typeof item.unitPrice === "number" &&
                        item.unitPrice >= 0
                          ? item.unitPrice
                          : baseUnitPrice;
                      const lineTotal = effectiveUnitPrice * item.quantity;

                      if (
                        typeof item.originalUnitPrice === "number" &&
                        item.originalUnitPrice > effectiveUnitPrice
                      ) {
                        const originalLineTotal =
                          item.originalUnitPrice * item.quantity;
                        return (
                          <>
                            <CartItemOriginalPrice>
                              GH₵{originalLineTotal.toFixed(2)}
                            </CartItemOriginalPrice>
                            GH₵{lineTotal.toFixed(2)}
                          </>
                        );
                      }

                      return `GH₵${lineTotal.toFixed(2)}`;
                    })()}
                  </CartItemPrice>
                </CartItemRow>
              ))}
            </CartItemsList>

            <SummaryDivider />

            {/* Coupon */}
            <CouponSection>
              <CouponForm>
                <CouponInput
                  type="text"
                  placeholder="Promo / coupon code"
                  value={couponCode}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/<[^>]*>/g, "").substring(0, 50);
                    setCouponCode(raw);
                  }}
                  disabled={isApplyingCoupon || discount > 0}
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleApplyCoupon}
                  loading={isApplyingCoupon}
                  disabled={discount > 0}
                >
                  Apply
                </Button>
              </CouponForm>
              {couponMessage && (
                <CouponMessage $success={discount > 0}>{couponMessage}</CouponMessage>
              )}
              {couponError && (
                <ErrorState message={couponError?.message || "Failed to apply coupon"} />
              )}
            </CouponSection>

            <SummaryDivider />

            {/* Totals */}
            <SummaryRow>
              <span>Subtotal</span>
              <span>GH₵{(backendSubtotal ?? subTotal).toFixed(2)}</span>
            </SummaryRow>

            {hasPreorderItem && (
              <SummaryRow>
                <span>Order type</span>
                <span>{isInternationalPreorderEnabled ? "International Pre-order" : "Pre-order"}</span>
              </SummaryRow>
            )}

            {discount > 0 && (
              <SummaryRow $highlight>
                <span>Discount</span>
                <span>- GH₵{(backendDiscount ?? discount).toFixed(2)}</span>
              </SummaryRow>
            )}

            {isInternationalPreorderEnabled && supplierCountry && (
              <SummaryRow>
                <span>Country of origin</span>
                <span>{supplierCountry}</span>
              </SummaryRow>
            )}

            {isInternationalPreorderEnabled && internationalBreakdown ? (
              <>
                <SummaryRow>
                  <span>Int&apos;l Shipping ({supplierCountry})</span>
                  <span>GH₵{(internationalBreakdown.shippingCost || 0).toFixed(2)}</span>
                </SummaryRow>
                <SummaryRow>
                  <span>Customs &amp; Taxes</span>
                  <span>GH₵{(internationalBreakdown.totalCustoms || 0).toFixed(2)}</span>
                </SummaryRow>
                <SummaryRow>
                  <span>Clearing Fee</span>
                  <span>GH₵{(internationalBreakdown.clearingFee || 0).toFixed(2)}</span>
                </SummaryRow>
                <SummaryRowMuted>
                  <span>Estimated arrival 15–25 days. Customs delays may occur.</span>
                </SummaryRowMuted>
              </>
            ) : (
              <SummaryRow>
                <span>Delivery</span>
                <span>
                  {isCalculatingShipping ? (
                    <LoadingSpinner size="sm" />
                  ) : shippingFee > 0 ? (
                    `GH₵${shippingFee.toFixed(2)}`
                  ) : (
                    "Free"
                  )}
                </span>
              </SummaryRow>
            )}

            <SummaryTotalRow>
              <span>Total</span>
              <TotalAmount>GH₵{total.toFixed(2)}</TotalAmount>
            </SummaryTotalRow>

            <PlaceOrderBtn
              onClick={handlePlaceOrder}
              disabled={isCreatingOrder || hasInsufficientBalance}
            >
              {isCreatingOrder ? (
                <LoadingSpinner size="sm" />
              ) : paymentMethod === "mobile_money" ? (
                "Place Order & Pay →"
              ) : paymentMethod === "credit_balance" ? (
                hasInsufficientBalance ? "Insufficient Balance" : "Place Order & Pay →"
              ) : (
                "Place Order →"
              )}
            </PlaceOrderBtn>

            {(createOrderError || formError) && (
              <ErrorState
                message={
                  createOrderError?.response?.data?.message ||
                  formError ||
                  createOrderError?.message ||
                  "Something went wrong"
                }
              />
            )}

            <TrustRow>
              <span>🔒 SSL Encrypted</span>
              <span>💳 📱 🏦</span>
            </TrustRow>
          </SummaryCard>
        </CheckoutRight>

      </CheckoutGrid>
    </CheckoutContainer>
  );
};

// ────────────────────────────────────────────────
// Styled Components — Modern Redesign
// ────────────────────────────────────────────────

// ── Page layout ──────────────────────────────────

const CheckoutContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 16px 80px;
  min-height: 100vh;
  background: #f4f6f8;
`;

const CheckoutHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 28px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e2e8f0;

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const CheckoutTitle = styled.h1`
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--color-grey-900);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ProgressSteps = styled.div`
  display: flex;
  align-items: center;
`;

const StepItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`;

const StepBubble = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 700;
  transition: all 0.3s ease;
  background: ${({ $done, $active }) =>
    $done
      ? "var(--color-primary)"
      : $active
        ? "var(--color-primary-100)"
        : "#e2e8f0"};
  color: ${({ $done, $active }) =>
    $done ? "white" : $active ? "var(--color-primary-700)" : "#94a3b8"};
`;

const StepLabel = styled.span`
  font-size: 0.68rem;
  font-weight: 600;
  color: var(--color-grey-500);
  white-space: nowrap;

  @media (max-width: 480px) {
    display: none;
  }
`;

const StepConnector = styled.div`
  width: 44px;
  height: 2px;
  background: ${({ $done }) => ($done ? "var(--color-primary)" : "#e2e8f0")};
  margin-bottom: 18px;
  transition: background 0.3s ease;

  @media (max-width: 480px) {
    width: 24px;
  }
`;

const CheckoutGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  align-items: start;

  @media (min-width: 992px) {
    grid-template-columns: 1.55fr 1fr;
  }
`;

const CheckoutLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const CheckoutRight = styled.div`
  @media (min-width: 992px) {
    position: sticky;
    top: 80px;
  }
`;

// ── Step Cards ────────────────────────────────────

const StepCard = styled.div`
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06), 0 4px 16px rgba(0, 0, 0, 0.04);
`;

const StepCardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
`;

const StepBadge = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: 700;
  flex-shrink: 0;
  transition: all 0.3s ease;
  background: ${({ $done }) =>
    $done ? "var(--color-primary)" : "var(--color-primary-100)"};
  color: ${({ $done }) =>
    $done ? "white" : "var(--color-primary-700)"};
`;

const StepCardTitle = styled.h2`
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-grey-900);
  margin: 0;
`;

const DeliveryNote = styled.span`
  margin-left: auto;
  font-size: 0.75rem;
  color: var(--color-primary-700);
  background: var(--color-primary-50);
  border: 1px solid var(--color-primary-200);
  border-radius: 20px;
  padding: 3px 10px;
  white-space: nowrap;
`;

// ── Order Summary sidebar ─────────────────────────

const SummaryCard = styled.div`
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06), 0 4px 16px rgba(0, 0, 0, 0.04);
`;

const SummaryHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;

  h3 {
    font-size: 1rem;
    font-weight: 700;
    color: var(--color-grey-900);
    margin: 0;
  }

  span {
    font-size: 0.78rem;
    color: var(--color-grey-500);
    background: var(--color-grey-100);
    border-radius: 12px;
    padding: 2px 8px;
  }
`;

const CartItemsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 240px;
  overflow-y: auto;
  margin-bottom: 4px;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--color-grey-300);
    border-radius: 4px;
  }
`;

const CartItemRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const CartItemImgWrap = styled.div`
  position: relative;
  flex-shrink: 0;
`;

const CartItemImg = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 10px;
  object-fit: cover;
  background: var(--color-grey-100);
  border: 1px solid var(--color-grey-200);
  display: block;
`;

const CartItemImgPlaceholder = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 10px;
  background: var(--color-grey-100);
  border: 1px solid var(--color-grey-200);
`;

const CartItemQtyBadge = styled.span`
  position: absolute;
  top: -6px;
  right: -6px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--color-primary);
  color: white;
  font-size: 0.65rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CartItemInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const CartItemName = styled.div`
  font-size: 0.83rem;
  font-weight: 500;
  color: var(--color-grey-900);
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CartItemVariant = styled.div`
  font-size: 0.72rem;
  color: var(--color-grey-400);
  margin-top: 2px;
`;

const CartItemPrice = styled.div`
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--color-grey-800);
  white-space: nowrap;
  flex-shrink: 0;
`;

const CartItemOriginalPrice = styled.span`
  color: var(--color-grey-400);
  text-decoration: line-through;
  margin-right: 0.35rem;
  font-weight: 500;
`;

const SummaryDivider = styled.hr`
  border: none;
  border-top: 1px solid var(--color-grey-100);
  margin: 14px 0;
`;

const CouponSection = styled.div`
  margin-bottom: 4px;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.88rem;
  color: ${({ $highlight }) =>
    $highlight ? "var(--color-green-700)" : "var(--color-grey-600)"};
  margin-bottom: 8px;
`;

const SummaryRowMuted = styled(SummaryRow)`
  font-size: 0.78rem;
  color: var(--color-grey-400);
`;

const SummaryTotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-grey-900);
  margin: 14px 0;
  padding-top: 12px;
  border-top: 2px solid var(--color-grey-200);
`;

const TotalAmount = styled.span`
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--color-primary-700);
`;

const PlaceOrderBtn = styled.button`
  width: 100%;
  padding: 15px;
  background: linear-gradient(135deg, #D4882A 0%, #f0a845 100%);
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 4px 14px rgba(212, 136, 42, 0.4);
  letter-spacing: 0.01em;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(212, 136, 42, 0.5);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    box-shadow: none;
  }
`;

const TrustRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 14px;
  font-size: 0.75rem;
  color: var(--color-grey-400);
`;

// ── Address ───────────────────────────────────────

/* ── Tab toggle (pill switcher) ── */
const TabToggleWrap = styled.div`
  display: flex;
  gap: 4px;
  background: var(--color-grey-100);
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 20px;
`;

const TabToggle = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 9px 16px;
  border: none;
  border-radius: 9px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${({ $active }) => ($active ? "#fff" : "transparent")};
  color: ${({ $active }) =>
    $active ? "var(--color-primary-700)" : "var(--color-grey-500)"};
  box-shadow: ${({ $active }) =>
    $active ? "0 1px 4px rgba(0,0,0,0.10)" : "none"};

  &:hover {
    color: ${({ $active }) =>
      $active ? "var(--color-primary-700)" : "var(--color-grey-700)"};
    background: ${({ $active }) => ($active ? "#fff" : "var(--color-grey-200)")};
  }
`;

const TabContent = styled.div`
  margin-top: 4px;
`;

const EmptyAddressState = styled.div`
  border: 1px dashed var(--color-grey-300);
  border-radius: 12px;
  padding: 18px;
  background: var(--color-grey-50);
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: flex-start;

  p {
    margin: 0;
    color: var(--color-grey-600);
    font-size: 0.9rem;
  }
`;

const AddressModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  z-index: 1100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
`;

const AddressModalCard = styled.div`
  width: min(760px, 100%);
  max-height: min(90vh, 920px);
  background: #fff;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 24px 56px rgba(15, 23, 42, 0.28);
  overflow: hidden;
`;

const AddressModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid var(--color-grey-200);
`;

const AddressModalTitle = styled.h3`
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-grey-900);
`;

const AddressModalClose = styled.button`
  border: none;
  background: transparent;
  color: var(--color-grey-500);
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;

  &:hover {
    background: var(--color-grey-100);
    color: var(--color-grey-800);
  }
`;

const AddressModalBody = styled.div`
  overflow-y: auto;
  padding: 10px 12px 12px;
`;

const AddressList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const AddressItem = styled.div`
  position: relative;
  padding: 14px 16px;
  border: 2px solid
    ${(props) =>
      props.$selected ? "var(--color-primary-500)" : "var(--color-grey-200)"};
  border-radius: 12px;
  background: ${(props) =>
    props.$selected
      ? "linear-gradient(135deg, var(--color-primary-50) 0%, #fffbf0 100%)"
      : "white"};
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: ${(props) =>
    props.$selected
      ? "0 2px 10px rgba(212, 136, 42, 0.15)"
      : "0 1px 3px rgba(0,0,0,0.04)"};

  &:hover {
    border-color: var(--color-primary-400);
    box-shadow: 0 4px 14px rgba(212, 136, 42, 0.15);
  }
`;

const AddressContent = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
`;

const AddressIcon = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: ${(props) =>
    props.$selected ? "var(--color-primary-500)" : "var(--color-grey-100)"};
  color: ${(props) =>
    props.$selected ? "white" : "var(--color-grey-400)"};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  flex-shrink: 0;
  transition: all 0.2s ease;
`;

const AddressInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

const AddressName = styled.div`
  font-weight: 600;
  font-size: 0.92rem;
  color: ${(props) =>
    props.$selected ? "var(--color-primary-700)" : "var(--color-grey-900)"};
`;

const AddressText = styled.div`
  font-size: 0.8rem;
  color: var(--color-grey-500);
  line-height: 1.4;
`;

const AddressLocation = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const DefaultBadge = styled.span`
  display: inline-block;
  padding: 2px 8px;
  background: var(--color-green-100);
  color: var(--color-green-700);
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 600;
  margin-top: 4px;
`;

const SelectionCheckmark = styled.span`
  position: absolute;
  top: 12px;
  right: 12px;
  width: 20px;
  height: 20px;
  background: var(--color-primary-500);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  box-shadow: 0 2px 6px rgba(212, 136, 42, 0.4);
  animation: ${pulse} 0.3s ease-out;
`;

const AddressForm = styled.form`
  margin-top: 4px;
`;

const AddressFormSection = styled.div`
  padding: 10px 12px;
  background: var(--color-grey-50);
  border-radius: 10px;
  margin-bottom: 8px;
`;

const AddressFormSectionLabel = styled.div`
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-grey-400);
  margin-bottom: 8px;
`;

const FormGroup = styled.div`
  margin-bottom: 8px;
`;

const FormRow = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 8px;

  @media (max-width: 500px) {
    flex-direction: column;
    gap: 0;
  }
`;

const Label = styled.label`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 3px;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-grey-700);
`;

const Input = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1.5px solid
    ${(props) =>
      props.error ? "var(--color-red-500)" : "var(--color-grey-300)"};
  border-radius: 10px;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  background: white;

  &:focus {
    border-color: var(--color-primary-500);
    box-shadow: 0 0 0 3px rgba(212, 136, 42, 0.1);
  }

  &::placeholder {
    color: var(--color-grey-400);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 8px 12px;
  border: 1.5px solid var(--color-grey-300);
  border-radius: 10px;
  font-size: 0.9rem;
  background: white;
  outline: none;
  cursor: pointer;

  &:focus {
    border-color: var(--color-primary-500);
    box-shadow: 0 0 0 3px rgba(212, 136, 42, 0.1);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 8px;
`;

const RadioInput = styled.input`
  display: none;
`;

// ── Delivery ──────────────────────────────────────

const DeliveryOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const DeliveryOption = styled.div`
  border: 2px solid
    ${(props) =>
      props.$selected ? "var(--color-primary)" : "var(--color-grey-200)"};
  border-radius: 12px;
  padding: 14px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${(props) =>
    props.$selected ? "var(--color-primary-50)" : "white"};
  position: relative;
  box-shadow: ${(props) =>
    props.$selected
      ? "0 2px 10px rgba(212,136,42,0.12)"
      : "0 1px 3px rgba(0,0,0,0.04)"};

  &:hover {
    border-color: var(--color-primary-400);
    box-shadow: 0 4px 14px rgba(212, 136, 42, 0.12);
  }
`;

const DeliveryContent = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
`;

const DeliveryIcon = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(props) =>
    props.$selected ? "var(--color-primary)" : "var(--color-grey-100)"};
  color: ${(props) =>
    props.$selected ? "white" : "var(--color-grey-400)"};
  font-size: 1rem;
  flex-shrink: 0;
  transition: all 0.2s ease;
`;

const DeliveryInfo = styled.div`
  flex: 1;
`;

const DeliveryTitle = styled.h4`
  font-size: 0.92rem;
  font-weight: 600;
  margin: 0 0 4px;
  color: ${(props) =>
    props.$selected ? "var(--color-primary-700)" : "var(--color-grey-900)"};
`;

const DeliveryDescription = styled.p`
  font-size: 0.8rem;
  color: var(--color-grey-500);
  line-height: 1.5;
  margin: 0;
`;

const DispatchFeeDisplay = styled.div`
  margin-top: 6px;
  font-size: 0.8rem;
  color: var(--color-primary-700);
  font-weight: 500;
`;

const DispatchShippingSection = styled.div`
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--color-grey-200);
`;

const DispatchShippingTitle = styled.h3`
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-grey-900);
  margin-bottom: 10px;
`;

const FreeShippingCheckoutNote = styled.p`
  margin: 0;
  padding: 10px 14px;
  font-size: 0.82rem;
  color: var(--color-green-800);
  background: var(--color-green-50);
  border: 1px solid var(--color-green-200);
  border-radius: 10px;
`;

const DeliverySpeedOptions = styled.div`
  margin-top: 10px;
  padding: 12px;
  background: var(--color-grey-50);
  border-radius: 10px;
  border: 1px solid var(--color-grey-200);
`;

const SpeedOptionLabel = styled.div`
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--color-grey-700);
  margin-bottom: 8px;
`;

const SpeedOptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SpeedOption = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: 2px solid
    ${(props) =>
      props.$selected ? "var(--color-primary)" : "var(--color-grey-200)"};
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${(props) => (props.$selected ? "var(--color-primary-50)" : "white")};

  &:hover {
    border-color: var(--color-primary-300);
    background: var(--color-primary-50);
  }
`;

const SpeedRadio = styled.input`
  width: 1rem;
  height: 1rem;
  cursor: pointer;
  accent-color: var(--color-primary);
`;

const SpeedContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const SpeedTitle = styled.div`
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--color-grey-900);
`;

const SpeedDescription = styled.div`
  font-size: 0.78rem;
  color: var(--color-grey-500);
`;

const PickupCenterSelector = styled.div`
  margin-top: 10px;
  padding: 14px;
  background: var(--color-grey-50);
  border-radius: 10px;
`;

const PickupCenterList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
`;

const PickupCenterItem = styled.div`
  border: 2px solid
    ${(props) =>
      props.$selected ? "var(--color-primary)" : "var(--color-grey-200)"};
  border-radius: 10px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${(props) =>
    props.$selected ? "var(--color-primary-50)" : "white"};
  position: relative;

  &:hover {
    border-color: var(--color-primary);
  }
`;

const PickupCenterContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const PickupCenterName = styled.h5`
  font-size: 0.88rem;
  font-weight: 600;
  color: ${(props) =>
    props.$selected ? "var(--color-primary)" : "var(--color-grey-900)"};
  margin: 0;
`;

const PickupCenterAddress = styled.p`
  font-size: 0.78rem;
  color: var(--color-grey-600);
  margin: 0;
`;

const PickupCenterHours = styled.p`
  font-size: 0.78rem;
  color: var(--color-grey-500);
  font-style: italic;
  margin: 0;
`;

const MapLink = styled.a`
  color: var(--color-primary);
  font-size: 0.78rem;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

// ── Payment ───────────────────────────────────────

const PaymentOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const PaymentOption = styled.div`
  position: relative;
  padding: 14px 16px;
  border: 2px solid
    ${(props) =>
      props.$selected
        ? "var(--color-primary-500)"
        : props.$disabled
          ? "var(--color-grey-300)"
          : "var(--color-grey-200)"};
  border-radius: 12px;
  background: ${(props) =>
    props.$selected
      ? "linear-gradient(135deg, var(--color-primary-50) 0%, #fffbf0 100%)"
      : props.$disabled
        ? "var(--color-grey-50)"
        : "white"};
  cursor: ${(props) => (props.$disabled ? "not-allowed" : "pointer")};
  opacity: ${(props) => (props.$disabled ? 0.6 : 1)};
  transition: all 0.2s ease;
  box-shadow: ${(props) =>
    props.$selected
      ? "0 2px 10px rgba(212, 136, 42, 0.15)"
      : "0 1px 3px rgba(0,0,0,0.04)"};

  &:hover {
    border-color: ${(props) =>
      props.$disabled ? "var(--color-grey-300)" : "var(--color-primary-400)"};
  }
`;

const PaymentContent = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
`;

const PaymentIcon = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: ${(props) =>
    props.$selected ? "var(--color-primary-500)" : "var(--color-grey-100)"};
  color: ${(props) =>
    props.$selected ? "white" : "var(--color-grey-400)"};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
  transition: all 0.2s ease;
`;

const PaymentInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

const PaymentTitle = styled.div`
  font-weight: ${(props) => (props.$selected ? "700" : "600")};
  font-size: 0.92rem;
  color: ${(props) =>
    props.$selected ? "var(--color-primary-700)" : "var(--color-grey-900)"};
`;

const PaymentDescription = styled.div`
  font-size: 0.8rem;
  color: var(--color-grey-500);
  line-height: 1.5;
`;

const PaymentNote = styled.strong`
  color: var(--color-primary-600);
  display: inline-block;
  margin-top: 4px;
`;

const BankNote = styled.p`
  margin-top: 10px;
  font-size: 0.9rem;
`;

const PaymentDetails = styled.div`
  margin-top: 10px;
`;

const BankDetails = styled.div`
  padding: 10px 12px;
  background: var(--color-grey-50);
  border-radius: 8px;
  border: 1px solid var(--color-grey-200);
`;

const BankInfo = styled.div`
  font-size: 0.82rem;
  margin-bottom: 4px;
  color: var(--color-grey-700);
`;

const BalanceDetails = styled.div`
  padding: 10px 12px;
  background: var(--color-grey-50);
  border-radius: 8px;
  border: 1px solid var(--color-grey-200);
`;

const BalanceInfo = styled.div`
  font-size: 0.82rem;
  margin-bottom: 4px;
  color: var(--color-grey-700);

  strong {
    color: var(--color-grey-900);
  }
`;

const InsufficientBalanceWarning = styled.div`
  margin-top: 8px;
  padding: 8px 10px;
  background: var(--color-red-50);
  border: 1px solid var(--color-red-300);
  border-radius: 8px;
  color: var(--color-red-700);
  font-size: 0.8rem;
  font-weight: 500;
`;

// ── Misc ──────────────────────────────────────────

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 10px;
`;

const SectionTitle = styled.h2`
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
`;

const SecurityBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.76rem;
  color: var(--color-green-700);
  background: var(--color-green-50);
  border: 1px solid var(--color-green-200);
  border-radius: 20px;
  padding: 3px 10px;
  margin-left: auto;
`;

const ShieldIcon = styled.span`
  font-size: 0.85rem;
`;

const FragileCheckboxContainer = styled.div`
  margin-top: 12px;
  padding: 12px;
  background: var(--color-grey-50);
  border-radius: 10px;
  border: 1px solid var(--color-grey-200);
`;

const FragileCheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;

  input[type="checkbox"] {
    width: 1rem;
    height: 1rem;
    cursor: pointer;
    accent-color: var(--color-primary);
  }

  span {
    font-size: 0.85rem;
    color: var(--color-grey-900);
    font-weight: 500;
  }
`;

const FragileHint = styled.div`
  margin-top: 6px;
  padding-left: 1.5rem;
  font-size: 0.78rem;
  color: var(--color-grey-500);
`;

const ErrorText = styled.span`
  color: var(--color-red-700);
  font-size: 0.76rem;
  display: block;
  margin-top: 4px;
`;

const LocationButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.76rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: var(--color-primary-700);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;


const HintText = styled.span`
  color: var(--color-grey-500);
  font-size: 0.76rem;
  display: block;
  margin-top: 4px;
`;

const InfoText = styled.p`
  margin: 0;
  padding: 10px 14px;
  background: #eff6ff;
  border-left: 3px solid #60a5fa;
  border-radius: 8px;
  font-size: 0.82rem;
  color: #1d4ed8;
  line-height: 1.5;
`;

const CouponForm = styled.div`
  display: flex;
  gap: 8px;
  position: relative;
`;

const CouponInput = styled.input`
  flex: 1;
  padding: 10px 14px;
  border: 1.5px solid var(--color-grey-300);
  border-radius: 10px;
  font-size: 0.88rem;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: var(--color-primary);
  }

  &::placeholder {
    color: var(--color-grey-400);
  }
`;

const CouponMessage = styled.div`
  margin-top: 6px;
  font-size: 0.8rem;
  color: ${(props) =>
    props.$success ? "var(--color-green-700)" : "var(--color-red-700)"};
`;

export default CheckoutPage;
