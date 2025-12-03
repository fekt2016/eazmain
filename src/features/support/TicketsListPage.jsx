import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaPlus, FaSearch, FaFilter, FaTicketAlt, FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import styled from 'styled-components';
import { useMyTickets } from '../../shared/hooks/useSupport';
import { STATUS_COLORS, PRIORITY_COLORS } from './supportTypes';
import { PATHS } from '../../routes/routePaths';

const Container = styled.div`
  max-width: 120rem;
  margin: 0 auto;
  padding: 3rem 2rem;
  min-height: 100vh;
  background: #fafbfc;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3rem;
  flex-wrap: wrap;
  gap: 1.6rem;
`;

const Title = styled.h1`
  font-size: 2.4rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0;
`;

const CreateButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  background: #00C896;
  color: #ffffff;
  border: none;
  padding: 1.2rem 2.4rem;
  border-radius: 0.8rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #00A67E;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 200, 150, 0.3);
  }
`;

const FiltersBar = styled.div`
  display: flex;
  gap: 1.6rem;
  margin-bottom: 2.4rem;
  flex-wrap: wrap;
  align-items: center;
`;

const SearchInput = styled.div`
  position: relative;
  flex: 1;
  min-width: 20rem;
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 1.2rem;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem 1rem 1rem 4rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.8rem;
  font-size: 1rem;
  background: #ffffff;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #00C896;
    box-shadow: 0 0 0 3px rgba(0, 200, 150, 0.1);
  }
`;

const FilterSelect = styled.select`
  padding: 1rem 1.2rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.8rem;
  font-size: 1rem;
  background: #ffffff;
  cursor: pointer;
  min-width: 15rem;
  
  &:focus {
    outline: none;
    border-color: #00C896;
  }
`;

const TicketsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.6rem;
`;

const TicketCard = styled(motion.div)`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 1.2rem;
  padding: 2.4rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  
  &:hover {
    border-color: #00C896;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const TicketHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.2rem;
  gap: 1.6rem;
`;

const TicketLeft = styled.div`
  flex: 1;
  min-width: 0;
`;

const TicketNumber = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 0.4rem;
`;

const TicketTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 0.8rem 0;
  line-height: 1.3;
`;

const TicketMeta = styled.div`
  display: flex;
  gap: 1.6rem;
  flex-wrap: wrap;
  font-size: 0.875rem;
  color: #64748b;
`;

const TicketRight = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.8rem;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.4rem 0.8rem;
  border-radius: 0.4rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
  background: ${props => props.$bgColor || '#e2e8f0'};
  color: ${props => props.$color || '#1a202c'};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 6rem 2rem;
  background: #ffffff;
  border-radius: 1.2rem;
  border: 1px solid #e2e8f0;
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  color: #cbd5e1;
  margin-bottom: 1.6rem;
`;

const EmptyTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0 0 0.8rem 0;
`;

const EmptyText = styled.p`
  font-size: 1rem;
  color: #64748b;
  margin: 0 0 2.4rem 0;
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 6rem 2rem;
  color: #64748b;
`;

/**
 * Tickets List Page (Buyer)
 */
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

  // Filter by search query
  const filteredTickets = tickets.filter((ticket) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      ticket.title?.toLowerCase().includes(query) ||
      ticket.ticketNumber?.toLowerCase().includes(query) ||
      ticket.department?.toLowerCase().includes(query)
    );
  });

  const handleTicketClick = (ticketId) => {
    navigate(`/support/tickets/${ticketId}`);
  };

  const handleCreateTicket = () => {
    navigate('/support');
  };

  const getStatusBadge = (status) => {
    const colors = STATUS_COLORS[status] || '#6B7280';
    return (
      <Badge $bgColor={`${colors}15`} $color={colors}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const getPriorityBadge = (priority) => {
    const colors = PRIORITY_COLORS[priority] || '#6B7280';
    return (
      <Badge $bgColor={`${colors}15`} $color={colors}>
        {priority}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <Container>
        <LoadingState>Loading tickets...</LoadingState>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <EmptyState>
          <EmptyTitle>Error loading tickets</EmptyTitle>
          <EmptyText>Please try again later.</EmptyText>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>My Support Tickets</Title>
        <CreateButton
          onClick={handleCreateTicket}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <FaPlus />
          Create New Ticket
        </CreateButton>
      </Header>

      <FiltersBar>
        <SearchInput>
          <SearchIcon>
            <FaSearch />
          </SearchIcon>
          <Input
            type="text"
            placeholder="Search tickets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </SearchInput>
        <FilterSelect
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="awaiting_user">Awaiting Response</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </FilterSelect>
        <FilterSelect
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
        >
          <option value="">All Departments</option>
          <option value="Orders & Delivery">Orders & Delivery</option>
          <option value="Payments & Billing">Payments & Billing</option>
          <option value="Shipping & Returns">Shipping & Returns</option>
          <option value="Account & Profile">Account & Profile</option>
        </FilterSelect>
      </FiltersBar>

      {filteredTickets.length === 0 ? (
        <EmptyState>
          <EmptyIcon>
            <FaTicketAlt />
          </EmptyIcon>
          <EmptyTitle>No tickets found</EmptyTitle>
          <EmptyText>
            {searchQuery || statusFilter || departmentFilter
              ? 'Try adjusting your filters'
              : "You haven't created any support tickets yet."}
          </EmptyText>
          {!searchQuery && !statusFilter && !departmentFilter && (
            <CreateButton
              onClick={handleCreateTicket}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FaPlus />
              Create Your First Ticket
            </CreateButton>
          )}
        </EmptyState>
      ) : (
        <TicketsList>
          {filteredTickets.map((ticket) => (
            <TicketCard
              key={ticket._id}
              onClick={() => handleTicketClick(ticket._id)}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <TicketHeader>
                <TicketLeft>
                  <TicketNumber>{ticket.ticketNumber}</TicketNumber>
                  <TicketTitle>{ticket.title}</TicketTitle>
                  <TicketMeta>
                    <span>{ticket.department}</span>
                    <span>•</span>
                    <span>{formatDate(ticket.createdAt)}</span>
                    {ticket.lastMessageAt && (
                      <>
                        <span>•</span>
                        <span>Last updated: {formatDate(ticket.lastMessageAt)}</span>
                      </>
                    )}
                  </TicketMeta>
                </TicketLeft>
                <TicketRight>
                  {getStatusBadge(ticket.status)}
                  {getPriorityBadge(ticket.priority)}
                </TicketRight>
              </TicketHeader>
            </TicketCard>
          ))}
        </TicketsList>
      )}
    </Container>
  );
};

export default TicketsListPage;

