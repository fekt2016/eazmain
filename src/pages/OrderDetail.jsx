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
} from "react-icons/fa";
import { useGetUserOrderById } from "../hooks/useOrder";

const OrderDetail = () => {
  const { id: orderId } = useParams();

  const navigate = useNavigate();

  const { data: orderData, isLoading, isError } = useGetUserOrderById(orderId);

  const order = useMemo(() => {
    return orderData?.order;
  }, [orderData]);

  const [status, setStatus] = useState("");
  // console.log("order", order);

  useEffect(() => {
    if (order) {
      setStatus(order.status);
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

  if (isLoading)
    return <LoadingContainer>Loading order details...</LoadingContainer>;
  if (isError) return <ErrorContainer>Error loading order</ErrorContainer>;
  if (!order) return <EmptyState>Order not found</EmptyState>;

  console.log("order", order);
  // Calculate grand total
  const grandTotal = order.sellerOrder.reduce((total, order) => {
    return total + order.subtotal;
  }, 0);

  return (
    <OrderDetailContainer>
      <HeaderContainer>
        <BackButton onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back to Orders
        </BackButton>

        <HeaderContent>
          <HeaderTitle>
            <FaShoppingBag /> Order #{order.orderNumber}
          </HeaderTitle>
          <HeaderSubtitle>
            Order Placed: {new Date(order.createdAt).toLocaleDateString()}
          </HeaderSubtitle>
        </HeaderContent>

        <HeaderActions>
          <ActionButton>
            <FaPrint /> Print
          </ActionButton>
          <ActionButton>
            <FaEnvelope /> Email
          </ActionButton>
        </HeaderActions>
      </HeaderContainer>

      <OrderSummary>
        <SummaryCard>
          <SummaryTitle>Order Status</SummaryTitle>
          <StatusContainer>
            <StatusSelect value={status} onChange={handleStatusChange}>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </StatusSelect>
            <SaveButton onClick={handleSaveStatus}>Save</SaveButton>
          </StatusContainer>
          <StatusTimeline>
            <TimelineStep $active={true}>
              <StepIcon>
                <FaBox />
              </StepIcon>
              <StepLabel>Order Placed</StepLabel>
              <StepDate>
                {new Date(order.createdAt).toLocaleDateString()}
              </StepDate>
            </TimelineStep>

            <TimelineStep $active={status !== "processing"}>
              <StepIcon>
                <FaTruck />
              </StepIcon>
              <StepLabel>Shipped</StepLabel>
              {order.shippedAt && (
                <StepDate>
                  {new Date(order.shippedAt).toLocaleDateString()}
                </StepDate>
              )}
            </TimelineStep>

            <TimelineStep $active={status === "delivered"}>
              <StepIcon>
                <FaCheckCircle />
              </StepIcon>
              <StepLabel>Delivered</StepLabel>
              {order.deliveredAt && (
                <StepDate>
                  {new Date(order.deliveredAt).toLocaleDateString()}
                </StepDate>
              )}
            </TimelineStep>
          </StatusTimeline>
        </SummaryCard>

        <SummaryCard>
          <SummaryTitle>Customer Information</SummaryTitle>
          <CustomerInfo>
            <InfoRow>
              <InfoLabel>Name:</InfoLabel>
              <InfoValue>{order.user.name}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Email:</InfoLabel>
              <InfoValue>{order.user.email}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Phone:</InfoLabel>
              <InfoValue>{order.user.phone || "N/A"}</InfoValue>
            </InfoRow>
          </CustomerInfo>
        </SummaryCard>

        <SummaryCard>
          <SummaryTitle>Shipping Address</SummaryTitle>
          <ShippingAddress>
            {order.shippingAddress.streetAddress}, {order.shippingAddress.city}
            <br />
            {order.shippingAddress.state}, {order.shippingAddress.digitalAdress}
            <br />
            {order.shippingAddress.country}
          </ShippingAddress>
        </SummaryCard>

        <SummaryCard>
          <SummaryTitle>Payment Information</SummaryTitle>
          <PaymentInfo>
            <InfoRow>
              <InfoLabel>Method:</InfoLabel>
              <InfoValue>{order.paymentMethod}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Status:</InfoLabel>
              <InfoValue>
                <PaymentStatus $paid={order.isPaid}>
                  {order.isPaid ? "Paid" : "Pending"}
                </PaymentStatus>
              </InfoValue>
            </InfoRow>
            {order.paidAt && (
              <InfoRow>
                <InfoLabel>Paid At:</InfoLabel>
                <InfoValue>{new Date(order.paidAt).toLocaleString()}</InfoValue>
              </InfoRow>
            )}
          </PaymentInfo>
        </SummaryCard>
      </OrderSummary>

      {/* Seller Orders Section */}
      <OrderItemsContainer>
        <SectionHeader>Seller Orders</SectionHeader>

        {order.sellerOrder.map((sellerOrder) => (
          <SellerOrderCard key={sellerOrder._id}>
            <SellerHeader>
              <SellerName>
                Seller: {sellerOrder.seller?.name || "Unknown Seller"}
              </SellerName>
              <SellerContact>
                Email: {sellerOrder.seller?.email || "N/A"}
              </SellerContact>
            </SellerHeader>

            <ItemsTable>
              <thead>
                <TableHeaderRow>
                  <TableHeader>Product</TableHeader>
                  <TableHeader>Price</TableHeader>
                  <TableHeader>Quantity</TableHeader>
                  <TableHeader>Total</TableHeader>
                </TableHeaderRow>
              </thead>
              <tbody>
                {order.orderItems.map((item) => {
                  console.log("item", item);
                  return (
                    <TableRow key={item._id}>
                      <TableCell>
                        <ProductInfo>
                          <ProductImage
                            src={item.product.imageCover}
                            alt={item.product.name}
                          />
                          <ProductName>{item.product.name}</ProductName>
                        </ProductInfo>
                      </TableCell>
                      <TableCell>GH₵{item.price.toFixed(2)}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>
                        GH₵{(item.price * item.quantity).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </tbody>
              <tfoot>
                <TableRow>
                  <TableCell colSpan="3" style={{ textAlign: "right" }}>
                    Items Subtotal:
                  </TableCell>
                  <TableCell>
                    GH₵
                    {sellerOrder.subtotal.toFixed(2)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan="3" style={{ textAlign: "right" }}>
                    Shipping Cost:
                  </TableCell>
                  <TableCell>
                    GH₵{sellerOrder.shippingCost.toFixed(2)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan="3" style={{ textAlign: "right" }}>
                    Tax:
                  </TableCell>
                  <TableCell>GH₵{sellerOrder.tax.toFixed(2)}</TableCell>
                </TableRow>
                <TableRow style={{ fontWeight: "bold" }}>
                  <TableCell colSpan="3" style={{ textAlign: "right" }}>
                    Seller Total:
                  </TableCell>
                  <TableCell>GH₵{sellerOrder.total.toFixed(2)}</TableCell>
                </TableRow>
              </tfoot>
            </ItemsTable>
          </SellerOrderCard>
        ))}
      </OrderItemsContainer>

      {/* Grand Total Section */}
      <OrderTotals>
        <TotalsGrid>
          <TotalRow $total={true}>
            <TotalLabel>Grand Total:</TotalLabel>
            <TotalValue>GH₵{grandTotal.toFixed(2)}</TotalValue>
          </TotalRow>
        </TotalsGrid>
      </OrderTotals>

      <ActionBar>
        <DangerButton onClick={handleDeleteOrder}>
          <FaTrash /> Delete Order
        </DangerButton>
        <ActionGroup>
          <SecondaryButton>
            <FaEdit /> Edit Order
          </SecondaryButton>
          <PrimaryButton>Save Changes</PrimaryButton>
        </ActionGroup>
      </ActionBar>
    </OrderDetailContainer>
  );
};

// Styled Components
// const OrderDetailContainer = styled.div`
//   max-width: 1200px;
//   margin: 0 auto;
//   padding: 20px;
//   background-color: #f8f9fa;
//   font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
// `;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e0e0e0;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: #4e73df;
  font-weight: 500;
  cursor: pointer;
  padding: 8px 15px;
  border-radius: 6px;
  transition: all 0.3s;

  &:hover {
    background-color: #e8eeff;
  }
`;

const HeaderContent = styled.div`
  flex: 1;
  padding: 0 20px;
`;

const HeaderTitle = styled.h1`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.8rem;
  color: #2e3a59;
  margin-bottom: 5px;
`;

const HeaderSubtitle = styled.p`
  font-size: 1rem;
  color: #666;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 10px;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 15px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    border-color: #4e73df;
    color: #4e73df;
    background: #e8eeff;
  }
`;

const OrderSummary = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const SummaryCard = styled.div`
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
`;

const SummaryTitle = styled.h2`
  font-size: 1.2rem;
  color: #2e3a59;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
`;

const StatusContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
`;

const StatusSelect = styled.select`
  flex: 1;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
`;

const SaveButton = styled.button`
  padding: 10px 20px;
  background: #4e73df;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s;

  &:hover {
    background: #2e59d9;
  }
`;

const StatusTimeline = styled.div`
  display: flex;
  justify-content: space-between;
  position: relative;
  margin-top: 20px;

  &::before {
    content: "";
    position: absolute;
    top: 20px;
    left: 0;
    right: 0;
    height: 2px;
    background: #eee;
    z-index: 1;
  }
`;

const TimelineStep = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 2;
  flex: 1;
  opacity: ${(props) => (props.$active ? 1 : 0.5)};
`;

const StepIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${(props) => (props.$active ? "#4e73df" : "#eee")};
  color: ${(props) => (props.$active ? "white" : "#666")};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
`;

const StepLabel = styled.div`
  font-size: 0.85rem;
  text-align: center;
  color: ${(props) => (props.$active ? "#2e3a59" : "#666")};
  font-weight: ${(props) => (props.$active ? 600 : 400)};
`;

const StepDate = styled.div`
  font-size: 0.75rem;
  color: #888;
  margin-top: 5px;
  text-align: center;
`;

const CustomerInfo = styled.div`
  display: grid;
  gap: 10px;
`;

const InfoRow = styled.div`
  display: flex;
`;

const InfoLabel = styled.div`
  font-weight: 500;
  color: #666;
  width: 100px;
`;

const InfoValue = styled.div`
  flex: 1;
  color: #2e3a59;
`;

const ShippingAddress = styled.div`
  line-height: 1.6;
  color: #2e3a59;
`;

const PaymentInfo = styled(CustomerInfo)``;

const PaymentStatus = styled.span`
  color: ${(props) => (props.$paid ? "#28a745" : "#dc3545")};
  font-weight: 500;
`;

const OrderItemsContainer = styled(SummaryCard)`
  grid-column: 1 / -1;
  margin-bottom: 20px;
`;

const SectionHeader = styled(SummaryTitle)``;

const ItemsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeaderRow = styled.tr`
  background-color: #f8f9fa;
`;

const TableHeader = styled.th`
  padding: 15px;
  text-align: left;
  font-weight: 600;
  color: #666;
`;

const TableRow = styled.tr`
  border-bottom: 1px solid #eee;
`;

const TableCell = styled.td`
  padding: 15px;
  vertical-align: middle;
`;

const ProductInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const ProductImage = styled.img`
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #eee;
`;

const ProductName = styled.div`
  font-weight: 500;
  color: #2e3a59;
`;

const OrderTotals = styled.div`
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 30px;
`;

const TotalsGrid = styled.div`
  max-width: 400px;
  margin-left: auto;
`;

const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid ${(props) => (props.$total ? "transparent" : "#eee")};
  font-size: ${(props) => (props.$total ? "1.2rem" : "1rem")};
  font-weight: ${(props) => (props.$total ? 600 : 400)};
`;

const TotalLabel = styled.div`
  color: #666;
`;

const TotalValue = styled.div`
  color: #2e3a59;
`;

const ActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 20px 0;
`;

const DangerButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: #f8d7da;
  color: #dc3545;
  border: 1px solid #f5c6cb;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;

  &:hover {
    background: #f5c6cb;
  }
`;

const ActionGroup = styled.div`
  display: flex;
  gap: 10px;
`;

const SecondaryButton = styled(ActionButton)`
  background: #fff;
`;

const PrimaryButton = styled.button`
  padding: 12px 25px;
  background: #4e73df;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.3s;

  &:hover {
    background: #2e59d9;
  }
`;

const LoadingContainer = styled.div`
  text-align: center;
  padding: 50px;
  font-size: 1.2rem;
  color: #666;
`;

const ErrorContainer = styled(LoadingContainer)`
  color: #dc3545;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 50px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  font-size: 1.2rem;
  color: #666;
`;
const SellerOrderCard = styled.div`
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 25px;
  border: 1px solid #eee;
`;

const SellerHeader = styled.div`
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
`;

const SellerName = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: #2e3a59;
`;

const SellerContact = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-top: 5px;
`;

// Existing styled components (keep all previous styles and add these new ones)
const OrderDetailContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f8f9fa;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
`;

export default OrderDetail;
