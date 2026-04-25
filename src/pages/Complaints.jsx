import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import DataTable from '../components/common/DataTable';
import SearchFilterBar from '../components/common/SearchFilterBar';
import Badge from '../components/common/Badge';
import StatCard from '../components/StatCard';
import Modal from '../components/common/Modal';
import FormInput from '../components/common/FormInput';
import ConfirmModal from '../components/common/ConfirmModal';
import { useToast } from '../components/common/Toast';
import { complaintService } from '../services/complaintService';

const priorityStyles = {
  Urgent: 'bg-error text-on-error',
  High: 'bg-[#fff8e1] text-[#e65100]',
  Medium: 'bg-surface-container text-on-surface',
  Low: 'bg-surface-variant text-on-surface-variant',
};

const categories = [
  { value: 'Maintenance', label: '🔧 Maintenance' },
  { value: 'Cleanliness', label: '🧹 Cleanliness' },
  { value: 'Noise', label: '🔊 Noise' },
  { value: 'Security', label: '🔒 Security' },
  { value: 'Food', label: '🍽️ Food' },
  { value: 'Other', label: '❓ Other' },
];

const Complaints = () => {
  const { user, isAdmin } = useAuth();
  const toast = useToast();
  const [complaints, setComplaints] = useState([]);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [form, setForm] = useState({ category: 'Maintenance', title: '', description: '', priority: 'Medium' });
  const [adminNote, setAdminNote] = useState('');
  const [statusChange, setStatusChange] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const perPage = 10;

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      let data;
      if (isAdmin) {
        data = await complaintService.getAllComplaints().catch(() => []);
      } else {
        data = await complaintService.getComplaintsByTenant(user?.id).catch(() => []);
      }
      setComplaints(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleCreate = async () => {
    setActionLoading(true);
    try {
      if (selectedComplaint) {
        await complaintService.updateComplaint(selectedComplaint._id, form);
        toast.success('Complaint updated successfully');
      } else {
        await complaintService.createComplaint({ ...form, tenantId: user?.id });
        toast.success('Complaint raised successfully');
      }
      setShowCreateModal(false);
      setForm({ category: 'Maintenance', title: '', description: '', priority: 'Medium' });
      setSelectedComplaint(null);
      fetchData();
    } catch (err) { 
      toast.error(err.response?.data?.message || 'Failed to save complaint');
    } finally { setActionLoading(false); }
  };

  const handleStatusChange = async (id, status, note = null) => {
    setActionLoading(true);
    try {
      await complaintService.updateStatus(id, status, note);
      toast.success('Status updated');
      fetchData();
    } catch (err) { 
      toast.error('Failed to update status');
    } finally { setActionLoading(false); }
  };

  const handleDelete = async () => {
    if (!selectedComplaint) return;
    setActionLoading(true);
    try {
      await complaintService.deleteComplaint(selectedComplaint._id);
      toast.success('Complaint deleted');
      setShowDeleteModal(false);
      setSelectedComplaint(null);
      fetchData();
    } catch (err) {
      toast.error('Failed to delete complaint');
    } finally { setActionLoading(false); }
  };

  const filtered = complaints.filter(c => {
    if (search && !c.title?.toLowerCase().includes(search.toLowerCase()) && !c.tenantName?.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterCategory !== 'all' && c.category !== filterCategory) return false;
    if (filterPriority !== 'all' && c.priority !== filterPriority) return false;
    if (filterStatus !== 'all' && c.status !== filterStatus) return false;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / perPage) || 1;
  const paged = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  const openCount = complaints.filter(c => c.status === 'Open').length;
  const inProgressCount = complaints.filter(c => c.status === 'In Progress').length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;

  const getInitials = (name) => name ? name.charAt(0).toUpperCase() : 'T';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary-container"></div>
      </div>
    );
  }

  // ═══ TENANT VIEW ═══
  if (!isAdmin) {
    return (
      <div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-h1 font-h1 text-on-background">My Complaints</h2>
            <p className="text-body-md text-on-surface-variant mt-1">Track your issues and requests</p>
          </div>
          <button onClick={() => { setForm({ category: 'Maintenance', title: '', description: '', priority: 'Medium' }); setShowCreateModal(true); }} className="bg-secondary-container hover:bg-secondary text-on-primary font-label-md px-4 py-2.5 rounded shadow-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">add</span>
            Raise Complaint
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-card-gap mb-8">
          <StatCard icon="error" iconBg="bg-error-container" value={openCount} label="Open" />
          <StatCard icon="pending" iconBg="bg-[#fff8e1]" value={inProgressCount} label="In Progress" />
          <StatCard icon="check_circle" iconBg="bg-primary-container" value={resolvedCount} label="Resolved" />
        </div>

        <div className="bg-surface-container-lowest rounded-lg border border-outline-variant shadow-sm overflow-hidden">
          {complaints.length === 0 ? (
            <div className="text-center py-12 text-on-surface-variant">
              <span className="material-symbols-outlined text-[48px] mb-2">done_all</span>
              <p>No complaints raised yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-outline-variant">
              {complaints.map(c => (
                <div key={c._id} className="p-6 hover:bg-surface-container-lowest transition-colors flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge status={c.category} label={c.category} />
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-label-sm capitalize ${priorityStyles[c.priority] || priorityStyles.Medium}`}>{c.priority}</span>
                      <Badge status={c.status} />
                    </div>
                    <h3 className="font-h3 text-on-background mb-1">{c.title}</h3>
                    <p className="text-body-md text-on-surface-variant">{c.description}</p>
                    {c.adminNote && (
                      <div className="mt-3 p-3 bg-surface-container-low rounded-lg border-l-4 border-secondary-container">
                        <p className="font-label-sm text-on-surface-variant mb-1">Admin Response:</p>
                        <p className="text-body-md text-on-surface">{c.adminNote}</p>
                      </div>
                    )}
                    <p className="text-[12px] text-on-surface-variant mt-3">{new Date(c.createdAt).toLocaleString()}</p>
                  </div>
                  {c.status === 'Open' && (
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setSelectedComplaint(c); setForm({ category: c.category, title: c.title, description: c.description, priority: c.priority }); setShowCreateModal(true); }} className="p-1.5 rounded text-on-surface-variant hover:text-primary">
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button onClick={() => { setSelectedComplaint(c); setShowDeleteModal(true); }} className="p-1.5 rounded text-on-surface-variant hover:text-error">
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Raise Complaint Modal */}
        <Modal isOpen={showCreateModal} onClose={() => { setShowCreateModal(false); setSelectedComplaint(null); setForm({ category: 'Maintenance', title: '', description: '', priority: 'Medium' }); }} title={selectedComplaint ? "Edit Complaint" : "Raise New Complaint"}
          footer={
            <>
              <button onClick={() => { setShowCreateModal(false); setSelectedComplaint(null); }} className="px-4 py-2 border border-outline-variant rounded text-on-surface font-label-md hover:bg-surface-container-low">Cancel</button>
              <button onClick={handleCreate} disabled={actionLoading} className="px-4 py-2 bg-secondary-container hover:bg-secondary text-on-primary rounded font-label-md flex items-center gap-2 disabled:opacity-50">
                {actionLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                {selectedComplaint ? "Save Changes" : "Submit"}
              </button>
            </>
          }
        >
          <div className="space-y-4">
            <div>
              <label className="font-label-md text-on-surface mb-1 block">Category</label>
              <select value={form.category} onChange={(e) => setForm({...form, category: e.target.value})} className="w-full px-3 py-2 border border-outline-variant rounded-md font-body-md text-on-surface bg-surface focus:outline-none focus:ring-2 focus:ring-primary">
                {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <FormInput label="Title" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} placeholder="Brief title for your complaint" />
            <div>
              <label className="font-label-md text-on-surface mb-1 block">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} rows={4} className="w-full px-3 py-2 border border-outline-variant rounded-md font-body-md text-on-surface bg-surface focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Describe the issue in detail..." />
            </div>
            <div>
              <label className="font-label-md text-on-surface mb-2 block">Priority</label>
              <div className="grid grid-cols-3 gap-3">
                {['Low', 'Medium', 'High'].map(p => (
                  <button key={p} onClick={() => setForm({...form, priority: p})}
                    className={`border rounded-lg p-3 cursor-pointer text-center font-label-md capitalize transition-colors ${
                      form.priority === p ? 'border-secondary-container bg-[#fff3e0] text-secondary-container' : 'border-outline-variant text-on-surface hover:bg-surface-container-low'
                    }`}
                  >{p}</button>
                ))}
              </div>
            </div>
          </div>
        </Modal>

        <ConfirmModal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} onConfirm={handleDelete} loading={actionLoading} title="Delete Complaint" message="Are you sure you want to delete this complaint?" />
      </div>
    );
  }

  // ═══ ADMIN VIEW ═══
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-h1 font-h1 text-on-background">Complaints</h2>
          <p className="text-body-md text-on-surface-variant mt-1">Track and resolve tenant issues</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-card-gap mb-8">
        <StatCard icon="error" iconBg="bg-error-container" value={openCount} label="Open" />
        <StatCard icon="pending" iconBg="bg-[#fff8e1]" value={inProgressCount} label="In Progress" />
        <StatCard icon="check_circle" iconBg="bg-primary-container" value={resolvedCount} label="Resolved" />
        <StatCard icon="list" iconBg="bg-surface-container" value={complaints.length} label="Total" />
      </div>

      {/* Filter Bar */}
      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        placeholder="Search by tenant or title..."
        filters={[
          { type: 'select', value: filterCategory, onChange: setFilterCategory, options: [{ label: 'All Categories', value: 'all' }, ...categories.map(c => ({ label: c.label, value: c.value }))] },
          { type: 'select', value: filterPriority, onChange: setFilterPriority, options: [{ label: 'All Priorities', value: 'all' }, { label: 'Low', value: 'Low' }, { label: 'Medium', value: 'Medium' }, { label: 'High', value: 'High' }, { label: 'Urgent', value: 'Urgent' }] },
          { type: 'select', value: filterStatus, onChange: setFilterStatus, options: [{ label: 'All Status', value: 'all' }, { label: 'Open', value: 'Open' }, { label: 'In Progress', value: 'In Progress' }, { label: 'Resolved', value: 'Resolved' }, { label: 'Closed', value: 'Closed' }] },
        ]}
      />

      {/* Table */}
      <DataTable
        columns={[
          { header: 'Tenant', render: (row) => (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed font-label-md text-sm">
                {getInitials(row.tenantName)}
              </div>
              <span className="font-label-md text-on-surface">{row.tenantName || 'Unknown'}</span>
            </div>
          )},
          { header: 'Room', render: (row) => <span>{row.roomNumber || 'N/A'}</span> },
          { header: 'Category', render: (row) => <Badge status={row.category || 'Other'} label={row.category} /> },
          { header: 'Title', render: (row) => <span className="font-label-md">{row.title}</span> },
          { header: 'Priority', render: (row) => (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-label-sm capitalize ${priorityStyles[row.priority] || priorityStyles.Medium}`}>{row.priority}</span>
          )},
          { header: 'Status', render: (row) => <Badge status={row.status} /> },
          { header: 'Date', render: (row) => <span className="text-on-surface-variant">{row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '-'}</span> },
        ]}
        data={paged}
        actions={(row) => (
          <>
            <button onClick={() => { setSelectedComplaint(row); setStatusChange(row.status); setAdminNote(row.adminNote || ''); setShowViewModal(true); }} className="p-1.5 rounded text-on-surface-variant hover:text-primary">
              <span className="material-symbols-outlined text-[20px]">visibility</span>
            </button>
            {row.status === 'Open' && (
              <button onClick={() => handleStatusChange(row._id, 'In Progress')} className="p-1.5 rounded text-on-surface-variant hover:text-[#f57f17]" title="Move to In Progress">
                <span className="material-symbols-outlined text-[20px]">pending</span>
              </button>
            )}
            {row.status === 'In Progress' && (
              <button onClick={() => handleStatusChange(row._id, 'Resolved')} className="p-1.5 rounded text-on-surface-variant hover:text-green-600" title="Mark Resolved">
                <span className="material-symbols-outlined text-[20px]">check_circle</span>
              </button>
            )}
          </>
        )}
        pagination={{
          currentPage, totalPages, total: filtered.length,
          start: (currentPage - 1) * perPage + 1,
          end: Math.min(currentPage * perPage, filtered.length),
          onPageChange: setCurrentPage,
        }}
      />

      {/* View Complaint Modal */}
      <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title="Complaint Details"
        footer={
          <>
            <button onClick={() => setShowViewModal(false)} className="px-4 py-2 border border-outline-variant rounded text-on-surface font-label-md hover:bg-surface-container-low">Close</button>
            <button onClick={() => { if (selectedComplaint) handleStatusChange(selectedComplaint._id, statusChange, adminNote); setShowViewModal(false); }} disabled={actionLoading} className="px-4 py-2 bg-secondary-container hover:bg-secondary text-on-primary rounded font-label-md flex items-center gap-2 disabled:opacity-50">
              {actionLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
              Save Changes
            </button>
          </>
        }
      >
        {selectedComplaint && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge status={selectedComplaint.category} label={selectedComplaint.category} />
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-label-sm capitalize ${priorityStyles[selectedComplaint.priority] || priorityStyles.Medium}`}>{selectedComplaint.priority}</span>
              <Badge status={selectedComplaint.status} />
            </div>
            <h3 className="font-h3 text-on-background">{selectedComplaint.title}</h3>
            <p className="text-body-md text-on-surface-variant">{selectedComplaint.description}</p>
            <div className="border-t border-outline-variant pt-4 space-y-4">
              <div>
                <label className="font-label-md text-on-surface mb-1 block">Change Status</label>
                <select value={statusChange} onChange={(e) => setStatusChange(e.target.value)} className="w-full px-3 py-2 border border-outline-variant rounded-md font-body-md text-on-surface bg-surface">
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
              <div>
                <label className="font-label-md text-on-surface mb-1 block">Admin Notes</label>
                <textarea value={adminNote} onChange={(e) => setAdminNote(e.target.value)} rows={3} className="w-full px-3 py-2 border border-outline-variant rounded-md font-body-md text-on-surface bg-surface focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Add notes for the tenant..." />
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Complaints;
