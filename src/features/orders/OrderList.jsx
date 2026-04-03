import { useState, useMemo } from "react";
import styled, { keyframes } from "styled-components";
import {
  FaSearch,
  FaShoppingBag,
  FaEye,
  FaEdit,
  FaTrash,
  FaFileAlt,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaBoxOpen,
  FaTruck,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
} from "react-icons/fa";
import {
  useGetUserOrders,
  getOrderStructure,
  getOrderDisplayStatus,
  useDeleteOrder,
} from "../../shared/hooks/useOrder";
import { getOrderStatusColorKey, getOrderBadgeColors } from "../../shared/utils/orderStatusBadgeStyles";
import { useNavigate, Link } from "react-router-dom";
import { PATHS } from "../../routes/routePaths";
import logger from "../../shared/utils/logger";
import { useModal } from "../../shared/hooks/useModal";
import { LoadingState, ErrorState } from "../../components/loading";

const STATUS_FILTERS = [
  { key: "all",        label: "All Orders",  icon: FaBoxOpen },
  { key: "processing", label: "Processing",   icon: FaClock },
  { key: "shipped",    label: "Shipped",      icon: FaTruck },
  { key: "delivered",  label: "Delivered",    icon: FaCheckCircle },
  { key: "cancelled",  label: "Cancelled",    icon: FaTimesCircle },
];

