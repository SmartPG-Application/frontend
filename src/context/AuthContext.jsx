import { createContext, useContext, useState, useEffect } from 'react';
import { tenantService } from '../services/tenantService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('smartpg_user');
    const storedToken = localStorage.getItem('smartpg_token');

    if (storedUser && storedToken) {
      try {
        const payload = JSON.parse(atob(storedToken.split('.')[1]));
        if (payload.exp * 1000 < Date.now()) {
          logout();
        } else {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
          // Set old user item for backward compatibility with existing service code temporarily
          localStorage.setItem('user', JSON.stringify({ ...JSON.parse(storedUser), token: storedToken })); 
        }
      } catch (e) {
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const data = await tenantService.login(email, password);
      // data should contain { _id, name, email, role, token }
      const userData = { id: data._id, name: data.name, email: data.email, role: data.role, tenantId: data._id };
      setUser(userData);
      setToken(data.token);
      localStorage.setItem('smartpg_user', JSON.stringify(userData));
      localStorage.setItem('smartpg_token', data.token);
      localStorage.setItem('user', JSON.stringify({ ...userData, token: data.token }));
      return userData;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('smartpg_user');
    localStorage.removeItem('smartpg_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const updateUser = (data) => {
    const updated = { ...user, ...data };
    setUser(updated);
    localStorage.setItem('smartpg_user', JSON.stringify(updated));
    localStorage.setItem('user', JSON.stringify({ ...updated, token }));
  };

  const isAdmin = user?.role === 'admin';
  const isTenant = user?.role === 'tenant';

  return (
    <AuthContext.Provider value={{ user, token, isAdmin, isTenant, login, logout, updateUser, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
