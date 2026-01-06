import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  FaCheckCircle,
  FaClock,
  FaTruck,
  FaBox,
  FaMapMarkerAlt,
  FaArrowLeft,
  FaExclamationCircle,
  FaShoppingBag,
  FaCreditCard,
  FaDollarSign,
  FaCalendarAlt,
} from "react-icons/fa";
import { orderService } from "../../shared/services/orderApi";
import { LoadingState, ErrorState } from "../../components/loading";
import useDynamicPageTitle from "../../shared/hooks/useDynamicPageTitle";
import logger from "../../shared/utils/logger";
import Container from "../../shared/components/Container";

const TrackingPage = () => {
  const { trackingNumber } = useParams();
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Guard against missing trackingNumber
  if (!trackingNumber) {
    return (
      <Container>
        <ErrorState
          title="Tracking Number Missing"
          message="Tracking number is required. Please go back and try again."
          onRetry={() => navigate(-1)}
        />
      </Container>
    );
  }

  useDynamicPageTitle({
    title: "Track Order",
    dynamicTitle: trackingNumber && `Track Order ${trackingNumber} | EazShop`,
    description: "Track your order status and delivery",
    defaultTitle: "Track Order | EazShop",
  });

  useEffect(() => {
    const fetchTrackingData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Add a small delay to ensure backend is ready (helps with connection issues)
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const response = await orderService.getOrderByTrackingNumber(trackingNumber);
        const order = response.data?.order;
        logger.log('Tracking Page - Order Data:', order);
        logger.log('Tracking Page - Shipping Address:', order?.shippingAddress);
        setOrderData(order);
      } catch (err) {
        logger.error('Tracking Page Error:', {
          error: err,
          message: err.message,
          code: err.code,
          response: err.response?.data,
          status: err.response?.status,
          url: err.config?.url,
          baseURL: err.config?.baseURL,
          trackingNumber,
        });
        
        // Better error handling for connection issues
        if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error') || err.message?.includes('CONNECTION_REFUSED') || err.isNetworkError) {
          setError("Unable to connect to the server. Please ensure the backend server is running on port 4000 and try again.");
        } else if (err.response?.status === 404) {
          setError("Order not found with this tracking number. Please verify the tracking number is correct.");
        } else if (err.response?.status === 500) {
          setError("Server error occurred. Please try again later.");
        } else {
          setError(err.response?.data?.message || err.message || "Failed to load tracking information");
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (trackingNumber) {
      fetchTrackingData();
    }
  }, [trackingNumber]);

  if (isLoading) {
    return (
      <PageContainer>
        <LoadingState message="Loading tracking information..." />
      </PageContainer>
    );
  }

  if (error || !orderData) {
    return (
      <PageContainer>
        <ErrorState
          title="Tracking Not Found"
          message={error || "Order not found with this tracking number"}
        />
        <BackButton onClick={() => navigate(-1)}>
          <FaArrowLeft />
          Go Back
        </BackButton>
      </PageContainer>
    );
  }

  const getStatusIcon = (status, iconType) => {
    if (iconType === 'order') return <FaBox />;
    if (iconType === 'payment') return <FaCreditCard />;
    if (iconType === 'processing') return <FaBox />;
    if (iconType === 'preparing') return <FaBox />;
    if (iconType === 'rider') return <FaTruck />;
    if (iconType === 'delivery') return <FaTruck />;
    if (iconType === 'delivered') return <FaCheckCircle />;
    
    switch (status) {
      case "pending_payment":
        return <FaClock />;
      case "payment_completed":
        return <FaCreditCard />;
      case "processing":
      case "confirmed":
      case "preparing":
        return <FaBox />;
      case "ready_for_dispatch":
      case "out_for_delivery":
        return <FaTruck />;
      case "delivered":
        return <FaCheckCircle />;
      case "cancelled":
      case "refunded":
        return <FaExclamationCircle />;
      default:
        return <FaClock />;
    }
  };

  const getStepColor = (step) => {
    if (step.isCompleted) {
      return "#F7C948"; // Yellow for completed
    } else if (step.isActive) {
      return "#2D7FF9"; // Blue for active
    } else {
      return "#D1D5DB"; // Gray for pending
    }
  };

  const getStepBgColor = (step) => {
    if (step.isCompleted) {
      return "#F7C948"; // Yellow background
    } else if (step.isActive) {
      return "#2D7FF9"; // Blue background
    } else {
      return "#E5E7EB"; // Gray background
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatStatusLabel = (status) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const trackingHistory = orderData.trackingHistory || [];
  const currentStatus = orderData.currentStatus || "pending_payment";
  const orderItems = orderData.orderItems || [];
  const paymentStatus = orderData.paymentStatus || "pending";

  // Define all possible tracking steps in order
  const ALL_TRACKING_STEPS = [
    { status: 'pending_payment', label: 'Order Placed', icon: 'order' },
    { status: 'payment_completed', label: 'Payment Completed', icon: 'payment' },
    { status: 'processing', label: 'Processing Order', icon: 'processing' },
    { status: 'preparing', label: 'Preparing for Dispatch', icon: 'preparing' },
    { status: 'ready_for_dispatch', label: 'Rider Assigned', icon: 'rider' },
    { status: 'out_for_delivery', label: 'Out for Delivery', icon: 'delivery' },
    { status: 'delivered', label: 'Delivered', icon: 'delivered' },
  ];

  // Map currentStatus to active step index
  // If order is paid but status is still pending_payment, move to payment_completed
  const getActiveStepIndex = () => {
    // If payment is paid but status hasn't been updated, show payment_completed as active
    if ((paymentStatus === 'paid' || paymentStatus === 'completed') && currentStatus === 'pending_payment') {
      return 1; // payment_completed
    }
    
    const statusToIndex = {
      'pending_payment': 0,
      'payment_completed': 1,
      'processing': 2,
      'confirmed': 2,
      'preparing': 3,
      'ready_for_dispatch': 4,
      'out_for_delivery': 5,
      'delivered': 6,
    };
    return statusToIndex[currentStatus] ?? 0;
  };

  const activeStepIndex = getActiveStepIndex();

  // Build complete timeline with all steps
  const buildCompleteTimeline = () => {
    return ALL_TRACKING_STEPS.map((step, index) => {
      // Check if this step has a tracking history entry
      let historyEntry = trackingHistory.find(entry => entry.status === step.status);
      
      // Special handling: If payment is paid but no payment_completed entry exists,
      // create a virtual entry for display
      if (step.status === 'payment_completed' && (paymentStatus === 'paid' || paymentStatus === 'completed') && !historyEntry) {
        historyEntry = {
          status: 'payment_completed',
          message: 'Your payment has been confirmed.',
          timestamp: orderData.paidAt || orderData.createdAt,
        };
      }
      
      const isCompleted = index < activeStepIndex;
      const isActive = index === activeStepIndex;
      const isPending = index > activeStepIndex;

      return {
        ...step,
        historyEntry,
        isCompleted,
        isActive,
        isPending,
        stepIndex: index,
      };
    });
  };

  const completeTimeline = buildCompleteTimeline();

  // Get estimated delivery from shipping options (stored in order)
  const getEstimatedDelivery = () => {
    // Use the deliveryEstimate from shipping options if available
    if (orderData.deliveryEstimate) {
      // If it's already a formatted date string, return it
      if (orderData.deliveryEstimate.includes('Today') || 
          orderData.deliveryEstimate.includes('Business Day') ||
          orderData.deliveryEstimate.includes('Arrives')) {
        return orderData.deliveryEstimate;
      }
      
      // If it's a number (days), calculate the actual date
      const days = parseInt(orderData.deliveryEstimate);
      if (!isNaN(days) && orderData.createdAt) {
        const orderDate = new Date(orderData.createdAt);
        const estimatedDate = new Date(orderDate);
        estimatedDate.setDate(estimatedDate.getDate() + days);
        
        return estimatedDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      }
      
      // Return as-is if it's already a formatted string
      return orderData.deliveryEstimate;
    }
    
    // Fallback: calculate based on order date and shipping type if no estimate stored
    if (orderData.createdAt) {
      const orderDate = new Date(orderData.createdAt);
      const estimatedDate = new Date(orderDate);
      
      // Use shippingType to determine days
      if (orderData.shippingType === 'same_day') {
        return 'Arrives Today';
      } else if (orderData.shippingType === 'express') {
        estimatedDate.setDate(estimatedDate.getDate() + 1);
        return estimatedDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      } else {
        // Standard delivery: 2-3 business days
        estimatedDate.setDate(estimatedDate.getDate() + 3);
        return estimatedDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      }
    }
    
    return null;
  };

  const estimatedDelivery = getEstimatedDelivery();

  return (
    <PageContainer>
      <Header>
        <BackButton onClick={() => navigate(-1)}>
          <FaArrowLeft />
          Back
        </BackButton>
        <Title>Order Tracking</Title>
      </Header>

      <ContentGrid>
        {/* Main Tracking Card */}
        <MainCard>
        <TrackingHeader>
          <TrackingNumber>
            Tracking Number: <strong>{orderData.trackingNumber}</strong>
          </TrackingNumber>
          <OrderNumber>
            Order Number: <strong>{orderData.orderNumber}</strong>
          </OrderNumber>
          {estimatedDelivery && (
            <EstimatedDeliveryHeader>
              <FaCalendarAlt style={{ marginRight: '0.5rem' }} />
              Expected Delivery: <strong>{estimatedDelivery}</strong>
            </EstimatedDeliveryHeader>
          )}
        </TrackingHeader>

        <CurrentStatus>
          <StatusLabel>Current Status</StatusLabel>
          <StatusBadge $color={getStepColor(completeTimeline.find(s => s.isActive) || completeTimeline[0])}>
            {getStatusIcon(currentStatus)}
            {formatStatusLabel(currentStatus)}
          </StatusBadge>
        </CurrentStatus>

        {estimatedDelivery && (
          <DeliveryEstimateSection>
            <DeliveryEstimateLabel>
              <FaCalendarAlt style={{ marginRight: '0.5rem' }} />
              Estimated Delivery Date
            </DeliveryEstimateLabel>
            <DeliveryEstimateValue>
              {estimatedDelivery}
            </DeliveryEstimateValue>
          </DeliveryEstimateSection>
        )}

        <TimelineSection>
          <TimelineTitle>Tracking History</TimelineTitle>
          <Timeline>
            {completeTimeline.map((step, index) => {
              const isLast = index === completeTimeline.length - 1;
              const stepColor = getStepColor(step);
              const stepBgColor = getStepBgColor(step);
              
              return (
                <TimelineItem key={step.status} $completed={step.isCompleted} $isActive={step.isActive} $isLast={isLast}>
                  <TimelineIcon $color={stepColor} $bgColor={stepBgColor} $completed={step.isCompleted} $isActive={step.isActive}>
                    {getStatusIcon(step.status, step.icon)}
                  </TimelineIcon>
                  <TimelineContent>
                    <TimelineStatus $color={stepColor}>
                      {step.isCompleted && <FaCheckCircle style={{ marginRight: '0.5rem', color: stepColor }} />}
                      {step.label}
                    </TimelineStatus>
                    {step.historyEntry && step.historyEntry.message && (
                      <TimelineMessage>{step.historyEntry.message}</TimelineMessage>
                    )}
                    {step.historyEntry && step.historyEntry.timestamp && (
                      <TimelineDate>{formatDate(step.historyEntry.timestamp)}</TimelineDate>
                    )}
                    {step.historyEntry && step.historyEntry.location && (
                      <TimelineLocation>
                        <FaMapMarkerAlt />
                        {step.historyEntry.location}
                      </TimelineLocation>
                    )}
                  </TimelineContent>
                  {!isLast && <TimelineLine $color={step.isCompleted ? stepColor : "#E5E7EB"} />}
                </TimelineItem>
              );
            })}
          </Timeline>
        </TimelineSection>

        <ShippingInfo>
          <InfoTitle>
            <FaMapMarkerAlt style={{ marginRight: '0.5rem' }} />
            Shipping Address
          </InfoTitle>
          {orderData.shippingAddress && Object.keys(orderData.shippingAddress).length > 0 ? (
            <AddressGrid>
              {orderData.shippingAddress.fullName && (
                <AddressItem>
                  <AddressLabel>Full Name</AddressLabel>
                  <AddressValue>{orderData.shippingAddress.fullName}</AddressValue>
                </AddressItem>
              )}
              {orderData.shippingAddress.streetAddress && (
                <AddressItem>
                  <AddressLabel>Street Address</AddressLabel>
                  <AddressValue>{orderData.shippingAddress.streetAddress}</AddressValue>
                </AddressItem>
              )}
              {orderData.shippingAddress.area && (
                <AddressItem>
                  <AddressLabel>Area/Neighborhood</AddressLabel>
                  <AddressValue>{orderData.shippingAddress.area}</AddressValue>
                </AddressItem>
              )}
              {orderData.shippingAddress.landmark && (
                <AddressItem>
                  <AddressLabel>Landmark</AddressLabel>
                  <AddressValue>{orderData.shippingAddress.landmark}</AddressValue>
                </AddressItem>
              )}
              {(orderData.shippingAddress.city || orderData.shippingAddress.state) && (
                <AddressItem>
                  <AddressLabel>City/State</AddressLabel>
                  <AddressValue>
                    {orderData.shippingAddress.city && typeof orderData.shippingAddress.city === 'string' && orderData.shippingAddress.city.charAt(0).toUpperCase() + orderData.shippingAddress.city.slice(1)}
                    {orderData.shippingAddress.city && orderData.shippingAddress.state && ', '}
                    {orderData.shippingAddress.state && typeof orderData.shippingAddress.state === 'string' && orderData.shippingAddress.state.charAt(0).toUpperCase() + orderData.shippingAddress.state.slice(1)}
                  </AddressValue>
                </AddressItem>
              )}
              {orderData.shippingAddress.region && (
                <AddressItem>
                  <AddressLabel>Region</AddressLabel>
                  <AddressValue>
                    {typeof orderData.shippingAddress.region === 'string' 
                      ? orderData.shippingAddress.region.split(' ').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')
                      : orderData.shippingAddress.region}
                  </AddressValue>
                </AddressItem>
              )}
              {(orderData.shippingAddress.digitalAddress || orderData.shippingAddress.digitalAdress) && (
                <AddressItem>
                  <AddressLabel>Digital Address</AddressLabel>
                  <AddressValue>{orderData.shippingAddress.digitalAddress || orderData.shippingAddress.digitalAdress}</AddressValue>
                </AddressItem>
              )}
              {orderData.shippingAddress.contactPhone && (
                <AddressItem>
                  <AddressLabel>Contact Phone</AddressLabel>
                  <AddressValue>{orderData.shippingAddress.contactPhone}</AddressValue>
                </AddressItem>
              )}
              {orderData.shippingAddress.country && (
                <AddressItem>
                  <AddressLabel>Country</AddressLabel>
                  <AddressValue>{orderData.shippingAddress.country}</AddressValue>
                </AddressItem>
              )}
              {orderData.shippingAddress.additionalInformation && (
                <AddressItem $fullWidth>
                  <AddressLabel>Additional Information</AddressLabel>
                  <AddressValue>{orderData.shippingAddress.additionalInformation}</AddressValue>
                </AddressItem>
              )}
              {/* Fallback: Show raw address if no structured fields */}
              {!orderData.shippingAddress.fullName && 
               !orderData.shippingAddress.streetAddress && 
               !orderData.shippingAddress.city && 
               Object.keys(orderData.shippingAddress).length > 0 && (
                <AddressItem $fullWidth>
                  <AddressLabel>Address</AddressLabel>
                  <AddressValue>
                    {JSON.stringify(orderData.shippingAddress, null, 2)}
                  </AddressValue>
                </AddressItem>
              )}
            </AddressGrid>
          ) : (
            <EmptyAddress>
              Shipping address information is not available for this order.
            </EmptyAddress>
          )}
        </ShippingInfo>
        </MainCard>

        {/* Sidebar - Order Summary & Items */}
        <Sidebar>
          {/* Order Items */}
          {orderItems.length > 0 && (
            <SidebarCard>
              <CardTitle>
                <FaShoppingBag />
                Order Items
              </CardTitle>
              <ItemsList>
                {orderItems.map((item, index) => {
                  // Use a unique key: prefer item's own _id, fallback to product._id-index combination
                  const uniqueKey = item._id || item.id || `${item.product?._id || item.product?.id || 'item'}-${index}`;
                  return (
                  <ItemCard key={uniqueKey}>
                    {item.product?.imageCover && (
                      <ItemImage src={item.product.imageCover} alt={item.product?.name || 'Product'} />
                    )}
                    <ItemInfo>
                      <ItemName>{item.product?.name || 'Product'}</ItemName>
                      <ItemDetails>
                        <ItemQuantity>Qty: {item.quantity || 1}</ItemQuantity>
                        <ItemPrice>GH₵{((item.price || 0) * (item.quantity || 1)).toFixed(2)}</ItemPrice>
                      </ItemDetails>
                    </ItemInfo>
                  </ItemCard>
                  );
                })}
              </ItemsList>
            </SidebarCard>
          )}

          {/* Order Summary */}
          <SidebarCard>
            <CardTitle>
              <FaDollarSign />
              Order Summary
            </CardTitle>
            <SummaryList>
              <SummaryRow>
                <SummaryLabel>Subtotal</SummaryLabel>
                <SummaryValue>GH₵{(orderData.subtotal || 0).toFixed(2)}</SummaryValue>
              </SummaryRow>
              <SummaryRow>
                <SummaryLabel>Shipping</SummaryLabel>
                <SummaryValue>GH₵{(orderData.shippingCost || 0).toFixed(2)}</SummaryValue>
              </SummaryRow>
              <SummaryRow $total>
                <SummaryLabel>Total</SummaryLabel>
                <SummaryValue>GH₵{(orderData.totalPrice || 0).toFixed(2)}</SummaryValue>
              </SummaryRow>
            </SummaryList>
          </SidebarCard>

          {/* Payment Information */}
          <SidebarCard>
            <CardTitle>
              <FaCreditCard />
              Payment Information
            </CardTitle>
            <InfoList>
              <InfoRow>
                <InfoLabel>Payment Method</InfoLabel>
                <InfoValue>
                  {orderData.paymentMethod 
                    ? orderData.paymentMethod.split('_').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')
                    : 'N/A'}
                </InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>Payment Status</InfoLabel>
                <InfoValue>
                  <PaymentBadge $paid={orderData.paymentStatus === 'paid' || orderData.paymentStatus === 'completed'}>
                    {(orderData.paymentStatus === 'paid' || orderData.paymentStatus === 'completed') ? 'Paid' : 'Pending'}
                  </PaymentBadge>
                </InfoValue>
              </InfoRow>
              {orderData.paidAt && (
                <InfoRow>
                  <InfoLabel>Paid On</InfoLabel>
                  <InfoValue>{formatDate(orderData.paidAt)}</InfoValue>
                </InfoRow>
              )}
            </InfoList>
          </SidebarCard>

          {/* Delivery Information */}
          {(orderData.deliveryMethod || orderData.deliveryEstimate) && (
            <SidebarCard>
              <CardTitle>
                <FaTruck />
                Delivery Information
              </CardTitle>
              <InfoList>
                {orderData.deliveryMethod && (
                  <InfoRow>
                    <InfoLabel>Delivery Method</InfoLabel>
                    <InfoValue>
                      {orderData.deliveryMethod === 'pickup_center' 
                        ? 'Pickup from EazShop Center'
                        : orderData.deliveryMethod === 'dispatch'
                        ? 'EazShop Dispatch Rider'
                        : orderData.deliveryMethod === 'seller_delivery'
                        ? "Seller's Own Delivery"
                        : orderData.deliveryMethod.split('_').map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ')}
                    </InfoValue>
                  </InfoRow>
                )}
                {estimatedDelivery && (
                  <InfoRow>
                    <InfoLabel>
                      <FaCalendarAlt style={{ marginRight: '0.25rem' }} />
                      Estimated Delivery Date
                    </InfoLabel>
                    <InfoValue>{estimatedDelivery}</InfoValue>
                  </InfoRow>
                )}
                {orderData.deliveryZone && (
                  <InfoRow>
                    <InfoLabel>Delivery Zone</InfoLabel>
                    <InfoValue>
                      Zone {orderData.deliveryZone}
                      {orderData.deliveryZone === 'A' && ' (Same City)'}
                      {orderData.deliveryZone === 'B' && ' (Nearby City)'}
                      {orderData.deliveryZone === 'C' && ' (Nationwide)'}
                    </InfoValue>
                  </InfoRow>
                )}
                {orderData.deliveryMethod === 'pickup_center' && orderData.pickupCenter && (
                  <>
                    <InfoRow>
                      <InfoLabel>
                        <FaMapMarkerAlt style={{ marginRight: '0.25rem' }} />
                        Pickup Center
                      </InfoLabel>
                      <InfoValue>
                        <strong>{orderData.pickupCenter.pickupName || 'EazShop Pickup Center'}</strong>
                      </InfoValue>
                    </InfoRow>
                    {orderData.pickupCenter.address && (
                      <InfoRow>
                        <InfoLabel>Address</InfoLabel>
                        <InfoValue>{orderData.pickupCenter.address}</InfoValue>
                      </InfoRow>
                    )}
                    {(orderData.pickupCenter.city || orderData.pickupCenter.area) && (
                      <InfoRow>
                        <InfoLabel>Location</InfoLabel>
                        <InfoValue>
                          {orderData.pickupCenter.area && (
                            <span>{orderData.pickupCenter.area}</span>
                          )}
                          {orderData.pickupCenter.area && orderData.pickupCenter.city && ', '}
                          {orderData.pickupCenter.city && (
                            <span>{orderData.pickupCenter.city.charAt(0).toUpperCase() + orderData.pickupCenter.city.slice(1)}</span>
                          )}
                        </InfoValue>
                      </InfoRow>
                    )}
                    {orderData.pickupCenter.openingHours && (
                      <InfoRow>
                        <InfoLabel>
                          <FaClock style={{ marginRight: '0.25rem' }} />
                          Opening Hours
                        </InfoLabel>
                        <InfoValue>{orderData.pickupCenter.openingHours}</InfoValue>
                      </InfoRow>
                    )}
                    {orderData.pickupCenter.instructions && (
                      <InfoRow $fullWidth>
                        <InfoLabel>Pickup Instructions</InfoLabel>
                        <InfoValue style={{ fontSize: '0.875rem', lineHeight: '1.5', color: '#4a5568' }}>
                          {orderData.pickupCenter.instructions}
                        </InfoValue>
                      </InfoRow>
                    )}
                    {orderData.pickupCenter.googleMapLink && (
                      <InfoRow>
                        <InfoLabel>Map</InfoLabel>
                        <InfoValue>
                          <PickupMapLink 
                            href={orderData.pickupCenter.googleMapLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <FaMapMarkerAlt style={{ marginRight: '0.25rem' }} />
                            View on Google Maps
                          </PickupMapLink>
                        </InfoValue>
                      </InfoRow>
                    )}
                  </>
                )}
              </InfoList>
            </SidebarCard>
          )}
        </Sidebar>
      </ContentGrid>
    </PageContainer>
  );
};

export default TrackingPage;

// Styled Components
const PageContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const MainCard = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 2rem;
`;

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  @media (max-width: 1024px) {
    order: -1;
  }
`;

const SidebarCard = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
`;

const CardTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.125rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 1.25rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;

  svg {
    color: #6366f1;
    font-size: 1.25rem;
  }
`;

const ItemsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ItemCard = styled.div`
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #f7fafc;
  border-radius: 8px;
  transition: background 0.2s;

  &:hover {
    background: #edf2f7;
  }
`;

const ItemImage = styled.img`
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  background: #e2e8f0;
`;

const ItemInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ItemName = styled.div`
  font-size: 0.95rem;
  font-weight: 600;
  color: #2d3748;
  line-height: 1.4;
`;

const ItemDetails = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  color: #718096;
`;

const ItemQuantity = styled.span``;

const ItemPrice = styled.span`
  font-weight: 600;
  color: #2d3748;
`;

const SummaryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${props => props.$total ? '1rem 0' : '0.5rem 0'};
  ${props => props.$total && 'border-top: 2px solid #e2e8f0; margin-top: 0.5rem;'}
`;

const SummaryLabel = styled.div`
  font-size: ${props => props.$total ? '1.125rem' : '0.95rem'};
  font-weight: ${props => props.$total ? '700' : '500'};
  color: #4a5568;
`;

const SummaryValue = styled.div`
  font-size: ${props => props.$total ? '1.25rem' : '0.95rem'};
  font-weight: ${props => props.$total ? '700' : '600'};
  color: #2d3748;
`;

const InfoList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const InfoRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  ${props => props.$fullWidth && 'grid-column: 1 / -1;'}
`;

const InfoLabel = styled.div`
  font-size: 0.875rem;
  color: #718096;
  font-weight: 600;
  display: flex;
  align-items: center;
`;

const InfoValue = styled.div`
  font-size: 1rem;
  color: #2d3748;
  font-weight: 500;
`;

const PickupMapLink = styled.a`
  display: inline-flex;
  align-items: center;
  color: #3182ce;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;

  &:hover {
    color: #2c5aa0;
    text-decoration: underline;
  }

  svg {
    font-size: 0.875rem;
  }
`;

const PaymentBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  background: ${props => props.$paid ? '#d1fae5' : '#fef3c7'};
  color: ${props => props.$paid ? '#065f46' : '#92400e'};
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  color: #4a5568;
  transition: all 0.2s;

  &:hover {
    background: #f7fafc;
    border-color: #cbd5e0;
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0;
`;


const TrackingHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 2rem;
`;

const TrackingNumber = styled.div`
  font-size: 1.25rem;
  color: #4a5568;

  strong {
    color: #2d3748;
    font-weight: 700;
  }
`;

const OrderNumber = styled.div`
  font-size: 1rem;
  color: #718096;

  strong {
    color: #4a5568;
    font-weight: 600;
  }
`;

const EstimatedDeliveryHeader = styled.div`
  font-size: 1rem;
  color: #2d3748;
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  background: #f0f9ff;
  border-left: 4px solid #3182ce;
  border-radius: 4px;
  margin-top: 0.5rem;

  strong {
    color: #1e40af;
    font-weight: 700;
    margin-left: 0.25rem;
  }
`;

const CurrentStatus = styled.div`
  margin-bottom: 2rem;
`;

const DeliveryEstimateSection = styled.div`
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const DeliveryEstimateLabel = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  opacity: 0.9;
  display: flex;
  align-items: center;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const DeliveryEstimateValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  display: flex;
  align-items: center;
`;

const StatusLabel = styled.div`
  font-size: 0.875rem;
  color: #718096;
  margin-bottom: 0.5rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: ${(props) => `${props.$color}15`};
  color: ${(props) => props.$color};
  border-radius: 8px;
  font-size: 1.125rem;
  font-weight: 600;

  svg {
    font-size: 1.5rem;
  }
`;

const TimelineSection = styled.div`
  margin-bottom: 2rem;
`;

const TimelineTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 1.5rem;
`;

const Timeline = styled.div`
  position: relative;
  padding-left: 2rem;
`;

const TimelineItem = styled.div`
  position: relative;
  padding-bottom: 2rem;
  padding-left: 3rem;

  &:not(:last-child)::before {
    content: "";
    position: absolute;
    left: 0.75rem;
    top: 2.5rem;
    width: 2px;
    height: calc(100% - 1rem);
    background: ${props => {
      if (props.$completed) return '#F7C948';
      if (props.$isActive) return '#2D7FF9';
      return '#E5E7EB';
    }};
  }
`;

const TimelineIcon = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: ${(props) => {
    if (props.$completed) return props.$bgColor || '#F7C948';
    if (props.$isActive) return props.$bgColor || '#2D7FF9';
    return props.$bgColor || '#E5E7EB';
  }};
  color: ${(props) => {
    if (props.$completed || props.$isActive) return "white";
    return "#9CA3AF";
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  z-index: 1;
  border: 2px solid ${(props) => props.$color || '#D1D5DB'};
`;

const TimelineContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const TimelineStatus = styled.div`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${(props) => props.$color || '#1a202c'};
  display: flex;
  align-items: center;
`;

const TimelineMessage = styled.div`
  font-size: 1rem;
  color: #4a5568;
  line-height: 1.5;
`;

const TimelineDate = styled.div`
  font-size: 0.875rem;
  color: #718096;
`;

const TimelineLocation = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #718096;
  margin-top: 0.25rem;

  svg {
    font-size: 0.75rem;
  }
`;

const TimelineLine = styled.div`
  position: absolute;
  left: 0.75rem;
  top: 2.5rem;
  width: 2px;
  height: calc(100% - 1rem);
  background: ${(props) => props.$color || '#E5E7EB'};
  z-index: 0;
`;

const EmptyTimeline = styled.div`
  text-align: center;
  padding: 2rem;
  color: #718096;
  font-style: italic;
`;

const EmptyAddress = styled.div`
  text-align: center;
  padding: 2rem;
  color: #718096;
  font-style: italic;
  background: #f7fafc;
  border-radius: 8px;
`;

const ShippingInfo = styled.div`
  padding-top: 2rem;
  border-top: 1px solid #e2e8f0;
`;

const InfoTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
`;

const AddressGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const AddressItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  ${props => props.$fullWidth && 'grid-column: 1 / -1;'}
`;

const AddressLabel = styled.div`
  font-size: 0.875rem;
  color: #718096;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const AddressValue = styled.div`
  font-size: 1rem;
  color: #2d3748;
  font-weight: 500;
  line-height: 1.5;
`;

