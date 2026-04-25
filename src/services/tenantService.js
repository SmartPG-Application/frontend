import axios from 'axios';

const API_URL = import.meta.env.PROD ? '' : (import.meta.env.VITE_TENANT_SERVICE_URL || 'http://localhost:4001');

const getAuthHeader = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user && user.token ? { Authorization: `Bearer ${user.token}` } : {};
};

export const tenantService = {
  // ── AUTH ─────────────────────────────────────────────────
  login: async (email, password) => {
    const response = await axios.post(`${API_URL}/api/auth/login`, { email, password });
    return response.data;
  },

  // PUBLIC - no auth header needed
  selfRegister: async (data) => {
    const response = await axios.post(`${API_URL}/api/auth/register`, data);
    return response.data;
  },

  // Admin creates tenant (immediately active)
  adminCreateTenant: async (data) => {
    const response = await axios.post(`${API_URL}/api/auth/admin-create`, data, { headers: getAuthHeader() });
    return response.data;
  },

  // Legacy alias
  register: async (userData) => {
    const response = await axios.post(`${API_URL}/api/auth/register`, userData);
    return response.data;
  },

  // ── TENANTS ───────────────────────────────────────────────
  getTenants: async (params = {}) => {
    const response = await axios.get(`${API_URL}/api/tenants`, { headers: getAuthHeader(), params });
    return response.data;
  },

  getPendingTenants: async () => {
    const response = await axios.get(`${API_URL}/api/tenants/pending`, { headers: getAuthHeader() });
    return response.data;
  },

  getTenantById: async (id) => {
    const response = await axios.get(`${API_URL}/api/tenants/${id}`, { headers: getAuthHeader() });
    return response.data;
  },

  getTenantSummary: async (id) => {
    const response = await axios.get(`${API_URL}/api/tenants/${id}/summary`, { headers: getAuthHeader() });
    return response.data;
  },

  updateTenant: async (id, data) => {
    const response = await axios.put(`${API_URL}/api/tenants/${id}`, data, { headers: getAuthHeader() });
    return response.data;
  },

  updateTenantStatus: async (id, status) => {
    const response = await axios.put(`${API_URL}/api/tenants/${id}/status`, { status }, { headers: getAuthHeader() });
    return response.data;
  },

  updatePassword: async (id, data) => {
    const response = await axios.put(`${API_URL}/api/tenants/${id}/password`, data, { headers: getAuthHeader() });
    return response.data;
  },

  deleteTenant: async (id) => {
    const response = await axios.delete(`${API_URL}/api/tenants/${id}`, { headers: getAuthHeader() });
    return response.data;
  },

  approveTenant: async (id, roomId = null) => {
    const response = await axios.put(`${API_URL}/api/tenants/${id}/approve`, { roomId }, { headers: getAuthHeader() });
    return response.data;
  },

  rejectTenant: async (id, reason = '') => {
    const response = await axios.put(`${API_URL}/api/tenants/${id}/reject`, { reason }, { headers: getAuthHeader() });
    return response.data;
  },

  // ── ROOMS ─────────────────────────────────────────────────
  getRooms: async (params = {}) => {
    const response = await axios.get(`${API_URL}/api/rooms`, { headers: getAuthHeader(), params });
    return response.data;
  },

  getRoomById: async (id) => {
    if (!id) return null;
    const response = await axios.get(`${API_URL}/api/rooms/${id}`, { headers: getAuthHeader() });
    return response.data;
  },

  getAvailableRooms: async () => {
    const response = await axios.get(`${API_URL}/api/rooms/available`, { headers: getAuthHeader() });
    return response.data;
  },

  createRoom: async (data) => {
    const response = await axios.post(`${API_URL}/api/rooms`, data, { headers: getAuthHeader() });
    return response.data;
  },

  updateRoom: async (id, data) => {
    const response = await axios.put(`${API_URL}/api/rooms/${id}`, data, { headers: getAuthHeader() });
    return response.data;
  },

  allocateRoom: async (data) => {
    const response = await axios.post(`${API_URL}/api/rooms/allocate`, data, { headers: getAuthHeader() });
    return response.data;
  },

  releaseRoom: async (roomId, tenantId) => {
    const response = await axios.put(`${API_URL}/api/rooms/${roomId}/release`, { tenantId }, { headers: getAuthHeader() });
    return response.data;
  },

  getStats: async () => {
    const [tenants, rooms] = await Promise.all([
      axios.get(`${API_URL}/api/tenants`, { headers: getAuthHeader() }),
      axios.get(`${API_URL}/api/rooms`, { headers: getAuthHeader() }),
    ]);

    const availableRooms = rooms.data.filter(r => r.status === 'Available').length;

    return {
      totalTenants: tenants.data.length,
      availableRooms,
    };
  },
};
