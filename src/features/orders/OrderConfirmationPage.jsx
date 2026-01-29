import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import styled from "styled-components";
import {
  FaCheckCircle,
  FaShoppingBag,
  FaTruck,
  FaMobileAlt,
  FaBuilding,
  FaClock,
  FaExclamationTriangle,
  FaSpinner,
  FaBox,
} from "react-icons/fa";
import { useMemo, useEffect, useRef, useState } from "react";
import { useCartActions } from "../../shared/hooks/useCart";
import { useQueryClient } from "@tanstack/react-query";
import useDynamicPageTitle from "../../shared/hooks/useDynamicPageTitle";
import seoConfig from "../../shared/config/seoConfig";
import { useOrderConfirmation } from "../../shared/hooks/useOrderConfirmation";
import { usePaystackPayment } from "../../shared/hooks/usePaystackPayment";

/**
 * OrderConfirmationPage Component
 * 
 * Handles order confirmation display for both Paystack redirects and direct navigation.
 * Features:
 * - Validates URL query parameters (orderId, reference, trxref)
 * - Verifies Paystack payment transactions
 * - Handles Pay on Delivery orders without verification
 * - Safely clears cart only after successful verification
 * - Shows appropriate UI states (loading, verifying, success, failed, invalid)
 * - Displays tracking number link when available
 * - Protects against browser refresh and double API calls
 */
