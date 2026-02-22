import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { FaBell, FaCheck, FaCheckDouble, FaTrash, FaShoppingCart, FaTruck, FaMoneyBillWave, FaHeadset, FaBox, FaUndo, FaChevronLeft, FaChevronRight, FaCheckSquare, FaSquare } from 'react-icons/fa';
import { useNotifications, useUnreadCount, useMarkAsRead, useMarkAllAsRead, useDeleteNotification, useDeleteMultipleNotifications, useDeleteAllNotifications } from '../../shared/hooks/notifications/useNotifications';
import { PATHS } from '../../routes/routePaths';
import useDynamicPageTitle from '../../shared/hooks/useDynamicPageTitle';

const BuyerNotificationsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  useDynamicPageTitle({
    title: 'Notifications - Saiisai',
    description: 'View and manage your notifications on Saiisai.',
  });

  // Get pagination from URL params
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = 20; // Items per page

  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectMode, setSelectMode] = useState(false); // Toggle select mode
  const [selectedIds, setSelectedIds] = useState([]); // Selected notification IDs

  const { data: notificationsData, isLoading } = useNotifications({
    read: filter === 'all' ? undefined : filter === 'unread' ? false : true,
    type: typeFilter === 'all' ? undefined : typeFilter,
    page,
    limit,
  });

  const { data: unreadData } = useUnreadCount();
  const unreadCount = unreadData?.data?.unreadCount || 0;

  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const deleteNotification = useDeleteNotification();
  const deleteMultiple = useDeleteMultipleNotifications();
  const deleteAll = useDeleteAllNotifications();

  const notifications = notificationsData?.data?.notifications || [];
  const total = notificationsData?.total || 0;
  const totalPages = Math.ceil(total / limit);
  const currentPage = notificationsData?.page || page;

  // Handle page change
  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset to page 1 when filters change
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    if (page > 1) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set('page', '1');
      setSearchParams(newParams);
    }
  };

  const handleTypeFilterChange = (newTypeFilter) => {
    setTypeFilter(newTypeFilter);
    if (page > 1) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set('page', '1');
      setSearchParams(newParams);
    }
  };

  // Toggle select mode
  const toggleSelectMode = () => {
    setSelectMode(!selectMode);
    setSelectedIds([]); // Clear selection when toggling
  };

  // Toggle individual notification selection
  const toggleNotificationSelection = (notificationId) => {
    setSelectedIds((prev) => {
      if (prev.includes(notificationId)) {
        return prev.filter((id) => id !== notificationId);
      } else {
        return [...prev, notificationId];
      }
    });
  };

  // Select all visible notifications
  const selectAll = () => {
    setSelectedIds(notifications.map((n) => n._id));
  };

  // Deselect all
  const deselectAll = () => {
    setSelectedIds([]);
  };

  // Handle delete selected
  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;

    if (window.confirm(`Delete ${selectedIds.length} selected notification(s)?`)) {
      deleteMultiple.mutate(selectedIds, {
        onSuccess: () => {
          setSelectedIds([]);
          if (selectedIds.length === notifications.length && page > 1) {
            // If all notifications on this page were deleted, go to previous page
            handlePageChange(page - 1);
          }
        },
      });
    }
  };

  // Handle delete all
  const handleDeleteAll = () => {
    if (window.confirm(`Delete all ${total} notifications? This action cannot be undone.`)) {
      deleteAll.mutate(undefined, {
        onSuccess: () => {
          setSelectedIds([]);
          setSelectMode(false);
          // Reset to page 1
          if (page > 1) {
            handlePageChange(1);
          }
        },
      });
    }
  };

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
    console.log('[BuyerNotificationsPage] 🔔 Notification clicked:', {
      id: notification._id,
      type: notification.type,
      read: notification.read,
      actionUrl: notification.actionUrl,
      metadata: notification.metadata,
    });

    // CRITICAL FIX: Navigate immediately, don't wait for markAsRead
    // Navigation should be independent of markAsRead success
    // markAsRead failure must NEVER cause redirect to login
    let targetPath = null;

    // Navigate based on actionUrl or metadata
    if (notification.actionUrl) {
      targetPath = notification.actionUrl;
    } else if (notification.metadata?.orderId) {
      targetPath = `/orders/${notification.metadata.orderId}`;
    } else if (notification.metadata?.ticketId) {
      targetPath = `/support/${notification.metadata.ticketId}`;
    } else if (notification.metadata?.productId) {
      targetPath = `/product/${notification.metadata.productId}`;
    }

    if (targetPath) {
      console.log('[BuyerNotificationsPage] ✅ Navigating to:', targetPath);
      navigate(targetPath);
    } else {
      console.warn('[BuyerNotificationsPage] ⚠️ No valid navigation path for notification:', notification);
    }

    // CRITICAL FIX: Mark as read in background - don't block navigation
    // Support both read and isRead (backend returns only read when using .lean())
    if (!(notification.read ?? notification.isRead)) {
      console.log('[BuyerNotificationsPage] 📝 Marking notification as read in background:', notification._id);
      markAsRead.mutate(notification._id, {
        onError: (error) => {
          console.error('[BuyerNotificationsPage] ❌ Failed to mark notification as read:', error);
          console.warn('[BuyerNotificationsPage] ⚠️ Navigation still succeeded despite markAsRead failure');
          // CRITICAL FIX: Don't redirect to login on markAsRead failure
          // The error is flagged as isNotificationError, so useAuth won't clear auth data
          // Navigation already succeeded, so don't interfere
        },
      });
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
        <HeaderActions>
          {notifications.length > 0 && unreadCount > 0 && (
            <MarkAllReadButton
              onClick={() => markAllAsRead.mutate()}
              disabled={markAllAsRead.isPending}
            >
              <FaCheckDouble />
              Mark All Read
            </MarkAllReadButton>
          )}
          {notifications.length > 0 && (
            <>
              <SelectModeButton
                onClick={toggleSelectMode}
                $active={selectMode}
              >
                {selectMode ? <FaCheckSquare /> : <FaSquare />}
                {selectMode ? 'Cancel' : 'Select'}
              </SelectModeButton>
              {selectMode && selectedIds.length > 0 && (
                <DeleteSelectedButton
                  onClick={handleDeleteSelected}
                  disabled={deleteMultiple.isPending}
                  $danger
                >
                  <FaTrash />
                  Delete Selected ({selectedIds.length})
                </DeleteSelectedButton>
              )}
              {notifications.length > 0 && (
                <DeleteAllButton
                  onClick={handleDeleteAll}
                  disabled={deleteAll.isPending}
                  $danger
                >
                  <FaTrash />
                  Delete All
                </DeleteAllButton>
              )}
            </>
          )}
        </HeaderActions>
      </PageHeader>

      <FiltersSection>
        <FilterGroup>
          <FilterLabel>Status:</FilterLabel>
          <FilterButtons>
            <FilterButton
              $active={filter === 'all'}
              onClick={() => handleFilterChange('all')}
            >
              All
            </FilterButton>
            <FilterButton
              $active={filter === 'unread'}
              onClick={() => handleFilterChange('unread')}
            >
              Unread
            </FilterButton>
            <FilterButton
              $active={filter === 'read'}
              onClick={() => handleFilterChange('read')}
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
              onClick={() => handleTypeFilterChange('all')}
            >
              All
            </FilterButton>
            <FilterButton
              $active={typeFilter === 'order'}
              onClick={() => handleTypeFilterChange('order')}
            >
              Orders
            </FilterButton>
            <FilterButton
              $active={typeFilter === 'delivery'}
              onClick={() => handleTypeFilterChange('delivery')}
            >
              Delivery
            </FilterButton>
            <FilterButton
              $active={typeFilter === 'refund'}
              onClick={() => handleTypeFilterChange('refund')}
            >
              Refunds
            </FilterButton>
            <FilterButton
              $active={typeFilter === 'support'}
              onClick={() => handleTypeFilterChange('support')}
            >
              Support
            </FilterButton>
          </FilterButtons>
        </FilterGroup>
      </FiltersSection>

      {selectMode && notifications.length > 0 && (
        <SelectionBar>
          <SelectionInfo>
            {selectedIds.length > 0 ? (
              <>
                <span>{selectedIds.length} selected</span>
                <SelectionActions>
                  <SelectionButton onClick={selectAll}>Select All</SelectionButton>
                  <SelectionButton onClick={deselectAll}>Deselect All</SelectionButton>
                </SelectionActions>
              </>
            ) : (
              <span>Select notifications to delete</span>
            )}
          </SelectionInfo>
        </SelectionBar>
      )}

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
          {notifications.map((notification) => {
            const isSelected = selectedIds.includes(notification._id);
            return (
              <NotificationItem
                key={notification._id}
                $unread={!(notification.read ?? notification.isRead)}
                $selectMode={selectMode}
                onClick={() => {
                  if (selectMode) {
                    toggleNotificationSelection(notification._id);
                  } else {
                    handleNotificationClick(notification);
                  }
                }}
              >
                {selectMode && (
                  <CheckboxContainer
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleNotificationSelection(notification._id);
                    }}
                  >
                    {isSelected ? <FaCheckSquare /> : <FaSquare />}
                  </CheckboxContainer>
                )}
                <NotificationIcon $color={getNotificationColor(notification.type)}>
                  {getNotificationIcon(notification.type)}
                </NotificationIcon>
                <NotificationContent>
                  <NotificationHeader>
                    <NotificationTitle>{notification.title}</NotificationTitle>
                    {!(notification.read ?? notification.isRead) && <UnreadDot />}
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
                  {!(notification.read ?? notification.isRead) && (
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
            );
          })}
        </NotificationsList>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <PaginationContainer>
          <PaginationInfo>
            Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, total)} of {total} notifications
          </PaginationInfo>
          <PaginationControls>
            <PaginationButton
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              title="Previous page"
            >
              <FaChevronLeft />
              Previous
            </PaginationButton>

            <PageNumbers>
              {(() => {
                const pages = [];
                const maxVisible = 5;

                if (totalPages <= maxVisible) {
                  // Show all pages if total is less than max visible
                  for (let i = 1; i <= totalPages; i++) {
                    pages.push(i);
                  }
                } else {
                  // Show pages around current page
                  let start = Math.max(1, currentPage - 2);
                  let end = Math.min(totalPages, start + maxVisible - 1);

                  // Adjust start if we're near the end
                  if (end - start < maxVisible - 1) {
                    start = Math.max(1, end - maxVisible + 1);
                  }

                  // Add first page and ellipsis if needed
                  if (start > 1) {
                    pages.push(1);
                    if (start > 2) {
                      pages.push('ellipsis-start');
                    }
                  }

                  // Add page range
                  for (let i = start; i <= end; i++) {
                    pages.push(i);
                  }

                  // Add last page and ellipsis if needed
                  if (end < totalPages) {
                    if (end < totalPages - 1) {
                      pages.push('ellipsis-end');
                    }
                    pages.push(totalPages);
                  }
                }

                return pages.map((pageNum, index) => {
                  if (pageNum === 'ellipsis-start' || pageNum === 'ellipsis-end') {
                    return <Ellipsis key={`ellipsis-${index}`}>...</Ellipsis>;
                  }

                  return (
                    <PageNumber
                      key={pageNum}
                      $active={pageNum === currentPage}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </PageNumber>
                  );
                });
              })()}
            </PageNumbers>

            <PaginationButton
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              title="Next page"
            >
              Next
              <FaChevronRight />
            </PaginationButton>
          </PaginationControls>
        </PaginationContainer>
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

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
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

