import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  FaArrowLeft,
  FaShoppingBag,
  FaPrint,
  FaEnvelope,
  FaEdit,
  FaTrash,
  FaBox,
  FaTruck,
  FaCheckCircle,
  FaUser,
  FaMapMarkerAlt,
  FaCreditCard,
  FaStar,
  FaUndo,
  FaTimes,
} from "react-icons/fa";
import { useGetUserOrderById, useRequestRefund, useGetRefundStatus } from '../../shared/hooks/useOrder';
import { usePaystackPayment } from '../../shared/hooks/usePaystackPayment';
import { LoadingState, ErrorState, EmptyState } from '../../components/loading';
import useDynamicPageTitle from '../../shared/hooks/useDynamicPageTitle';
import { PATHS } from '../../routes/routePaths';
import EditOrderModal from './EditOrderModal';
import { orderService } from './orderApi';
import CreateReviewForm from '../products/CreateReviewForm';
import OrderTrackingTimeline from './OrderTrackingTimeline';
import logger from '../../shared/utils/logger';
import Button from '../../shared/components/Button';

const OrderDetail = () => {
  const { id: orderId } = useParams();
  const navigate = useNavigate();
  
  // Guard against missing orderId
  if (!orderId) {
    return (
      <ErrorState
        title="Order ID Missing"
        message="Order ID is required. Please go back and try again."
        onRetry={() => navigate(-1)}
      />
    );
  }
  
  const { data: orderData, isLoading, isError, refetch } = useGetUserOrderById(orderId);
  const order = useMemo(() => orderData?.order, [orderData]);
logger.log("order", order);

  useDynamicPageTitle({
    title: "Order Details",
    dynamicTitle: order && `Order #${order._id?.slice(-8) || order._id} | Saiisai`,
    description: "Track your order in real-time.",
    defaultTitle: "Saiisai Orders",
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedProductForReview, setSelectedProductForReview] = useState(null);
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [refundReasonText, setRefundReasonText] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  // Item-level refund state
  const [selectedItems, setSelectedItems] = useState({}); // { orderItemId: { quantity, reason, reasonText, images } }
  const [refundMode, setRefundMode] = useState('items'); // 'items' or 'whole'

  const { mutate: requestRefund, isPending: isRefundPending } = useRequestRefund();
  const { initializePaystackPayment } = usePaystackPayment();
  const { data: refundStatusData } = useGetRefundStatus(orderId);
  const refundStatus = useMemo(() => refundStatusData?.refund, [refundStatusData]);

  // Refetch order when component mounts or orderId changes (to get latest status after payment)
  useEffect(() => {
    if (orderId) {
      refetch();
    }
  }, [orderId, refetch]);

  // Determine current order stage
  const getCurrentStage = () => {
    if (!order) return 'placed';
    
    const orderStatus = order.status || order.orderStatus || 'pending';
    const paymentStatus = order.paymentStatus;
    
    // If payment is not completed, order is still at "placed" stage
    if (paymentStatus !== 'completed' && orderStatus === 'pending') {
      return 'placed';
    }
    
    // If order is shipped
    if (orderStatus === 'shipped' || order.orderStatus === 'shipped' || order.FulfillmentStatus === 'shipped') {
      return 'shipped';
    }
    
    // If order is delivered
    if (orderStatus === 'delivered' || order.orderStatus === 'delievered' || order.FulfillmentStatus === 'delievered' || orderStatus === 'completed') {
      return 'delivered';
    }
    
    // If payment is completed but order hasn't shipped yet, it's still at "placed" stage
    if (paymentStatus === 'completed' && (orderStatus === 'paid' || orderStatus === 'pending')) {
      return 'placed';
    }
    
    return 'placed';
  };

  const currentStage = getCurrentStage();

  // Determine if order is eligible for retry payment
  const canRetryPayment = useMemo(() => {
    if (!order) return false;
    const paymentMethod = order.paymentMethod;
    const isCashOnDelivery =
      paymentMethod === 'payment_on_delivery' ||
      paymentMethod === 'Cash on Delivery' ||
      paymentMethod === 'cod';
    const isWalletPayment =
      paymentMethod === 'credit_balance' ||
      paymentMethod === 'wallet' ||
      paymentMethod === 'account_balance';
    const isPaystackPayment = !isCashOnDelivery && !isWalletPayment;
    const isPaid =
      order.paymentStatus === 'completed' ||
      order.paymentStatus === 'paid' ||
      order.isPaid === true ||
      !!order.paidAt;
    const isUnpaid = !isPaid && (
      !order.paymentStatus ||
      order.paymentStatus === 'pending' ||
      order.paymentStatus === 'failed'
    );
    const isNotCancelled =
      order.status !== 'cancelled' && order.orderStatus !== 'cancelled';
    return isPaystackPayment && isUnpaid && isNotCancelled;
  }, [order]);

  const [payNowError, setPayNowError] = useState('');
  const [isPayNowLoading, setIsPayNowLoading] = useState(false);

  const handlePayNow = async () => {
    if (!order) return;
    setPayNowError('');
    setIsPayNowLoading(true);
    try {
      const email =
        order.user?.email ||
        order.shippingAddress?.contactEmail ||
        order.shippingAddress?.email ||
        '';

      const { redirectTo } = await initializePaystackPayment({
        orderId,
        email,
      });

      window.location.href = redirectTo;
    } catch (error) {
      console.error('[OrderDetail] Pay Now error:', error);
      setPayNowError(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to initialize payment. Please try again.'
      );
    } finally {
      setIsPayNowLoading(false);
    }
  };

  const handleDeleteOrder = () => {
    logger.log("Deleting order:", orderId);
  };

  const handleEditOrder = () => {
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    // Refetch order data after successful address update
    refetch();
  };

  const handleSendEmail = async () => {
    if (!order?.user?.email) {
      alert('User email not found');
      return;
    }

    try {
      const response = await orderService.sendOrderDetailEmail(orderId);
      alert('Order detail email sent successfully!');
    } catch (error) {
      logger.error('Error sending email:', error);
      alert(error?.response?.data?.message || 'Failed to send email. Please try again.');
    }
  };

  // Check if order is eligible for refund
  const isEligibleForRefund = useMemo(() => {
    if (!order) return false;
    
    // Order must be paid (consider all paid indicators)
    const orderIsPaid =
      order.paymentStatus === 'paid' ||
      order.paymentStatus === 'completed' ||
      order.isPaid === true ||
      !!order.paidAt;
    if (!orderIsPaid) {
      return false;
    }
    
    // Order cannot already be refunded
    if (order.paymentStatus === 'refunded' || order.currentStatus === 'refunded') {
      return false;
    }
    
    // Order cannot be cancelled
    if (order.currentStatus === 'cancelled' || order.status === 'cancelled') {
      return false;
    }
    
    // Check if refund already requested and pending
    if (refundStatus?.requested && refundStatus?.status === 'pending') {
      return false;
    }
    
    // Check if refund already approved
    if (refundStatus?.requested && refundStatus?.status === 'approved') {
      return false;
    }
    
    // Check refund window (30 days from delivery or order date)
    const refundWindowDays = 30;
    const orderDate = order.deliveredAt ? new Date(order.deliveredAt) : new Date(order.createdAt);
    const daysSinceOrder = (Date.now() - orderDate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSinceOrder > refundWindowDays) {
      return false;
    }
    
    return true;
  }, [order, refundStatus]);

  const handleRequestRefund = () => {
    setRefundModalOpen(true);
    setRefundAmount(order?.totalPrice?.toFixed(2) || '');
    setRefundMode('items'); // Default to item-level refunds
    setSelectedItems({});
  };

  const handleItemSelection = (itemId, checked) => {
    if (checked) {
      const item = (order?.orderItems || []).find(i => (i._id || i.id) === itemId);
      if (item) {
        setSelectedItems(prev => ({
          ...prev,
          [itemId]: {
            quantity: item.quantity,
            reason: '',
            reasonText: '',
            images: [],
          }
        }));
      }
    } else {
      setSelectedItems(prev => {
        const newItems = { ...prev };
        delete newItems[itemId];
        return newItems;
      });
    }
  };

  const handleItemQuantityChange = (itemId, quantity) => {
    const item = (order?.orderItems || []).find(i => (i._id || i.id) === itemId);
    if (item && quantity > 0 && quantity <= item.quantity) {
      setSelectedItems(prev => ({
        ...prev,
        [itemId]: {
          ...prev[itemId],
          quantity: parseInt(quantity),
        }
      }));
    }
  };

  const handleItemReasonChange = (itemId, reason) => {
    setSelectedItems(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        reason,
      }
    }));
  };

  const handleItemReasonTextChange = (itemId, reasonText) => {
    setSelectedItems(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        reasonText,
      }
    }));
  };

  const handleItemImageUpload = (itemId, files) => {
    // Convert files to base64 or upload to server
    // For now, we'll store file objects and convert on submit
    const imageFiles = Array.from(files);
    setSelectedItems(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        images: imageFiles,
      }
    }));
  };

  const convertImagesToBase64 = async (files) => {
    const promises = Array.from(files).map(file => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });
    return Promise.all(promises);
  };

  const handleSubmitRefundRequest = async (e) => {
    e.preventDefault();
    
    // ITEM-LEVEL REFUND
    if (refundMode === 'items') {
      const selectedItemsArray = Object.keys(selectedItems);
      
      if (selectedItemsArray.length === 0) {
        alert('Please select at least one item to refund');
        return;
      }

      // Validate all selected items have reason
      for (const itemId of selectedItemsArray) {
        const itemData = selectedItems[itemId];
        if (!itemData.reason) {
          alert('Please select a refund reason for all selected items');
          return;
        }
      }

      // Prepare items array with images converted to base64
      const items = await Promise.all(
        selectedItemsArray.map(async (itemId) => {
          const itemData = selectedItems[itemId];
          const orderItem = order.orderItems.find(i => (i._id || i.id) === itemId);
          
          let imageUrls = [];
          if (itemData.images && itemData.images.length > 0) {
            imageUrls = await convertImagesToBase64(itemData.images);
          }

          return {
            orderItemId: itemId,
            quantity: itemData.quantity,
            reason: itemData.reason,
            reasonText: itemData.reasonText || '',
            images: imageUrls,
          };
        })
      );

      requestRefund(
        {
          orderId,
          data: {
            items,
            reason: refundReason || items[0]?.reason, // Main reason for backward compatibility
            reasonText: refundReasonText || '',
            images: [], // Main images for backward compatibility
          },
        },
        {
          onSuccess: () => {
            alert('Refund request submitted successfully!');
            setRefundModalOpen(false);
            setRefundReason('');
            setRefundReasonText('');
            setRefundAmount('');
            setSelectedItems({});
            refetch();
          },
          onError: (error) => {
            alert(error?.response?.data?.message || 'Failed to submit refund request. Please try again.');
          },
        }
      );
    } else {
      // WHOLE-ORDER REFUND (backward compatible)
      if (!refundReason) {
        alert('Please select a refund reason');
        return;
      }
      
      const amount = parseFloat(refundAmount) || order?.totalPrice || 0;
      
      requestRefund(
        {
          orderId,
          data: {
            reason: refundReason,
            reasonText: refundReasonText,
            amount,
          },
        },
        {
          onSuccess: () => {
            alert('Refund request submitted successfully!');
            setRefundModalOpen(false);
            setRefundReason('');
            setRefundReasonText('');
            setRefundAmount('');
            refetch();
          },
          onError: (error) => {
            alert(error?.response?.data?.message || 'Failed to submit refund request. Please try again.');
          },
        }
      );
    }
  };


  if (isLoading) return <LoadingState message="Loading order details..." />;
  if (isError) return <ErrorState title="Error loading order" message="Please try again later." />;
  if (!order) return <EmptyState title="Order not found" message="The order you're looking for doesn't exist." />;

  // Calculate grand total (tax is already included in subtotal for VAT-inclusive pricing)
  const subtotal = (order?.sellerOrder || []).reduce((total, sellerOrder) => total + (sellerOrder.subtotal || 0), 0);
  const totalShipping = order.shippingCost || (order?.sellerOrder || []).reduce((total, sellerOrder) => total + (sellerOrder.shippingCost || 0), 0);
  // Get COVID levy from order (for tracking only, NOT added to customer total - will be deducted from seller at withdrawal)
  const totalCovidLevy = order.totalCovidLevy || (order?.sellerOrder || []).reduce((total, sellerOrder) => total + (sellerOrder.totalCovidLevy || 0), 0);
  // Grand total: subtotal + shipping (COVID levy NOT included)
  const grandTotal = order.totalPrice || (subtotal + totalShipping);

  return (
    <OrderDetailContainer>
      {/* Header Section */}
      <HeaderSection>
        <HeaderTop>
          <BackButton onClick={() => navigate(-1)}>
            <FaArrowLeft />
            <span>Back to Orders</span>
          </BackButton>
          
          <OrderNumber>
            <FaShoppingBag />
            <span>Order #{order.orderNumber}</span>
          </OrderNumber>
        </HeaderTop>

        <HeaderMeta>
          <MetaItem>
            <strong>Placed:</strong> {new Date(order.createdAt).toLocaleDateString()}
          </MetaItem>
          {order.trackingNumber && (
            <MetaItem>
              <strong>Tracking Number:</strong>
              <TrackingLink onClick={() => navigate(`/tracking/${order.trackingNumber}`)}>
                {order.trackingNumber}
              </TrackingLink>
            </MetaItem>
          )}
          <MetaItem>
            <strong>Status:</strong> 
            <StatusBadge $status={status || order.status || order.orderStatus || 'pending'}>
              {(status || order.status || order.orderStatus || 'pending').charAt(0).toUpperCase() + (status || order.status || order.orderStatus || 'pending').slice(1)}
            </StatusBadge>
            {(order.paymentStatus === 'completed' ||
              order.paymentStatus === 'paid' ||
              order.isPaid === true ||
              !!order.paidAt) && (
              <PaymentStatusBadge>
                Payment Completed
              </PaymentStatusBadge>
            )}
          </MetaItem>
        </HeaderMeta>

        {/* Pay Now / Retry Payment */}
        {canRetryPayment && (
          <PayNowBanner>
            <PayNowBannerText>
              This order was created but payment has not been completed.
            </PayNowBannerText>
            {payNowError && <PayNowBannerError>{payNowError}</PayNowBannerError>}
            <PayNowBannerButton
              type="button"
              onClick={handlePayNow}
              disabled={isPayNowLoading}
            >
              {isPayNowLoading ? 'Redirecting to Paystack...' : 'Pay Now'}
            </PayNowBannerButton>
          </PayNowBanner>
        )}
      </HeaderSection>

      {/* Main Content Grid */}
      <ContentGrid>
        {/* Left Column - Order Summary & Timeline */}
        <LeftColumn>
          {/* Order Tracking Timeline */}
          {orderId && (
            <OrderTrackingTimeline orderId={orderId} showLiveTracking={true} />
          )}

          {/* Order Timeline (Legacy - keeping for backward compatibility) */}
          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
            </CardHeader>
            <CardBody>
              <StatusTimeline>
                <TimelineStep $active={currentStage === 'placed'} $completed={true} $current={currentStage === 'placed'}>
                  <StepIndicator $completed={true} $current={currentStage === 'placed'}>
                    <FaBox />
                  </StepIndicator>
                  <StepContent>
                    <StepLabel $current={currentStage === 'placed'}>Order Placed</StepLabel>
                    <StepDate>{new Date(order.createdAt).toLocaleDateString()}</StepDate>
                  </StepContent>
                </TimelineStep>

                <TimelineStep $active={currentStage === 'shipped' || currentStage === 'delivered'} $completed={currentStage === 'shipped' || currentStage === 'delivered'} $current={currentStage === 'shipped'}>
                  <StepIndicator $completed={currentStage === 'shipped' || currentStage === 'delivered'} $current={currentStage === 'shipped'}>
                    <FaTruck />
                  </StepIndicator>
                  <StepContent>
                    <StepLabel $current={currentStage === 'shipped'}>Shipped</StepLabel>
                    {order.shippedAt && (
                      <StepDate>{new Date(order.shippedAt).toLocaleDateString()}</StepDate>
                    )}
                  </StepContent>
                </TimelineStep>

                <TimelineStep $active={currentStage === 'delivered'} $completed={currentStage === 'delivered'} $current={currentStage === 'delivered'}>
                  <StepIndicator $completed={currentStage === 'delivered'} $current={currentStage === 'delivered'}>
                    <FaCheckCircle />
                  </StepIndicator>
                  <StepContent>
                    <StepLabel $current={currentStage === 'delivered'}>Delivered</StepLabel>
                    {order.deliveredAt && (
                      <StepDate>{new Date(order.deliveredAt).toLocaleDateString()}</StepDate>
                    )}
                  </StepContent>
                </TimelineStep>
              </StatusTimeline>
            </CardBody>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>
                <FaUser />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardBody>
              <InfoGrid>
                <InfoItem>
                  <InfoLabel>Name</InfoLabel>
                  <InfoValue>{order.user.name}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Email</InfoLabel>
                  <InfoValue>{order.user.email}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Phone</InfoLabel>
                  <InfoValue>{order.user.phone || "N/A"}</InfoValue>
                </InfoItem>
              </InfoGrid>
            </CardBody>
          </Card>

          {/* Shipping Details */}
          <Card>
            <CardHeader>
              <CardTitle>
                <FaTruck />
                Shipping Details
              </CardTitle>
            </CardHeader>
            <CardBody>
              <InfoGrid>
                {/* Address Information */}
                {order.shippingAddress && (
                  <>
                    {order.shippingAddress.streetAddress && (
                      <InfoItem>
                        <InfoLabel>Street Address</InfoLabel>
                        <InfoValue>{order.shippingAddress.streetAddress}</InfoValue>
                      </InfoItem>
                    )}
                    {(order.shippingAddress.city || order.shippingAddress.state) && (
                      <InfoItem>
                        <InfoLabel>City/State</InfoLabel>
                        <InfoValue>
                          {order.shippingAddress.city}
                          {order.shippingAddress.city && order.shippingAddress.state && ', '}
                          {order.shippingAddress.state}
                        </InfoValue>
                      </InfoItem>
                    )}
                    {(order.shippingAddress.digitalAddress || order.shippingAddress.digitalAdress) && (
                      <InfoItem>
                        <InfoLabel>Digital Address</InfoLabel>
                        <InfoValue>{order.shippingAddress.digitalAddress || order.shippingAddress.digitalAdress}</InfoValue>
                      </InfoItem>
                    )}
                    {order.shippingAddress.region && (
                      <InfoItem>
                        <InfoLabel>Region</InfoLabel>
                        <InfoValue>{order.shippingAddress.region}</InfoValue>
                      </InfoItem>
                    )}
                    {order.shippingAddress.country && (
                      <InfoItem>
                        <InfoLabel>Country</InfoLabel>
                        <InfoValue>{order.shippingAddress.country}</InfoValue>
                      </InfoItem>
                    )}
                    {order.shippingAddress.contactPhone && (
                      <InfoItem>
                        <InfoLabel>Contact Phone</InfoLabel>
                        <InfoValue>{order.shippingAddress.contactPhone}</InfoValue>
                      </InfoItem>
                    )}
                    {order.shippingAddress.landmark && (
                      <InfoItem>
                        <InfoLabel>Landmark</InfoLabel>
                        <InfoValue>{order.shippingAddress.landmark}</InfoValue>
                      </InfoItem>
                    )}
                  </>
                )}
                
                {/* Delivery Information */}
                <InfoItem>
                  <InfoLabel>Delivery Method</InfoLabel>
                  <InfoValue>
                    {order.deliveryMethod === 'pickup_center' 
                      ? 'Pickup from Saiisai Center'
                      : order.deliveryMethod === 'dispatch'
                      ? 'Saiisai Dispatch Rider'
                      : order.deliveryMethod === 'seller_delivery'
                      ? "Seller's Own Delivery"
                      : 'Standard Delivery'}
                  </InfoValue>
                </InfoItem>
                {order.shippingType && (
                  <InfoItem>
                    <InfoLabel>Shipping Type</InfoLabel>
                    <InfoValue>
                      {order.shippingType === 'same_day' 
                        ? 'Express Shipping (Same Day)'
                        : order.shippingType === 'standard'
                        ? 'Standard Delivery (2-3 Days)'
                        : order.deliverySpeed === 'same_day'
                        ? 'Express Shipping (Same Day)'
                        : order.deliverySpeed === 'next_day'
                        ? 'Next Day Delivery'
                        : 'Standard Delivery'}
                    </InfoValue>
                  </InfoItem>
                )}
                {(order.shippingCost || order.shippingCost === 0) && (
                  <InfoItem>
                    <InfoLabel>Shipping Cost</InfoLabel>
                    <InfoValue>
                      {order.shippingCost > 0 
                        ? `GH₵${order.shippingCost.toFixed(2)}`
                        : 'Free'}
                    </InfoValue>
                  </InfoItem>
                )}
                {order.deliveryEstimate && (
                  <InfoItem>
                    <InfoLabel>Delivery Estimate</InfoLabel>
                    <InfoValue>{order.deliveryEstimate}</InfoValue>
                  </InfoItem>
                )}
                {order.weight && (
                  <InfoItem>
                    <InfoLabel>Weight</InfoLabel>
                    <InfoValue>{order.weight.toFixed(2)} kg</InfoValue>
                  </InfoItem>
                )}
                {order.deliveryZone && (
                  <InfoItem>
                    <InfoLabel>Delivery Zone</InfoLabel>
                    <InfoValue>
                      Zone {order.deliveryZone}
                      {order.deliveryZone === 'A' && ' (Same City)'}
                      {order.deliveryZone === 'B' && ' (Nearby City)'}
                      {order.deliveryZone === 'C' && ' (Nationwide)'}
                    </InfoValue>
                  </InfoItem>
                )}
                {order.shippingCity && (
                  <InfoItem>
                    <InfoLabel>Shipping City</InfoLabel>
                    <InfoValue>{order.shippingCity}</InfoValue>
                  </InfoItem>
                )}
                {(order.shippingAddress?.digitalAddress || order.shippingAddress?.digitalAdress) && (
                  <InfoItem>
                    <InfoLabel>Digital Address</InfoLabel>
                    <InfoValue>{order.shippingAddress.digitalAddress || order.shippingAddress.digitalAdress}</InfoValue>
                  </InfoItem>
                )}
                {order.pickupCenterId && order.pickupCenter && (
                  <InfoItem>
                    <InfoLabel>Pickup Center</InfoLabel>
                    <InfoValue>
                      {order.pickupCenter.pickupName || 'N/A'}
                      {order.pickupCenter.address && (
                        <div style={{ fontSize: '0.875rem', color: 'var(--color-grey-600)', marginTop: '0.25rem' }}>
                          {order.pickupCenter.address}
                        </div>
                      )}
                    </InfoValue>
                  </InfoItem>
                )}
              </InfoGrid>
              {order.shippingBreakdown && order.shippingBreakdown.length > 0 && (
                <ShippingBreakdownSection>
                  <BreakdownTitle>Shipping Breakdown</BreakdownTitle>
                  {(order?.shippingBreakdown || []).map((breakdown, index) => (
                    <BreakdownItem key={index}>
                      <BreakdownLabel>Seller {index + 1}</BreakdownLabel>
                      <BreakdownValue>
                        GH₵{breakdown.shippingFee?.toFixed(2) || '0.00'}
                        {breakdown.reason && (
                          <BreakdownReason>
                            ({breakdown.reason === 'sameCity' ? 'Same City' 
                              : breakdown.reason === 'crossCity' ? 'Cross City'
                              : breakdown.reason === 'heavyItem' ? 'Heavy Item'
                              : breakdown.reason})
                          </BreakdownReason>
                        )}
                      </BreakdownValue>
                    </BreakdownItem>
                  ))}
                </ShippingBreakdownSection>
              )}
            </CardBody>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle>
                <FaCreditCard />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardBody>
              <InfoGrid>
                <InfoItem>
                  <InfoLabel>Method</InfoLabel>
                  <InfoValue>{order.paymentMethod}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Status</InfoLabel>
                  <InfoValue>
                    {(() => {
                      const isPaid =
                        order.paymentStatus === 'completed' ||
                        order.paymentStatus === 'paid' ||
                        order.isPaid === true ||
                        !!order.paidAt;
                      const label =
                        isPaid && order.paymentStatus === 'refunded'
                          ? 'Refunded'
                          : isPaid
                            ? 'Paid'
                            : 'Pending';
                      return (
                        <PaymentStatus $paid={isPaid}>
                          {label}
                        </PaymentStatus>
                      );
                    })()}
                  </InfoValue>
                </InfoItem>
                {order.paidAt && (
                  <InfoItem>
                    <InfoLabel>Paid At</InfoLabel>
                    <InfoValue>{new Date(order.paidAt).toLocaleString()}</InfoValue>
                  </InfoItem>
                )}
              </InfoGrid>
            </CardBody>
          </Card>
        </LeftColumn>

        {/* Right Column - Order Items */}
        <RightColumn>
          <SectionHeader>
            <h2>Order Items</h2>
            <span>{(order?.sellerOrder || []).length} seller(s)</span>
          </SectionHeader>

          {/* Seller Orders - Mobile Card Layout */}
          <SellerOrdersGrid>
            {(order?.sellerOrder || []).map((sellerOrder) => (
              <SellerCard key={sellerOrder._id}>
                <SellerHeader>
                  <SellerAvatar>
                    <FaUser />
                  </SellerAvatar>
                  <SellerInfo>
                    <SellerName>{sellerOrder.seller?.name || "Unknown Seller"}</SellerName>
                    <SellerEmail>{sellerOrder.seller?.email || "N/A"}</SellerEmail>
                  </SellerInfo>
                </SellerHeader>

                {/* Order Items - Mobile Cards */}
                <OrderItemsList>
                  {(order?.orderItems || []).map((item, index) => {
                    // Check if order is completed or delivered (not just shipped)
                    const isCompleted = order.status === 'completed' || 
                                       order.status === 'delivered' ||
                                       order.orderStatus === 'completed' ||
                                       order.orderStatus === 'delievered' ||
                                       order.FulfillmentStatus === 'completed' ||
                                       order.FulfillmentStatus === 'delievered';
                    
                    // Use a unique key: prefer item's own _id, fallback to product._id-index combination
                    const uniqueKey = item._id || item.id || `${item.product?._id || item.product?.id || 'item'}-${index}`;
                    
                    return (
                      <OrderItemCard key={uniqueKey}>
                        <ItemImage src={item.product.imageCover} alt={item.product.name} />
                        <ItemDetails>
                          <ItemName>{item.product.name}</ItemName>
                          <ItemMeta>
                            <ItemPrice>GH₵{item.price.toFixed(2)}</ItemPrice>
                            <ItemQuantity>Qty: {item.quantity}</ItemQuantity>
                          </ItemMeta>
                          {isCompleted && (
                            <ReviewButton
                              onClick={() => {
                                setSelectedProductForReview({
                                  productId: item.product._id || item.product.id,
                                  productName: item.product.name,
                                  orderId: order._id || order.id,
                                });
                                setReviewModalOpen(true);
                              }}
                            >
                              <FaStar />
                              Write Review
                            </ReviewButton>
                          )}
                        </ItemDetails>
                        <ItemTotal>GH₵{(item.price * item.quantity).toFixed(2)}</ItemTotal>
                      </OrderItemCard>
                    );
                  })}
                </OrderItemsList>

                {/* Seller Order Summary */}
                <OrderSummary>
                  <SummaryRow>
                    <span>Items Subtotal:</span>
                    <span>GH₵{sellerOrder.subtotal.toFixed(2)}</span>
                  </SummaryRow>
                  <SummaryRow>
                    <span>Shipping Cost:</span>
                    <span>GH₵{sellerOrder.shippingCost.toFixed(2)}</span>
                  </SummaryRow>
                  <SummaryDivider />
                  <SummaryRow $total={true}>
                    <span>Seller Total:</span>
                    <span>GH₵{sellerOrder.total.toFixed(2)}</span>
                  </SummaryRow>
                </OrderSummary>
              </SellerCard>
            ))}
          </SellerOrdersGrid>

          {/* Grand Total */}
          <GrandTotalCard>
            <TotalContent>
              <TotalLabel>Grand Total</TotalLabel>
              <TotalBreakdown>
                <BreakdownRow>
                  <span>Subtotal:</span>
                  <span>GH₵{subtotal.toFixed(2)}</span>
                </BreakdownRow>
                {totalShipping > 0 && (
                  <BreakdownRow>
                    <span>Shipping:</span>
                    <span>GH₵{totalShipping.toFixed(2)}</span>
                  </BreakdownRow>
                )}
                <TotalAmount>GH₵{grandTotal.toFixed(2)}</TotalAmount>
              </TotalBreakdown>
            </TotalContent>
          </GrandTotalCard>
        </RightColumn>
      </ContentGrid>

      {/* Action Bar */}
      <ActionBar>
        <DangerButton onClick={handleDeleteOrder}>
          <FaTrash />
          Delete Order
        </DangerButton>
        <ActionGroup>
          {isEligibleForRefund && (
            <Button 
              variant="secondary" 
              onClick={handleRequestRefund}
              leftIcon={<FaUndo />}
            >
              Request Refund
            </Button>
          )}
          {refundStatus?.requested && (
            <RefundStatusBadge $status={refundStatus.status}>
              Refund {refundStatus.status === 'pending' ? 'Pending' : 
                      refundStatus.status === 'approved' ? 'Approved' :
                      refundStatus.status === 'rejected' ? 'Rejected' :
                      refundStatus.status === 'processing' ? 'Processing' :
                      refundStatus.status === 'completed' ? 'Completed' : 'Requested'}
            </RefundStatusBadge>
          )}
          <SecondaryButton onClick={handleEditOrder}>
            <FaMapMarkerAlt />
            Change Shipping Address or Method
          </SecondaryButton>
          <ActionButton>
            <FaPrint />
            Print
          </ActionButton>
          <ActionButton onClick={handleSendEmail}>
            <FaEnvelope />
            Email
          </ActionButton>
        </ActionGroup>
      </ActionBar>

      {/* Edit Order Modal */}
      <EditOrderModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        order={order}
        onSuccess={handleEditSuccess}
      />

      {/* Review Modal */}
      {reviewModalOpen && selectedProductForReview && (
        <ReviewModalOverlay onClick={() => {
          setReviewModalOpen(false);
          setSelectedProductForReview(null);
        }}>
          <ReviewModalContent onClick={(e) => e.stopPropagation()}>
            <ReviewModalHeader>
              <ReviewModalTitle>
                Write Review for {selectedProductForReview.productName}
              </ReviewModalTitle>
              <ReviewModalClose onClick={() => {
                setReviewModalOpen(false);
                setSelectedProductForReview(null);
              }}>
                ×
              </ReviewModalClose>
            </ReviewModalHeader>
            <ReviewModalBody>
              <CreateReviewForm
                productId={selectedProductForReview.productId}
                orderId={selectedProductForReview.orderId}
                onSuccess={() => {
                  setReviewModalOpen(false);
                  setSelectedProductForReview(null);
                  refetch(); // Refresh order data
                }}
                onCancel={() => {
                  setReviewModalOpen(false);
                  setSelectedProductForReview(null);
                }}
              />
            </ReviewModalBody>
          </ReviewModalContent>
        </ReviewModalOverlay>
      )}

      {/* Refund Request Modal */}
      {refundModalOpen && (
        <ReviewModalOverlay onClick={() => setRefundModalOpen(false)}>
          <ReviewModalContent onClick={(e) => e.stopPropagation()}>
            <ReviewModalHeader>
              <ReviewModalTitle>
                Request Refund for Order #{order?.orderNumber}
              </ReviewModalTitle>
              <ReviewModalClose onClick={() => setRefundModalOpen(false)}>
                ×
              </ReviewModalClose>
            </ReviewModalHeader>
            <ReviewModalBody>
              <RefundForm onSubmit={handleSubmitRefundRequest}>
                {/* Refund Mode Toggle */}
                <FormGroup>
                  <Label>Refund Type *</Label>
                  <ModeToggle>
                    <ModeButton
                      type="button"
                      $active={refundMode === 'items'}
                      onClick={() => setRefundMode('items')}
                    >
                      Select Items
                    </ModeButton>
                    <ModeButton
                      type="button"
                      $active={refundMode === 'whole'}
                      onClick={() => setRefundMode('whole')}
                    >
                      Whole Order
                    </ModeButton>
                  </ModeToggle>
                </FormGroup>

                {refundMode === 'items' ? (
                  <>
                    {/* Item Selection */}
                    <FormGroup>
                      <Label>Select Items to Refund *</Label>
                      <ItemsList>
                        {order?.orderItems?.map((item, index) => {
                          const itemId = item._id || item.id;
                          const isSelected = selectedItems[itemId];
                          const itemData = selectedItems[itemId] || {};
                          const maxQty = item.quantity || 1;
                          const alreadyRefundedQty = item.refundApprovedQty || 0;
                          const availableQty = maxQty - alreadyRefundedQty;
                          // Check if item can be refunded (not already fully refunded and not in pending/approved state)
                          const refundStatus = item.refundStatus || 'none';
                          const canRefund = availableQty > 0 && 
                            (refundStatus === 'none' || refundStatus === 'rejected') &&
                            refundStatus !== 'requested' && 
                            refundStatus !== 'seller_review' && 
                            refundStatus !== 'admin_review' && 
                            refundStatus !== 'approved';

                          return (
                            <ItemCard key={itemId} $selected={isSelected} $disabled={!canRefund}>
                              <ItemCheckbox>
                                <input
                                  type="checkbox"
                                  checked={!!isSelected}
                                  onChange={(e) => handleItemSelection(itemId, e.target.checked)}
                                  disabled={!canRefund}
                                />
                                <ItemInfo>
                                  <ItemImage src={item.product?.imageCover} alt={item.product?.name} />
                                  <ItemDetails>
                                    <ItemName>{item.product?.name}</ItemName>
                                    <ItemMeta>
                                      <span>Price: GH₵{item.price?.toFixed(2)}</span>
                                      <span>Qty: {item.quantity}</span>
                                      {alreadyRefundedQty > 0 && (
                                        <span style={{ color: '#e74c3c' }}>
                                          Already refunded: {alreadyRefundedQty}
                                        </span>
                                      )}
                                    </ItemMeta>
                                    {!canRefund && (
                                      <HelperText style={{ color: '#e74c3c', marginTop: '0.5rem' }}>
                                        This item cannot be refunded
                                      </HelperText>
                                    )}
                                  </ItemDetails>
                                </ItemInfo>
                              </ItemCheckbox>

                              {isSelected && canRefund && (
                                <ItemRefundForm>
                                  <FormGroup>
                                    <Label>Quantity to Refund *</Label>
                                    <Input
                                      type="number"
                                      min="1"
                                      max={availableQty}
                                      value={itemData.quantity || 1}
                                      onChange={(e) => handleItemQuantityChange(itemId, e.target.value)}
                                      required
                                    />
                                    <HelperText>
                                      Available: {availableQty} of {maxQty}
                                    </HelperText>
                                  </FormGroup>

                                  <FormGroup>
                                    <Label>Refund Reason *</Label>
                                    <Select
                                      value={itemData.reason || ''}
                                      onChange={(e) => handleItemReasonChange(itemId, e.target.value)}
                                      required
                                    >
                                      <option value="">Select a reason</option>
                                      <option value="defective_product">Defective Product</option>
                                      <option value="wrong_item">Wrong Item Received</option>
                                      <option value="not_as_described">Not as Described</option>
                                      <option value="damaged_during_shipping">Damaged During Shipping</option>
                                      <option value="late_delivery">Late Delivery</option>
                                      <option value="changed_mind">Changed My Mind</option>
                                      <option value="duplicate_order">Duplicate Order</option>
                                      <option value="other">Other</option>
                                    </Select>
                                  </FormGroup>

                                  <FormGroup>
                                    <Label>Additional Details</Label>
                                    <TextArea
                                      value={itemData.reasonText || ''}
                                      onChange={(e) => handleItemReasonTextChange(itemId, e.target.value)}
                                      placeholder="Please provide more details about this item..."
                                      rows={3}
                                      maxLength={500}
                                    />
                                    <CharCount>{(itemData.reasonText || '').length}/500</CharCount>
                                  </FormGroup>

                                  <FormGroup>
                                    <Label>Upload Images (Optional)</Label>
                                    <Input
                                      type="file"
                                      accept="image/*"
                                      multiple
                                      onChange={(e) => handleItemImageUpload(itemId, e.target.files)}
                                    />
                                    <HelperText>
                                      Upload images showing the issue (max 5 images)
                                    </HelperText>
                                    {itemData.images && itemData.images.length > 0 && (
                                      <ImagePreview>
                                        {Array.from(itemData.images).slice(0, 5).map((file, idx) => (
                                          <ImagePreviewItem key={idx}>
                                            <img src={URL.createObjectURL(file)} alt={`Preview ${idx + 1}`} />
                                            <span>{file.name}</span>
                                          </ImagePreviewItem>
                                        ))}
                                      </ImagePreview>
                                    )}
                                  </FormGroup>
                                </ItemRefundForm>
                              )}
                            </ItemCard>
                          );
                        })}
                      </ItemsList>
                      {Object.keys(selectedItems).length === 0 && (
                        <HelperText>Please select at least one item to refund</HelperText>
                      )}
                    </FormGroup>

                    {/* Main reason (optional, for backward compatibility) */}
                    <FormGroup>
                      <Label>Main Refund Reason (Optional)</Label>
                      <Select
                        value={refundReason}
                        onChange={(e) => setRefundReason(e.target.value)}
                      >
                        <option value="">Select a reason (optional)</option>
                        <option value="defective_product">Defective Product</option>
                        <option value="wrong_item">Wrong Item Received</option>
                        <option value="not_as_described">Not as Described</option>
                        <option value="damaged_during_shipping">Damaged During Shipping</option>
                        <option value="late_delivery">Late Delivery</option>
                        <option value="changed_mind">Changed My Mind</option>
                        <option value="duplicate_order">Duplicate Order</option>
                        <option value="other">Other</option>
                      </Select>
                    </FormGroup>

                    <FormGroup>
                      <Label>Additional Details (Optional)</Label>
                      <TextArea
                        value={refundReasonText}
                        onChange={(e) => setRefundReasonText(e.target.value)}
                        placeholder="Please provide more details about your refund request..."
                        rows={3}
                        maxLength={500}
                      />
                      <CharCount>{refundReasonText.length}/500</CharCount>
                    </FormGroup>
                  </>
                ) : (
                  <>
                    {/* Whole Order Refund Form (Backward Compatible) */}
                    <FormGroup>
                      <Label>Refund Reason *</Label>
                      <Select
                        value={refundReason}
                        onChange={(e) => setRefundReason(e.target.value)}
                        required
                      >
                        <option value="">Select a reason</option>
                        <option value="defective_product">Defective Product</option>
                        <option value="wrong_item">Wrong Item Received</option>
                        <option value="not_as_described">Not as Described</option>
                        <option value="damaged_during_shipping">Damaged During Shipping</option>
                        <option value="late_delivery">Late Delivery</option>
                        <option value="changed_mind">Changed My Mind</option>
                        <option value="duplicate_order">Duplicate Order</option>
                        <option value="other">Other</option>
                      </Select>
                    </FormGroup>

                    <FormGroup>
                      <Label>Additional Details</Label>
                      <TextArea
                        value={refundReasonText}
                        onChange={(e) => setRefundReasonText(e.target.value)}
                        placeholder="Please provide more details about your refund request..."
                        rows={4}
                        maxLength={500}
                      />
                      <CharCount>{refundReasonText.length}/500</CharCount>
                    </FormGroup>

                    <FormGroup>
                      <Label>Refund Amount (GH₵)</Label>
                      <Input
                        type="number"
                        value={refundAmount}
                        onChange={(e) => setRefundAmount(e.target.value)}
                        min="0"
                        max={order?.totalPrice || 0}
                        step="0.01"
                        required
                      />
                      <HelperText>
                        Maximum refundable: GH₵{order?.totalPrice?.toFixed(2) || '0.00'}
                      </HelperText>
                    </FormGroup>
                  </>
                )}

                <ButtonGroup>
                  <CancelButton
                    type="button"
                    onClick={() => {
                      setRefundModalOpen(false);
                      setRefundReason('');
                      setRefundReasonText('');
                      setRefundAmount('');
                      setSelectedItems({});
                    }}
                  >
                    Cancel
                  </CancelButton>
                  <SubmitButton 
                    type="submit" 
                    disabled={
                      isRefundPending || 
                      (refundMode === 'items' && Object.keys(selectedItems).length === 0) ||
                      (refundMode === 'whole' && !refundReason)
                    }
                  >
                    {isRefundPending ? 'Submitting...' : 'Submit Request'}
                  </SubmitButton>
                </ButtonGroup>
              </RefundForm>
            </ReviewModalBody>
          </ReviewModalContent>
        </ReviewModalOverlay>
      )}
    </OrderDetailContainer>
  );
};

