import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import DataTable from '../components/common/DataTable';
import SearchFilterBar from '../components/common/SearchFilterBar';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import ConfirmModal from '../components/common/ConfirmModal';
import FormInput from '../components/common/FormInput';
import { useToast } from '../components/common/Toast';
import { tenantService } from '../services/tenantService';

const Tenants = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [tenants, setTenants] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', emergencyContact: '', idProofType: 'Aadhar', roomId: '' });
  const perPage = 10;

  // Pending approval state
  const [pendingTenants, setPendingTenants] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedPending, setSelectedPending] = useState(null);
  const [approveRoomId, setApproveRoomId] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [availableRooms, setAvailableRooms] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [t, r] = await Promise.all([
        tenantService.getTenants().catch(() => []),
        tenantService.getRooms().catch(() => []),
      ]);
      setTenants(Array.isArray(t) ? t : []);
      setRooms(Array.isArray(r) ? r : []);
      setAvailableRooms(Array.isArray(r) ? r.filter(rm => rm.status === 'Available') : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }

    // Fetch pending separately
    fetchPending();
  };

  const fetchPending = async () => {
    setPendingLoading(true);
    try {
      const res = await tenantService.getPendingTenants();
      setPendingTenants(res.tenants || []);
    } catch { setPendingTenants([]); }
    finally { setPendingLoading(false); }
  };

  const filtered = tenants.filter(t => {
    const q = search.toLowerCase();
    return (t.name?.toLowerCase().includes(q) || t.email?.toLowerCase().includes(q) || t.phone?.includes(q) || t.roomNumber?.toString().includes(q));
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);
  const getInitials = (name) => name ? name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() : 'T';

  const handleAdd = async () => {
    setActionLoading(true);
    try {
      await tenantService.adminCreateTenant({ ...form, role: 'tenant' });
      setShowAddModal(false);
      setForm({ name: '', email: '', phone: '', password: '', emergencyContact: '', idProofType: 'Aadhar', roomId: '' });
      toast.success('Tenant created successfully');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create tenant');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedTenant) return;
    setActionLoading(true);
    try {
      await tenantService.updateTenant(selectedTenant._id, form);
      setShowEditModal(false);
      setSelectedTenant(null);
      toast.success('Tenant updated successfully');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update tenant');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedTenant) return;
    setActionLoading(true);
    try {
      await tenantService.deleteTenant(selectedTenant._id);
      toast.success('Tenant deleted successfully');
      setShowDeleteModal(false);
      setSelectedTenant(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete tenant');
    } finally {
      setActionLoading(false);
    }
  };

  // Approve handler
  const handleApprove = async () => {
    if (!selectedPending) return;
    setActionLoading(true);
    try {
      await tenantService.approveTenant(selectedPending._id, approveRoomId || null);
      toast.success(`${selectedPending.name} approved successfully!`);
      setShowApproveModal(false);
      setSelectedPending(null);
      setApproveRoomId('');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Approval failed');
    } finally { setActionLoading(false); }
  };

  // Reject handler
  const handleReject = async () => {
    if (!selectedPending) return;
    setActionLoading(true);
    try {
      await tenantService.rejectTenant(selectedPending._id, rejectReason);
      toast.success(`${selectedPending.name}'s registration rejected`);
      setShowRejectModal(false);
      setSelectedPending(null);
      setRejectReason('');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Rejection failed');
    } finally { setActionLoading(false); }
  };

  // Time ago helper
  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const columns = [
    {
      header: 'Name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed font-h3">
            {getInitials(row.name)}
          </div>
          <div>
            <div className="font-label-md text-on-surface">{row.name}</div>
            <div className="text-[13px] text-on-surface-variant">{row.email}</div>
          </div>
        </div>
      )
    },
    { header: 'Room', accessor: 'roomNumber', render: (row) => <span>{row.roomNumber || 'N/A'}</span> },
    { header: 'Phone', accessor: 'phone', render: (row) => <span>{row.phone || 'N/A'}</span> },
    { header: 'Join Date', render: (row) => <span>{row.joinDate ? new Date(row.joinDate).toLocaleDateString() : row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'N/A'}</span> },
    { header: 'Status', render: (row) => <Badge status={row.status || 'active'} /> },
  ];

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
          <h2 className="text-h1 font-h1 text-on-background">Tenants</h2>
          <p className="text-body-md text-on-surface-variant mt-1">Manage all current and past residents</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="bg-secondary-container hover:bg-secondary text-on-primary font-label-md px-4 py-2.5 rounded shadow-sm transition-colors flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px]">person_add</span>
          Add New Tenant
        </button>
      </div>

      {/* ══════════════ PENDING APPROVALS SECTION ══════════════ */}
      {pendingTenants.length > 0 && (
        <div className="mb-6 bg-[#fff8e1] border border-[#ffe082] rounded-xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-[#fff3e0] border-b border-[#ffe082]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#fff8e1] border border-[#ffe082] flex items-center justify-center">
                <span className="material-symbols-outlined text-[#f57f17]" style={{ fontSize: '18px' }}>pending_actions</span>
              </div>
              <span className="text-[16px] font-semibold text-[#e65100]">Pending Approvals</span>
              <span className="w-6 h-6 rounded-full bg-[#f57f17] text-white text-[11px] font-bold flex items-center justify-center">
                {pendingTenants.length}
              </span>
            </div>
            <span className="text-[13px] text-[#f57f17]">{pendingTenants.length} tenant(s) awaiting review</span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#ffe082]">
                  {['Name', 'Phone', 'ID Proof', 'Registered', 'Actions'].map(h => (
                    <th key={h} className="px-6 py-3 text-[12px] font-semibold text-[#e65100] uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pendingTenants.map((t) => (
                  <tr key={t._id} className="border-b border-[#ffe082]/50 hover:bg-[#fff3e0]/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#ffe082] flex items-center justify-center text-[#e65100] text-[13px] font-bold">
                          {getInitials(t.name)}
                        </div>
                        <div>
                          <div className="font-label-md text-[#3e2723]">{t.name}</div>
                          <div className="text-[12px] text-[#795548]">{t.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[13px] text-[#5d4037]">{t.phone || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#fff3e0] text-[#e65100] border border-[#ffe082]">
                        {t.idProofType || 'Aadhar'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[13px] text-[#795548]">{timeAgo(t.createdAt)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setSelectedPending(t); setApproveRoomId(''); setShowApproveModal(true); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#e8f5e9] text-[#2e7d32] border border-[#a5d6a7] rounded-lg text-[13px] font-semibold hover:bg-[#c8e6c9] transition-colors"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check</span>
                          Approve
                        </button>
                        <button
                          onClick={() => { setSelectedPending(t); setRejectReason(''); setShowRejectModal(true); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-error-container text-error border border-[#ef9a9a] rounded-lg text-[13px] font-semibold hover:bg-[#ffcdd2] transition-colors"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        placeholder="Search by name, room, or phone..."
        filters={[
          { label: 'Filter', icon: 'filter_list', onClick: () => {} },
        ]}
        onExport={() => {}}
      />

      {/* Table */}
      <DataTable
        columns={columns}
        data={paged}
        actions={(row) => (
          <>
            <button onClick={() => { setSelectedTenant(row); setShowViewModal(true); }} className="p-1.5 rounded text-on-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-[20px]">visibility</span>
            </button>
            {row.status !== 'inactive' && (
              <button onClick={() => { setSelectedTenant(row); setForm({ name: row.name, email: row.email, phone: row.phone || '', password: '', emergencyContact: row.emergencyContact || '', idProofType: row.idProofType || 'Aadhar', roomId: row.roomId || '' }); setShowEditModal(true); }} className="p-1.5 rounded text-on-surface-variant hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-[20px]">edit</span>
              </button>
            )}
            <button onClick={() => { setSelectedTenant(row); setShowDeleteModal(true); }} className="p-1.5 rounded text-on-surface-variant hover:text-error transition-colors">
              <span className="material-symbols-outlined text-[20px]">delete</span>
            </button>
          </>
        )}
        pagination={{
          currentPage,
          totalPages,
          total: filtered.length,
          start: (currentPage - 1) * perPage + 1,
          end: Math.min(currentPage * perPage, filtered.length),
          onPageChange: setCurrentPage,
        }}
      />

      {/* ══════════════ APPROVE MODAL ══════════════ */}
      <Modal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        title="Approve Tenant"
        footer={
          <>
            <button onClick={() => setShowApproveModal(false)} className="px-4 py-2 border border-outline-variant rounded text-on-surface font-label-md hover:bg-surface-container-low transition-colors">Cancel</button>
            <button onClick={handleApprove} disabled={actionLoading} className="px-4 py-2 bg-[#2e7d32] hover:bg-[#1b5e20] text-white rounded font-label-md transition-colors flex items-center gap-2 disabled:opacity-50">
              {actionLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check</span>
              Approve Tenant
            </button>
          </>
        }
      >
        {selectedPending && (
          <div>
            {/* Tenant summary card */}
            <div className="bg-surface-container rounded-xl p-4 mb-5 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed font-h2">
                {getInitials(selectedPending.name)}
              </div>
              <div>
                <h4 className="font-h3 text-on-background">{selectedPending.name}</h4>
                <p className="text-[13px] text-on-surface-variant">{selectedPending.email}</p>
                <p className="text-[13px] text-on-surface-variant">{selectedPending.phone}</p>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#fff3e0] text-[#e65100] border border-[#ffe082] mt-1">
                  {selectedPending.idProofType || 'Aadhar'}
                </span>
              </div>
            </div>

            {/* Room assignment */}
            <div className="mb-4">
              <label className="font-label-md text-on-surface mb-1 block">Assign Room (optional)</label>
              <select
                value={approveRoomId}
                onChange={(e) => setApproveRoomId(e.target.value)}
                className="w-full px-3 py-2 border border-outline-variant rounded-md font-body-md text-on-surface bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">— Assign room later —</option>
                {availableRooms.map(r => (
                  <option key={r._id} value={r._id}>
                    Room {r.roomNumber} — {r.type} — ₹{r.rent}/month
                  </option>
                ))}
              </select>
            </div>

            {/* Info note */}
            <div className="bg-[#e8f5e9] rounded-xl p-3 border border-[#a5d6a7] flex items-start gap-2">
              <span className="material-symbols-outlined text-[#2e7d32] flex-shrink-0" style={{ fontSize: '16px' }}>info</span>
              <p className="text-[12px] text-[#2e7d32]">Tenant will be notified and can login immediately after approval.</p>
            </div>
          </div>
        )}
      </Modal>

      {/* ══════════════ REJECT MODAL ══════════════ */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Reject Registration"
        footer={
          <>
            <button onClick={() => setShowRejectModal(false)} className="px-4 py-2 border border-outline-variant rounded text-on-surface font-label-md hover:bg-surface-container-low transition-colors">Cancel</button>
            <button onClick={handleReject} disabled={actionLoading} className="px-4 py-2 bg-error text-on-error hover:bg-red-700 rounded font-label-md transition-colors flex items-center gap-2 disabled:opacity-50">
              {actionLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
              Reject Registration
            </button>
          </>
        }
      >
        {selectedPending && (
          <div>
            <div className="flex flex-col items-center text-center mb-4">
              <div className="w-16 h-16 rounded-full bg-error-container flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-error text-[32px]">warning</span>
              </div>
              <h3 className="font-h3 text-on-background mb-2">Reject Registration</h3>
              <p className="text-body-md text-on-surface-variant">
                Are you sure you want to reject <strong>{selectedPending.name}</strong>'s registration? They will be notified.
              </p>
            </div>
            <div className="mt-4">
              <label className="font-label-md text-on-surface mb-1 block">Reason (optional)</label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Briefly explain why..."
                className="w-full px-3 py-2 border border-outline-variant rounded-md font-body-md text-on-surface bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Add Tenant Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Tenant"
        footer={
          <>
            <button onClick={() => setShowAddModal(false)} className="px-4 py-2 border border-outline-variant rounded text-on-surface font-label-md hover:bg-surface-container-low transition-colors">Cancel</button>
            <button onClick={handleAdd} disabled={actionLoading} className="px-4 py-2 bg-secondary-container hover:bg-secondary text-on-primary rounded font-label-md transition-colors flex items-center gap-2 disabled:opacity-50">
              {actionLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
              Add Tenant
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <FormInput label="Full Name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} placeholder="Enter full name" />
          <FormInput label="Email" type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} placeholder="Enter email" />
          <FormInput label="Phone" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} placeholder="Enter phone number" />
          <FormInput label="Password (leave blank to auto-generate)" type="password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} placeholder="Auto-generated if empty" />
          <FormInput label="Emergency Contact" value={form.emergencyContact} onChange={(e) => setForm({...form, emergencyContact: e.target.value})} placeholder="Emergency contact" />
          <div>
            <label className="font-label-md text-on-surface mb-1 block">ID Proof Type</label>
            <select value={form.idProofType} onChange={(e) => setForm({...form, idProofType: e.target.value})} className="w-full px-3 py-2 border border-outline-variant rounded-md font-body-md text-on-surface bg-surface focus:outline-none focus:ring-2 focus:ring-primary">
              <option>Aadhar</option>
              <option>PAN</option>
              <option>Passport</option>
              <option value="DrivingLicense">Driving License</option>
            </select>
          </div>
          <div>
            <label className="font-label-md text-on-surface mb-1 block">Assign Room</label>
            <select value={form.roomId} onChange={(e) => setForm({...form, roomId: e.target.value})} className="w-full px-3 py-2 border border-outline-variant rounded-md font-body-md text-on-surface bg-surface focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="">Select a room</option>
              {availableRooms.map(r => (
                <option key={r._id} value={r._id}>Room {r.roomNumber} (Floor {r.floor})</option>
              ))}
            </select>
          </div>
        </div>
      </Modal>

      {/* Edit Tenant Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Tenant"
        footer={
          <>
            <button onClick={() => setShowEditModal(false)} className="px-4 py-2 border border-outline-variant rounded text-on-surface font-label-md hover:bg-surface-container-low transition-colors">Cancel</button>
            <button onClick={handleEdit} disabled={actionLoading} className="px-4 py-2 bg-secondary-container hover:bg-secondary text-on-primary rounded font-label-md transition-colors flex items-center gap-2 disabled:opacity-50">
              {actionLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
              Save Changes
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <FormInput label="Full Name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} />
          <FormInput label="Email" type="email" value={form.email} readOnly />
          <FormInput label="Phone" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} />
          <FormInput label="Emergency Contact" value={form.emergencyContact} onChange={(e) => setForm({...form, emergencyContact: e.target.value})} />
        </div>
      </Modal>

      {/* View Tenant Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Tenant Details"
      >
        {selectedTenant && (
          <div>
            <div className="flex flex-col items-center mb-6">
              <div className="w-20 h-20 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed text-h1 font-h1 mb-3">
                {getInitials(selectedTenant.name)}
              </div>
              <h3 className="font-h3 text-on-background">{selectedTenant.name}</h3>
              <div className="flex items-center gap-2 mt-2">
                <Badge status="active" label="Tenant" />
                <Badge status={selectedTenant.status || 'active'} />
              </div>
            </div>
            <div className="border-t border-outline-variant pt-4 space-y-3">
              <h4 className="font-label-md text-on-surface-variant uppercase tracking-wider">Personal Info</h4>
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-[12px] text-on-surface-variant">Email</p><p className="font-label-md">{selectedTenant.email}</p></div>
                <div><p className="text-[12px] text-on-surface-variant">Phone</p><p className="font-label-md">{selectedTenant.phone || 'N/A'}</p></div>
                <div><p className="text-[12px] text-on-surface-variant">Room</p><p className="font-label-md">{selectedTenant.roomNumber || 'N/A'}</p></div>
                <div><p className="text-[12px] text-on-surface-variant">Joined</p><p className="font-label-md">{selectedTenant.joinDate ? new Date(selectedTenant.joinDate).toLocaleDateString() : selectedTenant.createdAt ? new Date(selectedTenant.createdAt).toLocaleDateString() : 'N/A'}</p></div>
                <div><p className="text-[12px] text-on-surface-variant">Emergency Contact</p><p className="font-label-md">{selectedTenant.emergencyContact || 'N/A'}</p></div>
                <div><p className="text-[12px] text-on-surface-variant">ID Proof</p><p className="font-label-md">{selectedTenant.idProofType || 'N/A'}</p></div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        loading={actionLoading}
        title="Delete Tenant"
        message={`Are you sure you want to remove ${selectedTenant?.name}? This action cannot be undone.`}
        confirmText="Delete"
      />
    </div>
  );
};

export default Tenants;
