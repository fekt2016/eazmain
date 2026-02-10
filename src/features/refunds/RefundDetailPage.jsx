import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import {
  FaArrowLeft,
  FaBox,
  FaUser,
  FaDollarSign,
  FaTruck,
  FaCheckCircle,
  FaTimes,
  FaExclamationCircle,
  FaClock,
} from 'react-icons/fa';
import { useGetRefundStatus, useSelectReturnShippingMethod, useGetUserOrderById } from '../../shared/hooks/useOrder';
import { LoadingState, ErrorState } from '../../components/loading';
import { PATHS } from '../../routes/routePaths';
import { formatDate } from '../../shared/utils/helpers';
import logger from '../../shared/utils/logger';
import Button from '../../shared/components/Button';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.5rem;
  background: #f3f4f6;
  border: none;
  border-radius: 0.6rem;
  font-size: 1.4rem;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
  &:hover {
    background: #e5e7eb;
  }
`;

const Title = styled.h1`
  font-size: 2.4rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;
  margin-top: 2rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 0.8rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 2rem;
`;

const CardTitle = styled.h3`
  font-size: 1.8rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.8rem;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const InfoLabel = styled.span`
  font-size: 1.2rem;
  color: #6b7280;
  font-weight: 500;
`;

const InfoValue = styled.span`
  font-size: 1.4rem;
  color: #1f2937;
  font-weight: 600;
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 999px;
  font-size: 1.2rem;
  font-weight: 600;
  background: ${({ $status }) => {
    switch ($status) {
      case 'pending':
      case 'seller_review':
        return '#fef3c7';
      case 'admin_review':
        return '#dbeafe';
      case 'approved':
      case 'completed':
        return '#d1fae5';
      case 'rejected':
        return '#fee2e2';
      default:
        return '#f3f4f6';
    }
  }};
  color: ${({ $status }) => {
    switch ($status) {
      case 'pending':
      case 'seller_review':
        return '#92400e';
      case 'admin_review':
        return '#1e40af';
      case 'approved':
      case 'completed':
        return '#065f46';
      case 'rejected':
        return '#991b1b';
      default:
        return '#374151';
    }
  }};
`;

const WorkflowStep = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: 0.8rem;
  background: ${({ $active, $completed }) => {
    if ($completed) return '#d1fae5';
    if ($active) return '#dbeafe';
    return '#f3f4f6';
  }};
  margin-bottom: 1rem;
`;

const StepIcon = styled.div`
  width: 3.2rem;
  height: 3.2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $active, $completed }) => {
    if ($completed) return '#10b981';
    if ($active) return '#3b82f6';
    return '#9ca3af';
  }};
  color: white;
  font-size: 1.6rem;
  flex-shrink: 0;
`;

const StepContent = styled.div`
  flex: 1;
`;

const StepTitle = styled.div`
  font-size: 1.4rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
`;

const StepDescription = styled.div`
  font-size: 1.2rem;
  color: #6b7280;
`;

const ShippingMethodCard = styled.div`
  border: 2px solid ${({ $selected }) => ($selected ? '#3b82f6' : '#e5e7eb')};
  border-radius: 0.8rem;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s;
  background: ${({ $selected }) => ($selected ? '#eff6ff' : 'white')};
  margin-bottom: 1rem;

  &:hover {
    border-color: #3b82f6;
    background: #eff6ff;
  }
`;

const ShippingMethodTitle = styled.div`
  font-size: 1.6rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
`;

const ShippingMethodDescription = styled.div`
  font-size: 1.2rem;
  color: #6b7280;
`;

const AlertBox = styled.div`
  padding: 1.5rem;
  border-radius: 0.8rem;
  background: ${({ $type }) => {
    switch ($type) {
      case 'info':
        return '#eff6ff';
      case 'warning':
        return '#fef3c7';
      case 'success':
        return '#d1fae5';
      default:
        return '#f3f4f6';
    }
  }};
  border-left: 4px solid
    ${({ $type }) => {
      switch ($type) {
        case 'info':
          return '#3b82f6';
        case 'warning':
          return '#f59e0b';
        case 'success':
          return '#10b981';
        default:
          return '#6b7280';
      }
    }};
  margin-bottom: 1.5rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
