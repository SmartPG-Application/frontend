import axios from 'axios';

const API_URL = import.meta.env.PROD ? '' : (import.meta.env.VITE_COMPLAINT_SERVICE_URL || 'http://localhost:4004');

const getAuthHeader = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user && user.token ? { Authorization: `Bearer ${user.token}` } : {};
};

export const complaintService = {
  getAllComplaints: async () => {
    const response = await axios.get(`${API_URL}/api/complaints`, { headers: getAuthHeader() });
    return response.data;
  },

  getComplaintsByTenant: async (tenantId) => {
    if (!tenantId || tenantId === 'undefined') return [];
    const response = await axios.get(`${API_URL}/api/complaints/tenant/${tenantId}`, { headers: getAuthHeader() });
    return response.data;
  },

  createComplaint: async (data) => {
    const response = await axios.post(`${API_URL}/api/complaints`, data, { headers: getAuthHeader() });
    return response.data;
  },

  updateComplaint: async (id, data) => {
    const response = await axios.put(`${API_URL}/api/complaints/${id}`, data, { headers: getAuthHeader() });
    return response.data;
  },

  updateStatus: async (id, status, adminNote) => {
    // Fire status update
    const response = await axios.put(`${API_URL}/api/complaints/${id}/status`, { status }, { headers: getAuthHeader() });
    
    // If adminNote is provided, also fire note update concurrently
    if (adminNote !== undefined && adminNote !== null) {
      await axios.put(`${API_URL}/api/complaints/${id}/note`, { adminNote }, { headers: getAuthHeader() }).catch(e => console.warn('Failed to update note', e));
    }
    
    return response.data;
  },

  deleteComplaint: async (id) => {
    const response = await axios.delete(`${API_URL}/api/complaints/${id}`, { headers: getAuthHeader() });
    return response.data;
  },
};