const OrdersPage = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "date", direction: "desc" });

  const { data: ordersData, isLoading, error, isError } = useGetUserOrders();
  const { mutate: deleteOrder } = useDeleteOrder();
  const { showDanger, showAlert } = useModal();

  const orders = getOrderStructure(ordersData);

  /* ── Derived stats ── */
  const stats = useMemo(() => {
    const count = (status) =>
      orders.filter((o) => getOrderDisplayStatus(o).badgeStatus === status).length;
    return {
      total:      orders.length,
      processing: count("processing"),
      delivered:  count("delivered"),
      cancelled:  count("cancelled"),
    };
  }, [orders]);

  /* ── Sort ── */
  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => {
      if (sortConfig.key === "date") {
        const dA = new Date(a.createdAt), dB = new Date(b.createdAt);
        return sortConfig.direction === "asc" ? dA - dB : dB - dA;
      }
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === "asc" ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [orders, sortConfig]);

  /* ── Filter ── */
  const filteredOrders = useMemo(() => {
    return sortedOrders.filter((order) => {
      const { badgeStatus } = getOrderDisplayStatus(order);
      const matchesFilter = filter === "all" || badgeStatus === filter;
      const matchesSearch =
        (order.orderNumber || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [sortedOrders, filter, searchTerm]);

  const requestSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc",
    });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort />;
    return sortConfig.direction === "asc" ? <FaSortUp /> : <FaSortDown />;
  };

  const handleView   = (id) => navigate(`/orders/${id}`);
  const handleEdit   = (id) => logger.debug("Edit order:", id);
  const handleDelete = (id) => {
    showDanger({
      title: "Cancel Order?",
      message: "Are you sure you want to cancel this order? This action cannot be undone.",
      onConfirm: () => {
        deleteOrder(id, {
          onSuccess: (res) => {
            showAlert({
              title: "Order updated",
              message: res?.data?.message || res?.message || "Order updated successfully.",
              variant: "success",
            });
          },
          onError: (err) => {
            const msg = err?.response?.data?.message || err?.message || "Failed to update order.";
            showAlert({
              title: msg === "This order can no longer be cancelled."
                ? "Order cannot be cancelled"
                : "Order update failed",
              message: msg === "This order can no longer be cancelled."
                ? "This order has already been paid or is being processed and can no longer be cancelled."
                : msg,
              variant: "error",
            });
          },
        });
      },
    });
  };

  const formatOrderNumber = (n) => (n.length > 8 ? n.slice(-8) : n);
  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  /* ── Loading / Error ── */
  if (isLoading) return (
    <PageWrapper>
      <PageBanner>
        <BannerInner>
          <BannerLeft>
            <BannerIcon><FaShoppingBag /></BannerIcon>
            <BannerText>
              <PageTitle>My Orders</PageTitle>
              <PageSubtitle>Track and manage your purchases</PageSubtitle>
            </BannerText>
          </BannerLeft>
        </BannerInner>
      </PageBanner>
      <LoadingState message="Loading your orders…" />
    </PageWrapper>
  );

  if (isError || error) return (
    <PageWrapper>
      <PageBanner>
        <BannerInner>
          <BannerLeft>
            <BannerIcon><FaShoppingBag /></BannerIcon>
            <BannerText>
              <PageTitle>My Orders</PageTitle>
              <PageSubtitle>Track and manage your purchases</PageSubtitle>
            </BannerText>
          </BannerLeft>
        </BannerInner>
      </PageBanner>
      <ErrorState message="Failed to load orders." details={error?.message} />
    </PageWrapper>
  );

  return (
    <PageWrapper>

      {/* ── Banner Header ── */}
      <PageBanner>
        <BannerInner>
          <BannerLeft>
            <BannerIcon><FaShoppingBag /></BannerIcon>
            <BannerText>
              <PageTitle>My Orders</PageTitle>
              <PageSubtitle>Track and manage your purchases</PageSubtitle>
            </BannerText>
          </BannerLeft>
          <StatRow>
            <StatPill>
              <StatNum>{stats.total}</StatNum>
              <StatName>Total</StatName>
            </StatPill>
            <StatDivider />
            <StatPill $color="#f59e0b">
              <StatNum>{stats.processing}</StatNum>
              <StatName>Processing</StatName>
            </StatPill>
            <StatDivider />
            <StatPill $color="#059669">
              <StatNum>{stats.delivered}</StatNum>
              <StatName>Delivered</StatName>
            </StatPill>
            <StatDivider />
            <StatPill $color="#dc2626">
              <StatNum>{stats.cancelled}</StatNum>
              <StatName>Cancelled</StatName>
            </StatPill>
          </StatRow>
        </BannerInner>
      </PageBanner>

      {/* ── Controls ── */}
      <ControlsBar>
        <SearchBox>
          <SearchIconWrap><FaSearch /></SearchIconWrap>
          <SearchInput
            type="text"
            placeholder="Search by order number…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchBox>

        <FilterPills role="group" aria-label="Filter orders by status">
          {STATUS_FILTERS.map(({ key, label, icon: Icon }) => (
            <FilterPill
              key={key}
              $active={filter === key}
              onClick={() => setFilter(key)}
              type="button"
            >
              <Icon />
              {label}
            </FilterPill>
          ))}
        </FilterPills>
      </ControlsBar>

      {/* ── Content ── */}
      <ContentCard>
        {filteredOrders.length === 0 ? (
          <EmptyState>
            <EmptyIcon><FaFileAlt /></EmptyIcon>
            <EmptyTitle>No orders found</EmptyTitle>
            <EmptyMsg>
              {searchTerm || filter !== "all"
                ? "Try adjusting your search or filter."
                : "You haven't placed any orders yet."}
            </EmptyMsg>
            {!searchTerm && filter === "all" && (
              <ShopNowLink to={PATHS.PRODUCTS}>Start Shopping →</ShopNowLink>
            )}
          </EmptyState>
        ) : (
          <>
            {/* ── Desktop Table ── */}
            <TableScroll>
              <Table>
                <THead>
                  <TR>
                    <TH $sortable onClick={() => requestSort("orderNumber")}>
                      Order ID <SortIcon>{getSortIcon("orderNumber")}</SortIcon>
                    </TH>
                    <TH $sortable onClick={() => requestSort("date")}>
                      Date <SortIcon>{getSortIcon("date")}</SortIcon>
                    </TH>
                    <TH>Items</TH>
                    <TH>Tracking</TH>
                    <TH $sortable onClick={() => requestSort("totalPrice")}>
                      Total <SortIcon>{getSortIcon("totalPrice")}</SortIcon>
                    </TH>
                    <TH>Status</TH>
                    <TH>Refund</TH>
                    <TH>Actions</TH>
                  </TR>
                </THead>
                <tbody>
                  {filteredOrders.map((order, i) => (
                    <TR key={order.id} $even={i % 2 === 0}>
                      <TD>
                        <OrderNum>#{formatOrderNumber(order.orderNumber)}</OrderNum>
                      </TD>
                      <TD>
                        <DateText>{formatDate(order.createdAt)}</DateText>
                      </TD>
                      <TD>
                        <ItemBadge>{order.orderItems.length} item{order.orderItems.length !== 1 ? 's' : ''}</ItemBadge>
                      </TD>
                      <TD>
                        {order.trackingNumber ? (
                          <TrackingLink
                            onClick={() => navigate(`/tracking/${order.trackingNumber}`)}
                            title="Track order"
                          >
                            {order.trackingNumber}
                          </TrackingLink>
                        ) : (
                          <TrackingPending>Pending…</TrackingPending>
                        )}
                      </TD>
                      <TD>
                        <TotalText>GH₵{order.totalPrice.toFixed(2)}</TotalText>
                      </TD>
                      <TD>
                        <StatusBadge
                          $bg={getOrderBadgeColors(getOrderStatusColorKey(order)).bg}
                          $fg={getOrderBadgeColors(getOrderStatusColorKey(order)).color}
                        >
                          {getOrderDisplayStatus(order).displayLabel}
                        </StatusBadge>
                      </TD>
                      <TD>
                        {order.refundRequested && (
                          <Link to={PATHS.REFUND_DETAIL.replace(':orderId', order.id || order._id)} style={{ textDecoration: 'none' }}>
                            <RefundBadge $status={order.refundStatus}>
                              {order.refundStatus === 'pending'    && 'Refund Pending'}
                              {order.refundStatus === 'approved'   && 'Refund Approved'}
                              {order.refundStatus === 'rejected'   && 'Refund Rejected'}
                              {order.refundStatus === 'processing' && 'Refund Processing'}
                              {order.refundStatus === 'completed'  && 'Refund Completed'}
                              {!order.refundStatus                 && 'Refund Requested'}
                              {' →'}
                            </RefundBadge>
                          </Link>
                        )}
                      </TD>
                      <TD>
                        <ActionRow>
                          <IconBtn $variant="view"   onClick={() => handleView(order.id)}   title="View details"><FaEye /></IconBtn>
                          <IconBtn $variant="edit"   onClick={() => handleEdit(order.id)}   title="Edit order"><FaEdit /></IconBtn>
                          <IconBtn $variant="delete" onClick={() => handleDelete(order.id)} title="Cancel order"><FaTrash /></IconBtn>
                        </ActionRow>
                      </TD>
                    </TR>
                  ))}
                </tbody>
              </Table>
            </TableScroll>

            {/* ── Mobile Cards ── */}
            <MobileList>
              {filteredOrders.map((order) => (
                <MobileCard key={order.id}>
                  <MobileCardTop>
                    <MobileOrderMeta>
                      <OrderNum>#{formatOrderNumber(order.orderNumber)}</OrderNum>
                      <DateText>{formatDate(order.createdAt)}</DateText>
                    </MobileOrderMeta>
                    <StatusBadge
                      $bg={getOrderBadgeColors(getOrderStatusColorKey(order)).bg}
                      $fg={getOrderBadgeColors(getOrderStatusColorKey(order)).color}
                    >
                      {getOrderDisplayStatus(order).displayLabel}
                    </StatusBadge>
                  </MobileCardTop>

                  <MobileCardBody>
                    <MobileDetailGrid>
                      <MobileDetailItem>
                        <MobileDetailLabel>Items</MobileDetailLabel>
                        <MobileDetailValue>{order.orderItems.length} item{order.orderItems.length !== 1 ? 's' : ''}</MobileDetailValue>
                      </MobileDetailItem>
                      <MobileDetailItem>
                        <MobileDetailLabel>Total</MobileDetailLabel>
                        <MobileDetailValue $gold>GH₵{order.totalPrice.toFixed(2)}</MobileDetailValue>
                      </MobileDetailItem>
                      <MobileDetailItem $full>
                        <MobileDetailLabel>Tracking</MobileDetailLabel>
                        <MobileDetailValue>
                          {order.trackingNumber ? (
                            <TrackingLink onClick={() => navigate(`/tracking/${order.trackingNumber}`)}>
                              {order.trackingNumber}
                            </TrackingLink>
                          ) : (
                            <TrackingPending>Pending…</TrackingPending>
                          )}
                        </MobileDetailValue>
                      </MobileDetailItem>
                      {order.refundRequested && (
                        <MobileDetailItem $full>
                          <MobileDetailLabel>Refund</MobileDetailLabel>
                          <MobileDetailValue>
                            <Link to={PATHS.REFUND_DETAIL.replace(':orderId', order.id || order._id)} style={{ textDecoration: 'none' }}>
                              <RefundBadge $status={order.refundStatus}>
                                {order.refundStatus === 'pending'    && 'Refund Pending'}
                                {order.refundStatus === 'approved'   && 'Refund Approved'}
                                {order.refundStatus === 'rejected'   && 'Refund Rejected'}
                                {order.refundStatus === 'processing' && 'Refund Processing'}
                                {order.refundStatus === 'completed'  && 'Refund Completed'}
                                {!order.refundStatus                 && 'Refund Requested'}
                                {' →'}
                              </RefundBadge>
                            </Link>
                          </MobileDetailValue>
                        </MobileDetailItem>
                      )}
                    </MobileDetailGrid>
                  </MobileCardBody>

                  <MobileCardActions>
                    <MobileActionBtn $variant="view"   onClick={() => handleView(order.id)}>
                      <FaEye /> View
                    </MobileActionBtn>
                    <MobileActionBtn $variant="edit"   onClick={() => handleEdit(order.id)}>
                      <FaEdit /> Edit
                    </MobileActionBtn>
                    <MobileActionBtn $variant="delete" onClick={() => handleDelete(order.id)}>
                      <FaTrash /> Cancel
                    </MobileActionBtn>
                  </MobileCardActions>
                </MobileCard>
              ))}
            </MobileList>
          </>
        )}
      </ContentCard>

      {/* ── Footer ── */}
      {filteredOrders.length > 0 && (
        <TableFooter>
          <FooterCount>
            Showing <strong>{filteredOrders.length}</strong> of <strong>{orders.length}</strong> orders
          </FooterCount>
        </TableFooter>
      )}
    </PageWrapper>
  );
};

