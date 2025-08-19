import { useNavigate, useLocation } from "react-router-dom";
import styled from "styled-components";
import {
  FaCheckCircle,
  FaShoppingBag,
  FaTruck,
  FaMobileAlt,
  FaBuilding,
  FaClock,
} from "react-icons/fa";
import { useGetUserAddress } from "../hooks/useAddress";
import { useMemo } from "react";
const OrderConfirmationPage = () => {
  const order = useLocation().state;

  const { data: addressData } = useGetUserAddress(order.shippingAddress);
  const shippingAddress = useMemo(() => {
    return addressData?.data?.address;
  }, [addressData]);

  const navigate = useNavigate();

  if (!order) {
    return (
      <LoadingContainer>
        <Spinner />
        <p>Loading your order details...</p>
      </LoadingContainer>
    );
  }

  return (
    <ConfirmationContainer>
      <ConfirmationHeader>
        <CheckmarkIcon>
          <FaCheckCircle />
        </CheckmarkIcon>
        <h1>Order Confirmed!</h1>
        <p>Thank you for your purchase. Your order is being processed.</p>
        <OrderNumber>Order #: {order.orderNumber}</OrderNumber>
      </ConfirmationHeader>

      <ConfirmationGrid>
        <OrderSummarySection>
          <SectionHeader>
            <FaShoppingBag />
            <h2>Order Summary</h2>
          </SectionHeader>

          <OrderItems>
            {order.orderItems.map((item) => {
              return (
                <OrderItem key={item.id}>
                  <ItemImage src={item.image} alt={item.name} />
                  <ItemDetails>
                    <ItemName>{item.name}</ItemName>
                    <ItemPrice>
                      GH₵{item.price.toFixed(2)} × {item.quantity}
                    </ItemPrice>
                  </ItemDetails>
                  <ItemTotal>
                    GH₵{(item.price * item.quantity).toFixed(2)}
                  </ItemTotal>
                </OrderItem>
              );
            })}
          </OrderItems>

          <SummaryDetails>
            <SummaryRow>
              <span>Subtotal</span>
              <span>GH₵{order.subTotal.toFixed(2)}</span>
            </SummaryRow>
            <SummaryRow>
              <span>discount</span>
              <span>-GH₵{order.discount}</span>
            </SummaryRow>
            <SummaryRow>
              <span>Shipping</span>
              <span>GH₵{order.shippingCost.toFixed(2)}</span>
            </SummaryRow>
            <SummaryRow>
              <span>Tax</span>
              <span>GH₵{order.tax.toFixed(2)}</span>
            </SummaryRow>
            <SummaryTotal>
              <span>Total</span>
              <span>GH₵{order.totalAmount.toFixed(2)}</span>
            </SummaryTotal>
          </SummaryDetails>

          <PaymentNotice>
            <p>
              <FaClock /> Your order is being processed and will be shipped
              soon. Youll receive an email with tracking information.
            </p>
          </PaymentNotice>
        </OrderSummarySection>

        <OrderDetailsSection>
          <OrderTimeline>
            <TimelineStep active>
              <StepIcon>1</StepIcon>
              <StepContent>
                <StepTitle>Order Placed</StepTitle>
                <StepDescription>{order.date}</StepDescription>
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
                  Estimated: {order.estimatedDelivery}
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
              <p>
                <strong>Address:</strong>
              </p>
              <p>{shippingAddress?.streetAddress}</p>
              <p>
                {shippingAddress?.city}, {order.shippingAddress.region}
              </p>
              <p>{shippingAddress?.country}</p>
              <p>
                <strong>Contact:</strong> {shippingAddress?.contactPhone}
              </p>
              <p>
                <strong>Delivery Method:</strong> Standard Shipping
              </p>
              <p>
                <strong>Estimated Delivery:</strong> {order.estimatedDelivery}
              </p>
            </CardContent>
          </DetailsCard>

          <DetailsCard>
            <CardHeader>
              {order.paymentMethod === "Mobile Money" ? (
                <FaMobileAlt />
              ) : (
                <FaBuilding />
              )}
              <h3>Payment Information</h3>
            </CardHeader>
            <CardContent>
              <p>
                <strong>Method:</strong>
                {order.paymentMethod.split("_").join(" ") || "N/A"}
              </p>

              {order.paymentMethod === "Mobile Money" && (
                <>
                  <p>
                    <strong>Network:</strong> {order.payment.details.network}
                  </p>
                  <p>
                    <strong>Number:</strong> {order.payment.details.number}
                  </p>
                  <p>
                    <strong>Name:</strong> {order.payment.details.name}
                  </p>
                  <PaymentNotice>
                    <p>
                      Your payment is being processed. Youll receive a
                      confirmation message shortly.
                    </p>
                  </PaymentNotice>
                </>
              )}

              {order.paymentMethod === "Bank Transfer" && (
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
                    <strong>Reference:</strong> {order.id}
                  </p>
                </PaymentNotice>
              )}

              {order.paymentMethod === "Cash on Delivery" && (
                <PaymentNotice>
                  <p>
                    Please prepare cash payment of GH₵
                    {order.summary.total.toFixed(2)} for the delivery agent.
                  </p>
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

export default OrderConfirmationPage;

// Styled Components
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

const OrderNumber = styled.p`
  font-size: 1.2rem;
  background: #e9f5e9;
  display: inline-block;
  padding: 8px 20px;
  border-radius: 20px;
  font-weight: bold;
  margin-top: 15px;
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
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;
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

  ${({ active }) =>
    active &&
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
`;

const Button = styled.button`
  padding: 12px 30px;
  border-radius: 30px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
`;

const ContinueButton = styled(Button)`
  background: #28a745;
  color: white;
  border: none;

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
  height: 70vh;
  gap: 20px;
`;

const Spinner = styled.div`
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #28a745;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;
