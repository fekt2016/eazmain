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
} from "react-icons/fa";
import { useGetUserAddress, useCreateAddress } from "../../shared/hooks/useAddress";
import { useCreateOrder } from "../../shared/hooks/useOrder";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
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
import { sanitizeCouponCode, sanitizeText, sanitizePhone, validateQuantity } from "../../shared/utils/sanitize";
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
  logger.log("📦 getShippingItems called with rawItems:", rawItems);
  logger.log("📦 rawItems type:", typeof rawItems);
  logger.log("📦 rawItems is array?", Array.isArray(rawItems));
  logger.log("📦 rawItems.length:", rawItems?.length);
  
  if (!rawItems || !Array.isArray(rawItems) || rawItems.length === 0) {
    logger.warn("⚠️ getShippingItems: rawItems is empty or not an array");
    return [];
  }
  
  const mapped = rawItems
    .map((item, index) => {
      logger.log(`📦 Processing item ${index}:`, item);
      logger.log(`📦 Item ${index} - product:`, item.product);
      logger.log(`📦 Item ${index} - product._id:`, item.product?._id);
      logger.log(`📦 Item ${index} - product.seller:`, item.product?.seller);
      logger.log(`📦 Item ${index} - product.seller._id:`, item.product?.seller?._id);
      logger.log(`📦 Item ${index} - quantity:`, item.quantity);
      
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
      
      const mappedItem = {
        productId: item.product?._id || item.product?.id || item.productId,
        sellerId: sellerId,
        quantity: item.quantity || 1,
      };
      
      logger.log(`📦 Item ${index} mapped:`, mappedItem);
      logger.log(`📦 Item ${index} - hasProductId:`, !!mappedItem.productId);
      logger.log(`📦 Item ${index} - hasSellerId:`, !!mappedItem.sellerId);
      logger.log(`📦 Item ${index} - sellerId value:`, sellerId);
      logger.log(`📦 Item ${index} - productId value:`, mappedItem.productId);
      
      return mappedItem;
    });
  
  const filtered = mapped.filter((item) => {
    const isValid = item.productId && item.sellerId;
    if (!isValid) {
      logger.warn("⚠️ Filtering out item - missing productId or sellerId:", item);
    }
    return isValid;
  });
  
  logger.log("📦 Final shippingItems:", filtered);
  logger.log("📦 Final shippingItems.length:", filtered.length);
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
  
  // Delivery method states
  const [deliveryMethod, setDeliveryMethod] = useState("dispatch");
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
    
    // DEBUG: Log wallet balance details for troubleshooting
    if ((typeof __DEV__ !== 'undefined' && __DEV__) || process.env.NODE_ENV !== 'production') {
      if (walletData) {
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
      (rawItems || []).map((item) => {
        // CRITICAL: Extract sku (standardized field name) with backward compatibility
        let sku = item.sku || item.variantSku || null;
        
        // Backward compatibility: If sku missing, try to resolve from variant
        if (!sku && item.variant) {
          // Case 1: variant object with SKU
          if (typeof item.variant === 'object' && item.variant !== null && item.variant.sku) {
            sku = item.variant.sku.trim().toUpperCase();
          }
          // Case 2: variant ID - resolve from product variants
          else if (Array.isArray(item.product?.variants)) {
            const variantId = typeof item.variant === 'string' 
              ? item.variant 
              : (item.variant._id?.toString ? item.variant._id.toString() : String(item.variant._id || item.variant));
            
            if (variantId) {
              const found = item.product.variants.find(
                (v) => {
                  const vId = v._id?.toString ? v._id.toString() : String(v._id);
                  return vId === variantId;
                }
              );
              if (found?.sku) {
                sku = found.sku.trim().toUpperCase();
              }
            }
          }
        }
        
        // Case 3: Single-variant product auto-assignment
        if (!sku && Array.isArray(item.product?.variants) && item.product.variants.length === 1) {
          const variantSku = item.product.variants[0].sku;
          if (variantSku) {
            sku = variantSku.trim().toUpperCase();
          }
        }
        
        return {
          product: item.product,
          quantity: item.quantity,
          sku: sku, // Standardized field name - SKU is the unit of commerce
        };
      }),
    [rawItems]
  );

  const hasPreorderItem = useMemo(
    () => products.some((item) => item.product?.isPreOrder),
    [products],
  );

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
          item.product?.isEazShopProduct ||
          item.product?.seller?.role === "eazshop_store"
      ),
    [products]
  );

  // Selected address
  const selectedAddress = address.find((addr) => addr._id === selectedAddressId);

  // Buyer city: prefer selected address on "existing" tab, else new address on "new" tab
  const buyerCity =
    activeTab === "existing" && selectedAddress?.city
    ? selectedAddress.city.toUpperCase()
      : activeTab === "new" && newAddress?.city
    ? newAddress.city.toUpperCase()
    : selectedAddress?.city?.toUpperCase() || null;
  
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
    
    // DEBUG: Log balance check details
    if ((typeof __DEV__ !== 'undefined' && __DEV__) || process.env.NODE_ENV !== 'production') {
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
        discount,
        newAddress,
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
    discount,
    newAddress,
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
        if (savedState.discount) setDiscount(savedState.discount);
        if (savedState.newAddress) setNewAddress(savedState.newAddress);
    }
  }, [isAuthenticated]);

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
    cartData,
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

  // If user has no addresses, open "new" tab by default
  useEffect(() => {
    if (!isAddressLoading && address.length === 0) {
      setActiveTab("new");
    }
  }, [isAddressLoading, address]);

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
    logger.log("🔄 Delivery method changed to:", method);
    setDeliveryMethod(method);
    // Reset delivery speed when switching away from dispatch
    if (method !== "dispatch") {
      setDeliverySpeed("standard");
    }
    // Shipping calculation will happen automatically via useEffect when deliveryMethod changes
  };

  const handleAddressSelect = (addressId) => {
    setSelectedAddressId(addressId);
    setActiveTab("existing");
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setErrors({});
    setFormError("");

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
      setNewAddress((prev) => ({ ...prev, [name]: value.toUpperCase() }));
      return;
    }

    setNewAddress((prev) => ({ ...prev, [name]: value }));
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
            const digitalAddressResponse = await locationApi.convertCoordinatesToDigitalAddress(latitude, longitude);
            const digitalAddressData = digitalAddressResponse?.data || digitalAddressResponse;
            console.log("digitalAddressData", digitalAddressData);
            digitalAddress = digitalAddressData?.digitalAddress || "";
          } catch (digitalError) {
            // If digital address conversion fails, log but don't block the rest of the flow
            logger.warn("Failed to convert coordinates to GhanaPost GPS digital address:", digitalError);
            // Fallback: Generate a basic format if conversion fails
            const latSuffix = Math.floor((Math.abs(latitude) % 1) * 10000);
            const lngPrefix = Math.abs(Math.floor(longitude));
            digitalAddress = `GA-${String(lngPrefix).padStart(3, "0")}-${String(latSuffix).padStart(4, "0")}`;
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
                ? (prev.area || "")
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
        logger.error("Geolocation error:", error);
        
        // Handle different geolocation error codes
        let errorMessage = "Location access denied. Please enable location services.";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied. Please enable location services in your browser settings.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable. Please enter your address manually.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out. Please try again.";
            break;
          default:
            errorMessage = "Failed to get your location. Please enter address manually.";
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

    const formattedAddress = {
      ...newAddress,
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

    if (
      activeTab === "new" &&
      (!newAddress.city || !newAddress.streetAddress)
    ) {
      setFormError("Please complete the shipping address form");
      return;
    }

    if (deliveryMethod === "pickup_center" && !selectedPickupCenterId) {
      setFormError("Please select a pickup center");
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
        deliverySpeed: deliverySpeed === "same_day" ? "same_day" : "standard",
        shippingType: deliverySpeed === "same_day" ? "same_day" : "standard",
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
            logger.log("[CheckoutPage] Initializing Paystack payment for order:", order._id);
            const { redirectTo } = await initializePaystackPayment({
              orderId: order._id,
              // SECURITY: Do NOT send amount - backend calculates from order.total
              email: order.user?.email || "",
            });

            logger.log("[CheckoutPage] Redirecting to Paystack:", redirectTo);
            
            // SECURITY: Validate redirect URL before redirecting (already validated in paymentApi)
            // Additional validation here as defense in depth
            try {
              const url = new URL(redirectTo);
              const isValidPaystack = url.hostname === 'paystack.com' || 
                                     url.hostname.endsWith('.paystack.com') ||
                                     url.hostname === 'checkout.paystack.com';
              
              if (!isValidPaystack) {
                throw new Error('Invalid payment redirect URL');
              }
            } catch (error) {
              logger.error("[CheckoutPage] Invalid redirect URL:", redirectTo);
              setFormError('Invalid payment redirect URL. Please contact support.');
              return;
            }
            
            // Use window.location.href for full page redirect to Paystack
            // After payment, Paystack will redirect back to our callback URL
            window.location.href = redirectTo;
          } catch (paymentError) {
            logger.error("[CheckoutPage] Payment initialization error:", paymentError);
            setFormError(
              paymentError.response?.data?.message ||
                "Failed to initialize payment. Please try again."
            );
            // IMPORTANT: Order has been created but payment did not start.
            // Redirect user to order confirmation page so they can retry payment safely.
            try {
              const confirmationPath = `/order-confirmation?orderId=${order._id}`;
              navigate(confirmationPath);
            } catch (navError) {
              logger.error("[CheckoutPage] Failed to navigate to order confirmation after payment error:", navError);
            }
          }
        } else if (paymentMethod === "credit_balance") {
          // Credit balance payment is handled on the backend
          // Navigate to order confirmation page
          logger.log("[CheckoutPage] Credit balance payment - navigating to order confirmation");
          const confirmationPath = `/order-confirmation?orderId=${order._id}`;
          navigate(confirmationPath);
        } else {
          // For non-Paystack payments (COD, bank transfer), navigate directly with order data
          // Use the same URL structure as Paystack: /order-confirmation?orderId=xxx
          // This ensures consistency between payment methods
          logger.log("[CheckoutPage] Navigating to order confirmation (non-Paystack payment)");
          
          // Safety check: Ensure we're in the eazmain app (port 5173), not admin app (port 5174)
          const currentPort = window.location.port;
          const isEazmain = currentPort === '5173' || currentPort === '' || !currentPort.includes('5174');
          
          if (!isEazmain) {
            logger.error(`[CheckoutPage] ❌ CRITICAL: Current port is ${currentPort}, expected 5173 (eazmain)`);
            logger.error(`[CheckoutPage] Current URL: ${window.location.href}`);
            logger.error(`[CheckoutPage] This should not happen - you may be in the wrong app!`);
          }
          
          // CRITICAL: Invalidate wallet balance immediately for UI update (if wallet payment)
          if (paymentMethod === "credit_balance" || paymentMethod === "wallet") {
            logger.log('[CheckoutPage] 💰 Wallet payment detected - invalidating wallet balance');
            queryClient.invalidateQueries({ queryKey: ['wallet', 'balance'] });
            queryClient.invalidateQueries({ queryKey: ['creditBalance'] });
            queryClient.refetchQueries({ queryKey: ['wallet', 'balance'] });
          }
          
          // Build URL with query parameter (same format as Paystack redirect)
          // Paystack redirects to: /order-confirmation?orderId=XXX&reference=YYY&trxref=YYY
          // We'll use: /order-confirmation?orderId=XXX (reference/trxref only for Paystack)
          const confirmationPath = `/order-confirmation?orderId=${order._id}`;
          
          logger.log(`[CheckoutPage] Navigating to: ${confirmationPath}`);
          logger.log(`[CheckoutPage] Current location: ${window.location.pathname}`);
          logger.log(`[CheckoutPage] Current origin: ${window.location.origin}`);
          
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
      <CheckoutGrid>
        {/* Shipping Section */}
        <ShippingSection>
          <SectionHeader>
            <SectionTitle>Shipping Information</SectionTitle>
          </SectionHeader>

          <TabContainer>
            <TabButton
              as={activeTab === "existing" ? PrimaryButton : GhostButton}
              $size="sm"
              $active={activeTab === "existing"}
              onClick={() => setActiveTab("existing")}
            >
              Select Address
            </TabButton>
            <TabButton
              as={activeTab === "new" ? PrimaryButton : GhostButton}
              $size="sm"
              $active={activeTab === "new"}
              onClick={() => setActiveTab("new")}
            >
              Add New Address
            </TabButton>
          </TabContainer>

          <TabContent>
            {activeTab === "existing" ? (
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
                <FormRow>
                  <FormGroup>
                    <Label>Full Name *</Label>
                    <Input
                      type="text"
                      name="fullName"
                      value={newAddress.fullName}
                      onChange={handleAddressChange}
                      placeholder="Full name"
                      required
                    />
                    {errors.fullName && (
                      <ErrorText>{errors.fullName}</ErrorText>
                    )}
                  </FormGroup>
                </FormRow>
                <FormRow>
                  <FormGroup>
                    <Label>Street Address *</Label>
                    <Input
                      type="text"
                      name="streetAddress"
                      value={newAddress.streetAddress}
                      onChange={handleAddressChange}
                      placeholder="123 Main Street"
                      required
                    />
                    {errors.streetAddress && (
                      <ErrorText>{errors.streetAddress}</ErrorText>
                    )}
                  </FormGroup>
                </FormRow>
                <FormRow>
                  <FormGroup>
                    <Label>Neighborhood/Area *</Label>
                    {autoNeighborhoodOptions.length > 0 ? (
                      <>
                        <Select
                          name="area"
                          value={newAddress.area}
                          onChange={(e) => {
                            const selectedName = e.target.value;
                            setNewAddress((prev) => ({
                              ...prev,
                              area: selectedName,
                            }));
                          }}
                        >
                          <option value="">Select neighborhood</option>
                          {autoNeighborhoodOptions.map((n) => (
                            <option
                              key={n._id || n.name}
                              value={n.name}
                            >
                              {n.name}
                              {n.municipality ? ` (${n.municipality})` : ""}
                            </option>
                          ))}
                        </Select>
                        <HintText>
                          We detected multiple neighborhoods for your area. Please choose the correct one.
                        </HintText>
                      </>
                    ) : (
                      <>
                        <NeighborhoodAutocomplete
                          value={newAddress.area}
                          onChange={handleAddressChange}
                          city={newAddress.city}
                          placeholder="Search neighborhood (e.g., Nima, Cantonments, Tema Community 1)"
                          onSelect={(neighborhood) => {
                            setNewAddress((prev) => ({
                              ...prev,
                              area: neighborhood.name,
                            }));
                          }}
                        />
                        <HintText>
                          Start typing to search for your neighborhood
                        </HintText>
                      </>
                    )}
                    {errors.area && (
                      <ErrorText>{errors.area}</ErrorText>
                    )}
                  </FormGroup>
                  <FormGroup>
                    <Label>Landmark</Label>
                    <Input
                      type="text"
                      name="landmark"
                      value={newAddress.landmark}
                      onChange={handleAddressChange}
                      placeholder="Near Osu Castle (optional)"
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
                    <HintText>
                      Saiisai currently delivers only in Accra and Tema
                    </HintText>
                  </FormGroup>
                  <FormGroup>
                    <Label>Region *</Label>
                    <Input
                      type="text"
                      name="region"
                      value={newAddress.region}
                      onChange={handleAddressChange}
                      placeholder="Greater Accra"
                      required
                    />
                    {errors.region && (
                      <ErrorText>{errors.region}</ErrorText>
                    )}
                  </FormGroup>
                </FormRow>
                <FormRow>
                  <FormGroup>
                    <Label>
                      Digital Address
                      <LocationButton
                        type="button"
                        onClick={getCurrentLocation}
                        disabled={isFetchingLocation}
                      >
                        <FaSearchLocation />
                        {isFetchingLocation ? "Detecting..." : "Auto-detect"}
                      </LocationButton>
                    </Label>
                    <Input
                      type="text"
                      name="digitalAddress"
                      value={newAddress.digitalAddress}
                      onChange={handleAddressChange}
                      placeholder="GA-123-4567"
                    />
                    {errors.digitalAddress && (
                      <ErrorText>{errors.digitalAddress}</ErrorText>
                    )}
                    {locationError && <ErrorText>{locationError}</ErrorText>}
                    <HintText>
                      Format: AA-123-4567 (e.g., GA-123-4567)
                    </HintText>
                  </FormGroup>
                </FormRow>
                <FormRow>
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
                    {errors.contactPhone && (
                      <ErrorText>{errors.contactPhone}</ErrorText>
                    )}
                    <HintText>
                      Format: 020, 023, 024, etc. followed by 7 digits
                    </HintText>
                  </FormGroup>
                </FormRow>
                <ButtonGroup>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setActiveTab("existing")}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    variant="success"
                    size="sm"
                    loading={isAddressCreating}
                  >
                    Save Shipping Address
                  </Button>
                </ButtonGroup>
              </AddressForm>
            )}
          </TabContent>
        </ShippingSection>

        {/* Delivery Method Section - Hide for pre-orders */}
        {!hasPreorderItem && (
          <DeliveryMethodSection>
            <SectionHeader>
              <SectionTitle>Delivery Method</SectionTitle>
              <InfoText>
                Saiisai currently delivers only in Accra and Tema
              </InfoText>
            </SectionHeader>

            <DeliveryOptions>
            {/* Pickup Center */}
            <DeliveryOption
              $selected={deliveryMethod === "pickup_center"}
              onClick={() => {
                setDeliveryMethod("pickup_center");
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

            {/* Shipping Options - Only show when dispatch is selected */}
            {deliveryMethod === "dispatch" && buyerCity && (
              <>
                {/* Saiisai Dispatch Rider Shipping Options */}
                <DispatchShippingSection>
                  {/* <DispatchShippingTitle>Saiisai Dispatch Rider</DispatchShippingTitle> */}
                  <ShippingOptions
                  weight={null} // Will be calculated from items
                  city={buyerCity}
                  neighborhoodName={
                    // Use area field as neighborhood name (preferred), fallback to landmark or streetAddress
                    activeTab === "existing" && selectedAddress
                      ? (selectedAddress.area || selectedAddress.landmark || selectedAddress.streetAddress)
                      : activeTab === "new" && newAddress
                      ? (newAddress.area || newAddress.landmark || newAddress.streetAddress)
                      : null
                  }
                  fragile={isFragileItem}
                  items={shippingItems}
                  selectedShippingType={deliverySpeed || "standard"}
                  onSelect={handleShippingSelect}
                  />
                </DispatchShippingSection>
                
                {/* Fragile Item Checkbox - Below shipping options */}
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

            </DeliveryOptions>

            {isCalculatingShipping && (
              <LoadingState message="Calculating shipping..." />
            )}
          </DeliveryMethodSection>
        )}

        {/* Pre-order Info Message */}
        {hasPreorderItem && (
          <DeliveryMethodSection>
            <SectionHeader>
              <SectionTitle>International Pre-Order</SectionTitle>
              <InfoText>
                This is an international pre-order. Shipping charges include international shipping, customs, and local delivery fees.
              </InfoText>
            </SectionHeader>
          </DeliveryMethodSection>
        )}

        {/* Payment Section */}
        <PaymentSection>
          <SectionHeader>
            <SectionTitle>Payment Method</SectionTitle>
            <SecurityBadge>
              <ShieldIcon>🔒</ShieldIcon>
              <span>Secure Payment</span>
            </SecurityBadge>
          </SectionHeader>

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
                    money
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
                          <strong>Bank Name:</strong> Ghana Commercial Bank
                        </BankInfo>
                        <BankInfo>
                          <strong>Account Name:</strong> ShopGH Ltd
                        </BankInfo>
                        <BankInfo>
                          <strong>Account Number:</strong> 1234567890
                        </BankInfo>
                        <BankInfo>
                          <strong>Reference:</strong> Order #ORD-20230708
                        </BankInfo>
                      </BankDetails>
                      <p style={{ marginTop: "10px", fontSize: "0.9rem" }}>
                        Please use the reference number when making your
                        payment
                      </p>
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
        </PaymentSection>

        {/* Order Summary */}
        <OrderSummary>
          <SectionTitle>Order Summary</SectionTitle>

          {/* Coupon */}
          <CouponForm>
            <CouponInput
              type="text"
              placeholder="Enter coupon code"
              value={couponCode}
              onChange={(e) => {
                // SECURITY: Sanitize coupon code input
                const sanitized = sanitizeCouponCode(e.target.value);
                setCouponCode(sanitized);
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
            {couponMessage && (
              <CouponMessage success={discount > 0}>
                {couponMessage}
              </CouponMessage>
            )}
            
            {couponError && (
              <ErrorState
                message={couponError?.message || "Failed to apply coupon"}
              />
            )}
          </CouponForm>

          {/* Totals – Jumia-style: single price; no tax line (price includes VAT) */}
          <SummaryItem>
            <span>Subtotal:</span>
            <span>GH₵{(backendSubtotal ?? subTotal).toFixed(2)}</span>
          </SummaryItem>

          {hasPreorderItem && (
            <SummaryItem style={{ fontSize: "0.85rem", color: "#4b5563" }}>
              <span>Order type:</span>
              <span>
                {isInternationalPreorderEnabled
                  ? "International Pre-order"
                  : "Pre-order"}
              </span>
            </SummaryItem>
          )}
          <SummaryItem style={{ fontSize: "0.85rem", color: "#666" }}>
            <span>Price includes applicable taxes</span>
          </SummaryItem>

          {discount > 0 && (
            <SummaryItem>
              <span>Discount:</span>
              <span>- GH₵{(backendDiscount ?? discount).toFixed(2)}</span>
            </SummaryItem>
          )}

          {isInternationalPreorderEnabled && (
            <SummaryItem style={{ fontSize: "0.85rem", color: "#4b5563" }}>
              <span>Country of origin:</span>
              <span>{supplierCountry}</span>
            </SummaryItem>
          )}

          {isInternationalPreorderEnabled && internationalBreakdown ? (
            <>
              <SummaryItem>
                <span>International Shipping ({supplierCountry}):</span>
                <span>GH₵{(internationalBreakdown.shippingCost || 0).toFixed(2)}</span>
              </SummaryItem>
              <SummaryItem>
                <span>Estimated Customs &amp; Taxes:</span>
                <span>GH₵{(internationalBreakdown.totalCustoms || 0).toFixed(2)}</span>
              </SummaryItem>
              <SummaryItem>
                <span>Clearing Fee:</span>
                <span>GH₵{(internationalBreakdown.clearingFee || 0).toFixed(2)}</span>
              </SummaryItem>
              <SummaryItem style={{ fontSize: "0.8rem", color: "#4b5563" }}>
                <span>
                  International pre-order. Estimated arrival 15–25 days. Customs
                  delays may occur.
                </span>
              </SummaryItem>
            </>
          ) : (
            <SummaryItem>
              <span>Local Delivery (Shipping Charges):</span>
              <span>
                {isCalculatingShipping ? (
                  <LoadingSpinner size="sm" />
                ) : shippingFee > 0 ? (
                  `GH₵${shippingFee.toFixed(2)}`
                ) : (
                  "Free"
                )}
              </span>
            </SummaryItem>
          )}

          <SummaryTotal>
            <span>Total:</span>
            <span>GH₵{total.toFixed(2)}</span>
          </SummaryTotal>

          <PrimaryButton 
            $size="lg"
            onClick={handlePlaceOrder}
            disabled={isCreatingOrder || hasInsufficientBalance}
            style={{ width: "100%", marginTop: "20px" }}
          >
            {isCreatingOrder ? (
              <LoadingSpinner size="sm" />
            ) : paymentMethod === "mobile_money" ? (
              "Place Order & Pay"
            ) : paymentMethod === "credit_balance" ? (
              hasInsufficientBalance ? "Insufficient Balance" : "Place Order & Pay"
            ) : (
              "Place Order"
            )}
          </PrimaryButton>
          
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

          <SecurityFooter>
            <PaymentIcons>
              <SecurityIcon>🔒</SecurityIcon>
              <span>Secure Payment</span>
            </PaymentIcons>
            <PaymentIcons>
              <Icon>💳</Icon>
              <Icon>📱</Icon>
              <Icon>🏦</Icon>
            </PaymentIcons>
          </SecurityFooter>
        </OrderSummary>
      </CheckoutGrid>
    </CheckoutContainer>
  );
};

// ────────────────────────────────────────────────
// Styled Components
// ────────────────────────────────────────────────

const FragileCheckboxContainer = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background: var(--color-grey-50);
  border-radius: var(--border-radius-sm);
`;

const FragileCheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  
  input[type="checkbox"] {
    width: 1.2rem;
    height: 1.2rem;
    cursor: pointer;
  }
  
  span {
    font-size: 0.95rem;
    color: var(--color-grey-900);
    font-weight: 500;
  }
`;

const FragileHint = styled.div`
  margin-top: 0.5rem;
  padding-left: 1.75rem;
  font-size: 0.85rem;
  color: var(--color-grey-600);
`;

const ErrorText = styled.span`
  color: var(--color-red-700);
  font-size: var(--font-size-xs);
  display: block;
  margin-top: var(--spacing-xs);
`;

const LocationButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin-left: auto;
  padding: 0.6rem 1rem;
  background: var(--color-primary-500);
  color: var(--color-white-0);
  border: none;
  border-radius: 8px;
  font-size: 1.2rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: var(--color-primary-600);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  svg {
    font-size: 1.2rem;
  }
`;

const DispatchShippingSection = styled.div`
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-grey-200);
`;

const DispatchShippingTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--color-grey-900);
  margin-bottom: 1rem;
`;

const HintText = styled.span`
  color: var(--color-grey-500);
  font-size: var(--font-size-xs);
  display: block;
  margin-top: var(--spacing-xs);
`;

const SecurityBadge = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-sm);
  color: var(--color-green-700);
`;

const ShieldIcon = styled.span`
  font-size: 1.2rem;
`;

const SecurityFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-grey-200);
`;

const SecurityIcon = styled.span`
  font-size: 1.5rem;
  margin-left: auto;
`;

const PaymentIcons = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.9rem;
`;

const Icon = styled.span`
  font-size: 1.5rem;
`;

const CheckoutContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const CheckoutGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 30px;

  @media (min-width: 992px) {
    grid-template-columns: 1fr 1fr;
    grid-template-areas:
      "shipping payment"
      "summary summary";

    .shipping-section {
      grid-area: shipping;
    }
    .payment-section {
      grid-area: payment;
    }
    .order-summary {
      grid-area: summary;
    }
  }
`;

const Section = styled(Card)`
  padding: var(--spacing-lg);
`;

const ShippingSection = styled(Section)``;
const PaymentSection = styled(Section)``;
const OrderSummary = styled(Section)``;

const DeliveryMethodSection = styled(Section)`
  margin-top: 2rem;
`;

const DeliveryOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const DeliveryOption = styled.div`
  border: 2px solid
    ${(props) => (props.$selected ? "var(--color-primary)" : "var(--color-grey-200)")};
  border-radius: var(--border-radius-md);
  padding: 1.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${(props) =>
    props.$selected ? "var(--color-primary-50)" : "white"};
  position: relative;

  &:hover {
    border-color: var(--color-primary);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const DeliveryContent = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
`;

const DeliveryIcon = styled.div`
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(props) =>
    props.$selected ? "var(--color-primary)" : "var(--color-grey-100)"};
  color: ${(props) =>
    props.$selected ? "white" : "var(--color-grey-600)"};
  font-size: 1.25rem;
  flex-shrink: 0;
  transition: all 0.2s ease;
`;

const DeliveryInfo = styled.div`
  flex: 1;
`;

const DeliveryTitle = styled.h4`
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: ${(props) =>
    props.$selected ? "var(--color-primary)" : "var(--color-grey-900)"};
  font-family: var(--font-heading);
`;

const DeliveryDescription = styled.p`
  font-size: 0.875rem;
  color: var(--color-grey-600);
  line-height: 1.5;
`;

const DispatchFeeDisplay = styled.div`
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: ${(props) =>
    props.$selected ? "rgba(255, 255, 255, 0.5)" : "var(--color-grey-50)"};
  border-radius: var(--border-radius-sm);
  font-size: 0.875rem;
  color: var(--color-primary-700);
  display: flex;
  align-items: center;
  gap: 0.5rem;

  strong {
    font-weight: 600;
    color: var(--color-primary);
  }
`;

const DeliverySpeedOptions = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background: var(--color-grey-50);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-grey-200);
`;

const SpeedOptionLabel = styled.div`
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-grey-700);
  margin-bottom: 0.75rem;
`;

const SpeedOptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const SpeedOption = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 2px solid ${(props) => (props.$selected ? "var(--color-primary)" : "var(--color-grey-200)")};
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${(props) => (props.$selected ? "var(--color-primary-50)" : "white")};

  &:hover {
    border-color: var(--color-primary-300);
    background: var(--color-primary-50);
  }
`;

const SpeedRadio = styled.input`
  width: 1.2rem;
  height: 1.2rem;
  cursor: pointer;
  accent-color: var(--color-primary);
`;

const SpeedContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const SpeedTitle = styled.div`
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-grey-900);
`;

const SpeedDescription = styled.div`
  font-size: 0.85rem;
  color: var(--color-grey-600);
`;

const PickupCenterSelector = styled.div`
  margin-top: 1.5rem;
  padding: 1.5rem;
  background: var(--color-grey-50);
  border-radius: var(--border-radius-md);
`;

const PickupCenterList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
`;

const PickupCenterItem = styled.div`
  border: 2px solid
    ${(props) => (props.$selected ? "var(--color-primary)" : "var(--color-grey-200)")};
  border-radius: var(--border-radius-md);
  padding: 1rem;
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
  gap: 0.5rem;
`;

const PickupCenterName = styled.h5`
  font-size: 1rem;
  font-weight: 500;
  color: ${(props) =>
    props.$selected ? "var(--color-primary)" : "var(--color-grey-900)"};
  font-family: var(--font-heading);
`;

const PickupCenterAddress = styled.p`
  font-size: 0.875rem;
  color: var(--color-grey-600);
`;

const PickupCenterHours = styled.p`
  font-size: 0.875rem;
  color: var(--color-grey-500);
  font-style: italic;
`;

const MapLink = styled.a`
  color: var(--color-primary);
  font-size: 0.875rem;
  text-decoration: none;
  margin-top: 0.25rem;
  display: inline-block;

  &:hover {
    text-decoration: underline;
  }
`;

const ShippingBreakdown = styled.div`
  margin-top: 1.5rem;
  padding: 1rem;
  background: var(--color-grey-50);
  border-radius: var(--border-radius-md);
`;

const BreakdownTitle = styled.h5`
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.75rem;
  color: var(--color-grey-900);
  font-family: var(--font-heading);
`;

const BreakdownItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  font-size: 0.875rem;
  color: var(--color-grey-700);
  border-bottom: 1px solid var(--color-grey-200);

  &:last-child {
    border-bottom: none;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
`;

const SectionTitle = styled.h2`
  margin: 0;
  padding: 0;
  font-size: 1.5rem;
`;

const RadioInput = styled.input`
  margin: 0;
`;

const AddressList = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.2rem;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
`;

const AddressItem = styled.div`
  position: relative;
  padding: 1.8rem;
  border: 2.5px solid
    ${(props) =>
      props.$selected ? "var(--color-primary-500)" : "var(--color-grey-200)"};
  border-radius: 1.6rem;
  background: ${(props) =>
    props.$selected
      ? "linear-gradient(135deg, var(--color-primary-50) 0%, var(--color-brand-50) 100%)"
      : "white"};
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${(props) =>
    props.$selected
      ? "0 4px 16px rgba(0, 120, 204, 0.2)"
      : "0 2px 8px rgba(0, 0, 0, 0.06)"};

  &:hover {
    border-color: ${(props) =>
      props.$selected
        ? "var(--color-primary-600)"
        : "var(--color-primary-500)"};
    transform: translateY(-3px) scale(1.02);
    box-shadow: ${(props) =>
      props.$selected
        ? "0 6px 24px rgba(0, 120, 204, 0.3)"
        : "0 6px 20px rgba(0, 0, 0, 0.12)"};
  }

  &:active {
    transform: translateY(-1px) scale(0.98);
  }

  &:focus-visible {
    outline: 3px solid var(--color-primary-200);
    outline-offset: 2px;
  }
`;

const AddressContent = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1.2rem;
  position: relative;
`;

const AddressIcon = styled.div`
  width: 4.8rem;
  height: 4.8rem;
  border-radius: 1.2rem;
  background: ${(props) =>
    props.$selected ? "var(--color-primary-500)" : "var(--color-grey-100)"};
  color: ${(props) =>
    props.$selected ? "white" : "var(--color-grey-600)"};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  transition: all 0.3s ease;
  flex-shrink: 0;
`;

const AddressInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
`;

const AddressName = styled.div`
  font-weight: ${(props) => (props.$selected ? "600" : "500")};
  font-size: 1.6rem;
  color: ${(props) =>
    props.$selected ? "var(--color-primary-700)" : "var(--color-grey-900)"};
  margin-bottom: 0.4rem;
  transition: all 0.2s ease;
`;

const AddressText = styled.div`
  font-size: var(--font-size-sm);
  color: var(--color-grey-600);
  line-height: 1.5;
`;

const AddressLocation = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
`;

const DefaultBadge = styled.span`
  display: inline-block;
  padding: 0.3rem 0.8rem;
  background: linear-gradient(
    135deg,
    var(--color-green-100) 0%,
    var(--color-green-700) 100%
  );
  color: white;
  border-radius: 0.8rem;
  font-size: 1rem;
  font-weight: 600;
  margin-top: 0.4rem;
  width: fit-content;
`;

const SelectionCheckmark = styled.span`
  position: absolute;
  top: 1.2rem;
  right: 1.2rem;
  width: 2.4rem;
  height: 2.4rem;
  background: var(--color-primary-500);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 120, 204, 0.4);
  animation: ${pulse} 0.3s ease-out;
`;

const AddressForm = styled.form`
  margin-top: 15px;
`;

const FormGroup = styled.div`
  margin-bottom: 15px;
`;

const FormRow = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 15px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 10px;
  }
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  font-size: 0.9rem;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: var(--spacing-sm);
  border: 1px solid
    ${(props) =>
      props.error ? "var(--color-red-700)" : "var(--color-grey-300)"};
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-md);

  &:focus {
    border-color: var(--color-primary-500);
    outline: none;
    box-shadow: 0 0 0 3px rgba(255, 196, 0, 0.2);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: var(--spacing-sm);
  border: 1px solid var(--color-grey-300);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-md);
  background: var(--color-white-0);

  &:focus {
    border-color: var(--color-primary-500);
    outline: none;
    box-shadow: 0 0 0 3px rgba(255, 196, 0, 0.2);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 10px;
`;

const TabContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  border-bottom: 1px solid var(--color-grey-200);
  margin-bottom: 0;
`;

const TabButton = styled.div`
  border-radius: 0.8rem 0.8rem 0 0;
  border-bottom: 2px solid
    ${({ $active }) =>
      $active ? "var(--color-primary-500)" : "transparent"};
  
  ${({ $active }) =>
    !$active &&
    css`
    background: var(--color-grey-100) !important;
    color: var(--color-grey-700) !important;
    box-shadow: none !important;
    
    &:hover {
      background: var(--color-grey-200) !important;
      transform: none !important;
    }
  `}
`;

const TabContent = styled.div`
  margin-top: 20px;
`;

const SummaryItem = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 10px 0;
`;

const SummaryTotal = styled(SummaryItem)`
  font-weight: bold;
  font-size: 1.2rem;
  margin-top: 20px;
  padding-top: 10px;
  border-top: 1px solid #eee;
`;

const CouponForm = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  position: relative;
`;

const CouponInput = styled.input`
  flex: 1;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-grey-300);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-md);
`;

const CouponMessage = styled.div`
  position: absolute;
  bottom: -25px;
  left: 0;
  font-size: var(--font-size-sm);
  color: ${(props) =>
    props.success ? "var(--color-green-700)" : "var(--color-red-700)"};
`;

const PaymentOptions = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.2rem;
  margin-top: 1.5rem;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
`;

const PaymentOption = styled.div`
  position: relative;
  padding: 1.8rem;
  border: 2.5px solid
    ${(props) =>
      props.$selected
        ? "var(--color-primary-500)"
        : props.$disabled
        ? "var(--color-grey-300)"
        : "var(--color-grey-200)"};
  border-radius: 1.6rem;
  background: ${(props) =>
    props.$selected
      ? "linear-gradient(135deg, var(--color-primary-50) 0%, var(--color-brand-50) 100%)"
      : props.$disabled
      ? "var(--color-grey-50)"
      : "white"};
  cursor: ${(props) => (props.$disabled ? "not-allowed" : "pointer")};
  opacity: ${(props) => (props.$disabled ? 0.6 : 1)};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${(props) =>
    props.$selected
      ? "0 4px 16px rgba(0, 120, 204, 0.2)"
      : "0 2px 8px rgba(0, 0, 0, 0.06)"};

  &:hover {
    border-color: ${(props) =>
      props.$selected
        ? "var(--color-primary-600)"
        : "var(--color-primary-500)"};
    transform: translateY(-3px) scale(1.02);
    box-shadow: ${(props) =>
      props.$selected
        ? "0 6px 24px rgba(0, 120, 204, 0.3)"
        : "0 6px 20px rgba(0, 0, 0, 0.12)"};
  }

  &:active {
    transform: translateY(-1px) scale(0.98);
  }

  &:focus-within {
    outline: 3px solid var(--color-primary-200);
    outline-offset: 2px;
  }
`;

const PaymentContent = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1.2rem;
  position: relative;
`;

const PaymentIcon = styled.div`
  width: 4.8rem;
  height: 4.8rem;
  border-radius: 1.2rem;
  background: ${(props) =>
    props.$selected ? "var(--color-primary-500)" : "var(--color-grey-100)"};
  color: ${(props) =>
    props.$selected ? "white" : "var(--color-grey-600)"};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  transition: all 0.3s ease;
  flex-shrink: 0;
`;

const PaymentInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
`;

const PaymentTitle = styled.div`
  font-weight: ${(props) => (props.$selected ? "600" : "500")};
  font-size: 1.6rem;
  color: ${(props) =>
    props.$selected ? "var(--color-primary-700)" : "var(--color-grey-900)"};
  margin-bottom: 0.4rem;
  transition: all 0.2s ease;
`;

const PaymentDescription = styled.div`
  font-size: var(--font-size-sm);
  color: var(--color-grey-600);
  line-height: 1.5;
`;

const PaymentDetails = styled.div`
  margin-top: 10px;
  margin-bottom: 10px;
`;

const BankDetails = styled.div`
  margin-top: var(--spacing-sm);
  padding: var(--spacing-sm);
  background: var(--color-grey-100);
  border-radius: var(--border-radius-sm);
  border: 1px solid var(--color-grey-200);
`;

const BankInfo = styled.div`
  font-size: var(--font-size-md);
  margin-bottom: var(--spacing-xs);
  color: var(--color-grey-800);
`;

const BalanceDetails = styled.div`
  margin-top: var(--spacing-sm);
  padding: var(--spacing-sm);
  background: var(--color-grey-100);
  border-radius: var(--border-radius-sm);
  border: 1px solid var(--color-grey-200);
`;

const BalanceInfo = styled.div`
  font-size: var(--font-size-md);
  margin-bottom: var(--spacing-xs);
  color: var(--color-grey-800);
  
  strong {
    color: var(--color-grey-900);
  }
`;

const InsufficientBalanceWarning = styled.div`
  margin-top: var(--spacing-sm);
  padding: var(--spacing-sm);
  background: var(--color-red-50);
  border: 1px solid var(--color-red-300);
  border-radius: var(--border-radius-sm);
  color: var(--color-red-700);
  font-size: var(--font-size-sm);
  font-weight: 500;
`;

const InfoText = styled.p`
  margin-top: var(--spacing-md);
  padding: var(--spacing-sm);
  background: var(--color-blue-100);
  border-left: 3px solid var(--color-blue-700);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-sm);
  color: var(--color-blue-700);
  line-height: 1.5;
`;

export default CheckoutPage;
