import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteMultipleNotifications,
  deleteAllNotifications,
} from '../../services/notifications/notificationApi';
import useAuth from '../useAuth';

/**
 * Hook to get all notifications
 * SECURITY: Only runs when user is authenticated and auth is ready
 * CRITICAL FIX: Added isLoading check to prevent fetching during auth initialization
 */
export const useNotifications = (params = {}) => {
  const { isAuthenticated, userData, isLoading: isAuthLoading } = useAuth();
  
  // Extract user from userData to check if user actually exists
  const user = userData?.data?.data || userData?.data?.user || userData?.user || userData;
  
  // CRITICAL FIX: Only enable when auth is ready (not loading) and user exists
  // This prevents 401 errors during auth initialization
  const isEnabled = Boolean(
    !isAuthLoading && // Auth must be ready (not loading)
    isAuthenticated && // User must be authenticated
    user && // User data must exist
    (user.id || user._id) // User must have an ID
  );
  
  return useQuery({
    queryKey: ['notifications', params],
    queryFn: () => getNotifications(params),
    enabled: isEnabled, // Only run when authenticated, auth ready, and user exists
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false, // FIX: Prevent refetch on tab switch to avoid reload loops
    retry: (failureCount, error) => {
      // CRITICAL FIX: Don't retry on 401 errors (auth failure)
      // This prevents infinite retry loops when auth is invalid
      if (error?.response?.status === 401) {
        return false;
      }
      // Retry network errors up to 2 times
      return failureCount < 2;
    },
  });
};

/**
 * Hook to get unread notification count
 * FIX: Updated settings to ensure count updates immediately
 * SECURITY: Only runs when user is authenticated and auth is ready
 * CRITICAL FIX: Added isLoading check to prevent fetching during auth initialization
 */
export const useUnreadCount = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated, userData, isLoading: isAuthLoading } = useAuth();
  
  // Extract user from userData to check if user actually exists
  const user = userData?.data?.data || userData?.data?.user || userData?.user || userData;
  
  // CRITICAL FIX: Only enable when auth is ready (not loading) and user exists
  // This prevents 401 errors during auth initialization
  // Also check that userData is not null/undefined (not just falsy)
  const hasValidUser = user && 
                      typeof user === 'object' && 
                      !Array.isArray(user) &&
                      (user.id || user._id) &&
                      (user.email || user.name || user.phone); // At least one identifying field
  
  const isEnabled = Boolean(
    !isAuthLoading && // Auth must be ready (not loading)
    isAuthenticated === true && // User must be authenticated
    hasValidUser // User must be valid
  );
  
  const query = useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: async () => {
      console.log('[EazMain useUnreadCount] 🔄 Query function called');
      try {
        const data = await getUnreadCount();
        console.log('[EazMain useUnreadCount] ✅ Query function returned:', {
          data,
          unreadCount: data?.data?.unreadCount,
          status: data?.status,
        });
        // Ensure response structure is consistent
        // Normalize the response to always have the same structure
        return {
          status: data?.status || 'success',
          data: {
            unreadCount: data?.data?.unreadCount ?? data?.unreadCount ?? 0,
          },
        };
      } catch (error) {
        // If 401, user is not authenticated - return zero count instead of throwing
        if (error?.response?.status === 401) {
          console.log('[EazMain useUnreadCount] ⚠️ 401 error - user not authenticated, returning zero count');
          return {
            status: 'success',
            data: {
              unreadCount: 0,
            },
          };
        }
        // If network error (backend unreachable), return zero count so UI doesn't break
        if (error?.code === 'ERR_NETWORK' || !error?.response) {
          console.warn('[EazMain useUnreadCount] ⚠️ Network error - backend may be down, returning zero count');
          return {
            status: 'success',
            data: {
              unreadCount: 0,
            },
          };
        }
        // Re-throw other errors
        throw error;
      }
    },
    enabled: isEnabled, // Only run when authenticated and user exists
    staleTime: 0, // Always consider stale to ensure fresh data
    refetchOnMount: true, // Refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchInterval: isEnabled ? 30000 : false, // Only poll when authenticated
    refetchIntervalInBackground: false, // Don't refetch when tab is in background
    retry: (failureCount, error) => {
      // Don't retry on 401 (auth failure)
      if (error?.response?.status === 401) {
        return false;
      }
      // Don't retry on network errors (backend down) to avoid console spam
      if (error?.code === 'ERR_NETWORK' || !error?.response) {
        return false;
      }
      return failureCount < 2;
    },
  });

  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    console.log('[EazMain useUnreadCount] 📊 Query state:', {
      isLoading: query.isLoading,
      isError: query.isError,
      error: query.error,
      data: query.data,
      unreadCount: query.data?.data?.unreadCount,
      status: query.status,
    });
  }

  return query;
};