// Styled Components using Global Styles
const OrderDetailContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: var(--spacing-lg);
  background: var(--color-grey-50);
  min-height: 100vh;

  @media (max-width: 768px) {
    padding: var(--spacing-md);
  }
`;

const HeaderSection = styled.div`
  background: var(--color-white-0);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
  margin-bottom: var(--spacing-xl);
`;

const HeaderTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);

  @media (max-width: 768px) {
    flex-direction: column;
    gap: var(--spacing-md);
    align-items: flex-start;
  }
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  background: none;
  border: none;
  color: var(--color-brand-600);
  font-weight: var(--font-semibold);
  cursor: pointer;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-md);
  transition: var(--transition-base);
  font-size: var(--font-size-sm);

  &:hover {
    background: var(--color-brand-50);
  }

  svg {
    font-size: var(--font-size-sm);
  }
`;

const OrderNumber = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-xl);
  font-weight: var(--font-bold);
  color: var(--color-grey-900);

  svg {
    color: var(--color-primary-500);
  }
`;

const PayNowBanner = styled.div`
  margin-top: var(--spacing-md);
  padding: 1.2rem 1.6rem;
  border-radius: var(--border-radius-md);
  background-color: #fff7ed;
  border: 1px solid #fed7aa;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;

  @media (min-width: 768px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`;

const PayNowBannerText = styled.p`
  margin: 0;
  font-size: 1.4rem;
  color: #7b341e;
`;

const PayNowBannerError = styled.p`
  margin: 0;
  font-size: 1.3rem;
  color: #dc2626;
`;

const PayNowBannerButton = styled(Button)`
  align-self: flex-start;
  background-color: #2563eb;
  color: #ffffff;

  &:hover {
    background-color: #1d4ed8;
  }
`;

const HeaderMeta = styled.div`
  display: flex;
  gap: var(--spacing-xl);
  flex-wrap: wrap;

  @media (max-width: 768px) {
    gap: var(--spacing-md);
  }
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-sm);
  color: var(--color-grey-600);

  strong {
    color: var(--color-grey-700);
  }
