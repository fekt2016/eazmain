import api from '../api';

/**
 * Notification API Service for EazMain (Buyer App)
 * All endpoints use the shared backend notification API
 */

// Get all notifications for the authenticated user
// Backend should NOT filter - we filter on frontend
export const getNotifications = async (params = {}) => {
  const { type, read, page = 1, limit = 50, sort = '-createdAt' } = params;
  const queryParams = new URLSearchParams();
  
  if (type) queryParams.append('type', type);
  // Convert boolean to string for query params
  if (read !== undefined) {
    queryParams.append('read', read === true ? 'true' : read === false ? 'false' : read);
  }
  queryParams.append('page', page);
  queryParams.append('limit', limit);
  if (sort) queryParams.append('sort', sort);

  const response = await api.get(`/notifications?${queryParams.toString()}`);
  return response.data;
};

// Get unread notification count
export const getUnreadCount = async () => {
  try {
    console.log('[EazMain NotificationAPI] 🔍 Fetching unread count...');
    const response = await api.get('/notifications/unread');
    console.log('[EazMain NotificationAPI] ✅ getUnreadCount response:', {
      fullResponse: response,
      responseData: response.data,
      unreadCount: response.data?.data?.unreadCount,
      status: response.data?.status,
    });
    return response.data;
  } catch (error) {
    console.error('[EazMain NotificationAPI] ❌ Error fetching unread count:', {
      error,
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
};

// Get single notification by ID
export const getNotification = async (id) => {
  const response = await api.get(`/notifications/${id}`);
  return response.data;
};

// Mark a notification as read
export const markAsRead = async (id) => {
  const response = await api.patch(`/notifications/read/${id}`);
  return response.data;
};

// Mark all notifications as read
export const markAllAsRead = async () => {
  const response = await api.patch('/notifications/read-all');
  return response.data;
};

// Delete a notification
export const deleteNotification = async (id) => {
  const response = await api.delete(`/notifications/${id}`);
  return response.data;
};

// Delete multiple notifications by IDs
export const deleteMultipleNotifications = async (ids) => {
  const response = await api.delete('/notifications/bulk', {
    data: { ids },
  });
  return response.data;
};

// Delete all notifications for the authenticated user
export const deleteAllNotifications = async () => {
  const response = await api.delete('/notifications/all');
  return response.data;
};

