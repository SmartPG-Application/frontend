import axios from 'axios';

const API_URL = import.meta.env.PROD ? '' : (import.meta.env.VITE_MESS_SERVICE_URL || 'http://localhost:4003');

const getAuthHeader = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user && user.token ? { Authorization: `Bearer ${user.token}` } : {};
};

export const messService = {
  getWeeklyMenu: async () => {
    const response = await axios.get(`${API_URL}/api/menu/weekly`, { headers: getAuthHeader() });
    return response.data;
  },

  getOrders: async (tenantId) => {
    const response = await axios.get(`${API_URL}/api/orders/tenant/${tenantId}`, { headers: getAuthHeader() });
    return response.data;
  },

  optIn: async (data) => {
    const response = await axios.post(`${API_URL}/api/orders/opt-in`, data, { headers: getAuthHeader() });
    return response.data;
  },

  optOut: async (data) => {
    const response = await axios.post(`${API_URL}/api/orders/opt-out`, data, { headers: getAuthHeader() });
    return response.data;
  },

  updateMenu: async (data) => {
    const response = await axios.post(`${API_URL}/api/menu`, data, { headers: getAuthHeader() });
    return response.data;
  },

  getStats: async () => {
    const response = await axios.get(`${API_URL}/api/orders/today/stats`, { headers: getAuthHeader() });
    return response.data;
  },

  getMessRate: async () => {
    const response = await axios.get(`${API_URL}/api/mess/rate`, { headers: getAuthHeader() });
    return response.data;
  },

  updateMessRate: async (rate) => {
    const response = await axios.put(`${API_URL}/api/mess/rate`, { ratePerMeal: rate }, { headers: getAuthHeader() });
    return response.data;
  },

  getBill: async (tenantId, month, year) => {
    const response = await axios.get(`${API_URL}/api/mess/bill/${tenantId}?month=${month}&year=${year}`, { headers: getAuthHeader() });
    return response.data;
  }
};