`;

const PaymentStatusBadge = styled.span`
  display: inline-block;
  margin-left: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-semibold);
  background: var(--color-green-100);
  color: var(--color-green-700);
`;

const TrackingLink = styled.span`
  color: var(--color-primary-600);
  cursor: pointer;
  text-decoration: underline;
  font-weight: 500;
  margin-left: var(--spacing-xs);
  transition: color 0.2s;

  &:hover {
    color: var(--color-primary-700);
  }
`;

const StatusBadge = styled.span`
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-cir);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  text-transform: capitalize;
  
  background: ${props => {
    switch(props.$status) {
      case 'paid': return 'var(--color-green-100)';
      case 'delivered': return 'var(--color-green-100)';
      case 'shipped': return 'var(--color-blue-100)';
      case 'cancelled': return 'var(--color-red-100)';
      default: return 'var(--color-yellow-100)';
    }
  }};
  
  color: ${props => {
    switch(props.$status) {
      case 'paid': return 'var(--color-green-700)';
      case 'delivered': return 'var(--color-green-700)';
      case 'shipped': return 'var(--color-blue-700)';
      case 'cancelled': return 'var(--color-red-700)';
      default: return 'var(--color-yellow-700)';
    }
  }};
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-xl);

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
  }
`;

const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
`;

