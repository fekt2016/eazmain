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
} from "react-icons/fa";
import { useGetUserOrderById } from '../../shared/hooks/useOrder';
import { LoadingState, ErrorState, EmptyState } from '../../components/loading';
import usePageTitle from '../../shared/hooks/usePageTitle';
import seoConfig from '../../shared/config/seoConfig';
import { PATHS } from '../../routes/routePaths';
import EditOrderModal from './EditOrderModal';
import { orderService } from './orderApi';
import CreateReviewForm from '../products/CreateReviewForm';
import OrderTrackingTimeline from './OrderTrackingTimeline';

const OrderDetail = () => {
  const { id: orderId } = useParams();
  const navigate = useNavigate();
  const { data: orderData, isLoading, isError, refetch } = useGetUserOrderById(orderId);
  const order = useMemo(() => orderData?.order, [orderData]);
console.log("order", order);

  usePageTitle(order ? seoConfig.orderDetail(order) : seoConfig.orderDetail(null));

  const [status, setStatus] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedProductForReview, setSelectedProductForReview] = useState(null);

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

  useEffect(() => {
    if (order) {
      // Use paymentStatus if available, otherwise fall back to status or orderStatus
      const displayStatus = order.paymentStatus === 'completed' 
        ? 'paid' 
        : order.status || order.orderStatus || 'pending';
      setStatus(displayStatus);
    }
  }, [order]);

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
  };

  const handleSaveStatus = () => {
    console.log("Saving status:", status);
  };

  const handleDeleteOrder = () => {
    console.log("Deleting order:", orderId);
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
      console.error('Error sending email:', error);
      alert(error?.response?.data?.message || 'Failed to send email. Please try again.');
    }
  };


  if (isLoading) return <LoadingState message="Loading order details..." />;
  if (isError) return <ErrorState title="Error loading order" message="Please try again later." />;
  if (!order) return <EmptyState title="Order not found" message="The order you're looking for doesn't exist." />;

  // Calculate grand total (tax is already included in subtotal for VAT-inclusive pricing)
  const subtotal = order.sellerOrder.reduce((total, sellerOrder) => total + (sellerOrder.subtotal || 0), 0);
  const totalShipping = order.shippingCost || order.sellerOrder.reduce((total, sellerOrder) => total + (sellerOrder.shippingCost || 0), 0);
  // Get COVID levy from order (if available) or calculate from seller orders
  const totalCovidLevy = order.totalCovidLevy || order.sellerOrder.reduce((total, sellerOrder) => total + (sellerOrder.totalCovidLevy || 0), 0);
  const grandTotal = order.totalPrice || (subtotal + totalShipping + totalCovidLevy);

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
            {order.paymentStatus === 'completed' && (
              <PaymentStatusBadge>
                Payment Completed
              </PaymentStatusBadge>
            )}
          </MetaItem>
        </HeaderMeta>
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

              <StatusControl>
                <StatusSelect value={status} onChange={handleStatusChange}>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </StatusSelect>
                <PrimaryButton onClick={handleSaveStatus}>
                  Update Status
                </PrimaryButton>
              </StatusControl>
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
                      ? 'Pickup from EazShop Center'
                      : order.deliveryMethod === 'dispatch'
                      ? 'EazShop Dispatch Rider'
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
                  {order.shippingBreakdown.map((breakdown, index) => (
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
                    <PaymentStatus $paid={order.paymentStatus === 'completed' || order.isPaid}>
                      {order.paymentStatus === 'completed' ? "Paid" : order.paymentStatus === 'pending' ? "Pending" : order.isPaid ? "Paid" : "Pending"}
                    </PaymentStatus>
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
            <span>{order.sellerOrder.length} seller(s)</span>
          </SectionHeader>

          {/* Seller Orders - Mobile Card Layout */}
          <SellerOrdersGrid>
            {order.sellerOrder.map((sellerOrder) => (
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
                  {order.orderItems.map((item, index) => {
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

const StatusControl = styled.div`
  display: flex;
  gap: var(--spacing-sm);
  
  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const StatusSelect = styled.select`
  flex: 1;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-grey-300);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-sm);
  background: var(--color-white-0);
  
  &:focus {
    outline: none;
    border-color: var(--color-primary-500);
    box-shadow: 0 0 0 3px var(--color-primary-100);
  }
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

export default OrderDetail;