`;

const AlertText = styled.div`
  flex: 1;
  font-size: 1.3rem;
  color: #374151;
`;

const ItemRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1.2rem;
  padding: 1rem 0;
  border-bottom: 1px solid #e5e7eb;

  &:last-child {
    border-bottom: none;
  }
`;

const ItemImageWrapper = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 0.6rem;
  overflow: hidden;
  flex-shrink: 0;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ItemImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const ItemImagePlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ItemDetails = styled.div`
  flex: 1;
  min-width: 0;
`;

const ItemName = styled.div`
  font-size: 1.4rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.4rem;
`;

const ItemMeta = styled.div`
  font-size: 1.2rem;
  color: #6b7280;
`;

const ItemReason = styled.div`
  font-size: 1.2rem;
  color: #6b7280;
  margin-top: 0.5rem;
`;

const ItemAmount = styled.div`
  font-size: 1.3rem;
  font-weight: 600;
  color: #059669;
  margin-top: 0.5rem;
`;

const RefundDetailPage = () => {
  // New route shape: /orders/:orderId/refund (no refundId in URL)
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [selectedShippingMethod, setSelectedShippingMethod] = useState(null);

  // Use refund-status endpoint to get latest refund + all metadata
  const { data: refundStatusData, isLoading: refundLoading, error: refundError } = useGetRefundStatus(orderId);
  const { data: orderData, isLoading: orderLoading } = useGetUserOrderById(orderId);
  const selectShippingMutation = useSelectReturnShippingMethod();

  const refundMeta = refundStatusData?.refund;
  const latestRefundRequest = useMemo(() => {
    if (!refundMeta?.refundRequests || !Array.isArray(refundMeta.refundRequests)) return null;
    // refundRequests are already sorted latest-first in backend getRefundStatus
    return refundMeta.refundRequests[0] || null;
  }, [refundMeta]);

  const refundId = latestRefundRequest?._id;

  // For display, combine top-level refundMeta with latestRefundRequest details
  const refund = latestRefundRequest || refundMeta || null;
  const order = orderData?.order;

  if (refundLoading || orderLoading) {
    return (
      <PageContainer>
        <LoadingState message="Loading refund details..." />
      </PageContainer>
    );
  }

  if (refundError || !refundMeta || !latestRefundRequest) {
    return (
      <PageContainer>
        <ErrorState
          title="Refund Not Found"
          message={refundError?.message || 'No refund request found for this order'}
          onRetry={() => navigate(-1)}
        />
      </PageContainer>
    );
  }

  const handleSelectShippingMethod = async (method) => {
    if (!method) return;
    if (!refundId) return;

    try {
      await selectShippingMutation.mutateAsync({
        orderId,
        refundId,
        returnShippingMethod: method,
      });
      setSelectedShippingMethod(method);
    } catch (error) {
      logger.error('Error selecting shipping method:', error);
    }
  };

  const sellerApproved = refund.sellerReviewed && refund.sellerDecision === 'approve_return';
  const sellerRejected = refund.sellerReviewed && refund.sellerDecision === 'reject_return';
  const shippingSelected = refund.returnShippingMethod !== null;
  const canSelectShipping = sellerApproved && !shippingSelected;

  return (
    <PageContainer>
      <Header>
        <BackButton onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back
        </BackButton>
        <Title>Refund Request Details</Title>
      </Header>

      <ContentGrid>
        <div>
          {/* Workflow Status */}
          <Card style={{ marginBottom: '2rem' }}>
            <CardTitle>Return Process Status</CardTitle>

            <WorkflowStep $completed={true} $active={false}>
              <StepIcon $completed={true}>
                <FaCheckCircle />
              </StepIcon>
              <StepContent>
                <StepTitle>Refund Requested</StepTitle>
                <StepDescription>
                  Your refund request was submitted on {formatDate(refund.createdAt)}
                </StepDescription>
              </StepContent>
            </WorkflowStep>

            <WorkflowStep
              $completed={sellerApproved || sellerRejected}
              $active={!sellerApproved && !sellerRejected && refund.sellerReviewed === false}
            >
              <StepIcon
                $completed={sellerApproved || sellerRejected}
                $active={!sellerApproved && !sellerRejected && refund.sellerReviewed === false}
              >
                {sellerRejected ? <FaTimes /> : sellerApproved ? <FaCheckCircle /> : <FaClock />}
              </StepIcon>
              <StepContent>
                <StepTitle>Seller Review</StepTitle>
                <StepDescription>
                  {sellerRejected
                    ? `Seller rejected the return. Reason: ${refund.sellerNote || 'Not provided'}`
                    : sellerApproved
                      ? (refund.resolutionType === 'replacement'
                          ? `Seller offered a replacement (new item) on ${formatDate(refund.sellerReviewDate)}${refund.resolutionNote ? `. Note: ${refund.resolutionNote}` : ''}`
                          : `Seller approved the return for refund on ${formatDate(refund.sellerReviewDate)}`)
                      : 'Waiting for seller to review your return request'}
                </StepDescription>
              </StepContent>
            </WorkflowStep>

            {sellerApproved && (
              <WorkflowStep $completed={shippingSelected} $active={canSelectShipping}>
                <StepIcon $completed={shippingSelected} $active={canSelectShipping}>
                  {shippingSelected ? <FaCheckCircle /> : <FaTruck />}
                </StepIcon>
                <StepContent>
                  <StepTitle>Select Return Shipping Method</StepTitle>
                  <StepDescription>
                    {shippingSelected
                      ? `You selected ${refund.returnShippingMethod === 'drop_off' ? 'drop-off' : 'pickup'} on ${formatDate(refund.returnShippingSelectedAt)}`
                      : 'Please select how you want to return the item'}
                  </StepDescription>
                </StepContent>
              </WorkflowStep>
            )}

            <WorkflowStep
              $completed={refund.status === 'approved' || refund.status === 'completed'}
              $active={shippingSelected && refund.status === 'admin_review'}
            >
              <StepIcon
                $completed={refund.status === 'approved' || refund.status === 'completed'}
                $active={shippingSelected && refund.status === 'admin_review'}
              >
                {refund.status === 'approved' || refund.status === 'completed' ? (
                  <FaCheckCircle />
                ) : (
                  <FaClock />
                )}
              </StepIcon>
              <StepContent>
                <StepTitle>Admin Review</StepTitle>
                <StepDescription>
                  {refund.status === 'approved' || refund.status === 'completed'
                    ? `Refund approved on ${formatDate(refund.adminReviewDate || refund.processedAt)}`
                    : shippingSelected
                      ? 'Waiting for admin to approve the refund'
                      : 'Waiting for you to select return shipping method'}
                </StepDescription>
              </StepContent>
            </WorkflowStep>
          </Card>

          {/* Shipping Method Selection */}
          {canSelectShipping && (
            <Card style={{ marginBottom: '2rem' }}>
              <CardTitle>
                <FaTruck /> Select Return Shipping Method
              </CardTitle>

              <AlertBox $type="info">
                <FaExclamationCircle style={{ fontSize: '2rem', color: '#3b82f6' }} />
                <AlertText>
                  The seller has approved your return request. Please select how you would like to
                  return the item(s).
                </AlertText>
              </AlertBox>

              <ShippingMethodCard
                $selected={selectedShippingMethod === 'drop_off'}
                onClick={() => setSelectedShippingMethod('drop_off')}
              >
                <ShippingMethodTitle>Drop Off</ShippingMethodTitle>
                <ShippingMethodDescription>
                  You will drop off the item at a designated location. Instructions will be provided
                  after selection.
                </ShippingMethodDescription>
              </ShippingMethodCard>

              <ShippingMethodCard
                $selected={selectedShippingMethod === 'pickup'}
                onClick={() => setSelectedShippingMethod('pickup')}
              >
                <ShippingMethodTitle>Pickup</ShippingMethodTitle>
                <ShippingMethodDescription>
                  A courier will pick up the item from your address. Please ensure someone is
                  available at the pickup location.
                </ShippingMethodDescription>
              </ShippingMethodCard>

              <Button
                onClick={() => handleSelectShippingMethod(selectedShippingMethod)}
                disabled={!selectedShippingMethod || selectShippingMutation.isPending}
                style={{ width: '100%', marginTop: '1rem' }}
              >
                {selectShippingMutation.isPending ? 'Submitting...' : 'Confirm Selection'}
              </Button>
            </Card>
          )}

          {/* Refund Information */}
          <Card>
            <CardTitle>
              <FaDollarSign /> Refund Information
            </CardTitle>
            <InfoGrid>
              <InfoItem>
                <InfoLabel>Refund Amount</InfoLabel>
                <InfoValue>GH₵{refund.totalRefundAmount?.toFixed(2) || '0.00'}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Status</InfoLabel>
                <StatusBadge $status={refund.status}>{refund.status || 'pending'}</StatusBadge>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Request Date</InfoLabel>
                <InfoValue>{formatDate(refund.createdAt)}</InfoValue>
              </InfoItem>
              {sellerApproved && refund.resolutionType && (
                <InfoItem>
                  <InfoLabel>Seller resolution</InfoLabel>
                  <InfoValue>
                    {refund.resolutionType === 'replacement'
                      ? 'Replacement (new item)' + (refund.resolutionNote ? ` — ${refund.resolutionNote}` : '')
                      : 'Refund'}
                  </InfoValue>
                </InfoItem>
              )}
              {refund.returnShippingMethod && (
                <InfoItem>
                  <InfoLabel>Return Shipping Method</InfoLabel>
                  <InfoValue>
                    {refund.returnShippingMethod === 'drop_off' ? 'Drop Off' : 'Pickup'}
                  </InfoValue>
                </InfoItem>
              )}
            </InfoGrid>
          </Card>
        </div>

        <div>
          {/* Order / Return section: only items being returned and their amount */}
          {order && (
            <Card style={{ marginBottom: '2rem' }}>
              <CardTitle>
                <FaBox /> Order &amp; Items to Return
              </CardTitle>
              <InfoGrid>
                <InfoItem>
                  <InfoLabel>Order Number</InfoLabel>
                  <InfoValue>
                    <Link
                      to={PATHS.ORDER_DETAIL.replace(':id', orderId)}
                      style={{ color: '#3b82f6', textDecoration: 'underline' }}
                    >
                      {order.orderNumber || orderId?.slice(-8)}
                    </Link>
                  </InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Order Date</InfoLabel>
                  <InfoValue>{formatDate(order.createdAt)}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Amount to Return</InfoLabel>
                  <InfoValue>GH₵{(refund.totalRefundAmount ?? 0).toFixed(2)}</InfoValue>
                </InfoItem>
              </InfoGrid>
            </Card>
          )}

          {/* Return Items - only the items being returned with image and amount */}
          {refund.items && refund.items.length > 0 && (
            <Card>
              <CardTitle>Items to Return</CardTitle>
              {refund.items.map((item, index) => {
                const productImage =
                  item.productId?.imageCover ||
                  (item.productId?.images && item.productId.images[0]) ||
                  null;
                const itemTotal = (item.price ?? 0) * (item.quantity ?? 1);
                return (
                  <ItemRow key={index}>
                    <ItemImageWrapper>
                      {productImage ? (
                        <ItemImage src={productImage} alt={item.productId?.name || 'Product'} />
                      ) : (
                        <ItemImagePlaceholder>
                          <FaBox style={{ fontSize: '2rem', color: '#9ca3af' }} />
                        </ItemImagePlaceholder>
                      )}
                    </ItemImageWrapper>
                    <ItemDetails>
                      <ItemName>{item.productId?.name || 'Product'}</ItemName>
                      <ItemMeta>
                        Quantity: {item.quantity} × GH₵{item.price?.toFixed(2)}
                      </ItemMeta>
                      <ItemReason>Reason: {item.reason?.replace(/_/g, ' ')}</ItemReason>
                      <ItemAmount>GH₵{itemTotal.toFixed(2)}</ItemAmount>
                    </ItemDetails>
                  </ItemRow>
                );
              })}
            </Card>
          )}
        </div>
      </ContentGrid>
    </PageContainer>
  );
};

export default RefundDetailPage;
