import {
  ContentCard,
  CardTitle,
  CardDescription,
} from "../components/TabPanelContainer";
import { LoadingState, ErrorState } from "../../../components/loading";
import { useGetUserOrders, getOrderStructure, getOrderDisplayStatus } from "../../../shared/hooks/useOrder";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { FaShoppingBag, FaArrowRight } from "react-icons/fa";

const OrdersTab = () => {
  const { data: ordersData, isLoading, error } = useGetUserOrders();
  const orders = getOrderStructure(ordersData) || [];

  if (isLoading) return <LoadingState message="Loading orders..." />;
  if (error) return <ErrorState message="Failed to load orders" />;

  return (
    <ContentCard>
      <CardTitle>Order History</CardTitle>
      <CardDescription>
        View and track all your past and current orders.
      </CardDescription>

      {orders.length === 0 ? (
        <EmptyState>
          <FaShoppingBag size={48} style={{ color: "var(--color-text-light)", marginBottom: "var(--space-md)" }} />
          <p>No orders yet.</p>
          <Link to="/products">
            <Button variant="primary">Start Shopping</Button>
          </Link>
        </EmptyState>
      ) : (
        <OrdersList>
          {orders.slice(0, 5).map((order) => (
            <OrderCard key={order._id} to={`/orders/${order._id}`}>
              <OrderInfo>
                <OrderNumber>Order #{order.orderNumber || order._id.slice(-8)}</OrderNumber>
                <OrderDate>
                  {new Date(order.createdAt).toLocaleDateString()}
                </OrderDate>
                <OrderTotal>${order.totalAmount?.toFixed(2) || "0.00"}</OrderTotal>
              </OrderInfo>
              <OrderStatus status={getOrderDisplayStatus(order).badgeStatus}>
                {getOrderDisplayStatus(order).displayLabel}
              </OrderStatus>
              <OrderArrow>
                <FaArrowRight />
              </OrderArrow>
            </OrderCard>
          ))}
        </OrdersList>
      )}

      {orders.length > 5 && (
        <ViewAllLink to="/orders">
          <Button variant="primary">View All Orders</Button>
        </ViewAllLink>
      )}
    </ContentCard>
  );
};

export default OrdersTab;

const EmptyState = styled.div`
  text-align: center;
  padding: var(--space-xl);
  color: var(--color-text-light);

  p {
    margin-bottom: var(--space-md);
  }
`;

const OrdersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
`;

const OrderCard = styled(Link)`
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-lg);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-bg-light);
  text-decoration: none;
  color: inherit;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--color-primary);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const OrderInfo = styled.div`
  flex: 1;
`;

const OrderNumber = styled.h3`
  font-family: "Plus Jakarta Sans", sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-dark);
  margin: 0 0 var(--space-xs) 0;
`;

const OrderDate = styled.p`
  font-family: "Inter", sans-serif;
  font-size: 14px;
  color: var(--color-text-light);
  margin: 0 0 var(--space-xs) 0;
`;

const OrderTotal = styled.p`
  font-family: "Inter", sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-dark);
  margin: 0;
`;

const OrderStatus = styled.span`
  padding: var(--space-xs) var(--space-sm);
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  background: ${(props) => {
    switch (props.status) {
      case "delivered":
      case "completed":
        return "var(--color-success)";
      case "shipped":
        return "var(--color-primary)";
      case "pending":
        return "#F59E0B";
      case "cancelled":
        return "var(--color-danger)";
      default:
        return "var(--color-text-light)";
    }
  }};
  color: white;
`;

const OrderArrow = styled.div`
  color: var(--color-text-light);
  font-size: 18px;
`;

const ViewAllLink = styled(Link)`
  display: inline-block;
  margin-top: var(--space-md);
  text-decoration: none;
`;

const Button = styled.button`
  padding: var(--space-md) var(--space-lg);
  border: none;
  border-radius: 8px;
  font-family: "Inter", sans-serif;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--color-primary);
  color: white;

  &:hover {
    background: var(--color-primary-hover);
  }
`;

