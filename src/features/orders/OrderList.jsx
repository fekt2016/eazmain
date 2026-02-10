import { useState, useMemo } from "react";
import styled from "styled-components";
import {
  FaSearch,
  FaFilter,
  FaShoppingBag,
  FaEye,
  FaEdit,
  FaTrash,
  FaFileAlt,
  FaSort,
  FaSortUp,
  FaSortDown,
} from "react-icons/fa";
import {
  useGetUserOrders,
  getOrderStructure,
  getOrderDisplayStatus,
  useDeleteOrder,
} from "../../shared/hooks/useOrder";
import { useNavigate, Link } from "react-router-dom";
import { PATHS } from "../../routes/routePaths";
import logger from "../../shared/utils/logger";
import AlertModal from "../../shared/components/AlertModal";

const OrdersPage = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "date",
    direction: "desc",
  });
  const { data: ordersData } = useGetUserOrders();
  const { mutate: deleteOrder } = useDeleteOrder();

  const [alertMessage, setAlertMessage] = useState("");
  const [alertTitle, setAlertTitle] = useState("");
  const [alertVariant, setAlertVariant] = useState("info");
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const orders = getOrderStructure(ordersData);

  // Sort orders
  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => {
      if (sortConfig.key === "date") {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA;
      }
      
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [orders, sortConfig]);

  // Filter orders based on status and search term
  const filteredOrders = useMemo(() => {
    return sortedOrders.filter((order) => {
      const { badgeStatus } = getOrderDisplayStatus(order);
      const matchesFilter =
        filter === "all" || badgeStatus === filter;
      const matchesSearch =
        (order.orderNumber || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [sortedOrders, filter, searchTerm]);

  const requestSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc"
    });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort />;
    return sortConfig.direction === "asc" ? <FaSortUp /> : <FaSortDown />;
  };

  const handleView = (orderId) => navigate(`/orders/${orderId}`);
  const handleEdit = (orderId) => logger.debug("Edit order:", orderId);
  const handleDelete = (orderId) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      setAlertMessage("");
      setIsAlertOpen(false);
      deleteOrder(orderId, {
        onSuccess: (response) => {
          const message =
            response?.data?.message ||
            response?.message ||
            "Order updated successfully.";
          setAlertTitle("Order updated");
          setAlertVariant("success");
          setAlertMessage(message);
          setIsAlertOpen(true);
        },
        onError: (error) => {
          const backendMessage =
            error?.response?.data?.message ||
            error?.message ||
            "Failed to update order.";

          // Provide a clearer explanation for paid / processing orders
          if (backendMessage === "This order can no longer be cancelled.") {
            setAlertTitle("Order cannot be cancelled");
            setAlertVariant("error");
            setAlertMessage(
              "This order has already been paid or is being processed and can no longer be cancelled."
            );
          } else {
            setAlertTitle("Order update failed");
            setAlertVariant("error");
            setAlertMessage(backendMessage);
          }

          setIsAlertOpen(true);
        },
      });
    }
  };

  const formatOrderNumber = (orderNumber) => {
    return orderNumber.length > 8 ? orderNumber.slice(-8) : orderNumber;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <OrdersPageContainer>
      {/* Header Section */}
      <PageHeader>
        <HeaderContent>
          <HeaderIcon>
            <FaShoppingBag />
          </HeaderIcon>
          <HeaderText>
            <PageTitle>Order Management</PageTitle>
            <PageSubtitle>View and manage all customer orders</PageSubtitle>
          </HeaderText>
        </HeaderContent>
      </PageHeader>

      {/* Controls Section */}
      <ControlsSection>
        <SearchWrapper>
          <SearchInputWrapper>
            <SearchIcon>
              <FaSearch />
            </SearchIcon>
            <SearchInput
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchInputWrapper>
        </SearchWrapper>

        <FilterWrapper>
          <FilterLabel>
            <FaFilter />
            Filter by:
          </FilterLabel>
          <FilterSelect
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Orders</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </FilterSelect>
        </FilterWrapper>
      </ControlsSection>

      {/* Delete / cancel feedback modal */}
      <AlertModal
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        title={alertTitle}
        message={alertMessage}
        variant={alertVariant}
      />

      {/* Orders Content */}
      <ContentSection>
        {filteredOrders.length === 0 ? (
          <EmptyState>
            <EmptyIcon>
              <FaFileAlt />
            </EmptyIcon>
            <EmptyTitle>No orders found</EmptyTitle>
            <EmptyMessage>
              {searchTerm || filter !== "all" 
                ? "Try adjusting your search or filter criteria"
                : "No orders have been placed yet"
              }
            </EmptyMessage>
          </EmptyState>
        ) : (
          <>
            {/* Desktop Table View */}
            <TableContainer>
              <OrdersTable>
                <TableHead>
                  <TableRow>
                    <TableHeader 
                      $sortable 
                      onClick={() => requestSort("orderNumber")}
                    >
                      <HeaderContent>
                        Order ID
                        <SortIcon>{getSortIcon("orderNumber")}</SortIcon>
                      </HeaderContent>
                    </TableHeader>
                    <TableHeader 
                      $sortable 
                      onClick={() => requestSort("date")}
                    >
                      <HeaderContent>
                        Date
                        <SortIcon>{getSortIcon("date")}</SortIcon>
                      </HeaderContent>
                    </TableHeader>
                    <TableHeader>Items</TableHeader>
                    <TableHeader>Tracking Number</TableHeader>
                    <TableHeader 
                      $sortable 
                      onClick={() => requestSort("totalPrice")}
                    >
                      <HeaderContent>
                        Total
                        <SortIcon>{getSortIcon("totalPrice")}</SortIcon>
                      </HeaderContent>
                    </TableHeader>
                    <TableHeader>Status</TableHeader>
                    <TableHeader>Refund</TableHeader>
                    <TableHeader>Actions</TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <OrderId>#{formatOrderNumber(order.orderNumber)}</OrderId>
                      </TableCell>
                      <TableCell>
                        <OrderDate>{formatDate(order.createdAt)}</OrderDate>
                      </TableCell>
                      <TableCell>
                        <ItemCount>{order.orderItems.length} items</ItemCount>
                      </TableCell>
                      <TableCell>
                        {order.trackingNumber ? (
                          <TrackingLink 
                            onClick={() => navigate(`/tracking/${order.trackingNumber}`)}
                            title="Track Order"
                          >
                            {order.trackingNumber}
                          </TrackingLink>
                        ) : (
                          <TrackingPending>Pending...</TrackingPending>
                        )}
                      </TableCell>
                      <TableCell>
                        <OrderTotal>GH₵{order.totalPrice.toFixed(2)}</OrderTotal>
                      </TableCell>
                      <TableCell>
                        <StatusBadge $status={getOrderDisplayStatus(order).badgeStatus}>
                          {getOrderDisplayStatus(order).displayLabel}
                        </StatusBadge>
                      </TableCell>
                      <TableCell>
                        {order.refundRequested && (
                          <Link
                            to={PATHS.REFUND_DETAIL.replace(':orderId', order.id || order._id)}
                            style={{ textDecoration: 'none' }}
                            title="Click to view refund details"
                          >
                            <RefundBadge $status={order.refundStatus} $clickable>
                              {order.refundStatus === 'pending' && 'Refund Pending'}
                              {order.refundStatus === 'approved' && 'Refund Approved'}
                              {order.refundStatus === 'rejected' && 'Refund Rejected'}
                              {order.refundStatus === 'processing' && 'Refund Processing'}
                              {order.refundStatus === 'completed' && 'Refund Completed'}
                              {!order.refundStatus && 'Refund Requested'}
                              {' →'}
                            </RefundBadge>
                          </Link>
                        )}
                      </TableCell>
                      <TableCell>
                        <ActionButtons>
                          <ActionButton 
                            $variant="view"
                            onClick={() => handleView(order.id)}
                            title="View Details"
                          >
                            <FaEye />
                          </ActionButton>
                          <ActionButton 
                            $variant="edit"
                            onClick={() => handleEdit(order.id)}
                            title="Edit Order"
                          >
                            <FaEdit />
                          </ActionButton>
                          <ActionButton 
                            $variant="delete"
                            onClick={() => handleDelete(order.id)}
                            title="Delete Order"
                          >
                            <FaTrash />
                          </ActionButton>
                        </ActionButtons>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </OrdersTable>
            </TableContainer>

            {/* Mobile Card View */}
            <MobileOrdersList>
              {filteredOrders.map((order) => (
                <OrderCard key={order.id}>
                  <CardHeader>
                    <OrderInfo>
                      <OrderId>#{formatOrderNumber(order.orderNumber)}</OrderId>
                      <OrderDate>{formatDate(order.createdAt)}</OrderDate>
                    </OrderInfo>
                    <StatusBadge $status={getOrderDisplayStatus(order).badgeStatus}>
                      {getOrderDisplayStatus(order).displayLabel}
                    </StatusBadge>
                  </CardHeader>
                  
                  <CardBody>
                    <OrderDetails>
                      <DetailItem>
                        <DetailLabel>Items</DetailLabel>
                        <DetailValue>{order.orderItems.length} items</DetailValue>
                      </DetailItem>
                      <DetailItem>
                        <DetailLabel>Tracking Number</DetailLabel>
                        <DetailValue>
                          {order.trackingNumber ? (
                            <TrackingLink 
                              onClick={() => navigate(`/tracking/${order.trackingNumber}`)}
                              title="Track Order"
                            >
                              {order.trackingNumber}
                            </TrackingLink>
                          ) : (
                            <TrackingPending>Pending...</TrackingPending>
                          )}
                        </DetailValue>
                      </DetailItem>
                      <DetailItem>
                        <DetailLabel>Total</DetailLabel>
                        <DetailValue>GH₵{order.totalPrice.toFixed(2)}</DetailValue>
                      </DetailItem>
                      {order.refundRequested && (
                        <DetailItem>
                          <DetailLabel>Refund</DetailLabel>
                          <DetailValue>
                            <Link
                              to={PATHS.REFUND_DETAIL.replace(':orderId', order.id || order._id)}
                              style={{ textDecoration: 'none' }}
                              title="Click to view refund details"
                            >
                              <RefundBadge $status={order.refundStatus} $clickable>
                                {order.refundStatus === 'pending' && 'Refund Pending'}
                                {order.refundStatus === 'approved' && 'Refund Approved'}
                                {order.refundStatus === 'rejected' && 'Refund Rejected'}
                                {order.refundStatus === 'processing' && 'Refund Processing'}
                                {order.refundStatus === 'completed' && 'Refund Completed'}
                                {!order.refundStatus && 'Refund Requested'}
                                {' →'}
                              </RefundBadge>
                            </Link>
                          </DetailValue>
                        </DetailItem>
                      )}
                    </OrderDetails>
                  </CardBody>

                  <CardActions>
                    <ActionButtons>
                      <ActionButton 
                        $variant="view"
                        onClick={() => handleView(order.id)}
                        title="View Details"
                      >
                        <FaEye />
                        <span>View</span>
                      </ActionButton>
                      <ActionButton 
                        $variant="edit"
                        onClick={() => handleEdit(order.id)}
                        title="Edit Order"
                      >
                        <FaEdit />
                        <span>Edit</span>
                      </ActionButton>
                      <ActionButton 
                        $variant="delete"
                        onClick={() => handleDelete(order.id)}
                        title="Delete Order"
                      >
                        <FaTrash />
                        <span>Delete</span>
                      </ActionButton>
                    </ActionButtons>
                  </CardActions>
                </OrderCard>
              ))}
            </MobileOrdersList>
          </>
        )}
      </ContentSection>

      {/* Footer */}
      {filteredOrders.length > 0 && (
        <TableFooter>
          <PaginationInfo>
            Showing {filteredOrders.length} of {orders.length} orders
          </PaginationInfo>
          {/* Pagination controls can be implemented here */}
        </TableFooter>
      )}
    </OrdersPageContainer>
  );
};

