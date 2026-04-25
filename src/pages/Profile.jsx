import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/common/Badge';
import FormInput from '../components/common/FormInput';
import { tenantService } from '../services/tenantService';
import { paymentService } from '../services/paymentService';
import { complaintService } from '../services/complaintService';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', phone: '', emergencyContact: '' });
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' });
  const [room, setRoom] = useState(null);
  const [paymentCount, setPaymentCount] = useState(0);
  const [complaintCount, setComplaintCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setForm({ name: user.name || '', email: user.email || '', phone: user.phone || '', emergencyContact: user.emergencyContact || '' });
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [roomData, payments, complaints] = await Promise.all([
        user?.roomId ? tenantService.getRoomById(user.roomId).catch(() => null) : Promise.resolve(null),
        paymentService.getPaymentsByTenant(user?.id).catch(() => []),
        complaintService.getComplaintsByTenant(user?.id).catch(() => []),
      ]);
      setRoom(roomData || null);
      setPaymentCount(Array.isArray(payments) ? payments.length : 0);
      setComplaintCount(Array.isArray(complaints) ? complaints.length : 0);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const getInitials = (name) => name ? name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() : 'T';

  const getPasswordStrength = (pass) => {
    if (!pass) return 0;
    let s = 0;
    if (pass.length >= 8) s++;
    if (/[A-Z]/.test(pass)) s++;
    if (/[0-9]/.test(pass)) s++;
    if (/[^A-Za-z0-9]/.test(pass)) s++;
    return s;
  };

  const strength = getPasswordStrength(passwordForm.newPass);
  const strengthColor = strength <= 1 ? 'bg-error' : strength <= 2 ? 'bg-[#f57f17]' : 'bg-green-500';

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
          <h2 className="text-h1 font-h1 text-on-background">My Profile</h2>
          <p className="text-body-md text-on-surface-variant mt-1">Manage your personal information</p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (1/3) */}
        <div>
          <div className="bg-surface-container-lowest rounded-lg border border-outline-variant p-6 text-center shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05)]">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full mx-auto bg-primary-container flex items-center justify-center text-h1 font-h1 text-on-primary-container">
              {getInitials(user?.name)}
            </div>
            <h3 className="font-h3 text-on-background mt-4">{user?.name}</h3>
            <p className="text-body-md text-on-surface-variant">{user?.email}</p>
            <div className="mt-2">
              <Badge status="active" label="Tenant" />
            </div>

            {/* Divider */}
            <div className="border-t border-outline-variant my-4"></div>

            {/* Room Card (mini) */}
            <div className="bg-surface-container rounded-lg p-4 text-left">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-secondary-container text-[20px]">bed</span>
                <span className="font-label-md text-on-surface">Room {room?.roomNumber || 'N/A'}</span>
              </div>
              <p className="text-body-md text-on-surface-variant">Floor {room?.floor || 'N/A'} · {room?.type || 'Single'}</p>
              <p className="font-h3 text-primary mt-2">₹{(room?.rent || 0).toLocaleString()}/month</p>
            </div>

            {/* Stats */}
            <div className="flex justify-around mt-4 pt-4 border-t border-outline-variant">
              <div className="text-center">
                <p className="font-h3 text-on-background">{paymentCount}</p>
                <p className="text-[12px] text-on-surface-variant">Payments</p>
              </div>
              <div className="text-center">
                <p className="font-h3 text-on-background">{complaintCount}</p>
                <p className="text-[12px] text-on-surface-variant">Complaints</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Info Card */}
          <div className="bg-surface-container-lowest rounded-lg border border-outline-variant p-6 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05)]">
            <h3 className="font-h3 text-on-background mb-6">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput label="Full Name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} />
              <FormInput label="Email" value={form.email} readOnly />
              <FormInput label="Phone" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} placeholder="Enter phone number" />
              <FormInput label="Emergency Contact" value={form.emergencyContact} onChange={(e) => setForm({...form, emergencyContact: e.target.value})} placeholder="Emergency contact" />
              <FormInput label="ID Proof" value={user?.idProofType || 'Aadhar'} readOnly />
              <FormInput label="Member Since" value={user?.joinDate ? new Date(user.joinDate).toLocaleDateString() : new Date().toLocaleDateString()} readOnly />
            </div>
            <div className="flex justify-end mt-6">
              <button onClick={() => updateUser(form)} className="px-6 py-2.5 bg-secondary-container text-on-primary rounded font-label-md hover:bg-secondary transition-colors">
                Save Changes
              </button>
            </div>
          </div>

          {/* Change Password Card */}
          <div className="bg-surface-container-lowest rounded-lg border border-outline-variant p-6 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05)]">
            <h3 className="font-h3 text-on-background mb-6">Change Password</h3>
            <div className="space-y-4 max-w-md">
              <FormInput label="Current Password" type="password" value={passwordForm.current} onChange={(e) => setPasswordForm({...passwordForm, current: e.target.value})} placeholder="Enter current password" />
              <div>
                <FormInput label="New Password" type="password" value={passwordForm.newPass} onChange={(e) => setPasswordForm({...passwordForm, newPass: e.target.value})} placeholder="Enter new password" />
                {passwordForm.newPass && (
                  <div className={`h-1 rounded-full mt-1 ${strengthColor}`} style={{ width: `${(strength / 4) * 100}%`, transition: 'width 0.3s' }}></div>
                )}
              </div>
              <FormInput label="Confirm Password" type="password" value={passwordForm.confirm} onChange={(e) => setPasswordForm({...passwordForm, confirm: e.target.value})} placeholder="Confirm new password" error={passwordForm.confirm && passwordForm.confirm !== passwordForm.newPass ? 'Passwords do not match' : ''} />
            </div>
            <div className="flex justify-end mt-6">
              <button className="px-6 py-2.5 bg-secondary-container text-on-primary rounded font-label-md hover:bg-secondary transition-colors">
                Update Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
