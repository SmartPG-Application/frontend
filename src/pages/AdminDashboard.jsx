import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import Badge from '../components/common/Badge';
import { tenantService } from '../services/tenantService';
import { paymentService } from '../services/paymentService';
import { complaintService } from '../services/complaintService';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalTenants: 0, availableRooms: 0, totalRooms: 0 });
  const [payments, setPayments] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tenantData, roomData, paymentData, complaintData] = await Promise.all([
        tenantService.getTenants().catch(() => []),
        tenantService.getRooms().catch(() => []),
        paymentService.getAllPayments().catch(() => []),
        complaintService.getAllComplaints().catch(() => []),
      ]);
      
      const rooms = Array.isArray(roomData) ? roomData : [];
      const available = rooms.filter(r => r.isAvailable).length;

      setTenants(Array.isArray(tenantData) ? tenantData : []);
      setPayments(Array.isArray(paymentData) ? paymentData : []);
      setComplaints(Array.isArray(complaintData) ? complaintData : []);
      setStats({
        totalTenants: Array.isArray(tenantData) ? tenantData.length : 0,
        availableRooms: available,
        totalRooms: rooms.length,
      });
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const now = new Date();
  const currentMonthNum = (now.getMonth() + 1).toString();
  const currentYear = now.getFullYear();

  // Filter payments for current month only
  const currentMonthPayments = payments.filter(p => p.month?.toString() === currentMonthNum && p.year === currentYear);

  const pendingPayments = currentMonthPayments.filter(p => p.status?.toLowerCase() === 'pending');
  const pendingAmount = pendingPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  
  const paidPayments = currentMonthPayments.filter(p => p.status?.toLowerCase() === 'completed' || p.status?.toLowerCase() === 'paid');
  const paidAmount = paidPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

  const openComplaints = complaints.filter(c => c.status?.toLowerCase() === 'open');
  const inProgressComplaints = complaints.filter(c => c.status?.toLowerCase() === 'in progress');
  const resolvedComplaints = complaints.filter(c => c.status?.toLowerCase() === 'resolved');
  
  const recentTenants = tenants.slice(0, 5);

  const getInitials = (name) => name ? name.charAt(0).toUpperCase() : 'T';

  const currentMonth = now.toLocaleString('default', { month: 'long', year: 'numeric' });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary-container"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-h1 font-h1 text-on-background">Dashboard</h2>
          <p className="text-body-md text-on-surface-variant mt-1">Welcome back, {user?.name || 'Admin'}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-card-gap mb-8">
        <StatCard icon="group" iconBg="bg-primary-container" value={stats.totalTenants} label="Total Tenants" trend="+2 this month" trendDirection="up" />
        <StatCard icon="bed" iconBg="bg-[#e8f5e9]" value={`${stats.availableRooms}/${stats.totalRooms}`} label="Available Rooms" trend={`${stats.totalRooms - stats.availableRooms} occupied`} />
        <StatCard icon="payments" iconBg="bg-[#fff8e1]" value={`₹${pendingAmount.toLocaleString()}`} label="Pending Payments" trend={`${pendingPayments.length} tenants`} />
        <StatCard icon="report_problem" iconBg="bg-error-container" value={openComplaints.length} label="Open Complaints" trend={`${openComplaints.filter(c => c.priority === 'Urgent' || c.priority === 'High').length} urgent`} trendDirection="down" />
      </div>

      {/* Lower Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tenants */}
        <div className="bg-surface-container-lowest rounded-lg border border-outline-variant p-6 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-h3 text-on-background">Recent Tenants</h3>
            <a href="/tenants" className="text-secondary-container font-label-sm hover:underline">View All</a>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-outline-variant">
                <th className="pb-3 font-label-sm text-on-surface-variant uppercase tracking-wider">Name</th>
                <th className="pb-3 font-label-sm text-on-surface-variant uppercase tracking-wider">Room</th>
                <th className="pb-3 font-label-sm text-on-surface-variant uppercase tracking-wider">Status</th>
                <th className="pb-3 font-label-sm text-on-surface-variant uppercase tracking-wider">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {recentTenants.map((tenant, i) => (
                <tr key={i} className="hover:bg-surface-container-low transition-colors">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed font-label-md text-sm">
                        {getInitials(tenant.name)}
                      </div>
                      <span className="font-label-md text-on-surface">{tenant.name}</span>
                    </div>
                  </td>
                  <td className="py-3 text-body-md text-on-surface">{tenant.roomNumber || 'N/A'}</td>
                  <td className="py-3"><Badge status={tenant.status || 'active'} /></td>
                  <td className="py-3 text-body-md text-on-surface-variant">{tenant.joinDate ? new Date(tenant.joinDate).toLocaleDateString() : 'N/A'}</td>
                </tr>
              ))}
              {recentTenants.length === 0 && (
                <tr><td colSpan={4} className="py-6 text-center text-on-surface-variant">No tenants yet</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Complaints Overview */}
        <div className="bg-surface-container-lowest rounded-lg border border-outline-variant p-6 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05)]">
          <h3 className="font-h3 text-on-background mb-4">Complaints Overview</h3>
          
          <div className="space-y-6">
            {/* Open */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-label-md text-on-surface">Open</span>
                <span className="font-label-sm text-on-surface-variant">{openComplaints.length}/{complaints.length}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200">
                <div className="h-2 rounded-full bg-error transition-all" style={{ width: `${complaints.length ? (openComplaints.length / complaints.length * 100) : 0}%` }}></div>
              </div>
            </div>

            {/* In Progress */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-label-md text-on-surface">In Progress</span>
                <span className="font-label-sm text-on-surface-variant">{inProgressComplaints.length}/{complaints.length}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200">
                <div className="h-2 rounded-full bg-[#f57f17] transition-all" style={{ width: `${complaints.length ? (inProgressComplaints.length / complaints.length * 100) : 0}%` }}></div>
              </div>
            </div>

            {/* Resolved */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-label-md text-on-surface">Resolved</span>
                <span className="font-label-sm text-on-surface-variant">{resolvedComplaints.length}/{complaints.length}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200">
                <div className="h-2 rounded-full bg-primary-container transition-all" style={{ width: `${complaints.length ? (resolvedComplaints.length / complaints.length * 100) : 0}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Summary */}
      <div className="bg-surface-container-lowest rounded-lg border border-outline-variant p-6 mt-6 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05)]">
        <h3 className="font-h3 text-on-background mb-6">Payment Summary — {currentMonth}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="text-center p-4 rounded-lg bg-[#e8f5e9]">
            <div className="text-h1 font-h1 text-green-800">₹{paidAmount.toLocaleString()}</div>
            <div className="text-body-md text-green-700 mt-1">Collected</div>
            <div className="font-label-sm text-green-600 mt-2">{paidPayments.length} payments</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-[#fff8e1]">
            <div className="text-h1 font-h1 text-amber-800">₹{pendingAmount.toLocaleString()}</div>
            <div className="text-body-md text-amber-700 mt-1">Pending</div>
            <div className="font-label-sm text-amber-600 mt-2">{pendingPayments.length} payments</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