const OrderConfirmationPage = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { clearCart } = useCartActions();
  const { initializePaystackPayment } = usePaystackPayment();
  const [payNowError, setPayNowError] = useState("");
  const [isPayNowLoading, setIsPayNowLoading] = useState(false);

  const orderFromState = location.state?.order || location.state;
  
  // Extract URL parameters
  const searchString = location.search;
  
  // Memoize URL parameters using search string to prevent re-creation on every render
  const orderIdFromUrl = useMemo(() => {
    const params = new URLSearchParams(searchString);
    return params.get("orderId");
  }, [searchString]);
  
  const paymentReference = useMemo(() => {
    const params = new URLSearchParams(searchString);
    return params.get("reference") || params.get("trxref");
  }, [searchString]);

  // Use custom hook for order confirmation logic
  const {
    orderFromApi,
    isOrderLoading,
    orderError,
    isVerifyingPayment,
    paymentVerificationError,
    verificationStatus,
    hasVerified,
  } = useOrderConfirmation(orderFromState, orderIdFromUrl, paymentReference);

  // Refs for cart clearing
  const cartClearedRef = useRef(false);

  /**
   * Transform order data from API to component format
   * Handles both orderFromState and orderFromApi structures
   */
  const order = useMemo(() => {
    // If order is in state (direct navigation), use it directly
    if (orderFromState) {
      // If already in correct format, return as-is
      if (orderFromState.orderId || orderFromState.orderNumber) {
        return orderFromState;
      }
      // Otherwise transform it
      return transformOrderData(orderFromState);
    }

    // Handle API order structure
    const apiOrder = orderFromApi?.data?.order || orderFromApi?.order || orderFromApi;
    
    if (!apiOrder) {
      return null;
    }
    
    return transformOrderData(apiOrder);
  }, [orderFromState, orderFromApi]);

  /**
   * Extract shipping address from order
   */
  const shippingAddress = useMemo(() => {
    if (!order?.shippingAddress) return null;
    if (typeof order.shippingAddress === "object") return order.shippingAddress;
    return null;
  }, [order]);

  // SEO - Set page title
  useDynamicPageTitle({
    title: seoConfig.orderSuccess.title,
    description: seoConfig.orderSuccess.description,
    keywords: seoConfig.orderSuccess.keywords,
    image: seoConfig.orderSuccess.image,
    type: seoConfig.orderSuccess.type,
    canonical: seoConfig.orderSuccess.canonical,
    jsonLd: seoConfig.orderSuccess.jsonLd,
    defaultTitle: seoConfig.orderSuccess.title,
    defaultDescription: seoConfig.orderSuccess.description,
  });

  /**
   * Validate URL parameters for Paystack redirects
   * Returns validation result and error message if invalid
   */
  const paramValidation = useMemo(() => {
    // If order is in state, params are optional (direct navigation)
    if (orderFromState) {
      return { isValid: true, error: null };
    }

    // For Paystack redirects, orderId is required
    if (!orderIdFromUrl) {
      return {
        isValid: false,
        error: "Invalid order confirmation link. Missing order ID.",
      };
    }

    // Payment reference validation:
    // - COD orders don't require payment reference
    // - Wallet/Credit balance orders don't require payment reference (payment is immediate)
    // - Paystack/mobile_money orders require payment reference for verification
    // - If order is still loading, be lenient (don't fail yet - might be COD or wallet)
    const orderIsLoaded = !!order && !!order.paymentMethod;
    
    // If order is not loaded yet, allow through (will validate once loaded)
    if (!orderIsLoaded) {
      return { isValid: true, error: null };
    }
    
    const isCOD = order?.paymentMethod === "payment_on_delivery" || 
                  order?.paymentMethod === "Cash on Delivery" ||
                  order?.paymentMethod === "cod";
    
    const isWalletPayment = order?.paymentMethod === "credit_balance" ||
                           order?.paymentMethod === "wallet" ||
                           order?.paymentMethod === "account_balance";
    
    // Only require payment reference for unpaid Paystack/mobile_money payments.
    // COD and wallet payments don't need external payment references.
    const isPaystackPayment = !isCOD && !isWalletPayment;

    // If the order already appears paid, we can treat the link as valid even
    // if the reference is missing (e.g. user opened the page from email/history).
    const isAlreadyPaid =
      order.paymentStatus === "completed" ||
      order.paymentStatus === "paid" ||
      order.isPaid ||
      !!order.paidAt;

    const requiresPaymentReference =
      isPaystackPayment && !paymentReference && !isAlreadyPaid;
    
    if (requiresPaymentReference) {
      return {
        isValid: false,
        error: "Invalid order confirmation link. Missing payment reference.",
      };
    }

    // If order is still loading and no payment reference, that's okay
    // (might be COD, wallet, or might be loaded later)
    // We'll validate again once order is loaded

    return { isValid: true, error: null };
  }, [orderIdFromUrl, paymentReference, orderFromState, order?.paymentMethod, order]);

  /**
   * Determine if this is a Pay on Delivery order
   */
  const isCashOnDelivery = useMemo(() => {
    return (
      order?.paymentMethod === "payment_on_delivery" ||
      order?.paymentMethod === "Cash on Delivery" ||
      order?.paymentMethod === "cod"
    );
  }, [order?.paymentMethod]);

  /**
   * Determine if this is a wallet/credit balance payment
   */
  const isWalletPayment = useMemo(() => {
    return (
      order?.paymentMethod === "credit_balance" ||
      order?.paymentMethod === "wallet" ||
      order?.paymentMethod === "account_balance"
    );
  }, [order?.paymentMethod]);

  /**
   * Determine if order is eligible for retry payment
   * Only for Paystack/mobile_money orders that are still unpaid/pending.
   */
  const canRetryPayment = useMemo(() => {
    if (!order) return false;
    const isPaystackPayment =
      order.paymentMethod === "mobile_money" ||
      order.paymentMethod === "paystack" ||
      (!isCashOnDelivery && !isWalletPayment);
    const isUnpaid =
      !order.paymentStatus ||
      order.paymentStatus === "pending" ||
      order.paymentStatus === "failed";
    const isNotCancelled =
      order.status !== "cancelled" && order.orderStatus !== "cancelled";
    return isPaystackPayment && isUnpaid && isNotCancelled;
  }, [order, isCashOnDelivery, isWalletPayment]);

  const handlePayNow = async () => {
    if (!order) return;
    setPayNowError("");
    setIsPayNowLoading(true);
    try {
      const orderId = order._id || order.id || order.orderId;
      const email =
        order.user?.email ||
        shippingAddress?.contactEmail ||
        shippingAddress?.email ||
        "";

      const { redirectTo } = await initializePaystackPayment({
        orderId,
        email,
      });

      window.location.href = redirectTo;
    } catch (error) {
      console.error("[OrderConfirmationPage] Pay Now error:", error);
      setPayNowError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to initialize payment. Please try again."
      );
    } finally {
      setIsPayNowLoading(false);
    }
  };

  /**
   * Safe cart clearing - only after successful verification or COD/wallet confirmation
   */
  useEffect(() => {
    const orderId = order?.orderId || order?.orderNumber;
    if (!order || !orderId) {
      return;
    }

    const cartClearKey = `CART_CLEARED_${orderId}`;
    
    // Check if cart already cleared for this order
    if (typeof window !== "undefined") {
      const alreadyCleared = window.sessionStorage.getItem(cartClearKey);
      if (alreadyCleared === "yes" || cartClearedRef.current) {
        return;
      }
    }

    // For COD and wallet orders, clear immediately (no verification needed)
    // Wallet payments are processed immediately on the backend
    if (isCashOnDelivery || isWalletPayment) {
      cartClearedRef.current = true;
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(cartClearKey, "yes");
      }
      clearCart();
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      return;
    }

    // For Paystack orders, only clear after successful verification
    if (verificationStatus === "success" && hasVerified) {
      cartClearedRef.current = true;
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(cartClearKey, "yes");
      }
      clearCart();
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    }
  }, [order, isCashOnDelivery, isWalletPayment, verificationStatus, hasVerified, clearCart, queryClient]);

  // ========== RENDER STATES ==========

  // Invalid parameters state
  if (!paramValidation.isValid) {
    return (
      <LoadingContainer>
        <ErrorIcon>
          <FaExclamationTriangle />
        </ErrorIcon>
        <h2>Invalid Order Confirmation Link</h2>
        <p style={{ color: "#dc3545", marginBottom: "2rem" }}>
          {paramValidation.error}
        </p>
        <ContinueButton onClick={() => navigate("/orders")}>
          View My Orders
        </ContinueButton>
      </LoadingContainer>
    );
  }

  // Error state - order fetch failed
  if (orderError && !order) {
    return (
      <LoadingContainer>
        <ErrorIcon>
          <FaExclamationTriangle />
        </ErrorIcon>
        <h2>Error Loading Order</h2>
        <p style={{ color: "#dc3545", marginBottom: "1rem" }}>
          {orderError?.message || "Failed to load order details"}
        </p>
        {paymentVerificationError && (
          <p style={{ color: "#f39c12", marginBottom: "2rem" }}>
            Payment verification error: {paymentVerificationError}
          </p>
        )}
        <ContinueButton onClick={() => navigate("/orders")}>
          View My Orders
        </ContinueButton>
      </LoadingContainer>
    );
  }

  // Loading state - fetching order or verifying payment
  if ((isOrderLoading && !orderFromState) || (!order && !orderFromState)) {
    return (
      <LoadingContainer>
        {isVerifyingPayment ? (
          <>
            <SpinnerIcon>
              <FaSpinner />
            </SpinnerIcon>
            <h2>Verifying Payment...</h2>
            <p>Please wait, we are validating your payment with Paystack.</p>
          </>
        ) : (
          <>
            <SpinnerIcon>
              <FaSpinner />
            </SpinnerIcon>
            <h2>Loading Order Details...</h2>
            <p>Please wait while we fetch your order information.</p>
          </>
        )}
        {orderIdFromUrl && (
          <p style={{ fontSize: "0.9rem", color: "#7f8c8d", marginTop: "1rem" }}>
            Order ID: {orderIdFromUrl}
          </p>
        )}
      </LoadingContainer>
    );
  }

  // Payment verification failed state (only for Paystack payments)
  if (verificationStatus === "failed" && !isCashOnDelivery && !isWalletPayment) {
    return (
      <LoadingContainer>
        <ErrorIcon>
          <FaExclamationTriangle />
        </ErrorIcon>
        <h2>Payment Verification Failed</h2>
        <p style={{ color: "#dc3545", marginBottom: "1rem" }}>
          {paymentVerificationError || "We couldn't verify your payment. Please contact support if payment was deducted."}
        </p>
        <ActionButtons>
          <ContinueButton onClick={() => navigate("/orders")}>
            View My Orders
          </ContinueButton>
          <ViewOrdersButton onClick={() => window.location.reload()}>
            Retry Verification
          </ViewOrdersButton>
        </ActionButtons>
      </LoadingContainer>
    );
  }

  // If we have orderFromState but order is null, there's a transformation issue
  if (orderFromState && !order) {
    return (
      <LoadingContainer>
        <ErrorIcon>
          <FaExclamationTriangle />
        </ErrorIcon>
        <h2>Order Data Error</h2>
        <p style={{ color: "#dc3545", marginBottom: "2rem" }}>
          There was an issue processing your order data. Please contact support.
        </p>
        <ContinueButton onClick={() => navigate("/orders")}>
          View My Orders
        </ContinueButton>
      </LoadingContainer>
    );
  }

  // ========== SUCCESS STATE - ORDER CONFIRMED ==========

  const readableOrderDate = order?.orderDate || order?.date
    ? new Date(order.orderDate || order.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A";

  const isMobileMoney =
    order?.paymentMethod === "mobile_money" ||
    order?.paymentMethod === "Mobile Money";

  const isBankTransfer =
    order?.paymentMethod === "bank_transfer" ||
    order?.paymentMethod === "Bank Transfer";

  const paymentMethodLabel = order?.paymentMethod
    ? order.paymentMethod
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    : "N/A";

  return (
    <ConfirmationContainer>
      <ConfirmationHeader>
        <CheckmarkIcon>
          <FaCheckCircle />
        </CheckmarkIcon>
        <h1>Order Confirmed!</h1>
        <p>Thank you for your purchase. Your order is being processed.</p>
        <OrderNumber>
          Order #: {order?.orderNumber || order?.orderId || "N/A"}
        </OrderNumber>
        {order?.trackingNumber && (
          <TrackingLinkContainer>
            <TrackingLink onClick={() => navigate(`/tracking/${order.trackingNumber}`)}>
              <FaBox /> Track Order: {order.trackingNumber}
            </TrackingLink>
          </TrackingLinkContainer>
        )}
        {!order?.trackingNumber && (
          <TrackingPlaceholder>
            <FaClock /> Preparing your package...
          </TrackingPlaceholder>
        )}
      </ConfirmationHeader>

      <ConfirmationGrid>
        <OrderSummarySection>
          <SectionHeader>
            <FaShoppingBag />
            <h2>Order Summary</h2>
          </SectionHeader>

          <OrderItems>
            {order?.orderItems && order.orderItems.length > 0 ? (
              order.orderItems.map((item, index) => {
                const uniqueKey =
                  item.id || item._id || `${item.productId || "item"}-${index}`;
                return (
                  <OrderItem key={uniqueKey}>
                    <ItemImage
                      src={item.image || ""}
                      alt={item.name || "Product"}
                      onError={(e) => {
                        e.target.src = "/placeholder-product.png";
                      }}
                    />
                    <ItemDetails>
                      <ItemName>{item.name || "Product"}</ItemName>
                      <ItemPrice>
                        GH₵{(item.price || 0).toFixed(2)} ×{" "}
                        {item.quantity || 0}
                      </ItemPrice>
                    </ItemDetails>
                    <ItemTotal>
                      GH₵{((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                    </ItemTotal>
                  </OrderItem>
                );
              })
            ) : (
              <p>No items found in this order.</p>
            )}
          </OrderItems>

          <SummaryDetails>
            <SummaryRow>
              <span>Subtotal</span>
              <span>GH₵{(order?.subTotal || 0).toFixed(2)}</span>
            </SummaryRow>
            {order?.discount > 0 && (
              <SummaryRow>
                <span>Discount</span>
                <span>-GH₵{(order?.discount || 0).toFixed(2)}</span>
              </SummaryRow>
            )}
            <SummaryRow>
              <span>Shipping</span>
              <span>GH₵{(order?.shippingCost || 0).toFixed(2)}</span>
            </SummaryRow>
            <SummaryTotal>
              <span>Total</span>
              <span>GH₵{(order?.totalAmount || order?.totalPrice || 0).toFixed(2)}</span>
            </SummaryTotal>
          </SummaryDetails>

          <PaymentNotice>
            <p>
              <FaClock /> Your order is being processed and will be shipped
              soon. You&apos;ll receive an email with tracking information.
            </p>
          </PaymentNotice>

          {/* Pay Now / Retry Payment */}
          {canRetryPayment && (
            <PayNowSection>
              <PayNowTitle>Payment Pending</PayNowTitle>
              <PayNowText>
                Your order was created, but payment has not been completed. You can pay securely now to confirm your order.
              </PayNowText>
              {payNowError && (
                <PayNowError>{payNowError}</PayNowError>
              )}
              <PayNowButton
                type="button"
                onClick={handlePayNow}
                disabled={isPayNowLoading}
              >
                {isPayNowLoading ? "Redirecting to Paystack..." : "Pay Now"}
              </PayNowButton>
            </PayNowSection>
          )}
        </OrderSummarySection>

        <OrderDetailsSection>
          <OrderTimeline>
            <TimelineStep $active>
              <StepIcon>1</StepIcon>
              <StepContent>
                <StepTitle>Order Placed</StepTitle>
                <StepDescription>{readableOrderDate}</StepDescription>
              </StepContent>
            </TimelineStep>

            <TimelineStep>
              <StepIcon>2</StepIcon>
              <StepContent>
                <StepTitle>Processing</StepTitle>
                <StepDescription>Preparing your order</StepDescription>
              </StepContent>
            </TimelineStep>

            <TimelineStep>
              <StepIcon>3</StepIcon>
              <StepContent>
                <StepTitle>Shipped</StepTitle>
                <StepDescription>
                  Estimated: {order?.estimatedDelivery || "3-5 business days"}
                </StepDescription>
              </StepContent>
            </TimelineStep>

            <TimelineStep>
              <StepIcon>4</StepIcon>
              <StepContent>
                <StepTitle>Delivered</StepTitle>
                <StepDescription>To your address</StepDescription>
              </StepContent>
            </TimelineStep>
          </OrderTimeline>

          <DetailsCard>
            <CardHeader>
              <FaTruck />
              <h3>Shipping Information</h3>
            </CardHeader>
            <CardContent>
              {shippingAddress ? (
                <>
                  <p>
                    <strong>Address:</strong>
                  </p>
                  <p>{shippingAddress?.streetAddress || "N/A"}</p>
                  <p>
                    {shippingAddress?.city || "N/A"},{" "}
                    {shippingAddress?.region || "N/A"}
                  </p>
                  <p>{shippingAddress?.country || "N/A"}</p>
                  <p>
                    <strong>Contact:</strong>{" "}
                    {shippingAddress?.contactPhone || "N/A"}
                  </p>
                </>
              ) : (
                <p>Shipping address information is being loaded...</p>
              )}
              <p>
                <strong>Delivery Method:</strong> Standard Shipping
              </p>
              <p>
                <strong>Estimated Delivery:</strong>{" "}
                {order?.estimatedDelivery || "3-5 business days"}
              </p>
            </CardContent>
          </DetailsCard>

          <DetailsCard>
            <CardHeader>
              {isMobileMoney ? <FaMobileAlt /> : <FaBuilding />}
              <h3>Payment Information</h3>
            </CardHeader>
            <CardContent>
              <p>
                <strong>Method:</strong> {paymentMethodLabel}
              </p>

              {isMobileMoney && (
                <PaymentNotice>
                  <p>
                    Your payment is being processed. You&apos;ll receive a
                    confirmation message shortly.
                  </p>
                </PaymentNotice>
              )}

              {isBankTransfer && (
                <PaymentNotice>
                  <p>Please complete your bank transfer to:</p>
                  <p>
                    <strong>Bank:</strong> Ghana Commercial Bank
                  </p>
                  <p>
                    <strong>Account:</strong> ShopGH Ltd
                  </p>
                  <p>
                    <strong>Account #:</strong> 1234567890
                  </p>
                  <p>
                    <strong>Reference:</strong>{" "}
                    {order?.orderNumber || order?.orderId || "N/A"}
                  </p>
                </PaymentNotice>
              )}

              {isCashOnDelivery && (
                <PaymentNotice>
                  <p>
                    Please prepare cash payment of GH₵
                    {(order?.totalAmount || 0).toFixed(2)} for the delivery
                    agent.
                  </p>
                </PaymentNotice>
              )}

              {isWalletPayment && (
                <PaymentNotice>
                  <p>
                    ✅ Payment completed using your account balance. Order #{order?.orderNumber || order?.orderId || "N/A"}
                  </p>
                </PaymentNotice>
              )}

              {/* Show Paystack reference if available and not COD/wallet */}
              {!isCashOnDelivery && !isWalletPayment && paymentReference && (
                <PaymentNotice>
                  <p>
                    <strong>Payment Reference:</strong> {paymentReference}
                  </p>
                  {verificationStatus === "success" && (
                    <p style={{ color: "#28a745", marginTop: "0.5rem" }}>
                      ✓ Payment verified successfully
                    </p>
                  )}
                </PaymentNotice>
              )}
            </CardContent>
          </DetailsCard>
        </OrderDetailsSection>
      </ConfirmationGrid>

      <ActionButtons>
        <ContinueButton onClick={() => navigate("/")}>
          Continue Shopping
        </ContinueButton>
        <ViewOrdersButton onClick={() => navigate("/orders")}>
          View My Orders
        </ViewOrdersButton>
      </ActionButtons>

      <HelpSection>
        <h3>Need Help?</h3>
        <p>
          Contact our support team at support@shopgh.com or call +233 20 123
          4567
        </p>
      </HelpSection>
    </ConfirmationContainer>
  );
};

/**
 * Transform order data from API format to component format
 * @param {Object} apiOrder - Order object from API
 * @returns {Object} Transformed order object
 */
const transformOrderData = (apiOrder) => {
  if (!apiOrder) return null;

  return {
    orderId: apiOrder._id || apiOrder.id,
    orderNumber: apiOrder.orderNumber,
    totalAmount: apiOrder.totalPrice,
    orderDate: apiOrder.createdAt,
    paymentMethod: apiOrder.paymentMethod || "mobile_money",
    shippingAddress:
      typeof apiOrder.shippingAddress === "object"
        ? apiOrder.shippingAddress
        : null,
    shippingAddressId:
      typeof apiOrder.shippingAddress === "string"
        ? apiOrder.shippingAddress
        : apiOrder.shippingAddress?._id,
    shippingCost: apiOrder.shippingCost || 0,
    tax: apiOrder.tax || 0,
    subTotal: apiOrder.subtotal || apiOrder.subTotal || apiOrder.totalPrice,
    discount: apiOrder.discountAmount || apiOrder.discount || 0,
    orderItems:
      apiOrder.orderItems?.map((item, index) => ({
        id:
          item._id ||
          item.id ||
          `${item.product?._id || item.product?.id || item.product}-${index}`,
        productId: item.product?._id || item.product?.id || item.product,
        name: item.product?.name || "Product",
        image: item.product?.imageCover || item.product?.image || "",
        price: item.price,
        quantity: item.quantity,
      })) || [],
    status: apiOrder.orderStatus || apiOrder.status,
    paymentStatus: apiOrder.paymentStatus,
    contactEmail: apiOrder.user?.email || "",
    estimatedDelivery: apiOrder.estimatedDelivery || "3-5 business days",
    date: apiOrder.createdAt,
    trackingNumber: apiOrder.trackingNumber,
  };
};

export default OrderConfirmationPage;

// ========== STYLED COMPONENTS ==========

const ConfirmationContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 20px;
  background-color: #f8f9fa;
`;

const ConfirmationHeader = styled.div`
  text-align: center;
  padding: 40px 20px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 30px;
`;

const CheckmarkIcon = styled.div`
  font-size: 5rem;
  color: #28a745;
  margin-bottom: 20px;
`;

const ErrorIcon = styled.div`
  font-size: 4rem;
  color: #dc3545;
  margin-bottom: 20px;
  animation: pulse 2s infinite;
  
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.7;
    }
  }
`;

const SpinnerIcon = styled.div`
  font-size: 4rem;
  color: #28a745;
  margin-bottom: 20px;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

const OrderNumber = styled.p`
  font-size: 1.2rem;
  background: #e9f5e9;
  display: inline-block;
  padding: 8px 20px;
  border-radius: 20px;
  font-weight: bold;
  margin-top: 15px;
`;

const TrackingLinkContainer = styled.div`
  margin-top: 15px;
`;

const TrackingLink = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
  
  &:hover {
    background: #0056b3;
    transform: translateY(-2px);
  }
`;

const TrackingPlaceholder = styled.p`
  margin-top: 15px;
  color: #6c757d;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
`;

const ConfirmationGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 25px;

  @media (min-width: 992px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const Section = styled.div`
  background: white;
  border-radius: 10px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
`;

const OrderSummarySection = styled(Section)``;

const OrderDetailsSection = styled(Section)`
  display: flex;
  flex-direction: column;
  gap: 25px;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;

  h2 {
    margin: 0;
    font-size: 1.5rem;
  }

  svg {
    color: #28a745;
    font-size: 1.5rem;
  }
`;

const OrderItems = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 25px;
`;

const OrderItem = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #eee;
  background: #fafafa;
`;

const ItemImage = styled.img`
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 5px;
`;

const ItemDetails = styled.div`
  flex: 1;
`;

const ItemName = styled.h3`
  margin: 0 0 5px 0;
  font-size: 1rem;
`;

const ItemPrice = styled.p`
  margin: 0;
  color: #666;
  font-size: 0.9rem;
`;

const ItemTotal = styled.div`
  font-weight: bold;
`;

const SummaryDetails = styled.div`
  border-top: 1px solid #eee;
  padding-top: 15px;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const SummaryTotal = styled(SummaryRow)`
  font-weight: bold;
  font-size: 1.1rem;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #eee;
`;

const PaymentNotice = styled.div`
  background: #e9f5e9;
  padding: 15px;
  border-radius: 8px;
  margin-top: 20px;
  font-size: 0.9rem;

  p {
    margin: 0 0 8px 0;
    display: flex;
    align-items: center;
    gap: 8px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
`;

const OrderTimeline = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: relative;
  padding-left: 30px;

  &::before {
    content: "";
    position: absolute;
    left: 14px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: #eee;
  }
`;

const TimelineStep = styled.div`
  display: flex;
  gap: 15px;
  position: relative;

  ${({ $active }) =>
    $active &&
    `
    ${StepIcon} {
      background: #28a745;
      color: white;
      border-color: #28a745;
    }
    
    ${StepTitle} {
      color: #28a745;
    }
  `}
`;

const StepIcon = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: white;
  border: 2px solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9rem;
  z-index: 1;
`;

const StepContent = styled.div`
  flex: 1;
`;

const StepTitle = styled.h4`
  margin: 0 0 5px 0;
`;

const StepDescription = styled.p`
  margin: 0;
  color: #666;
  font-size: 0.9rem;
`;

const DetailsCard = styled.div`
  border: 1px solid #eee;
  border-radius: 10px;
  overflow: hidden;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #eee;

  h3 {
    margin: 0;
    font-size: 1.2rem;
  }

  svg {
    color: #28a745;
    font-size: 1.2rem;
  }
`;

const CardContent = styled.div`
  padding: 20px;

  p {
    margin: 0 0 10px 0;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 15px;
  margin: 40px 0;
  justify-content: center;
  flex-wrap: wrap;
`;

const Button = styled.button`
  padding: 12px 30px;
  border-radius: 30px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
`;

const ContinueButton = styled(Button)`
  background: #28a745;
  color: white;

  &:hover {
    background: #218838;
    transform: translateY(-2px);
  }
`;

const ViewOrdersButton = styled(Button)`
  background: white;
  color: #28a745;
  border: 2px solid #28a745;

  &:hover {
    background: #e9f5e9;
    transform: translateY(-2px);
  }
`;

const PayNowSection = styled.div`
  margin-top: 2.4rem;
  padding: 1.6rem 2rem;
  border-radius: 0.8rem;
  background-color: #fff7ed;
  border: 1px solid #fed7aa;
`;

const PayNowTitle = styled.h3`
  font-size: 1.6rem;
  font-weight: 600;
  color: #c05621;
  margin-bottom: 0.8rem;
`;

const PayNowText = styled.p`
  font-size: 1.4rem;
  color: #7b341e;
  margin-bottom: 1.2rem;
`;

const PayNowError = styled.p`
  font-size: 1.3rem;
  color: #dc2626;
  margin-bottom: 1rem;
`;

const PayNowButton = styled(Button)`
  background-color: #2563eb;
  color: #ffffff;
  &:hover {
    background-color: #1d4ed8;
  }
`;

const HelpSection = styled.div`
  text-align: center;
  padding: 30px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);

  h3 {
    margin-top: 0;
    color: #333;
  }

  p {
    margin-bottom: 0;
    color: #666;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 70vh;
  gap: 20px;
  padding: 40px 20px;
  text-align: center;

  h2 {
    margin: 0;
    color: #333;
  }

  p {
    color: #666;
    max-width: 500px;
  }
`;
