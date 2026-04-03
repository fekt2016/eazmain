import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaSearch, FaTicketAlt, FaChevronRight, FaInbox } from 'react-icons/fa';
import styled from 'styled-components';
import { useMyTickets } from '../../shared/hooks/useSupport';
import { STATUS_COLORS, PRIORITY_COLORS } from './supportTypes';
import { PATHS } from '../../routes/routePaths';

// ── Layout ─────────────────────────────────────────────
const Page = styled.div`
  min-height: 100vh;
  background: var(--color-grey-50);
  padding: 32px 24px 60px;
`;

const Inner = styled.div`
  max-width: 860px;
  margin: 0 auto;
`;

// ── Header ─────────────────────────────────────────────
const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
  gap: 16px;
  flex-wrap: wrap;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--color-grey-900);
  margin: 0;
`;

const CreateBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  background: linear-gradient(135deg, #D4882A 0%, #f0a845 100%);
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(212,136,42,0.35);
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 18px rgba(212,136,42,0.45);
  }
`;

// ── Filters ────────────────────────────────────────────
const FiltersRow = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  align-items: center;
`;

const SearchWrap = styled.div`
  position: relative;
  flex: 1;
  min-width: 200px;
`;

const SearchIconWrap = styled.span`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-grey-400);
  font-size: 0.8rem;
  pointer-events: none;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 12px 10px 36px;
  border: 1.5px solid var(--color-grey-200);
  border-radius: 10px;
  font-size: 0.85rem;
  background: #fff;
  outline: none;
  transition: border-color 0.2s;

  &:focus { border-color: var(--color-primary-500); }
  &::placeholder { color: var(--color-grey-400); }
`;

const FilterSelect = styled.select`
  padding: 10px 12px;
  border: 1.5px solid var(--color-grey-200);
  border-radius: 10px;
  font-size: 0.85rem;
  background: #fff;
  cursor: pointer;
  outline: none;
  min-width: 140px;
  color: var(--color-grey-700);

  &:focus { border-color: var(--color-primary-500); }
`;

// ── Tickets ────────────────────────────────────────────
const TicketsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const TicketCard = styled.div`
  background: #fff;
  border: 1.5px solid var(--color-grey-200);
  border-radius: 14px;
  padding: 18px 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 16px;

  &:hover {
    border-color: var(--color-primary-400);
    box-shadow: 0 4px 16px rgba(212,136,42,0.10);
    transform: translateY(-1px);
  }
`;

const TicketIconWrap = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: var(--color-grey-100);
  color: var(--color-grey-400);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
`;

const TicketBody = styled.div`
  flex: 1;
  min-width: 0;
`;

const TicketTop = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
  flex-wrap: wrap;
`;

const TicketNumber = styled.span`
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--color-grey-400);
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const TicketTitle = styled.h3`
  font-size: 0.93rem;
  font-weight: 700;
  color: var(--color-grey-900);
  margin: 0 0 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TicketMeta = styled.div`
  font-size: 0.78rem;
  color: var(--color-grey-400);
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const TicketRight = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  flex-shrink: 0;
`;

const ChevronWrap = styled.span`
  color: var(--color-grey-300);
  font-size: 0.75rem;
  margin-top: 2px;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 3px 9px;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: capitalize;
  background: ${props => props.$bg || 'var(--color-grey-100)'};
  color: ${props => props.$color || 'var(--color-grey-600)'};
`;

// ── Empty State ────────────────────────────────────────
const EmptyCard = styled.div`
  background: #fff;
  border: 1.5px solid var(--color-grey-200);
  border-radius: 16px;
  padding: 64px 24px;
  text-align: center;
`;

const EmptyIconWrap = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: var(--color-grey-100);
  color: var(--color-grey-300);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  margin: 0 auto 20px;
`;

const EmptyTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-grey-800);
  margin: 0 0 6px;
`;

const EmptyText = styled.p`
  font-size: 0.85rem;
  color: var(--color-grey-500);
  margin: 0 0 24px;
`;

const LoadingWrap = styled.div`
  text-align: center;
  padding: 60px 24px;
  color: var(--color-grey-400);
  font-size: 0.9rem;
