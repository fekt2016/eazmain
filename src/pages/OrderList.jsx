import { useState } from "react";
import styled from "styled-components";
import {
  FaSearch,
  FaFilter,
  FaShoppingBag,
  FaEye,
  FaEdit,
  FaTrash,
  FaFileAlt,
} from "react-icons/fa";
import {
  useGetUserOrders,
  getOrderStructure,
  useDeleteOrder,
} from "../hooks/useOrder";
import { useNavigate } from "react-router-dom";

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

  const orders = getOrderStructure(ordersData);
  console.log("orders", orders);
  // Sort orders
  const sortedOrders = [...orders].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  // Filter orders based on status and search term
  const filteredOrders = sortedOrders.filter((order) => {
    const matchesFilter =
      filter === "all" || order.status.toLowerCase() === filter;
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Action handlers
  const handleView = (orderId) => {
    navigate(`/orders/${orderId}`);
  };

  const handleEdit = (orderId) => {
    console.log("Edit order:", orderId);
    // Open edit modal or navigate to edit page
  };

  const handleDelete = (orderId) => {
    console.log("Delete order:", orderId);
    deleteOrder(orderId);
    // Show confirmation modal and delete order
  };

  return (
    <OrdersPageContainer>
      <PageHeader>
        <h1>
          <FaShoppingBag /> Orders Management
        </h1>
        <p>View and manage all customer orders</p>
      </PageHeader>

      <ControlsContainer>
        <SearchContainer>
          <SearchInput
            type="text"
            placeholder="Search by order ID or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <SearchIcon>
            <FaSearch />
          </SearchIcon>
        </SearchContainer>

        <FilterContainer>
          <FilterLabel>
            <FaFilter /> Status:
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
        </FilterContainer>
      </ControlsContainer>

      {filteredOrders.length === 0 ? (
        <EmptyState>
          <FaFileAlt size={48} />
          <h3>No orders found</h3>
          <p>Try adjusting your search or filter criteria</p>
        </EmptyState>
      ) : (
        <TableContainer>
          <OrdersTable>
            <thead>
              <TableHeaderRow>
                <TableHeader onClick={() => requestSort("id")}>
                  Order ID
                  {sortConfig.key === "id" &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </TableHeader>
                <TableHeader onClick={() => requestSort("date")}>
                  Date
                  {sortConfig.key === "date" &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </TableHeader>
                {/* <TableHeader>Customer</TableHeader> */}
                <TableHeader>Items</TableHeader>
                <TableHeader onClick={() => requestSort("total")}>
                  Total
                  {sortConfig.key === "total" &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Actions</TableHeader>
              </TableHeaderRow>
            </thead>

            <tbody>
              {filteredOrders.map((order) => {
                const orderNumber = order.orderNumber.slice(14);
                console.log("orderNumber", orderNumber);
                return (
                  <TableRow key={order.id}>
                    <TableCell>
                      <OrderId>
                        {order.orderNumber.slice(0, 4) + orderNumber}
                      </OrderId>
                    </TableCell>
                    <TableCell>{order.createdAt}</TableCell>
                    {/* <TableCell>{order.user.name}</TableCell> */}
                    <TableCell>{order.orderItems.length}</TableCell>
                    <TableCell>GH₵{order.totalPrice.toFixed(2)}</TableCell>
                    <TableCell>
                      <StatusBadge $status={order.status.toLowerCase()}>
                        {order.status}
                      </StatusBadge>
                    </TableCell>
                    <TableCell>
                      <ActionIcons>
                        <ViewIcon
                          title="View Details"
                          onClick={() => handleView(order.id)}
                        >
                          <FaEye />
                        </ViewIcon>
                        <EditIcon
                          title="Edit Order"
                          onClick={() => handleEdit(order.id)}
                        >
                          <FaEdit />
                        </EditIcon>
                        <DeleteIcon
                          title="Delete Order"
                          onClick={() => handleDelete(order.id)}
                        >
                          <FaTrash />
                        </DeleteIcon>
                      </ActionIcons>
                    </TableCell>
                  </TableRow>
                );
              })}
            </tbody>
          </OrdersTable>
        </TableContainer>
      )}

      <TableFooter>
        <PaginationInfo>
          Showing {filteredOrders.length} of {orders.length} orders
        </PaginationInfo>
        <PaginationControls>
          <PaginationButton disabled>Previous</PaginationButton>
          <PaginationButton active>1</PaginationButton>
          <PaginationButton>2</PaginationButton>
          <PaginationButton>Next</PaginationButton>
        </PaginationControls>
      </TableFooter>
    </OrdersPageContainer>
  );
};

// Styled Components
const OrdersPageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 20px;
  background-color: #f8f9fa;
  min-height: 80vh;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
`;

const PageHeader = styled.div`
  margin-bottom: 30px;

  h1 {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 2rem;
    color: #2e3a59;
    margin-bottom: 10px;
  }

  p {
    font-size: 1.1rem;
    color: #666;
  }
`;

const ControlsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  flex-wrap: wrap;
  gap: 20px;
  background: white;
  padding: 15px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  max-width: 400px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 20px 12px 50px;
  border: 1px solid #ddd;
  border-radius: 30px;
  font-size: 1rem;
  transition: all 0.3s;

  &:focus {
    outline: none;
    border-color: #4e73df;
    box-shadow: 0 0 0 3px rgba(78, 115, 223, 0.2);
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
`;

const FilterContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const FilterLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: 500;
`;

const FilterSelect = styled.select`
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  font-size: 1rem;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #4e73df;
  }
`;

const TableContainer = styled.div`
  overflow-x: auto;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
`;

const OrdersTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
`;

const TableHeaderRow = styled.tr`
  background-color: #4e73df;
`;

const TableHeader = styled.th`
  padding: 15px 20px;
  text-align: left;
  font-weight: 600;
  color: white;
  cursor: pointer;
  user-select: none;
  transition: background 0.2s;

  &:hover {
    background-color: #2e59d9;
  }
`;

const TableRow = styled.tr`
  border-bottom: 1px solid #eee;
  transition: background 0.2s;

  &:hover {
    background-color: #f8f9fa;
  }
`;

const TableCell = styled.td`
  padding: 15px 20px;
  vertical-align: middle;
`;

const OrderId = styled.div`
  font-weight: 600;
  color: #2e3a59;
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  background: ${(props) =>
    props.$status === "delivered"
      ? "#e9f5e9"
      : props.$status === "shipped"
      ? "#e8eeff"
      : props.$status === "processing"
      ? "#fff8e1"
      : props.$status === "cancelled"
      ? "#f8f9fa"
      : "#f8f9fa"};
  color: ${(props) =>
    props.$status === "delivered"
      ? "#28a745"
      : props.$status === "shipped"
      ? "#4e73df"
      : props.$status === "processing"
      ? "#ffc107"
      : props.$status === "cancelled"
      ? "#6c757d"
      : "#6c757d"};
`;

const ActionIcons = styled.div`
  display: flex;
  gap: 12px;
`;

const IconButton = styled.button`
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border: 1px solid #eee;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }
`;

const ViewIcon = styled(IconButton)`
  &:hover {
    color: #4e73df;
    border-color: #4e73df;
    background: #e8eeff;
  }
`;

const EditIcon = styled(IconButton)`
  &:hover {
    color: #ffc107;
    border-color: #ffc107;
    background: #fff8e1;
  }
`;

const DeleteIcon = styled(IconButton)`
  &:hover {
    color: #dc3545;
    border-color: #dc3545;
    background: #f8d7da;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 50px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);

  svg {
    color: #6c757d;
    margin-bottom: 20px;
  }

  h3 {
    margin: 0 0 10px 0;
    color: #2e3a59;
  }

  p {
    color: #666;
    margin-bottom: 20px;
  }
`;

const TableFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 25px;
  padding: 15px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
`;

const PaginationInfo = styled.div`
  font-size: 0.9rem;
  color: #666;
`;

const PaginationControls = styled.div`
  display: flex;
  gap: 8px;
`;

const PaginationButton = styled.button`
  padding: 8px 14px;
  border: 1px solid #ddd;
  background: ${(props) => (props.active ? "#4e73df" : "white")};
  color: ${(props) => (props.active ? "white" : "#666")};
  border-radius: 4px;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  opacity: ${(props) => (props.disabled ? 0.5 : 1)};

  &:hover:not(:disabled) {
    background: ${(props) => (props.active ? "#2e59d9" : "#f8f9fa")};
  }
`;

export default OrdersPage;