/**
 * Hook to mark a notification as read
 * FIX: Optimistically update unread count immediately
 * CRITICAL: Update cache so notification disappears from dropdown if unread remain
 */
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAsRead,
    onMutate: async (notificationId) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      await queryClient.cancelQueries({ queryKey: ['notifications', 'unread'] });

      // Snapshot the previous values
      const previousNotifications = queryClient.getQueriesData({ queryKey: ['notifications'] });
      const previousUnreadCount = queryClient.getQueryData(['notifications', 'unread']);

      // STEP 4: Optimistically update cache - mark notification as read
      // CRITICAL: This removes the notification from dropdown immediately if unread remain
      queryClient.setQueriesData({ queryKey: ['notifications'] }, (oldData) => {
        if (!oldData) return oldData;
        
        const updatedData = { ...oldData };
        if (updatedData.data?.notifications) {
          // Mark notification as read. Set both read and isRead (backend returns read; dropdown checks both)
          updatedData.data.notifications = updatedData.data.notifications.map((notif) =>
            notif._id === notificationId
              ? { ...notif, read: true, isRead: true, readAt: new Date().toISOString() }
              : notif
          );
        }
        return updatedData;
      });

      // Optimistically update unread count
      queryClient.setQueryData(['notifications', 'unread'], (oldData) => {
        if (!oldData) return oldData;
        
        const currentCount = oldData?.data?.unreadCount ?? oldData?.unreadCount ?? 0;
        const newCount = Math.max(0, currentCount - 1);
        
        return {
          ...oldData,
          data: {
            ...oldData.data,
            unreadCount: newCount,
          },
        };
      });

      // Return context with snapshots for rollback
      return { previousNotifications, previousUnreadCount };
    },
    onSuccess: (data, notificationId) => {
      console.log('[useMarkAsRead] ✅ Notification marked as read:', notificationId, data);
      
      // Invalidate to refetch fresh data (background refetch)
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread'] });
    },
    onError: (error, notificationId, context) => {
      console.error('[useMarkAsRead] ❌ Error marking notification as read:', error);
      
      // Rollback optimistic updates on error
      if (context?.previousNotifications) {
        context.previousNotifications.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      if (context?.previousUnreadCount) {
        queryClient.setQueryData(['notifications', 'unread'], context.previousUnreadCount);
      }
      
      // Invalidate to refetch correct data
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread'] });
    },
  });
};

/**
 * Hook to mark all notifications as read
 * FIX: Optimistically update unread count to 0 immediately
 */
export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllAsRead,
    onSuccess: (data) => {
      console.log('[useMarkAllAsRead] ✅ All notifications marked as read:', data);
      
      // FIX: Optimistically update unread count to 0 immediately
      queryClient.setQueryData(['notifications', 'unread'], (oldData) => {
        if (!oldData) return oldData;
        
        return {
          ...oldData,
          data: {
            ...oldData.data,
            unreadCount: 0,
          },
        };
      });
      
      // Optimistically update all notifications in cache.
      // FIX: Set both read and isRead so dropdown (which filters by isRead) shows them as read
      // immediately. Backend returns only `read` (lean()); dropdown checks isRead.
      queryClient.setQueriesData({ queryKey: ['notifications'] }, (oldData) => {
        if (!oldData) return oldData;
        
        const updatedData = { ...oldData };
        if (updatedData.data?.notifications) {
          updatedData.data.notifications = updatedData.data.notifications.map((notif) => ({
            ...notif,
            read: true,
            isRead: true,
            readAt: new Date(),
          }));
        }
        return updatedData;
      });
      
      // Invalidate to refetch fresh data (background refetch)
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread'] });
    },
    onError: (error) => {
      console.error('[useMarkAllAsRead] ❌ Error marking all notifications as read:', error);
      // Revert optimistic update on error
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread'] });
    },
  });
};

/**
 * Hook to delete a notification
 * FIX: Optimistically update unread count if deleted notification was unread
 */
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteNotification,
    onMutate: async (notificationId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      await queryClient.cancelQueries({ queryKey: ['notifications', 'unread'] });

      // Snapshot previous values
      const previousNotifications = queryClient.getQueryData(['notifications']);
      const previousUnreadCount = queryClient.getQueryData(['notifications', 'unread']);

      // Optimistically remove notification from list
      queryClient.setQueriesData({ queryKey: ['notifications'] }, (oldData) => {
        if (!oldData) return oldData;
        
        const notifications = oldData?.data?.notifications || [];
        const deletedNotification = notifications.find(n => n._id === notificationId);
        
        // Check if deleted notification was unread (check both field names for compatibility)
        const wasUnread = deletedNotification && (
          deletedNotification.isRead === false || 
          deletedNotification.read === false ||
          !deletedNotification.isRead ||
          !deletedNotification.read
        );
        
        // Optimistically update unread count if notification was unread
        if (wasUnread) {
          queryClient.setQueryData(['notifications', 'unread'], (oldUnreadData) => {
            if (!oldUnreadData) return oldUnreadData;
            
            const currentCount = oldUnreadData?.data?.unreadCount ?? oldUnreadData?.unreadCount ?? 0;
            const newCount = Math.max(0, currentCount - 1);
            
            return {
              ...oldUnreadData,
              data: {
                ...oldUnreadData.data,
                unreadCount: newCount,
              },
            };
          });
        }
        
        // Remove notification from list immediately
        return {
          ...oldData,
          data: {
            ...oldData.data,
            notifications: notifications.filter(n => n._id !== notificationId),
          },
        };
      });

      return { previousNotifications, previousUnreadCount };
    },
    onSuccess: (data, notificationId) => {
      console.log('[useDeleteNotification] ✅ Notification deleted:', notificationId, data);
      
      // Invalidate to refetch fresh data (background refetch)
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread'] });
    },
    onError: (error, notificationId, context) => {
      console.error('[useDeleteNotification] ❌ Error deleting notification:', error);
      
      // Revert optimistic updates on error
      if (context?.previousNotifications) {
        queryClient.setQueryData(['notifications'], context.previousNotifications);
      }
      if (context?.previousUnreadCount) {
        queryClient.setQueryData(['notifications', 'unread'], context.previousUnreadCount);
      }
      
      // Invalidate to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread'] });
    },
  });
};

