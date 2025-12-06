import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { 
  FaBell, 
  FaShoppingCart, 
  FaTruck, 
  FaMoneyBillWave, 
  FaHeadset, 
  FaBox,
  FaCheckCircle,
  FaExclamationCircle,
  FaUndo,
  FaChevronRight,
  FaTrash
} from 'react-icons/fa';
import { useNotifications, useMarkAsRead, useDeleteNotification } from '../hooks/notifications/useNotifications';
import { PATHS } from '../../routes/routePaths';

const NotificationDropdown = ({ unreadCount }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const { data: notificationsData } = useNotifications({ 
    limit: 5
    // Show recent notifications (both read and unread)
  });
  const markAsRead = useMarkAsRead();
  const deleteNotification = useDeleteNotification();

  const notifications = notificationsData?.data?.notifications || [];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

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
        return 'var(--color-primary-500, #007bff)';
      case 'delivery':
        return 'var(--color-blue-500, #17a2b8)';
      case 'refund':
      case 'return':
        return 'var(--color-orange-500, #ffc107)';
      case 'support':
        return 'var(--color-purple-500, #6f42c1)';
      case 'product':
        return 'var(--color-green-500, #28a745)';
      default:
        return 'var(--color-grey-500, #6c757d)';
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead.mutate(notification._id);
    }

    setIsOpen(false);

    // Navigate based on actionUrl or metadata
    let targetPath = null;

    try {
      if (notification.actionUrl) {
        // Use actionUrl from backend
        targetPath = notification.actionUrl;
      } else if (notification.metadata?.orderId) {
        targetPath = `/orders/${notification.metadata.orderId}`;
      } else if (notification.metadata?.ticketId) {
        targetPath = `/support/${notification.metadata.ticketId}`;
      } else if (notification.metadata?.productId) {
        targetPath = `/product/${notification.metadata.productId}`;
      }

      if (targetPath) {
        console.log('[NotificationDropdown] Navigating to:', targetPath, 'from notification:', {
          id: notification._id,
          type: notification.type,
          actionUrl: notification.actionUrl,
          metadata: notification.metadata
        });
        navigate(targetPath);
      } else {
        console.warn('[NotificationDropdown] No valid navigation path for notification:', notification);
        // Fallback to home page
        navigate(PATHS.HOME);
      }
    } catch (error) {
      console.error('[NotificationDropdown] Error navigating:', error, 'notification:', notification);
      // Fallback to home page on error
      navigate(PATHS.HOME);
    }
  };

  // Debug: Log unreadCount to verify it's being passed correctly
  useEffect(() => {
    console.log('[EazMain NotificationDropdown] 🔔 unreadCount prop:', {
      unreadCount,
      type: typeof unreadCount,
      isNumber: typeof unreadCount === 'number',
      isGreaterThanZero: unreadCount > 0,
      willShowBadge: unreadCount > 0,
    });
  }, [unreadCount]);

  return (
    <DropdownContainer ref={dropdownRef}>
      <IconButton onClick={() => setIsOpen(!isOpen)} title="Notifications">
        <FaBell />
        {unreadCount > 0 && (
          <NotificationBadge>{unreadCount > 99 ? '99+' : unreadCount}</NotificationBadge>
        )}
      </IconButton>

      {isOpen && (
        <DropdownMenu>
          <DropdownHeader>
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <UnreadBadge>{unreadCount} unread</UnreadBadge>
            )}
          </DropdownHeader>

          <NotificationsList>
            {notifications.length === 0 ? (
              <EmptyState>
                <FaBell />
                <p>No new notifications</p>
              </EmptyState>
            ) : (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification._id}
                  unread={!notification.read}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <IconWrapper color={getNotificationColor(notification.type)}>
                    {getNotificationIcon(notification.type)}
                  </IconWrapper>
                  <NotificationContent>
                    <NotificationTitle>{notification.title}</NotificationTitle>
                    <NotificationMessage>{notification.message}</NotificationMessage>
                    <NotificationTime>{formatTime(notification.createdAt)}</NotificationTime>
                  </NotificationContent>
                  <NotificationActions>
                    {!notification.read && <UnreadDot />}
                    <DeleteButton
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Delete this notification?')) {
                          deleteNotification.mutate(notification._id);
                        }
                      }}
                      title="Delete notification"
                    >
                      <FaTrash />
                    </DeleteButton>
                  </NotificationActions>
                </NotificationItem>
              ))
            )}
          </NotificationsList>

          <DropdownFooter>
            <ViewAllButton onClick={() => {
              setIsOpen(false);
              navigate(PATHS.NOTIFICATION);
            }}>
              View All Notifications <FaChevronRight />
            </ViewAllButton>
          </DropdownFooter>
        </DropdownMenu>
      )}
    </DropdownContainer>
  );
};

