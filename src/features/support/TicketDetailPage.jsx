import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaPaperclip, FaSpinner, FaUser, FaUserShield } from 'react-icons/fa';
import styled from 'styled-components';
import { useTicketDetail, useReplyToTicket } from '../../shared/hooks/useSupport';
import { STATUS_COLORS, PRIORITY_COLORS } from './supportTypes';
import { ErrorState } from '../../components/loading';

const Container = styled.div`
  max-width: 100rem;
  margin: 0 auto;
  padding: 3rem 2rem;
  min-height: 100vh;
  background: #fafbfc;
`;

const BackButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  background: transparent;
  border: 1px solid #e2e8f0;
  color: #64748b;
  padding: 0.8rem 1.6rem;
  border-radius: 0.8rem;
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  margin-bottom: 2.4rem;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #00C896;
    color: #00C896;
  }
`;

const TicketHeader = styled.div`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 1.2rem;
  padding: 2.4rem;
  margin-bottom: 2.4rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const TicketTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 1.6rem 0;
`;

const TicketMeta = styled.div`
  display: flex;
  gap: 1.6rem;
  flex-wrap: wrap;
  margin-bottom: 1.6rem;
`;

const MetaItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

const MetaLabel = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const MetaValue = styled.span`
  font-size: 0.9375rem;
  font-weight: 500;
  color: #1a202c;
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

const MessagesContainer = styled.div`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 1.2rem;
  padding: 2.4rem;
  margin-bottom: 2.4rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const MessagesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-bottom: 2.4rem;
`;

const MessageBubble = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  align-items: ${props => props.$isUser ? 'flex-end' : 'flex-start'};
`;

const MessageContent = styled.div`
  max-width: 70%;
  padding: 1.2rem 1.6rem;
  border-radius: 1.2rem;
  background: ${props => props.$isUser ? '#00C896' : '#f1f5f9'};
  color: ${props => props.$isUser ? '#ffffff' : '#1a202c'};
  font-size: 0.9375rem;
  line-height: 1.6;
`;

const MessageHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 0.4rem;
`;

const MessageTime = styled.span`
  font-size: 0.75rem;
  color: #94a3b8;
`;

const ReplyForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  padding-top: 2.4rem;
  border-top: 1px solid #e2e8f0;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 12rem;
  padding: 1.2rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.8rem;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #00C896;
    box-shadow: 0 0 0 3px rgba(0, 200, 150, 0.1);
  }
`;

const SubmitButton = styled(motion.button)`
  align-self: flex-start;
  background: #00C896;
  color: #ffffff;
  border: none;
  padding: 1.2rem 2.4rem;
  border-radius: 0.8rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  
  &:hover:not(:disabled) {
    background: #00A67E;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 200, 150, 0.3);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 6rem 2rem;
  color: #64748b;
`;

/**
 * Ticket Detail Page (Buyer)
 */
const TicketDetailPage = () => {
  const { id } = useParams();
  
  // Guard against missing ticket id
  if (!id) {
    return (
      <Container>
        <ErrorState
          title="Ticket ID Missing"
          message="Ticket ID is required. Please go back and try again."
        />
      </Container>
    );
  }
  
  const navigate = useNavigate();
  const [replyMessage, setReplyMessage] = useState('');

  const { data, isLoading, error } = useTicketDetail(id);
  const replyMutation = useReplyToTicket();

  const ticket = data?.data?.ticket;
  const messages = data?.data?.messages || [];

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;

    try {
      await replyMutation.mutateAsync({
        ticketId: id,
        replyData: { message: replyMessage },
      });
      setReplyMessage('');
    } catch (error) {
      // Error handled by hook
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
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

  const isClosed = ticket?.status === 'closed' || ticket?.status === 'resolved';

  if (isLoading) {
    return (
      <Container>
        <LoadingState>Loading ticket...</LoadingState>
      </Container>
    );
  }

  if (error || !ticket) {
    return (
      <Container>
        <ErrorState
          title="Ticket not found"
          message="The ticket you're looking for doesn't exist or you don't have permission to view it."
        />
      </Container>
    );
  }

  return (
    <Container>
      <BackButton
        onClick={() => navigate('/support/tickets')}
        whileHover={{ x: -4 }}
        transition={{ duration: 0.2 }}
      >
        <FaArrowLeft />
        Back to Tickets
      </BackButton>

      <TicketHeader>
        <TicketTitle>{ticket.title}</TicketTitle>
        <TicketMeta>
          <MetaItem>
            <MetaLabel>Ticket Number</MetaLabel>
            <MetaValue>{ticket.ticketNumber}</MetaValue>
          </MetaItem>
          <MetaItem>
            <MetaLabel>Department</MetaLabel>
            <MetaValue>{ticket.department}</MetaValue>
          </MetaItem>
          <MetaItem>
            <MetaLabel>Created</MetaLabel>
            <MetaValue>{formatDate(ticket.createdAt)}</MetaValue>
          </MetaItem>
          <MetaItem>
            <MetaLabel>Status</MetaLabel>
            {getStatusBadge(ticket.status)}
          </MetaItem>
          <MetaItem>
            <MetaLabel>Priority</MetaLabel>
            {getPriorityBadge(ticket.priority)}
          </MetaItem>
        </TicketMeta>
      </TicketHeader>

      <MessagesContainer>
        <MessagesList>
          {messages.map((message) => {
            const isUser = message.senderRole === 'buyer';
            return (
              <MessageBubble key={message._id} $isUser={isUser}>
                <MessageHeader>
                  {isUser ? <FaUser /> : <FaUserShield />}
                  <span>{message.senderName}</span>
                  <span>•</span>
                  <MessageTime>{formatDate(message.createdAt)}</MessageTime>
                </MessageHeader>
                <MessageContent $isUser={isUser}>
                  {message.message}
                </MessageContent>
              </MessageBubble>
            );
          })}
        </MessagesList>

        {!isClosed && (
          <ReplyForm onSubmit={handleSubmitReply}>
            <TextArea
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              placeholder="Type your reply here..."
              disabled={replyMutation.isPending}
            />
            <SubmitButton
              type="submit"
              disabled={!replyMessage.trim() || replyMutation.isPending}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {replyMutation.isPending ? (
                <>
                  <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
                  Sending...
                </>
              ) : (
                'Send Reply'
              )}
            </SubmitButton>
          </ReplyForm>
        )}

        {isClosed && (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
            This ticket is {ticket.status}. You can no longer reply to it.
          </div>
        )}
      </MessagesContainer>
    </Container>
  );
};

export default TicketDetailPage;

