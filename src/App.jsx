import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ToastProvider } from './components/common/Toast';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Payments from './pages/Payments';
import MessMenu from './pages/MessMenu';
import Complaints from './pages/Complaints';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Rooms from './pages/Rooms';
import TenantDetail from './pages/TenantDetail';
import Tenants from './pages/Tenants';

// Components
import Layout from './components/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';

function App() {
  const { isAdmin } = useAuth();

  return (
    <ToastProvider>
      <Router>
        <Routes>
          {/* PUBLIC routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Protected Routes (Admin or Tenant) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/*" element={
              <Layout>
                <Routes>
                  <Route path="dashboard" element={isAdmin ? <AdminDashboard /> : <Dashboard />} />
                  <Route path="payments" element={<Payments />} />
                  <Route path="mess" element={<MessMenu />} />
                  <Route path="complaints" element={<Complaints />} />
                  <Route path="notifications" element={<Notifications />} />
                  <Route path="profile" element={<Profile />} />

                  {/* Admin Only Routes */}
                  <Route element={<AdminRoute />}>
                    <Route path="tenants" element={<Tenants />} />
                    <Route path="tenants/:id" element={<TenantDetail />} />
                    <Route path="rooms" element={<Rooms />} />
                  </Route>

                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Layout>
            } />
          </Route>

        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;