const DropdownContainer = styled.div`
  position: relative;
`;

const IconButton = styled.button`
  position: relative;
  background: transparent;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;
  color: var(--color-grey-700, #374151);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: var(--color-grey-100, #f3f4f6);
    color: var(--color-primary-500, #007bff);
  }
`;

const NotificationBadge = styled.span`
  position: absolute;
  top: -2px;
  right: -2px;
  background: var(--color-red-600, #dc2626);
  color: white;
  font-size: 10px;
  font-weight: 600;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  z-index: 10;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  border: 2px solid white;
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 380px;
  max-height: 500px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  border: 1px solid var(--color-grey-200, #e5e7eb);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  @media (max-width: 768px) {
    width: 320px;
    right: -10px;
  }
`;

const DropdownHeader = styled.div`
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--color-grey-200, #e5e7eb);
  display: flex;
  justify-content: space-between;
  align-items: center;

  h3 {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--color-grey-900, #111827);
  }
`;

const UnreadBadge = styled.span`
  background: var(--color-primary-500, #007bff);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
`;

const NotificationsList = styled.div`
  max-height: 400px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

const NotificationItem = styled.div`
  padding: 1rem 1.25rem;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  cursor: pointer;
  transition: background 0.2s;
  position: relative;
  border-bottom: 1px solid var(--color-grey-100, #f3f4f6);

  ${props => props.unread && `
    background: var(--color-primary-50, #f0f7ff);
    border-left: 3px solid var(--color-primary-500, #007bff);
  `}

  &:hover {
    background: var(--color-grey-50, #f9fafb);
  }

  &:last-child {
    border-bottom: none;
  }
`;

const IconWrapper = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.color || '#e0e0e0'};
  color: white;
  flex-shrink: 0;
  font-size: 1rem;
`;

const NotificationContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const NotificationTitle = styled.h4`
  margin: 0 0 0.25rem 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-grey-900, #111827);
`;

const NotificationMessage = styled.p`
  margin: 0 0 0.25rem 0;
  color: var(--color-grey-600, #4b5563);
  font-size: 0.8125rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const NotificationTime = styled.span`
  color: var(--color-grey-500, #6b7280);
  font-size: 0.75rem;
`;

const UnreadDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-primary-500, #007bff);
  flex-shrink: 0;
  margin-top: 0.5rem;
`;

const NotificationActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
`;

const DeleteButton = styled.button`
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: var(--color-grey-500, #6b7280);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.75rem;
  opacity: 0.6;

  &:hover {
    background: var(--color-red-100, #fee2e2);
    color: var(--color-red-600, #dc2626);
    opacity: 1;
  }
`;

const EmptyState = styled.div`
  padding: 3rem 1.25rem;
  text-align: center;
  color: var(--color-grey-500, #6b7280);

  svg {
    font-size: 2.5rem;
    margin-bottom: 0.75rem;
    opacity: 0.3;
  }

  p {
    margin: 0;
    font-size: 0.875rem;
  }
`;

const DropdownFooter = styled.div`
  padding: 0.75rem 1.25rem;
  border-top: 1px solid var(--color-grey-200, #e5e7eb);
  background: var(--color-grey-50, #f9fafb);
`;

const ViewAllButton = styled.button`
  width: 100%;
  padding: 0.625rem;
  background: transparent;
  border: none;
  color: var(--color-primary-500, #007bff);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-radius: 6px;
  transition: background 0.2s;

  &:hover {
    background: var(--color-primary-50, #f0f7ff);
  }
`;

export default NotificationDropdown;