/**
 * Hook to delete multiple notifications
 */
export const useDeleteMultipleNotifications = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMultipleNotifications,
    onMutate: async (ids) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      await queryClient.cancelQueries({ queryKey: ['notifications', 'unread'] });

      // Snapshot previous values
      const previousNotifications = queryClient.getQueryData(['notifications']);
      const previousUnreadCount = queryClient.getQueryData(['notifications', 'unread']);

      // Optimistically remove notifications from list
      queryClient.setQueriesData({ queryKey: ['notifications'] }, (oldData) => {
        if (!oldData) return oldData;
        
        const notifications = oldData?.data?.notifications || [];
        const deletedNotifications = notifications.filter(n => ids.includes(n._id));
        
        // Count how many were unread
        const unreadDeletedCount = deletedNotifications.filter(n => 
          n.isRead === false || n.read === false || !n.isRead || !n.read
        ).length;
        
        // Optimistically update unread count
        if (unreadDeletedCount > 0) {
          queryClient.setQueryData(['notifications', 'unread'], (oldUnreadData) => {
            if (!oldUnreadData) return oldUnreadData;
            
            const currentCount = oldUnreadData?.data?.unreadCount ?? oldUnreadData?.unreadCount ?? 0;
            const newCount = Math.max(0, currentCount - unreadDeletedCount);
            
            return {
              ...oldUnreadData,
              data: {
                ...oldUnreadData.data,
                unreadCount: newCount,
              },
            };
          });
        }
        
        // Remove notifications from list immediately
        return {
          ...oldData,
          data: {
            ...oldData.data,
            notifications: notifications.filter(n => !ids.includes(n._id)),
          },
        };
      });

      return { previousNotifications, previousUnreadCount };
    },
    onSuccess: (data, ids) => {
      console.log('[useDeleteMultipleNotifications] ✅ Notifications deleted:', ids, data);
      
      // Invalidate to refetch fresh data (background refetch)
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread'] });
    },
    onError: (error, ids, context) => {
      console.error('[useDeleteMultipleNotifications] ❌ Error deleting notifications:', error);
      
      // Revert optimistic updates on error
      if (context?.previousNotifications) {
        queryClient.setQueryData(['notifications'], context.previousNotifications);
      }
      if (context?.previousUnreadCount) {
        queryClient.setQueryData(['notifications', 'unread'], context.previousUnreadCount);
      }
      
      // Invalidate to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread'] });
    },
  });
};

/**
 * Hook to delete all notifications
 */
export const useDeleteAllNotifications = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAllNotifications,
    onMutate: async () => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      await queryClient.cancelQueries({ queryKey: ['notifications', 'unread'] });

      // Snapshot previous values
      const previousNotifications = queryClient.getQueryData(['notifications']);
      const previousUnreadCount = queryClient.getQueryData(['notifications', 'unread']);

      // Optimistically clear all notifications
      queryClient.setQueriesData({ queryKey: ['notifications'] }, (oldData) => {
        if (!oldData) return oldData;
        
        return {
          ...oldData,
          data: {
            ...oldData.data,
            notifications: [],
          },
        };
      });

      // Reset unread count to 0
      queryClient.setQueryData(['notifications', 'unread'], (oldUnreadData) => {
        if (!oldUnreadData) return oldUnreadData;
        
        return {
          ...oldUnreadData,
          data: {
            ...oldUnreadData.data,
            unreadCount: 0,
          },
        };
      });

      return { previousNotifications, previousUnreadCount };
    },
    onSuccess: (data) => {
      console.log('[useDeleteAllNotifications] ✅ All notifications deleted:', data);
      
      // Invalidate to refetch fresh data (background refetch)
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread'] });
    },
    onError: (error, context) => {
      console.error('[useDeleteAllNotifications] ❌ Error deleting all notifications:', error);
      
      // Revert optimistic updates on error
      if (context?.previousNotifications) {
        queryClient.setQueryData(['notifications'], context.previousNotifications);
      }
      if (context?.previousUnreadCount) {
        queryClient.setQueryData(['notifications', 'unread'], context.previousUnreadCount);
      }
      
      // Invalidate to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread'] });
    },
  });
};

