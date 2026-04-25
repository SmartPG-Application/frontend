import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Badge from '../components/common/Badge';
import { tenantService } from '../services/tenantService';
import { paymentService } from '../services/paymentService';
import { complaintService } from '../services/complaintService';

const TenantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState(null);
  const [payments, setPayments] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, [id]);

  const fetchData = async () => {
    try {
      const [tenants, payData, compData, roomData] = await Promise.all([
        tenantService.getTenants().catch(() => []),
        paymentService.getAllPayments().catch(() => []),
        complaintService.getAllComplaints().catch(() => []),
        tenantService.getRooms().catch(() => []),
      ]);
      const t = Array.isArray(tenants) ? tenants.find(x => x._id === id) : null;
      setTenant(t);
      setPayments(Array.isArray(payData) ? payData.filter(p => p.tenantId === id) : []);
      setComplaints(Array.isArray(compData) ? compData.filter(c => c.tenantId === id) : []);
      setRooms(Array.isArray(roomData) ? roomData : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const getInitials = (name) => name ? name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() : 'T';
  const myRoom = rooms.find(r => r.tenantId === id || r.tenant === id);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary-container"></div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="text-center py-12 text-on-surface-variant">
        <span className="material-symbols-outlined text-[48px] mb-2">person_off</span>
        <p className="font-h3">Tenant not found</p>
        <button onClick={() => navigate('/tenants')} className="mt-4 px-4 py-2 bg-secondary-container text-on-primary rounded font-label-md hover:bg-secondary">
          Back to Tenants
        </button>
      </div>
    );
  }

  const paidPayments = payments.filter(p => p.status === 'paid').length;
  const pendingPayments = payments.filter(p => p.status === 'pending').length;
  const openComplaints = complaints.filter(c => c.status === 'open').length;

  return (
    <div>
      {/* Back button + Page Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/tenants')} className="p-2 rounded-full hover:bg-surface-container-low transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <h2 className="text-h1 font-h1 text-on-background">Tenant Details</h2>
          <p className="text-body-md text-on-surface-variant mt-1">View complete tenant profile</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left - Profile Card */}
        <div className="bg-surface-container-lowest rounded-lg border border-outline-variant p-6 text-center shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="w-20 h-20 rounded-full mx-auto bg-primary-fixed flex items-center justify-center text-on-primary-fixed text-h1 font-h1">
            {getInitials(tenant.name)}
          </div>
          <h3 className="font-h3 text-on-background mt-4">{tenant.name}</h3>
          <p className="text-body-md text-on-surface-variant">{tenant.email}</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Badge status="active" label="Tenant" />
            <Badge status={tenant.status || 'active'} />
          </div>

          <div className="border-t border-outline-variant my-4"></div>

          <div className="text-left space-y-3">
            <div className="flex justify-between">
              <span className="text-on-surface-variant text-body-md">Phone</span>
              <span className="font-label-md text-on-surface">{tenant.phone || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant text-body-md">Emergency</span>
              <span className="font-label-md text-on-surface">{tenant.emergencyContact || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant text-body-md">ID Proof</span>
              <span className="font-label-md text-on-surface">{tenant.idProofType || 'Aadhar'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant text-body-md">Joined</span>
              <span className="font-label-md text-on-surface">{tenant.joinDate ? new Date(tenant.joinDate).toLocaleDateString() : 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant text-body-md">Room</span>
              <span className="font-label-md text-on-surface">{tenant.roomNumber || myRoom?.roomNumber || 'N/A'}</span>
            </div>
          </div>

          <div className="border-t border-outline-variant my-4"></div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="font-h3 text-on-background">{paidPayments}</p>
              <p className="text-[11px] text-on-surface-variant">Paid</p>
            </div>
            <div>
              <p className="font-h3 text-[#f57f17]">{pendingPayments}</p>
              <p className="text-[11px] text-on-surface-variant">Pending</p>
            </div>
            <div>
              <p className="font-h3 text-error">{openComplaints}</p>
              <p className="text-[11px] text-on-surface-variant">Open</p>
            </div>
          </div>

          <button className="w-full mt-4 px-4 py-2 bg-secondary-container text-on-primary rounded font-label-md hover:bg-secondary transition-colors flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[18px]">send</span>
            Send Notification
          </button>
        </div>

        {/* Right - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Payment History */}
          <div className="bg-surface-container-lowest rounded-lg border border-outline-variant p-6 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05)]">
            <h3 className="font-h3 text-on-background mb-4">Payment History</h3>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-outline-variant">
                  <th className="pb-3 font-label-sm text-on-surface-variant uppercase tracking-wider">Month</th>
                  <th className="pb-3 font-label-sm text-on-surface-variant uppercase tracking-wider">Amount</th>
                  <th className="pb-3 font-label-sm text-on-surface-variant uppercase tracking-wider">Due</th>
                  <th className="pb-3 font-label-sm text-on-surface-variant uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {payments.slice(0, 5).map((p, i) => (
                  <tr key={i} className="hover:bg-surface-container-low transition-colors">
                    <td className="py-3 text-body-md text-on-surface">{p.month}/{p.year}</td>
                    <td className="py-3 text-body-md text-on-surface">₹{(p.amount || 0).toLocaleString()}</td>
                    <td className="py-3 text-body-md text-on-surface-variant">{p.dueDate ? new Date(p.dueDate).toLocaleDateString() : '-'}</td>
                    <td className="py-3"><Badge status={p.status} /></td>
                  </tr>
                ))}
                {payments.length === 0 && (
                  <tr><td colSpan={4} className="py-6 text-center text-on-surface-variant">No payment records</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Complaints */}
          <div className="bg-surface-container-lowest rounded-lg border border-outline-variant p-6 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05)]">
            <h3 className="font-h3 text-on-background mb-4">Complaints</h3>
            <div className="space-y-3">
              {complaints.slice(0, 5).map((c, i) => (
                <div key={i} className="p-3 rounded-lg border border-outline-variant hover:bg-surface-container-low transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Badge status={c.category || 'other'} label={c.category} />
                      <Badge status={c.status} />
                    </div>
                    <span className="text-[12px] text-on-surface-variant">{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ''}</span>
                  </div>
                  <p className="font-label-md text-on-background">{c.title}</p>
                  <p className="text-body-md text-on-surface-variant line-clamp-1 mt-0.5">{c.description}</p>
                </div>
              ))}
              {complaints.length === 0 && (
                <div className="text-center py-6 text-on-surface-variant">No complaints from this tenant</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantDetail;