// Styled Components using Global Design System
const OrdersPageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-xl);
  background: var(--color-grey-50);
  min-height: 100vh;

  @media (max-width: 768px) {
    padding: var(--spacing-md);
  }
`;

const PageHeader = styled.div`
  background: var(--color-white-0);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-xl);
  margin-bottom: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
`;

const HeaderIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: var(--border-radius-lg);
  background: var(--gradient-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-white-0);
  font-size: var(--font-size-lg);
`;

const HeaderText = styled.div`
  flex: 1;
`;

const PageTitle = styled.h1`
  font-size: var(--font-size-2xl);
  font-weight: var(--font-bold);
  color: var(--color-grey-900);
  margin-bottom: var(--spacing-xs);
`;

const PageSubtitle = styled.p`
  color: var(--color-grey-600);
  font-size: var(--font-size-sm);
  margin: 0;
`;

const ControlsSection = styled.div`
  display: flex;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: var(--spacing-md);
  }
`;

const SearchWrapper = styled.div`
  flex: 1;
  min-width: 300px;
`;

const SearchInputWrapper = styled.div`
  position: relative;
  background: var(--color-white-0);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
`;

const SearchIcon = styled.div`
  position: absolute;
  left: var(--spacing-lg);
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-grey-500);
  font-size: var(--font-size-sm);
`;

