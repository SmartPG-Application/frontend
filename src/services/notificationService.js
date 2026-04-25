import axios from 'axios';

const API_URL = import.meta.env.PROD ? '' : (import.meta.env.VITE_NOTIFICATION_SERVICE_URL || 'http://localhost:4005');

const getAuthHeader = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user && user.token ? { Authorization: `Bearer ${user.token}` } : {};
};

export const notificationService = {
  getAllNotifications: async () => {
    const response = await axios.get(`${API_URL}/api/notifications/all`, { headers: getAuthHeader() });
    return response.data;
  },

  getNotifications: async (tenantId) => {
    if (!tenantId || tenantId === 'undefined') return [];
    const response = await axios.get(`${API_URL}/api/notifications/${tenantId}`, { headers: getAuthHeader() });
    return response.data;
  },

  getUnreadCount: async (tenantId) => {
    if (!tenantId || tenantId === 'undefined') return { count: 0 };
    const response = await axios.get(`${API_URL}/api/notifications/count/${tenantId}`, { headers: getAuthHeader() });
    return response.data;
  },

  markAsRead: async (id) => {
    const response = await axios.put(`${API_URL}/api/notifications/${id}/read`, {}, { headers: getAuthHeader() });
    return response.data;
  },

  markAllAsRead: async (tenantId) => {
    const response = await axios.put(`${API_URL}/api/notifications/read-all/${tenantId}`, {}, { headers: getAuthHeader() });
    return response.data;
  },

  sendNotification: async (data) => {
    const response = await axios.post(`${API_URL}/api/notifications`, data, { headers: getAuthHeader() });
    return response.data;
  },

  deleteNotification: async (id) => {
    const response = await axios.delete(`${API_URL}/api/notifications/${id}`, { headers: getAuthHeader() });
    return response.data;
  },
};
