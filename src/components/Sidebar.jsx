import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { tenantService } from '../services/tenantService';

const Sidebar = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [pendingCount, setPendingCount] = useState(0);

  // Poll pending count for admins
  useEffect(() => {
    if (!isAdmin) return;

    const fetchPending = async () => {
      try {
        const res = await tenantService.getPendingTenants();
        setPendingCount(res.count || 0);
      } catch {
        // silent fail
      }
    };
    fetchPending();
    const interval = setInterval(fetchPending, 60000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminNavItems = [
    { name: 'Dashboard', icon: 'dashboard', path: '/dashboard' },
    { name: 'Tenants', icon: 'group', path: '/tenants', showBadge: true },
    { name: 'Rooms', icon: 'bed', path: '/rooms' },
    { name: 'Payments', icon: 'payments', path: '/payments' },
    { name: 'Mess Menu', icon: 'restaurant', path: '/mess' },
    { name: 'Complaints', icon: 'report_problem', path: '/complaints' },
    { name: 'Notifications', icon: 'notifications', path: '/notifications' },
  ];

  const tenantNavItems = [
    { name: 'Dashboard', icon: 'dashboard', path: '/dashboard' },
    { name: 'My Payments', icon: 'payments', path: '/payments' },
    { name: 'Mess Menu', icon: 'restaurant', path: '/mess' },
    { name: 'My Complaints', icon: 'report_problem', path: '/complaints' },
    { name: 'Notifications', icon: 'notifications', path: '/notifications' },
    { name: 'My Profile', icon: 'person', path: '/profile' },
  ];

  const navItems = isAdmin ? adminNavItems : tenantNavItems;

  return (
    <nav className="fixed left-0 top-0 h-screen w-[240px] bg-slate-900 border-r border-slate-800 flex flex-col py-6 z-50">
      {/* Brand section */}
      <div className="px-6 mb-8">
        <h1 className="text-2xl font-extrabold text-white">SmartPG</h1>
        <p className="text-slate-400 font-label-sm uppercase tracking-wider mt-1">
          {isAdmin ? 'Admin Portal' : 'My Portal'}
        </p>
      </div>

      {/* CTA Button */}
      <div className="px-6 mb-8">
        {isAdmin ? (
          <button onClick={() => navigate('/tenants')} className="w-full bg-secondary-container hover:bg-secondary text-on-primary font-label-md py-2.5 rounded flex items-center justify-center gap-2 transition-colors">
            <span className="material-symbols-outlined text-[20px]">add</span>
            Add New Booking
          </button>
        ) : (
          <button onClick={() => navigate('/complaints')} className="w-full bg-secondary-container hover:bg-secondary text-on-primary font-label-md py-2.5 rounded flex items-center justify-center gap-2 transition-colors">
            <span className="material-symbols-outlined text-[20px]">report_problem</span>
            Raise Complaint
          </button>
        )}
      </div>

      {/* Navigation links */}
      <div className="flex-1 flex flex-col font-sans text-[13px] font-semibold uppercase tracking-wider space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              isActive
                ? "flex items-center gap-3 px-6 py-3 text-white bg-slate-800 border-l-4 border-orange-500 transition-all duration-200 cursor-pointer"
                : "flex items-center gap-3 px-6 py-3 text-slate-400 hover:bg-slate-800 hover:text-white transition-all duration-200 cursor-pointer"
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className="material-symbols-outlined"
                  style={isActive ? { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" } : {}}
                >
                  {item.icon}
                </span>
                {item.name}
                {item.showBadge && pendingCount > 0 && (
                  <span className="ml-auto bg-[#f57f17] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] h-5 flex items-center justify-center">
                    {pendingCount > 9 ? '9+' : pendingCount}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* Footer links */}
      <div className="mt-auto space-y-1 font-sans text-[13px] font-semibold uppercase tracking-wider">

        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-6 py-3 text-slate-400 hover:bg-slate-800 hover:text-white transition-all duration-200 cursor-pointer text-left">
          <span className="material-symbols-outlined">logout</span>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;