export default OrdersPage;

/* ─── Animations ─────────────────────────────────────────── */
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`;

/* ─── Layout ─────────────────────────────────────────────── */
const PageWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem 3rem;
  min-height: 100vh;
  animation: ${fadeUp} 0.35s ease;

  @media (max-width: 768px) {
    padding: 1rem 0.75rem 2rem;
  }
`;

/* ─── Banner ─────────────────────────────────────────────── */
const PageBanner = styled.div`
  background: linear-gradient(135deg, #1A1F2E 0%, #2d3444 55%, #1a2035 100%);
  border-radius: 16px;
  padding: 1.75rem 2rem;
  margin-bottom: 1.25rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: radial-gradient(circle, rgba(212,136,42,0.1) 1px, transparent 1px);
    background-size: 26px 26px;
    pointer-events: none;
  }

  @media (max-width: 768px) {
    padding: 1.25rem 1rem;
    border-radius: 12px;
  }
`;

const BannerInner = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  flex-wrap: wrap;
`;

const BannerLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const BannerIcon = styled.div`
  width: 46px;
  height: 46px;
  border-radius: 12px;
  background: rgba(212, 136, 42, 0.18);
  border: 1px solid rgba(212, 136, 42, 0.3);
  color: #f0a845;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  flex-shrink: 0;