const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
`;

const Card = styled.div`
  background: var(--color-white-0);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
`;

const CardHeader = styled.div`
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--color-grey-200);
  background: linear-gradient(135deg, var(--color-grey-50) 0%, var(--color-white-0) 100%);
`;

const CardTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-lg);
  font-weight: var(--font-semibold);
  color: var(--color-grey-900);
  
  svg {
    color: var(--color-primary-500);
    font-size: var(--font-size-md);
  }
`;

const CardBody = styled.div`
  padding: var(--spacing-lg);
`;

const StatusTimeline = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
`;

const TimelineStep = styled.div`
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  opacity: ${props => props.$active ? 1 : 0.4};
  transition: var(--transition-base);
  
  ${props => props.$current && `
    transform: scale(1.05);
    opacity: 1;
  `}
`;

const StepIndicator = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: var(--transition-base);
  position: relative;
  
  /* Completed stages - green */
  background: ${props => {
    if (props.$current) {
      return 'var(--color-primary-500)'; // Current stage - primary color
    }
    if (props.$completed) {
      return 'var(--color-green-500)'; // Completed stages - green
    }
    return 'var(--color-grey-200)'; // Future stages - grey
  }};
  
  color: ${props => {
    if (props.$current || props.$completed) {
      return 'var(--color-white-0)';
    }
    return 'var(--color-grey-500)';
  }};
  
  /* Add pulse animation for current stage */
  ${props => props.$current && `
    box-shadow: 0 0 0 4px rgba(67, 97, 238, 0.2);
    animation: pulse 2s infinite;
    
    @keyframes pulse {
      0%, 100% {
        box-shadow: 0 0 0 4px rgba(67, 97, 238, 0.2);
      }
      50% {
        box-shadow: 0 0 0 8px rgba(67, 97, 238, 0.1);
      }
    }
  `}
  
  /* Add checkmark for completed stages */
  ${props => props.$completed && !props.$current && `
    &::after {
      content: '✓';
      position: absolute;
      top: -2px;
      right: -2px;
      width: 16px;
      height: 16px;
      background: var(--color-green-500);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      color: white;
      font-weight: bold;
    }
  `}
`;