`;

// ── Component ──────────────────────────────────────────
const TicketsListPage = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading, error } = useMyTickets({
    status: statusFilter || undefined,
    department: departmentFilter || undefined,
  });

  const tickets = data?.data?.tickets || [];

  const filteredTickets = tickets.filter((ticket) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      ticket.title?.toLowerCase().includes(query) ||
      ticket.ticketNumber?.toLowerCase().includes(query) ||
      ticket.department?.toLowerCase().includes(query)
    );
  });

  const handleTicketClick = (ticketId) => navigate(`/support/tickets/${ticketId}`);
  const handleCreateTicket = () => navigate('/support');

  const getStatusBadge = (status) => {
    const color = STATUS_COLORS[status] || '#6B7280';
    return (
      <Badge $bg={`${color}18`} $color={color}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const getPriorityBadge = (priority) => {
    const color = PRIORITY_COLORS[priority] || '#6B7280';
    return (
      <Badge $bg={`${color}18`} $color={color}>
        {priority}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  };

  if (isLoading) return <Page><LoadingWrap>Loading your tickets&hellip;</LoadingWrap></Page>;

  if (error) return (
    <Page>
      <Inner>
        <EmptyCard>
          <EmptyTitle>Couldn&apos;t load tickets</EmptyTitle>
          <EmptyText>Please try again later.</EmptyText>
        </EmptyCard>
      </Inner>
    </Page>
  );

  return (
    <Page>
      <Inner>
        <Header>
          <Title>My Support Tickets</Title>
          <CreateBtn onClick={handleCreateTicket}>
            <FaPlus />
            Create New Ticket
          </CreateBtn>
        </Header>

        <FiltersRow>
          <SearchWrap>
            <SearchIconWrap><FaSearch /></SearchIconWrap>
            <SearchInput
              type="text"
              placeholder="Search tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </SearchWrap>
          <FilterSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="awaiting_user">Awaiting Response</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </FilterSelect>
          <FilterSelect value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}>
            <option value="">All Departments</option>
            <option value="Orders & Delivery">Orders &amp; Delivery</option>
            <option value="Payments & Billing">Payments &amp; Billing</option>
            <option value="Shipping & Returns">Shipping &amp; Returns</option>
            <option value="Account & Profile">Account &amp; Profile</option>
          </FilterSelect>
        </FiltersRow>

        {filteredTickets.length === 0 ? (
          <EmptyCard>
            <EmptyIconWrap>
              {searchQuery || statusFilter || departmentFilter ? <FaSearch /> : <FaInbox />}
            </EmptyIconWrap>
            <EmptyTitle>
              {searchQuery || statusFilter || departmentFilter ? 'No tickets match your filters' : 'No tickets found'}
            </EmptyTitle>
            <EmptyText>
              {searchQuery || statusFilter || departmentFilter
                ? 'Try adjusting your search or filters.'
                : "You haven't created any support tickets yet."}
            </EmptyText>
            {!searchQuery && !statusFilter && !departmentFilter && (
              <CreateBtn onClick={handleCreateTicket}>
                <FaPlus />
                Create Your First Ticket
              </CreateBtn>
            )}
          </EmptyCard>
        ) : (
          <TicketsList>
            {filteredTickets.map((ticket) => (
              <TicketCard key={ticket._id} onClick={() => handleTicketClick(ticket._id)}>
                <TicketIconWrap><FaTicketAlt /></TicketIconWrap>
                <TicketBody>
                  <TicketTop>
                    <TicketNumber>{ticket.ticketNumber}</TicketNumber>
                    <span style={{ color: 'var(--color-grey-300)', fontSize: '0.7rem' }}>·</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-grey-400)' }}>{ticket.department}</span>
                  </TicketTop>
                  <TicketTitle>{ticket.title}</TicketTitle>
                  <TicketMeta>
                    <span>Created {formatDate(ticket.createdAt)}</span>
                    {ticket.lastMessageAt && (
                      <span>· Updated {formatDate(ticket.lastMessageAt)}</span>
                    )}
                  </TicketMeta>
                </TicketBody>
                <TicketRight>
                  {getStatusBadge(ticket.status)}
                  {getPriorityBadge(ticket.priority)}
                  <ChevronWrap><FaChevronRight /></ChevronWrap>
                </TicketRight>
              </TicketCard>
            ))}
          </TicketsList>
        )}
      </Inner>
    </Page>
  );
};

export default TicketsListPage;