const SearchInput = styled.input`
  width: 100%;
  padding: var(--spacing-md) var(--spacing-md) var(--spacing-md) var(--spacing-3xl);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-lg);
  font-size: var(--font-size-sm);
  background: var(--color-white-0);
  transition: var(--transition-base);

  &:focus {
    outline: none;
    border-color: var(--color-primary-500);
    box-shadow: 0 0 0 3px var(--color-primary-100);
  }

  &::placeholder {
    color: var(--color-grey-400);
  }
`;

const FilterWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  background: var(--color-white-0);
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
`;

const FilterLabel = styled.label`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-weight: var(--font-medium);
  color: var(--color-grey-700);
  font-size: var(--font-size-sm);
  white-space: nowrap;
`;

const FilterSelect = styled.select`
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-grey-300);
  border-radius: var(--border-radius-md);
  background: var(--color-white-0);
  font-size: var(--font-size-sm);
  color: var(--color-grey-700);
  cursor: pointer;
  min-width: 140px;

  &:focus {
    outline: none;
    border-color: var(--color-primary-500);
  }
`;

const ContentSection = styled.div`
  background: var(--color-white-0);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
`;

const TableContainer = styled.div`
  overflow-x: auto;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const OrdersTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
`;

const TableHead = styled.thead`
  background: linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-600) 100%);