const StepContent = styled.div`
  flex: 1;
`;

const StepLabel = styled.div`
  font-weight: var(--font-semibold);
  color: ${props => {
    if (props.$current) {
      return 'var(--color-primary-600)'; // Current stage - primary color
    }
    if (props.$completed) {
      return 'var(--color-green-700)'; // Completed stages - green
    }
    return 'var(--color-grey-600)'; // Future stages - grey
  }};
  margin-bottom: var(--spacing-xs);
  transition: var(--transition-base);
  
  ${props => props.$current && `
    font-size: 1.05em;
    font-weight: var(--font-bold);
  `}
`;

const StepDate = styled.div`
  font-size: var(--font-size-sm);
  color: var(--color-grey-500);
`;

const InfoGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
`;

const InfoItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: var(--spacing-sm);
  border-bottom: 1px solid var(--color-grey-100);
  
  &:last-child {
    border-bottom: none;
  }
`;

const InfoLabel = styled.span`
  font-weight: var(--font-medium);
  color: var(--color-grey-600);
  font-size: var(--font-size-sm);
`;

const InfoValue = styled.span`
  color: var(--color-grey-800);
  font-size: var(--font-size-sm);
`;

const AddressText = styled.p`
  color: var(--color-grey-700);
  line-height: 1.6;
  font-size: var(--font-size-sm);
`;