const SelectModeButton = styled.button`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  background: ${(props) => props.$active ? 'var(--color-grey-200)' : 'var(--color-white-0)'};
  color: ${(props) => props.$active ? 'var(--color-grey-900)' : 'var(--color-grey-700)'};
  border: 1px solid var(--color-grey-300);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: var(--transition-base);

  &:hover {
    background: var(--color-grey-100);
    border-color: var(--color-grey-400);
  }
`;

const DeleteSelectedButton = styled.button`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  background: ${(props) => props.$danger ? 'var(--color-red-500)' : 'var(--color-white-0)'};
  color: var(--color-white-0);
  border: none;
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: var(--transition-base);

  &:hover:not(:disabled) {
    background: ${(props) => props.$danger ? 'var(--color-red-600)' : 'var(--color-grey-100)'};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const DeleteAllButton = styled.button`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-white-0);
  color: var(--color-red-600);
  border: 1px solid var(--color-red-300);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: var(--transition-base);

  &:hover:not(:disabled) {
    background: var(--color-red-50);
    border-color: var(--color-red-500);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SelectionBar = styled.div`
  padding: var(--spacing-md);
  background: var(--color-primary-50);
  border: 1px solid var(--color-primary-200);
  border-radius: var(--border-radius-md);
  margin-bottom: var(--spacing-md);
`;

const SelectionInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--font-size-sm);
  color: var(--color-grey-700);
  font-weight: var(--font-medium);
