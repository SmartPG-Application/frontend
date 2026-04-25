import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/common/Badge';
import { paymentService } from '../services/paymentService';
import { complaintService } from '../services/complaintService';
import { messService } from '../services/messService';
import { tenantService } from '../services/tenantService';

const Dashboard = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [mealPrefs, setMealPrefs] = useState({ breakfast: true, lunch: true, dinner: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [payData, complaintData, roomData] = await Promise.all([
        paymentService.getPaymentsByTenant(user?.id).catch(() => []),
        complaintService.getComplaintsByTenant(user?.id).catch(() => []),
        user?.roomId ? tenantService.getRoomById(user.roomId).catch(() => null) : Promise.resolve(null),
      ]);
      setPayments(Array.isArray(payData) ? payData : []);
      setComplaints(Array.isArray(complaintData) ? complaintData : []);
      setRooms(roomData ? [roomData] : []);
    } catch (err) {
      console.error('Dashboard fetch:', err);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const myRoom = rooms.find(r => r.tenantId === user?.id || r.tenant === user?.id);
  const currentMonth = new Date().toLocaleString('default', { month: 'long' });
  const currentPayment = payments.find(p => {
    const now = new Date();
    return p.month === now.getMonth() + 1 && p.year === now.getFullYear();
  }) || payments[0];
  const recentPayments = payments.slice(0, 5);
  const recentComplaints = complaints.slice(0, 4);

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
          <h2 className="text-h1 font-h1 text-on-background">My Dashboard</h2>
          <p className="text-body-md text-on-surface-variant mt-1">{getGreeting()}, {user?.name || 'Tenant'}</p>
        </div>
      </div>

      {/* Top Section - 3 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* My Room */}
        <div className="bg-surface-container-lowest rounded-lg border border-outline-variant p-6 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary-container">bed</span>
            </div>
            <div>
              <div className="font-h2 text-on-background">Room {myRoom?.roomNumber || 'N/A'}</div>
            </div>
          </div>
          <div className="space-y-2 text-body-md text-on-surface-variant">
            <p>Floor: {myRoom?.floor || 'N/A'} | Type: {myRoom?.type || 'Single'}</p>
            <p className="font-h3 text-primary">₹{(myRoom?.rent || 0).toLocaleString()}/month</p>
          </div>
          <div className="mt-3">
            <Badge status="occupied" label="Occupied" />
          </div>
        </div>

        {/* Payment Status */}
        <div className="bg-surface-container-lowest rounded-lg border border-outline-variant p-6 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05)]">
          <p className="font-label-md text-on-surface-variant mb-2">Current Month Payment</p>
          <h3 className="font-h3 text-on-background">{currentMonth}</h3>
          <p className="text-h2 font-h2 text-primary mt-2">₹{(currentPayment?.amount || myRoom?.rent || 0).toLocaleString()}</p>
          <div className="mt-3 flex items-center gap-3">
            <Badge status={currentPayment?.status || 'pending'} />
          </div>
          <p className="text-body-md text-on-surface-variant mt-2">
            Due: {currentPayment?.dueDate ? new Date(currentPayment.dueDate).toLocaleDateString() : '5th of month'}
          </p>
        </div>

        {/* Mess Status */}
        <div className="bg-surface-container-lowest rounded-lg border border-outline-variant p-6 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05)]">
          <p className="font-label-md text-on-surface-variant mb-3">Today's Meals</p>
          <div className="space-y-3">
            {[
              { emoji: '🍳', label: 'Breakfast', key: 'breakfast' },
              { emoji: '🍱', label: 'Lunch', key: 'lunch' },
              { emoji: '🍽️', label: 'Dinner', key: 'dinner' },
            ].map((meal) => (
              <div key={meal.key} className="flex justify-between items-center">
                <span className="text-body-md text-on-surface">{meal.emoji} {meal.label}</span>
                <button
                  onClick={() => setMealPrefs(prev => ({ ...prev, [meal.key]: !prev[meal.key] }))}
                  className={`w-12 h-6 rounded-full cursor-pointer transition-colors duration-200 relative ${
                    mealPrefs[meal.key] ? 'bg-secondary-container' : 'bg-outline-variant'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform duration-200 shadow ${
                    mealPrefs[meal.key] ? 'translate-x-6' : 'translate-x-1'
                  }`}></div>
                </button>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 bg-secondary-container text-on-primary py-2 rounded font-label-md hover:bg-secondary transition-colors">
            Save Preference
          </button>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Recent Payments */}
        <div className="bg-surface-container-lowest rounded-lg border border-outline-variant p-6 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-h3 text-on-background">My Payments</h3>
            <a href="/payments" className="text-secondary-container font-label-sm hover:underline">View All</a>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-outline-variant">
                <th className="pb-3 font-label-sm text-on-surface-variant uppercase tracking-wider">Month</th>
                <th className="pb-3 font-label-sm text-on-surface-variant uppercase tracking-wider">Amount</th>
                <th className="pb-3 font-label-sm text-on-surface-variant uppercase tracking-wider">Status</th>
                <th className="pb-3 font-label-sm text-on-surface-variant uppercase tracking-wider">Due</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {recentPayments.map((p, i) => (
                <tr key={i} className="hover:bg-surface-container-low transition-colors">
                  <td className="py-3 text-body-md text-on-surface">{p.month}/{p.year}</td>
                  <td className="py-3 text-body-md text-on-surface">₹{(p.amount || 0).toLocaleString()}</td>
                  <td className="py-3"><Badge status={p.status} /></td>
                  <td className="py-3 text-body-md text-on-surface-variant">{p.dueDate ? new Date(p.dueDate).toLocaleDateString() : '-'}</td>
                </tr>
              ))}
              {recentPayments.length === 0 && (
                <tr><td colSpan={4} className="py-6 text-center text-on-surface-variant">No payment records</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* My Complaints */}
        <div className="bg-surface-container-lowest rounded-lg border border-outline-variant p-6 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-h3 text-on-background">My Complaints</h3>
            <a href="/complaints" className="text-secondary-container font-label-sm hover:underline">Raise New</a>
          </div>
          <div className="space-y-3">
            {recentComplaints.map((c, i) => (
              <div key={i} className="p-4 rounded-lg border border-outline-variant hover:bg-surface-container-low transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <Badge status={c.category || 'other'} label={c.category} />
                  <Badge status={c.status} />
                </div>
                <p className="font-label-md text-on-background">{c.title}</p>
                <p className="text-[12px] text-on-surface-variant mt-1">{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ''}</p>
              </div>
            ))}
            {recentComplaints.length === 0 && (
              <div className="text-center py-6 text-on-surface-variant">No complaints raised</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