`;

const TableRow = styled.tr`
  border-bottom: 1px solid var(--color-grey-200);
  transition: var(--transition-base);

  &:hover {
    background: var(--color-grey-50);
  }
`;

const TableHeader = styled.th`
  padding: var(--spacing-lg);
  text-align: left;
  font-weight: var(--font-semibold);
  color: var(--color-white-0);
  cursor: ${props => props.$sortable ? 'pointer' : 'default'};
  user-select: none;
  transition: var(--transition-base);

  ${props => props.$sortable && `
    &:hover {
      background: var(--color-primary-600);
    }
  `}
`;

const SortIcon = styled.span`
  font-size: var(--font-size-sm);
  opacity: 0.8;
`;

const TableBody = styled.tbody``;

const TableCell = styled.td`
  padding: var(--spacing-lg);
  vertical-align: middle;
`;

const OrderId = styled.span`
  font-weight: var(--font-semibold);
  color: var(--color-grey-900);
  font-family: 'Courier New', monospace;
`;

const OrderDate = styled.span`
  color: var(--color-grey-700);
  font-size: var(--font-size-sm);
`;

const ItemCount = styled.span`
  color: var(--color-grey-600);
  font-size: var(--font-size-sm);
`;

const OrderTotal = styled.span`
  font-weight: var(--font-semibold);
  color: var(--color-primary-600);
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--border-radius-cir);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  text-transform: capitalize;
  
  background: ${props => {
    switch(props.$status) {
      case 'delivered': return 'var(--color-green-100)';
      case 'shipped': return 'var(--color-blue-100)';
      case 'cancelled': return 'var(--color-red-100)';
      default: return 'var(--color-yellow-100)';
    }
  }};
  
  color: ${props => {
    switch(props.$status) {
      case 'delivered': return 'var(--color-green-700)';
      case 'shipped': return 'var(--color-blue-700)';
      case 'cancelled': return 'var(--color-red-700)';
      default: return 'var(--color-yellow-700)';
    }
  }};