`;

const SelectionActions = styled.div`
  display: flex;
  gap: var(--spacing-sm);
`;

const SelectionButton = styled.button`
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--color-white-0);
  color: var(--primary-700);
  border: 1px solid var(--color-primary-300);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: var(--transition-base);

  &:hover {
    background: var(--color-primary-50);
    border-color: var(--color-primary-500);
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
  cursor: ${(props) => props.$selectMode ? 'default' : 'pointer'};
  transition: var(--transition-base);
  position: relative;

  ${(props) =>
    props.$unread &&
    `
    border-left: 4px solid var(--color-primary-500);
    background: var(--color-primary-50);
  `}

  ${(props) =>
    props.$selectMode &&
    `
    border: 2px solid var(--color-grey-300);
  `}

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transform: ${(props) => props.$selectMode ? 'none' : 'translateY(-1px)'};
  }
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  color: var(--color-primary-500);
  cursor: pointer;
  flex-shrink: 0;
  font-size: var(--font-size-lg);
  
  &:hover {
    color: var(--primary-700);
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

const PaginationContainer = styled.div`
  margin-top: var(--spacing-xl);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--color-grey-200);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  align-items: center;
`;

const PaginationInfo = styled.div`
  font-size: var(--font-size-sm);
  color: var(--color-grey-600);
  text-align: center;
`;

const PaginationControls = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  flex-wrap: wrap;
  justify-content: center;
`;

const PaginationButton = styled.button`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-grey-300);
  background: var(--color-white-0);
  color: var(--color-grey-700);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: var(--transition-base);

  &:hover:not(:disabled) {
    background: var(--color-primary-50);
    border-color: var(--color-primary-500);
    color: var(--primary-700);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PageNumbers = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
`;

const PageNumber = styled.button`
  min-width: 2.5rem;
  height: 2.5rem;
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
    background: ${(props) =>
    props.$active ? 'var(--color-primary-600)' : 'var(--color-primary-50)'};
    border-color: var(--color-primary-500);
    color: ${(props) =>
    props.$active ? 'var(--color-white-0)' : 'var(--color-primary-600)'};
  }
`;

const Ellipsis = styled.span`
  padding: var(--spacing-xs) var(--spacing-sm);
  color: var(--color-grey-500);
  font-size: var(--font-size-sm);
`;