`;

const BannerText = styled.div``;

const PageTitle = styled.h1`
  font-size: 1.4rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 0.2rem;
  line-height: 1.2;
`;

const PageSubtitle = styled.p`
  font-size: 0.82rem;
  color: rgba(255,255,255,0.55);
  margin: 0;
`;

const StatRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 0.6rem 1rem;

  @media (max-width: 640px) {
    width: 100%;
    justify-content: space-around;
  }
`;

const StatPill = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.1rem;
  padding: 0 1rem;
`;

const StatNum = styled.div`
  font-size: 1.3rem;
  font-weight: 700;
  color: #ffffff;
  line-height: 1;
`;

const StatName = styled.div`
  font-size: 0.68rem;
  color: rgba(255,255,255,0.5);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const StatDivider = styled.div`
  width: 1px;
  height: 28px;
  background: rgba(255,255,255,0.12);
`;

/* ─── Controls ───────────────────────────────────────────── */
const ControlsBar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const SearchBox = styled.div`
  position: relative;
`;

const SearchIconWrap = styled.div`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 0.85rem;
  pointer-events: none;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font-size: 0.9rem;
  background: #ffffff;
  color: #1a1a1a;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &:focus {
    outline: none;
    border-color: #D4882A;
    box-shadow: 0 0 0 3px rgba(212,136,42,0.12);
  }

  &::placeholder { color: #9ca3af; }
`;

