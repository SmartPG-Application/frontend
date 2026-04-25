import React from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Check if user logged in with temp password
  const storedToken = localStorage.getItem('smartpg_token');
  let hasTempPassword = false;
  if (storedToken) {
    try {
      const payload = JSON.parse(atob(storedToken.split('.')[1]));
      hasTempPassword = payload.tempPassword === true;
    } catch {}
  }

  return (
    <div className="flex h-screen bg-background font-body-md overflow-hidden text-on-background">
      <Sidebar />
      <main className="flex-1 ml-[240px] flex flex-col h-screen overflow-hidden">
        <Navbar />

        {/* Temp password warning banner */}
        {hasTempPassword && (
          <div className="bg-[#fff8e1] border-b border-[#ffe082] px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#f57f17]" style={{ fontSize: '20px' }}>warning</span>
              <p className="text-[14px] text-[#e65100] font-medium">
                You are using a temporary password. Please change it for security.
              </p>
            </div>
            <button
              onClick={() => navigate('/profile')}
              className="px-4 py-1.5 bg-[#f57f17] text-white text-[13px] font-semibold rounded hover:bg-[#e65100] transition-colors"
            >
              Change Password
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-[2rem] bg-background">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
