import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/common/Modal';
import FormInput from '../components/common/FormInput';
import DataTable from '../components/common/DataTable';
import ConfirmModal from '../components/common/ConfirmModal';
import { notificationService } from '../services/notificationService';
import { tenantService } from '../services/tenantService';

const typeIcons = {
  payment: { bg: 'bg-[#e8f5e9]', icon: 'payments', color: 'text-green-700' },
  complaint: { bg: 'bg-error-container', icon: 'report_problem', color: 'text-on-error-container' },
  announcement: { bg: 'bg-[#fff8e1]', icon: 'campaign', color: 'text-amber-700' },
  system: { bg: 'bg-surface-container', icon: 'settings', color: 'text-on-surface' },
};

const getTimeAgo = (date) => {
  if (!date) return '';
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days} days ago`;
};

const Notifications = () => {
  const { user, isAdmin } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSendModal, setShowSendModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState({ title: '', message: '', target: 'all', tenantId: '', type: 'announcement' });
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      if (isAdmin) {
        const [t, n] = await Promise.all([
          tenantService.getTenants().catch(() => []),
          notificationService.getAllNotifications().catch(() => [])
        ]);
        setTenants(Array.isArray(t) ? t : []);
        setNotifications(Array.isArray(n) ? n : []);
      } else {
        const data = await notificationService.getNotifications(user?.id).catch(() => []);
        setNotifications(Array.isArray(data) ? data : []);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead(user?.id);
      fetchData();
    } catch (err) { console.error(err); }
  };

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'read') return n.isRead;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary-container"></div>
      </div>
    );
  }

  // ═══ ADMIN VIEW ═══
  if (isAdmin) {
    return (
      <div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-h1 font-h1 text-on-background">Notifications</h2>
            <p className="text-body-md text-on-surface-variant mt-1">Send announcements and alerts</p>
          </div>
          <button onClick={() => setShowSendModal(true)} className="bg-secondary-container hover:bg-secondary text-on-primary font-label-md px-4 py-2.5 rounded shadow-sm transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">campaign</span>
            Send Announcement
          </button>
        </div>

        {/* Sent History */}
        <DataTable
          columns={[
            { header: 'Title', render: (row) => <span className="font-label-md">{row.title}</span> },
            { header: 'Message', render: (row) => <span className="text-on-surface-variant truncate max-w-[200px] block">{row.message}</span> },
            { header: 'Target', render: (row) => <span>{row.target || 'All'}</span> },
            { header: 'Type', render: (row) => <span className="capitalize">{row.type}</span> },
            { header: 'Sent At', render: (row) => <span className="text-on-surface-variant">{row.createdAt ? new Date(row.createdAt).toLocaleString() : '-'}</span> },
          ]}
          data={notifications}
          actions={(row) => (
            <button 
              onClick={async () => {
                try {
                  await notificationService.deleteNotification(row._id);
                  fetchData();
                } catch (err) {
                  console.error('Failed to delete notification:', err);
                }
              }} 
              className="p-1.5 rounded text-on-surface-variant hover:text-error"
            >
              <span className="material-symbols-outlined text-[20px]">delete</span>
            </button>
          )}
        />

        {notifications.length === 0 && (
          <div className="text-center py-12 text-on-surface-variant bg-surface-container-lowest rounded-lg border border-outline-variant">
            <span className="material-symbols-outlined text-[48px] mb-2">campaign</span>
            <p>No announcements sent yet</p>
          </div>
        )}

        {/* Send Announcement Modal */}
        <Modal isOpen={showSendModal} onClose={() => setShowSendModal(false)} title="Send Announcement"
          footer={
            <>
              <button onClick={() => setShowSendModal(false)} className="px-4 py-2 border border-outline-variant rounded text-on-surface font-label-md hover:bg-surface-container-low">Cancel</button>
              <button 
                onClick={async () => {
                  try {
                    await notificationService.sendNotification({
                      title: form.title,
                      message: form.message,
                      type: form.type,
                      tenantId: form.target === 'specific' ? form.tenantId : null
                    });
                    setShowSendModal(false);
                    setForm({ title: '', message: '', target: 'all', tenantId: '', type: 'announcement' });
                    fetchData();
                  } catch (err) {
                    console.error('Failed to send notification:', err);
                  }
                }} 
                className="px-4 py-2 bg-secondary-container hover:bg-secondary text-on-primary rounded font-label-md"
              >
                Send
              </button>
            </>
          }
        >
          <div className="space-y-4">
            <FormInput label="Title" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} placeholder="Announcement title" />
            <div>
              <label className="font-label-md text-on-surface mb-1 block">Message</label>
              <textarea value={form.message} onChange={(e) => setForm({...form, message: e.target.value})} rows={4} className="w-full px-3 py-2 border border-outline-variant rounded-md font-body-md text-on-surface bg-surface focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Write your message..." />
            </div>
            <div>
              <label className="font-label-md text-on-surface mb-2 block">Target</label>
              <div className="flex gap-3">
                {['all', 'specific'].map(t => (
                  <button key={t} onClick={() => setForm({...form, target: t})}
                    className={`px-4 py-2 rounded-lg border font-label-md capitalize transition-colors ${
                      form.target === t ? 'border-secondary-container bg-[#fff3e0] text-secondary-container' : 'border-outline-variant text-on-surface hover:bg-surface-container-low'
                    }`}
                  >{t === 'all' ? 'All Tenants' : 'Specific Tenant'}</button>
                ))}
              </div>
            </div>
            {form.target === 'specific' && (
              <div>
                <label className="font-label-md text-on-surface mb-1 block">Select Tenant</label>
                <select value={form.tenantId} onChange={(e) => setForm({...form, tenantId: e.target.value})} className="w-full px-3 py-2 border border-outline-variant rounded-md font-body-md text-on-surface bg-surface">
                  <option value="">Choose a tenant...</option>
                  {tenants.map(t => <option key={t._id} value={t._id}>{t.name} ({t.email})</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="font-label-md text-on-surface mb-1 block">Type</label>
              <select value={form.type} onChange={(e) => setForm({...form, type: e.target.value})} className="w-full px-3 py-2 border border-outline-variant rounded-md font-body-md text-on-surface bg-surface">
                <option value="announcement">Announcement</option>
                <option value="payment">Payment</option>
                <option value="system">System</option>
                <option value="complaint">Complaint</option>
              </select>
            </div>
          </div>
        </Modal>
      </div>
    );
  }

  // ═══ TENANT VIEW ═══
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-h1 font-h1 text-on-background">Notifications</h2>
          <p className="text-body-md text-on-surface-variant mt-1">Your messages and announcements</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="bg-secondary-container hover:bg-secondary text-on-primary font-label-md px-4 py-2.5 rounded shadow-sm transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">done_all</span>
            Mark All Read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-6 border-b border-outline-variant mb-6">
        {[
          { key: 'all', label: 'All' },
          { key: 'unread', label: `Unread (${unreadCount})` },
          { key: 'read', label: 'Read' },
        ].map(tab => (
          <button key={tab.key} onClick={() => setFilter(tab.key)}
            className={`pb-2 font-label-md transition-colors ${
              filter === tab.key
                ? 'border-b-2 border-secondary-container text-secondary-container'
                : 'border-b-2 border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >{tab.label}</button>
        ))}
      </div>

      {/* Notification List */}
      <div className="space-y-3">
        {filtered.map((n, i) => {
          const typeStyle = typeIcons[n.type] || typeIcons.system;
          return (
            <div key={i} className={`flex gap-4 p-4 rounded-lg transition-colors ${
              n.isRead
                ? 'bg-surface-container-lowest border border-outline-variant'
                : 'bg-surface-container-low border-l-4 border-secondary-container'
            }`}>
              {/* Icon */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${typeStyle.bg}`}>
                <span className={`material-symbols-outlined text-[20px] ${typeStyle.color}`}>{typeStyle.icon}</span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <p className={`font-label-md text-on-surface ${!n.isRead ? 'font-bold' : ''}`}>{n.title}</p>
                  <span className="text-[12px] text-on-surface-variant flex-shrink-0 ml-2">{getTimeAgo(n.createdAt)}</span>
                </div>
                <p className="text-body-md text-on-surface-variant mt-1">{n.message}</p>
                {!n.isRead && (
                  <button onClick={() => handleMarkRead(n._id)} className="text-secondary-container font-label-sm hover:underline mt-2">
                    Mark as Read
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-on-surface-variant">
          <span className="material-symbols-outlined text-[48px] mb-2">notifications_off</span>
          <p>No notifications yet</p>
        </div>
      )}
    </div>
  );
};

export default Notifications;