const PaymentStatus = styled.span`
  color: ${props => props.$paid ? 'var(--color-green-700)' : 'var(--color-red-700)'};
  font-weight: var(--font-semibold);
  font-size: var(--font-size-sm);
`;

const ShippingBreakdownSection = styled.div`
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--color-grey-200);
`;

const BreakdownTitle = styled.h4`
  font-size: var(--font-size-md);
  font-weight: var(--font-semibold);
  color: var(--color-grey-900);
  margin-bottom: var(--spacing-md);
`;

const BreakdownItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) 0;
  border-bottom: 1px solid var(--color-grey-100);
  
  &:last-child {
    border-bottom: none;
  }
`;

const BreakdownLabel = styled.span`
  font-size: var(--font-size-sm);
  color: var(--color-grey-600);
`;

const BreakdownValue = styled.span`
  font-size: var(--font-size-sm);
  font-weight: var(--font-semibold);
  color: var(--color-grey-900);
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
`;

const BreakdownReason = styled.span`
  font-size: var(--font-size-xs);
  font-weight: var(--font-normal);
  color: var(--color-grey-500);
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
  
  h2 {
    font-size: var(--font-size-xl);
    color: var(--color-grey-900);
    margin: 0;
  }
  
  span {
    color: var(--color-grey-500);
    font-size: var(--font-size-sm);
  }
