import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaBell, FaCheck, FaCheckDouble, FaTrash, FaShoppingCart, FaTruck, FaMoneyBillWave, FaHeadset, FaBox, FaUndo } from 'react-icons/fa';
import { useNotifications, useUnreadCount, useMarkAsRead, useMarkAllAsRead, useDeleteNotification } from '../../shared/hooks/notifications/useNotifications';
import { PATHS } from '../../routes/routePaths';

const BuyerNotificationsPage = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'
  const [typeFilter, setTypeFilter] = useState('all');

  const { data: notificationsData, isLoading } = useNotifications({
    read: filter === 'all' ? undefined : filter === 'unread' ? false : true,
    type: typeFilter === 'all' ? undefined : typeFilter,
  });

  const { data: unreadData } = useUnreadCount();
  const unreadCount = unreadData?.data?.unreadCount || 0;

  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const deleteNotification = useDeleteNotification();

  const notifications = notificationsData?.data?.notifications || [];

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order':
        return <FaShoppingCart />;
      case 'delivery':
        return <FaTruck />;
      case 'refund':
      case 'return':
        return <FaUndo />;
      case 'support':
        return <FaHeadset />;
      case 'product':
        return <FaBox />;
      default:
        return <FaBell />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'order':
        return 'var(--color-primary-500)';
      case 'delivery':
        return 'var(--color-blue-500)';
      case 'refund':
      case 'return':
        return 'var(--color-orange-500)';
      case 'support':
        return 'var(--color-purple-500)';
      case 'product':
        return 'var(--color-green-500)';
      default:
        return 'var(--color-grey-500)';
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead.mutate(notification._id);
    }

    // Navigate based on actionUrl or metadata
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    } else if (notification.metadata?.orderId) {
      navigate(`/orders/${notification.metadata.orderId}`);
    } else if (notification.metadata?.ticketId) {
      navigate(`/support/${notification.metadata.ticketId}`);
    } else if (notification.metadata?.productId) {
      navigate(`/product/${notification.metadata.productId}`);
    }
  };

  if (isLoading) {
    return (
      <PageContainer>
        <LoadingSpinner />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader>
        <HeaderContent>
          <TitleSection>
            <h1>Notifications</h1>
            {unreadCount > 0 && (
              <UnreadBadge>{unreadCount} unread</UnreadBadge>
            )}
          </TitleSection>
        </HeaderContent>
        {notifications.length > 0 && unreadCount > 0 && (
          <MarkAllReadButton
            onClick={() => markAllAsRead.mutate()}
            disabled={markAllAsRead.isPending}
          >
            <FaCheckDouble />
            Mark All Read
          </MarkAllReadButton>
        )}
      </PageHeader>

      <FiltersSection>
        <FilterGroup>
          <FilterLabel>Status:</FilterLabel>
          <FilterButtons>
            <FilterButton
              $active={filter === 'all'}
              onClick={() => setFilter('all')}
            >
              All
            </FilterButton>
            <FilterButton
              $active={filter === 'unread'}
              onClick={() => setFilter('unread')}
            >
              Unread
            </FilterButton>
            <FilterButton
              $active={filter === 'read'}
              onClick={() => setFilter('read')}
            >
              Read
            </FilterButton>
          </FilterButtons>
        </FilterGroup>

        <FilterGroup>
          <FilterLabel>Type:</FilterLabel>
          <FilterButtons>
            <FilterButton
              $active={typeFilter === 'all'}
              onClick={() => setTypeFilter('all')}
            >
              All
            </FilterButton>
            <FilterButton
              $active={typeFilter === 'order'}
              onClick={() => setTypeFilter('order')}
            >
              Orders
            </FilterButton>
            <FilterButton
              $active={typeFilter === 'delivery'}
              onClick={() => setTypeFilter('delivery')}
            >
              Delivery
            </FilterButton>
            <FilterButton
              $active={typeFilter === 'refund'}
              onClick={() => setTypeFilter('refund')}
            >
              Refunds
            </FilterButton>
            <FilterButton
              $active={typeFilter === 'support'}
              onClick={() => setTypeFilter('support')}
            >
              Support
            </FilterButton>
          </FilterButtons>
        </FilterGroup>
      </FiltersSection>

      {notifications.length === 0 ? (
        <EmptyState>
          <EmptyIcon>
            <FaBell />
          </EmptyIcon>
          <EmptyTitle>No notifications</EmptyTitle>
          <EmptyMessage>
            {filter === 'unread'
              ? "You're all caught up! No unread notifications."
              : 'You have no notifications yet.'}
          </EmptyMessage>
        </EmptyState>
      ) : (
        <NotificationsList>
          {notifications.map((notification) => (
            <NotificationItem
              key={notification._id}
              $unread={!notification.read}
              onClick={() => handleNotificationClick(notification)}
            >
              <NotificationIcon $color={getNotificationColor(notification.type)}>
                {getNotificationIcon(notification.type)}
              </NotificationIcon>
              <NotificationContent>
                <NotificationHeader>
                  <NotificationTitle>{notification.title}</NotificationTitle>
                  {!notification.read && <UnreadDot />}
                </NotificationHeader>
                <NotificationMessage>{notification.message}</NotificationMessage>
                <NotificationMeta>
                  <NotificationTime>
                    {new Date(notification.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </NotificationTime>
                  <NotificationType>{notification.type}</NotificationType>
                </NotificationMeta>
              </NotificationContent>
              <NotificationActions>
                {!notification.read && (
                  <ActionButton
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsRead.mutate(notification._id);
                    }}
                    title="Mark as read"
                  >
                    <FaCheck />
                  </ActionButton>
                )}
                <ActionButton
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm('Delete this notification?')) {
                      deleteNotification.mutate(notification._id);
                    }
                  }}
                  title="Delete"
                  $danger
                >
                  <FaTrash />
                </ActionButton>
              </NotificationActions>
            </NotificationItem>
          ))}
        </NotificationsList>
      )}
    </PageContainer>
  );
};