const FilterPills = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const FilterPill = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.9rem;
  border-radius: 999px;
  border: 1px solid ${({ $active }) => ($active ? '#D4882A' : '#e5e7eb')};
  background: ${({ $active }) => ($active ? '#fff7ed' : '#ffffff')};
  color: ${({ $active }) => ($active ? '#B8711F' : '#6b7280')};
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;

  svg { font-size: 0.75rem; }

  &:hover {
    border-color: #D4882A;
    color: #B8711F;
    background: #fff7ed;
  }
`;

/* ─── Content Card ───────────────────────────────────────── */
const ContentCard = styled.div`
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid #f0e8d8;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
  overflow: hidden;
`;

/* ─── Table ──────────────────────────────────────────────── */
const TableScroll = styled.div`
  overflow-x: auto;

  @media (max-width: 768px) {
    display: none;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 820px;
`;

const THead = styled.thead`
  background: #fafafa;
  border-bottom: 2px solid #f0e8d8;
`;

const TR = styled.tr`
  border-bottom: 1px solid #f5f5f5;
  background: ${({ $even }) => ($even ? '#ffffff' : '#fdfcfb')};
  transition: background 0.15s ease;

  &:hover {
    background: #fff9f0;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const TH = styled.th`
  padding: 0.85rem 1rem;
  text-align: left;
  font-size: 0.78rem;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
  cursor: ${({ $sortable }) => ($sortable ? 'pointer' : 'default')};
  user-select: none;

  ${({ $sortable }) => $sortable && `
    &:hover { color: #D4882A; }
  `}
`;

const SortIcon = styled.span`
  display: inline-flex;
  align-items: center;
  margin-left: 4px;
  opacity: 0.7;
  font-size: 0.7rem;
`;

const TD = styled.td`
  padding: 0.9rem 1rem;
  vertical-align: middle;
`;

const OrderNum = styled.span`
  font-size: 0.875rem;
  font-weight: 700;
  color: #1a1a1a;
  font-family: 'Courier New', monospace;
`;

const DateText = styled.span`
  font-size: 0.82rem;
  color: #6b7280;
`;

const ItemBadge = styled.span`
  font-size: 0.82rem;
  color: #374151;
  background: #f3f4f6;
  border-radius: 20px;
  padding: 0.2rem 0.6rem;
  font-weight: 500;
`;

const TotalText = styled.span`
  font-size: 0.9rem;
  font-weight: 700;
  color: #B8711F;
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 0.28rem 0.7rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: capitalize;
  white-space: nowrap;
  background: ${({ $bg }) => $bg};
  color: ${({ $fg }) => $fg};
`;

const RefundBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  white-space: nowrap;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 6px rgba(0,0,0,0.08);
  }

  background: ${({ $status }) => {
    switch ($status) {
      case 'approved': case 'completed':  return 'rgba(22,163,74,0.1)';
      case 'pending':  case 'processing': return 'rgba(234,179,8,0.1)';
      case 'rejected':                    return 'rgba(220,38,38,0.1)';
      default:                            return 'rgba(59,130,246,0.08)';
    }
  }};

  color: ${({ $status }) => {
    switch ($status) {
      case 'approved': case 'completed':  return '#16a34a';
      case 'pending':  case 'processing': return '#b45309';
      case 'rejected':                    return '#b91c1c';
      default:                            return '#1d4ed8';
    }
  }};
`;

const TrackingLink = styled.span`
  color: #D4882A;
  cursor: pointer;
  font-size: 0.82rem;
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 2px;

  &:hover { color: #B8711F; }
`;

const TrackingPending = styled.span`
  color: #9ca3af;
  font-style: italic;
  font-size: 0.82rem;
`;

/* ─── Action buttons ─────────────────────────────────────── */
const ActionRow = styled.div`
  display: flex;
  gap: 0.4rem;
`;

const IconBtn = styled.button`
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.15s ease;

  background: ${({ $variant }) => ({
    view:   'rgba(59,130,246,0.1)',
    edit:   'rgba(234,179,8,0.1)',
    delete: 'rgba(220,38,38,0.1)',
  }[$variant] || '#f3f4f6')};

  color: ${({ $variant }) => ({
    view:   '#2563eb',
    edit:   '#b45309',
    delete: '#dc2626',
  }[$variant] || '#374151')};

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 6px rgba(0,0,0,0.1);

    background: ${({ $variant }) => ({
      view:   'rgba(59,130,246,0.2)',
      edit:   'rgba(234,179,8,0.2)',
      delete: 'rgba(220,38,38,0.2)',
    }[$variant] || '#e5e7eb')};
  }
`;

/* ─── Mobile Cards ───────────────────────────────────────── */
const MobileList = styled.div`
  display: none;
  flex-direction: column;
  gap: 0;

  @media (max-width: 768px) {
    display: flex;
  }
`;

const MobileCard = styled.div`
  border-bottom: 1px solid #f0f0f0;
  padding: 1rem;

  &:last-child { border-bottom: none; }
`;

const MobileCardTop = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.85rem;
`;

const MobileOrderMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
`;

const MobileCardBody = styled.div`
  margin-bottom: 0.85rem;
`;

const MobileDetailGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.6rem 1rem;
`;

const MobileDetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  ${({ $full }) => $full && 'grid-column: 1 / -1;'}
`;

const MobileDetailLabel = styled.span`
  font-size: 0.7rem;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const MobileDetailValue = styled.span`
  font-size: 0.85rem;
  font-weight: ${({ $gold }) => ($gold ? 700 : 500)};
  color: ${({ $gold }) => ($gold ? '#B8711F' : '#374151')};
`;

const MobileCardActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const MobileActionBtn = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  padding: 0.5rem;
  border: none;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;

  background: ${({ $variant }) => ({
    view:   'rgba(59,130,246,0.08)',
    edit:   'rgba(234,179,8,0.08)',
    delete: 'rgba(220,38,38,0.08)',
  }[$variant] || '#f3f4f6')};

  color: ${({ $variant }) => ({
    view:   '#2563eb',
    edit:   '#b45309',
    delete: '#dc2626',
  }[$variant] || '#374151')};

  &:hover {
    background: ${({ $variant }) => ({
      view:   'rgba(59,130,246,0.15)',
      edit:   'rgba(234,179,8,0.15)',
      delete: 'rgba(220,38,38,0.15)',
    }[$variant] || '#e5e7eb')};
  }
`;

/* ─── Empty State ────────────────────────────────────────── */
const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 1.5rem;
  color: #9ca3af;
`;

const EmptyIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.35;
`;

const EmptyTitle = styled.h3`
  font-size: 1.1rem;
  color: #374151;
  font-weight: 700;
  margin: 0 0 0.4rem;
`;

const EmptyMsg = styled.p`
  font-size: 0.88rem;
  color: #6b7280;
  margin: 0 0 1.25rem;
`;

const ShopNowLink = styled(Link)`
  display: inline-block;
  padding: 0.65rem 1.5rem;
  background: #D4882A;
  color: #fff;
  border-radius: 10px;
  font-size: 0.88rem;
  font-weight: 700;
  text-decoration: none;
  transition: background 0.2s ease;

  &:hover { background: #B8711F; }
`;

/* ─── Footer ─────────────────────────────────────────────── */
const TableFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 0.85rem 1.25rem;
  border-top: 1px solid #f0e8d8;
  background: #fafafa;
`;

const FooterCount = styled.div`
  font-size: 0.82rem;
  color: #6b7280;

  strong { color: #374151; }
`;