`;

const SellerOrdersGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
`;

const SellerCard = styled(Card)`
  border: 1px solid var(--color-grey-200);
  transition: var(--transition-base);
  
  &:hover {
    border-color: var(--color-primary-300);
    box-shadow: var(--shadow-md);
  }
`;

const SellerHeader = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--color-grey-100);
  background: var(--color-grey-50);
`;

const SellerAvatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--color-primary-100);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary-600);
  font-size: var(--font-size-lg);
`;

const SellerInfo = styled.div`
  flex: 1;
`;

const SellerName = styled.div`
  font-weight: var(--font-semibold);
  color: var(--color-grey-900);
  margin-bottom: var(--spacing-xs);
`;

const SellerEmail = styled.div`
  color: var(--color-grey-500);
  font-size: var(--font-size-sm);
`;

const OrderItemsList = styled.div`
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
`;

const OrderItemCard = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--color-grey-50);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-grey-200);
  
  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
  }
`;

const ItemImage = styled.img`
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: var(--border-radius-md);
  border: 2px solid var(--color-primary-200);
  flex-shrink: 0;
`;

const ItemDetails = styled.div`
  flex: 1;
  min-width: 0;
`;

const ItemName = styled.div`
  font-weight: var(--font-medium);
  color: var(--color-grey-800);
  margin-bottom: var(--spacing-xs);
  font-size: var(--font-size-sm);
`;

const ItemMeta = styled.div`
  display: flex;
  gap: var(--spacing-md);
  font-size: var(--font-size-sm);
`;

const ItemPrice = styled.span`
  color: var(--color-grey-600);
`;

const ItemQuantity = styled.span`
  color: var(--color-grey-500);
`;

const ReviewButton = styled.button`
  margin-top: 0.75rem;
  padding: 0.5rem 1rem;
  background: var(--color-primary-600, #3182ce);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  justify-content: center;

  &:hover {
    background: var(--color-primary-700, #2c5aa0);
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0);
  }

  svg {
    font-size: 0.875rem;
  }
`;

const ItemTotal = styled.div`
  font-weight: var(--font-semibold);
  color: var(--color-primary-600);
  font-size: var(--font-size-sm);
  flex-shrink: 0;
`;

const OrderSummary = styled.div`
  padding: var(--spacing-lg);
  border-top: 1px solid var(--color-grey-200);
  background: var(--color-grey-50);
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-xs) 0;
  font-size: var(--font-size-sm);
  font-weight: ${props => props.$total ? 'var(--font-semibold)' : 'var(--font-normal)'};
  color: ${props => props.$total ? 'var(--color-grey-900)' : 'var(--color-grey-600)'};
  
  ${props => props.$total && `
    font-size: var(--font-size-md);
    border-top: 1px solid var(--color-grey-300);
    margin-top: var(--spacing-xs);
    padding-top: var(--spacing-sm);
  `}