export default BuyerNotificationsPage;

// Styled Components
const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-lg);
  
  @media (max-width: 768px) {
    padding: var(--spacing-md);
  }
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  flex-wrap: wrap;
  gap: var(--spacing-md);
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
`;

const TitleSection = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  
  h1 {
    font-size: var(--font-size-2xl);
    font-weight: var(--font-bold);
    color: var(--color-grey-900);
    margin: 0;
  }
`;

const UnreadBadge = styled.span`
  background: var(--color-primary-500);
  color: var(--color-white-0);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-semibold);
`;

const MarkAllReadButton = styled.button`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-primary-500);
  color: var(--color-white-0);
  border: none;
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: var(--transition-base);

  &:hover:not(:disabled) {
    background: var(--color-primary-600);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const FiltersSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-md);
  background: var(--color-white-0);
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--color-grey-200);
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex-wrap: wrap;
`;

const FilterLabel = styled.label`
  font-size: var(--font-size-sm);
  font-weight: var(--font-semibold);
  color: var(--color-grey-700);
  min-width: 4rem;
`;

const FilterButtons = styled.div`
  display: flex;
  gap: var(--spacing-xs);
  flex-wrap: wrap;
`;

const FilterButton = styled.button`
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--color-grey-300);
  background: ${(props) =>
    props.$active ? 'var(--color-primary-500)' : 'var(--color-white-0)'};
  color: ${(props) =>
    props.$active ? 'var(--color-white-0)' : 'var(--color-grey-700)'};
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: var(--transition-base);

  &:hover {
    border-color: var(--color-primary-500);
    background: ${(props) =>
      props.$active ? 'var(--color-primary-600)' : 'var(--color-primary-50)'};
    color: ${(props) =>
      props.$active ? 'var(--color-white-0)' : 'var(--color-primary-600)'};
  }
`;

const NotificationsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
`;

const NotificationItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--color-white-0);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-grey-200);
  cursor: pointer;
  transition: var(--transition-base);
  position: relative;

  ${(props) =>
    props.$unread &&
    `
    border-left: 4px solid var(--color-primary-500);
    background: var(--color-primary-50);
  `}

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
  }
`;

const NotificationIcon = styled.div`
  width: 3rem;
  height: 3rem;
  border-radius: var(--border-radius-md);
  background: ${(props) => props.$color || 'var(--color-grey-200)'};
  color: var(--color-white-0);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-lg);
  flex-shrink: 0;
`;

const NotificationContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
`;

const NotificationHeader = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
`;

const NotificationTitle = styled.h3`
  font-size: var(--font-size-md);
  font-weight: var(--font-semibold);
  color: var(--color-grey-900);
  margin: 0;
`;

const UnreadDot = styled.span`
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: var(--color-primary-500);
`;

const NotificationMessage = styled.p`
  font-size: var(--font-size-sm);
  color: var(--color-grey-700);
  margin: 0;
  line-height: 1.5;
`;

const NotificationMeta = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-xs);
`;

const NotificationTime = styled.span`
  font-size: var(--font-size-xs);
  color: var(--color-grey-500);
`;

const NotificationType = styled.span`
  font-size: var(--font-size-xs);
  color: var(--color-grey-500);
  text-transform: capitalize;
  padding: 0.125rem 0.5rem;
  background: var(--color-grey-100);
  border-radius: var(--border-radius-sm);
`;

const NotificationActions = styled.div`
  display: flex;
  gap: var(--spacing-xs);
  flex-shrink: 0;
`;

const ActionButton = styled.button`
  width: 2rem;
  height: 2rem;
  border: none;
  background: var(--color-grey-100);
  color: ${(props) =>
    props.$danger ? 'var(--color-red-600)' : 'var(--color-grey-700)'};
  border-radius: var(--border-radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--transition-base);

  &:hover {
    background: ${(props) =>
      props.$danger ? 'var(--color-red-100)' : 'var(--color-grey-200)'};
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xxl);
  text-align: center;
`;

const EmptyIcon = styled.div`
  width: 5rem;
  height: 5rem;
  border-radius: 50%;
  background: var(--color-grey-100);
  color: var(--color-grey-400);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin-bottom: var(--spacing-md);
`;

const EmptyTitle = styled.h3`
  font-size: var(--font-size-lg);
  font-weight: var(--font-semibold);
  color: var(--color-grey-900);
  margin-bottom: var(--spacing-sm);
`;

const EmptyMessage = styled.p`
  font-size: var(--font-size-md);
  color: var(--color-grey-600);
  margin: 0;
`;

const LoadingSpinner = styled.div`
  width: 3rem;
  height: 3rem;
  border: 3px solid var(--color-grey-200);
  border-top-color: var(--color-primary-500);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: var(--spacing-xxl) auto;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