`;

const RefundBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: none;
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};
  transition: all 0.2s;
  ${({ $clickable }) =>
    $clickable &&
    `
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
  `}

  background: ${({ $status }) => {
    switch ($status) {
      case 'approved':
      case 'completed':
        return 'rgba(22,163,74,0.12)'; // green soft
      case 'pending':
      case 'processing':
        return 'rgba(234,179,8,0.12)'; // yellow soft
      case 'rejected':
        return 'rgba(220,38,38,0.12)'; // red soft
      default:
        return 'rgba(59,130,246,0.08)'; // blue soft
    }
  }};

  color: ${({ $status }) => {
    switch ($status) {
      case 'approved':
      case 'completed':
        return '#16a34a';
      case 'pending':
      case 'processing':
        return '#b45309';
      case 'rejected':
        return '#b91c1c';
      default:
        return '#1d4ed8';
    }
  }};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: var(--spacing-sm);
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm);
  border: none;
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: var(--transition-base);
  
  background: ${props => {
    switch(props.$variant) {
      case 'view': return 'var(--color-blue-100)';
      case 'edit': return 'var(--color-yellow-100)';
      case 'delete': return 'var(--color-red-100)';
      default: return 'var(--color-grey-100)';
    }
  }};
  
  color: ${props => {
    switch(props.$variant) {
      case 'view': return 'var(--color-blue-700)';
      case 'edit': return 'var(--color-yellow-700)';
      case 'delete': return 'var(--color-red-700)';
      default: return 'var(--color-grey-700)';
    }
  }};

  &:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
    
    background: ${props => {
      switch(props.$variant) {
        case 'view': return 'var(--color-blue-200)';
        case 'edit': return 'var(--color-yellow-200)';
        case 'delete': return 'var(--color-red-200)';
        default: return 'var(--color-grey-200)';
      }
    }};
  }

  @media (max-width: 768px) {
    flex: 1;
    justify-content: center;
  }
`;

const MobileOrdersList = styled.div`
  display: none;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);

  @media (max-width: 768px) {
    display: flex;
  }
`;

const OrderCard = styled.div`
  background: var(--color-white-0);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  transition: var(--transition-base);

  &:hover {
    box-shadow: var(--shadow-md);
    border-color: var(--color-primary-200);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-md);
`;

const OrderInfo = styled.div`
  flex: 1;
`;

const CardBody = styled.div`
  margin-bottom: var(--spacing-md);
`;

const OrderDetails = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
`;

const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
`;

const DetailLabel = styled.span`
  font-size: var(--text-xs);
  color: var(--color-grey-500);
  font-weight: var(--font-medium);
`;

const DetailValue = styled.span`
  font-size: var(--text-sm);
  color: var(--color-grey-800);
  font-weight: var(--font-semibold);
`;

const TrackingLink = styled.span`
  color: var(--color-primary-600);
  cursor: pointer;
  text-decoration: underline;
  font-weight: 500;
  transition: color 0.2s;

  &:hover {
    color: var(--color-primary-700);
  }
`;

const TrackingPending = styled.span`
  color: var(--color-grey-500);
  font-style: italic;
`;

const CardActions = styled.div``;

const EmptyState = styled.div`
  text-align: center;
  padding: var(--spacing-3xl);
  color: var(--color-grey-500);
`;

const EmptyIcon = styled.div`
  font-size: var(--font-size-4xl);
  margin-bottom: var(--spacing-lg);
  opacity: 0.5;
`;

const EmptyTitle = styled.h3`
  font-size: var(--font-size-xl);
  color: var(--color-grey-700);
  margin-bottom: var(--spacing-sm);
`;

const EmptyMessage = styled.p`
  color: var(--color-grey-600);
  font-size: var(--font-size-sm);
  margin: 0;
`;

const TableFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  background: var(--color-white-0);
  border-top: 1px solid var(--color-grey-200);
`;

const PaginationInfo = styled.div`
  font-size: var(--font-size-sm);
  color: var(--color-grey-600);
`;

export default OrdersPage;