`;

const SummaryDivider = styled.div`
  height: 1px;
  background: var(--color-grey-300);
  margin: var(--spacing-sm) 0;
`;

const GrandTotalCard = styled(Card)`
  background: linear-gradient(135deg, var(--color-primary-50) 0%, var(--color-primary-100) 100%);
  border: 1px solid var(--color-primary-200);
`;

const TotalContent = styled.div`
  padding: var(--spacing-xl);
`;

const TotalLabel = styled.div`
  font-size: var(--font-size-lg);
  font-weight: var(--font-semibold);
  color: var(--color-primary-700);
  margin-bottom: var(--spacing-md);
  text-align: center;
`;

const TotalBreakdown = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
`;

const BreakdownRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--font-size-sm);
  color: var(--color-grey-700);
  
  span:last-child {
    font-weight: var(--font-semibold);
  }
`;

const TotalAmount = styled.div`
  font-size: var(--font-size-2xl);
  font-weight: var(--font-bold);
  color: var(--color-primary-800);
  text-align: center;
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 2px solid var(--color-primary-200);
`;

const ActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg) 0;
  border-top: 1px solid var(--color-grey-200);
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: var(--spacing-md);
    align-items: stretch;
  }
`;

const ActionGroup = styled.div`
  display: flex;
  gap: var(--spacing-sm);
  
  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const BaseButton = styled.button`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
  border-radius: var(--border-radius-md);
  font-weight: var(--font-semibold);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: var(--transition-base);
  
  svg {
    font-size: var(--font-size-sm);
  }
`;

const PrimaryButton = styled(BaseButton)`
  background: var(--color-primary-500);
  color: var(--color-white-0);
  
  &:hover {
    background: var(--color-primary-600);
    transform: translateY(-1px);
  }
`;

const SecondaryButton = styled(BaseButton)`
  background: var(--color-white-0);
  color: var(--color-grey-700);
  border: 1px solid var(--color-grey-300);
  
  &:hover {
    background: var(--color-grey-50);
    border-color: var(--color-grey-400);
  }
`;

const DangerButton = styled(BaseButton)`
  background: var(--color-red-100);
  color: var(--color-red-700);
  border: 1px solid var(--color-red-200);
  
  &:hover {
    background: var(--color-red-200);
    border-color: var(--color-red-300);
  }
`;

const ActionButton = styled(SecondaryButton)`
  background: var(--color-white-0);
`;

// Review Modal Styled Components
const ReviewModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
`;

const ReviewModalContent = styled.div`
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
`;

const ReviewModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e2e8f0;
`;

const ReviewModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
`;

const ReviewModalClose = styled.button`
  background: none;
  border: none;
  font-size: 2rem;
  color: #64748b;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s;

  &:hover {
    background: #f1f5f9;
    color: #1e293b;
  }
`;

const ReviewModalBody = styled.div`
  padding: 2rem;
`;

const RefundStatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-semibold);
  background: ${(props) => {
    switch (props.$status) {
      case 'pending':
        return 'var(--color-yellow-100, #fef3c7)';
      case 'approved':
      case 'processing':
        return 'var(--color-blue-100, #dbeafe)';
      case 'completed':
        return 'var(--color-green-100, #d1fae5)';
      case 'rejected':
        return 'var(--color-red-100, #fee2e2)';
      default:
        return 'var(--color-grey-100, #f3f4f6)';
    }
  }};
  color: ${(props) => {
    switch (props.$status) {
      case 'pending':
        return 'var(--color-yellow-800, #92400e)';
      case 'approved':
      case 'processing':
        return 'var(--color-blue-800, #1e40af)';
      case 'completed':
        return 'var(--color-green-800, #065f46)';
      case 'rejected':
        return 'var(--color-red-800, #991b1b)';
      default:
        return 'var(--color-grey-800, #1f2937)';
    }
  }};
`;

const RefundForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: var(--font-size-base);
  font-weight: var(--font-semibold);
  color: var(--color-grey-800);
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid var(--color-grey-300);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-base);
  background: white;
  color: var(--color-grey-900);

  &:focus {
    outline: none;
    border-color: var(--color-primary-500);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid var(--color-grey-300);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-base);
  font-family: inherit;
  resize: vertical;
  min-height: 100px;

  &:focus {
    outline: none;
    border-color: var(--color-primary-500);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid var(--color-grey-300);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-base);

  &:focus {
    outline: none;
    border-color: var(--color-primary-500);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
`;

const HelperText = styled.p`
  font-size: var(--font-size-sm);
  color: var(--color-grey-600);
  margin: 0;
`;

const CharCount = styled.span`
  font-size: var(--font-size-xs);
  color: var(--color-grey-500);
  text-align: right;
  margin-top: -0.25rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const CancelButton = styled.button`
  flex: 1;
  padding: 0.75rem 1.5rem;
  border: 1px solid var(--color-grey-300);
  border-radius: var(--border-radius-md);
  background: white;
  color: var(--color-grey-700);
  font-size: var(--font-size-base);
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: var(--color-grey-50);
    border-color: var(--color-grey-400);
  }
`;

const SubmitButton = styled.button`
  flex: 1;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: var(--border-radius-md);
  background: var(--color-primary-600);
  color: white;
  font-size: var(--font-size-base);
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: var(--color-primary-700);
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

// Item-level refund styled components
const ModeToggle = styled.div`
  display: flex;
  gap: 0.5rem;
  background: var(--color-grey-100);
  padding: 0.25rem;
  border-radius: var(--border-radius-md);
`;

const ModeButton = styled.button`
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: var(--border-radius-sm);
  background: ${props => props.$active ? 'var(--color-primary-600)' : 'transparent'};
  color: ${props => props.$active ? 'white' : 'var(--color-grey-700)'};
  font-size: var(--font-size-sm);
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.$active ? 'var(--color-primary-700)' : 'var(--color-grey-200)'};
  }
`;

const ItemsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  max-height: 500px;
  overflow-y: auto;
  padding: var(--spacing-sm);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-md);
  background: var(--color-grey-50);
`;

const ItemCard = styled.div`
  background: white;
  border: 2px solid ${props => props.$selected ? 'var(--color-primary-500)' : 'var(--color-grey-200)'};
  border-radius: var(--border-radius-md);
  padding: var(--spacing-md);
  transition: all 0.2s;
  opacity: ${props => props.$disabled ? 0.6 : 1};
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};

  &:hover {
    border-color: ${props => props.$disabled ? 'var(--color-grey-200)' : 'var(--color-primary-400)'};
    box-shadow: ${props => props.$disabled ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.1)'};
  }
`;

const ItemCheckbox = styled.div`
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);

  input[type="checkbox"] {
    width: 20px;
    height: 20px;
    margin-top: 0.25rem;
    cursor: pointer;
  }
`;

const ItemInfo = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex: 1;
`;

const ItemRefundForm = styled.div`
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-grey-200);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
`;

const ImagePreview = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);
`;

const ImagePreviewItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  width: 80px;

  img {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: var(--border-radius-sm);
    border: 1px solid var(--color-grey-200);
  }

  span {
    font-size: var(--font-size-xs);
    color: var(--color-grey-600);
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    max-width: 100%;
  }
`;

export default OrderDetail;