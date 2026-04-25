import axios from 'axios';

const API_URL = import.meta.env.PROD ? '' : (import.meta.env.VITE_PAYMENT_SERVICE_URL || 'http://localhost:4002');

const getAuthHeader = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user && user.token ? { Authorization: `Bearer ${user.token}` } : {};
};

export const paymentService = {
  getPaymentsByTenant: async (tenantId) => {
    if (!tenantId || tenantId === 'undefined') return [];
    const response = await axios.get(`${API_URL}/api/payments/tenant/${tenantId}`, { headers: getAuthHeader() });
    return response.data;
  },

  getAllPayments: async () => {
    const response = await axios.get(`${API_URL}/api/payments`, { headers: getAuthHeader() });
    return response.data;
  },

  getSummary: async () => {
    const response = await axios.get(`${API_URL}/api/payments/summary`, { headers: getAuthHeader() });
    return response.data;
  },

  getByMonth: async (month, year) => {
    const response = await axios.get(`${API_URL}/api/payments/month/${month}/${year}`, { headers: getAuthHeader() });
    return response.data;
  },

  createPayment: async (data) => {
    const response = await axios.post(`${API_URL}/api/payments`, data, { headers: getAuthHeader() });
    return response.data;
  },

  updateStatus: async (id, status) => {
    const response = await axios.put(`${API_URL}/api/payments/${id}/status`, { status }, { headers: getAuthHeader() });
    return response.data;
  },

  deletePayment: async (id) => {
    const response = await axios.delete(`${API_URL}/api/payments/${id}`, { headers: getAuthHeader() });
    return response.data;
  },
};
