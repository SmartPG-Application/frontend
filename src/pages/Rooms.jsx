import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import FormInput from '../components/common/FormInput';
import { useToast } from '../components/common/Toast';
import { tenantService } from '../services/tenantService';

const Rooms = () => {
  const toast = useToast();
  const [rooms, setRooms] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [search, setSearch] = useState('');
  const [filterFloor, setFilterFloor] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [form, setForm] = useState({ roomNumber: '', floor: '', type: 'single', rent: '', amenities: [] });
  const [allocateForm, setAllocateForm] = useState({ tenantId: '', moveInDate: '' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [r, t] = await Promise.all([
        tenantService.getRooms().catch(() => []),
        tenantService.getTenants().catch(() => []),
      ]);
      setRooms(Array.isArray(r) ? r : []);
      setTenants(Array.isArray(t) ? t : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const allAmenities = ['WiFi', 'AC', 'Geyser', 'Laundry', 'Parking', 'TV', 'Balcony'];

  const filtered = rooms.filter(r => {
    if (search && !r.roomNumber?.toString().includes(search)) return false;
    if (filterFloor !== 'all' && r.floor?.toString() !== filterFloor) return false;
    if (filterType !== 'all' && r.type !== filterType) return false;
    if (filterStatus !== 'all') {
      const status = getRoomStatus(r);
      if (status !== filterStatus) return false;
    }
    return true;
  });

  const totalRooms = rooms.length;
  const available = rooms.filter(r => r.status === 'Available').length;
  const occupied = rooms.filter(r => r.status === 'Occupied').length;
  const maintenance = rooms.filter(r => r.status === 'Maintenance').length;
  const floors = [...new Set(rooms.map(r => r.floor))].sort();
  const getInitials = (name) => name ? name.charAt(0).toUpperCase() : 'T';
  const unassignedTenants = tenants.filter(t => !t.roomId && t.status !== 'inactive');

  function getRoomStatus(room) {
    // Model uses 'Available', 'Occupied', 'Maintenance' (capitalized)
    if (room.status === 'Maintenance') return 'maintenance';
    if (room.status === 'Occupied') return 'occupied';
    return 'available';
  }

  const getTenantForRoom = (room) => {
    if (!room || !room.occupants || room.occupants.length === 0) return null;
    // occupants might be populated objects or just IDs
    if (typeof room.occupants[0] === 'object' && room.occupants[0].name) {
      return room.occupants[0];
    }
    return tenants.find(t => room.occupants.some(occ => (occ._id || occ).toString() === t._id));
  };

  // ── ADD ROOM ──
  const handleAddRoom = async () => {
    if (!form.roomNumber || !form.floor || !form.rent) {
      toast.error('Room number, floor and rent are required');
      return;
    }
    setActionLoading(true);
    try {
      await tenantService.createRoom({
        roomNumber: form.roomNumber,
        floor: form.floor,
        type: form.type,
        rent: Number(form.rent),
        amenities: form.amenities,
      });
      toast.success(`Room ${form.roomNumber} created successfully`);
      setShowAddModal(false);
      setForm({ roomNumber: '', floor: '', type: 'single', rent: '', amenities: [] });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create room');
    } finally { setActionLoading(false); }
  };

  // ── EDIT ROOM ──
  const handleEditRoom = async () => {
    if (!selectedRoom) return;
    setActionLoading(true);
    try {
      await tenantService.updateRoom(selectedRoom._id, {
        floor: form.floor,
        type: form.type,
        rent: Number(form.rent),
        amenities: form.amenities,
      });
      toast.success(`Room ${form.roomNumber} updated`);
      setShowEditModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update room');
    } finally { setActionLoading(false); }
  };

  // ── ALLOCATE / RELEASE ROOM ──
  const handleAllocateOrRelease = async () => {
    if (!selectedRoom) return;
    const tenant = getTenantForRoom(selectedRoom);
    setActionLoading(true);

    try {
      if (tenant) {
        // RELEASE
        const tenantId = tenant._id;
        await tenantService.releaseRoom(selectedRoom._id, tenantId);
        toast.success(`Room ${selectedRoom.roomNumber} released`);
      } else {
        // ALLOCATE
        if (!allocateForm.tenantId) {
          toast.error('Please select a tenant');
          setActionLoading(false);
          return;
        }
        await tenantService.allocateRoom({ tenantId: allocateForm.tenantId, roomId: selectedRoom._id });
        toast.success(`Room ${selectedRoom.roomNumber} allocated successfully`);
      }
      setShowAllocateModal(false);
      setAllocateForm({ tenantId: '', moveInDate: '' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally { setActionLoading(false); }
  };

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
          <h2 className="text-h1 font-h1 text-on-background">Rooms</h2>
          <p className="text-body-md text-on-surface-variant mt-1">Manage property rooms</p>
        </div>
        <button onClick={() => { setForm({ roomNumber: '', floor: '', type: 'single', rent: '', amenities: [] }); setShowAddModal(true); }} className="bg-secondary-container hover:bg-secondary text-on-primary font-label-md px-4 py-2.5 rounded shadow-sm transition-colors flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px]">add</span>
          Add Room
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-card-gap mb-8">
        <StatCard icon="meeting_room" iconBg="bg-primary-container" value={totalRooms} label="Total Rooms" />
        <StatCard icon="check_circle" iconBg="bg-[#e8f5e9]" value={available} label="Available" />
        <StatCard icon="person" iconBg="bg-[#fff8e1]" value={occupied} label="Occupied" />
        <StatCard icon="build" iconBg="bg-error-container" value={maintenance} label="Maintenance" />
      </div>

      {/* Filter Bar */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-4 mb-6 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05)] flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[200px] relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
          <input type="text" placeholder="Search by room number..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-surface border border-outline-variant rounded-md font-body-md text-on-surface focus:outline-none focus:border-primary" />
        </div>
        <select value={filterFloor} onChange={(e) => setFilterFloor(e.target.value)} className="px-4 py-2 border border-outline-variant rounded-md bg-surface-container-lowest text-on-surface font-label-md">
          <option value="all">All Floors</option>
          {floors.map(f => <option key={f} value={f}>Floor {f}</option>)}
        </select>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-4 py-2 border border-outline-variant rounded-md bg-surface-container-lowest text-on-surface font-label-md">
          <option value="all">All Types</option>
          <option value="single">Single</option>
          <option value="double">Double</option>
          <option value="triple">Triple</option>
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-2 border border-outline-variant rounded-md bg-surface-container-lowest text-on-surface font-label-md">
          <option value="all">All Status</option>
          <option value="available">Available</option>
          <option value="occupied">Occupied</option>
          <option value="maintenance">Maintenance</option>
        </select>
      </div>

      {/* Room Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((room) => {
          const status = getRoomStatus(room);
          const tenant = getTenantForRoom(room);
          return (
            <div key={room._id || room.roomNumber} className="bg-surface-container-lowest rounded-lg border border-outline-variant p-6 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05)] hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-h2 text-on-background">Room {room.roomNumber}</h3>
                  <p className="text-body-md text-on-surface-variant">Floor {room.floor} · {room.type}</p>
                </div>
                <Badge status={status} />
              </div>

              <div className="border-t border-outline-variant my-4"></div>

              {tenant ? (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed font-label-md text-sm">
                    {getInitials(tenant.name)}
                  </div>
                  <div>
                    <p className="font-label-md text-on-surface">{tenant.name}</p>
                    <p className="text-[11px] text-on-surface-variant">Current Tenant</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-on-surface-variant text-body-md">
                  <span className="material-symbols-outlined text-[20px]">person_off</span>
                  No tenant assigned
                </div>
              )}

              <div className="flex justify-between items-center mt-3">
                <span className="font-h3 text-primary">₹{(room.rent || 0).toLocaleString()}/month</span>
                <div className="flex gap-1 flex-wrap justify-end">
                  {(room.amenities || []).slice(0, 3).map((a, i) => (
                    <span key={i} className="text-[11px] px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant">{a}</span>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t border-outline-variant">
                <button onClick={() => { setSelectedRoom(room); setForm({ roomNumber: room.roomNumber, floor: room.floor, type: room.type, rent: room.rent, amenities: room.amenities || [] }); setShowEditModal(true); }} className="flex-1 border border-outline-variant rounded py-2 text-on-surface font-label-md hover:bg-surface-container-low transition-colors text-center">
                  Edit
                </button>
                <button onClick={() => { setSelectedRoom(room); setAllocateForm({ tenantId: '', moveInDate: '' }); setShowAllocateModal(true); }} className="flex-1 bg-secondary-container text-on-primary rounded py-2 font-label-md hover:bg-secondary transition-colors text-center">
                  {tenant ? 'Release' : 'Allocate'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-on-surface-variant">
          <span className="material-symbols-outlined text-[48px] mb-2">meeting_room</span>
          <p>No rooms found</p>
        </div>
      )}

      {/* Add Room Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Room"
        footer={
          <>
            <button onClick={() => setShowAddModal(false)} className="px-4 py-2 border border-outline-variant rounded text-on-surface font-label-md hover:bg-surface-container-low">Cancel</button>
            <button onClick={handleAddRoom} disabled={actionLoading} className="px-4 py-2 bg-secondary-container hover:bg-secondary text-on-primary rounded font-label-md disabled:opacity-50 flex items-center gap-2">
              {actionLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
              Add Room
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <FormInput label="Room Number" value={form.roomNumber} onChange={(e) => setForm({...form, roomNumber: e.target.value})} placeholder="e.g. 101" />
          <FormInput label="Floor" value={form.floor} onChange={(e) => setForm({...form, floor: e.target.value})} placeholder="e.g. 1" />
          <div>
            <label className="font-label-md text-on-surface mb-1 block">Type</label>
            <select value={form.type} onChange={(e) => setForm({...form, type: e.target.value})} className="w-full px-3 py-2 border border-outline-variant rounded-md font-body-md text-on-surface bg-surface focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="single">Single</option>
              <option value="double">Double</option>
              <option value="triple">Triple</option>
            </select>
          </div>
          <FormInput label="Rent (₹)" type="number" value={form.rent} onChange={(e) => setForm({...form, rent: e.target.value})} placeholder="e.g. 8000" />
          <div>
            <label className="font-label-md text-on-surface mb-2 block">Amenities</label>
            <div className="grid grid-cols-3 gap-2">
              {allAmenities.map(a => (
                <label key={a} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.amenities.includes(a)} onChange={() => {
                    setForm(prev => ({
                      ...prev,
                      amenities: prev.amenities.includes(a) ? prev.amenities.filter(x => x !== a) : [...prev.amenities, a]
                    }));
                  }} className="rounded border-outline-variant" />
                  <span className="text-body-md text-on-surface">{a}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* Edit Room Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Room"
        footer={
          <>
            <button onClick={() => setShowEditModal(false)} className="px-4 py-2 border border-outline-variant rounded text-on-surface font-label-md hover:bg-surface-container-low">Cancel</button>
            <button onClick={handleEditRoom} disabled={actionLoading} className="px-4 py-2 bg-secondary-container hover:bg-secondary text-on-primary rounded font-label-md disabled:opacity-50 flex items-center gap-2">
              {actionLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
              Save Changes
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <FormInput label="Room Number" value={form.roomNumber} readOnly />
          <FormInput label="Floor" value={form.floor} onChange={(e) => setForm({...form, floor: e.target.value})} />
          <div>
            <label className="font-label-md text-on-surface mb-1 block">Type</label>
            <select value={form.type} onChange={(e) => setForm({...form, type: e.target.value})} className="w-full px-3 py-2 border border-outline-variant rounded-md font-body-md text-on-surface bg-surface">
              <option value="single">Single</option>
              <option value="double">Double</option>
              <option value="triple">Triple</option>
            </select>
          </div>
          <FormInput label="Rent (₹)" type="number" value={form.rent} onChange={(e) => setForm({...form, rent: e.target.value})} />
          <div>
            <label className="font-label-md text-on-surface mb-2 block">Amenities</label>
            <div className="grid grid-cols-3 gap-2">
              {allAmenities.map(a => (
                <label key={a} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.amenities.includes(a)} onChange={() => {
                    setForm(prev => ({ ...prev, amenities: prev.amenities.includes(a) ? prev.amenities.filter(x => x !== a) : [...prev.amenities, a] }));
                  }} className="rounded border-outline-variant" />
                  <span className="text-body-md text-on-surface">{a}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* Allocate / Release Room Modal */}
      <Modal isOpen={showAllocateModal} onClose={() => setShowAllocateModal(false)} title={getTenantForRoom(selectedRoom) ? `Release Room ${selectedRoom?.roomNumber}` : `Allocate Room ${selectedRoom?.roomNumber}`}
        footer={
          <>
            <button onClick={() => setShowAllocateModal(false)} className="px-4 py-2 border border-outline-variant rounded text-on-surface font-label-md hover:bg-surface-container-low">Cancel</button>
            <button onClick={handleAllocateOrRelease} disabled={actionLoading} className="px-4 py-2 bg-secondary-container hover:bg-secondary text-on-primary rounded font-label-md disabled:opacity-50 flex items-center gap-2">
              {actionLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
              {getTenantForRoom(selectedRoom) ? 'Release Room' : 'Allocate'}
            </button>
          </>
        }
      >
        {selectedRoom && getTenantForRoom(selectedRoom) ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-[#fff8e1] flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-[#f57f17] text-[32px]">logout</span>
            </div>
            <p className="font-label-md text-on-surface mb-2">Release <strong>{getTenantForRoom(selectedRoom)?.name}</strong> from Room {selectedRoom.roomNumber}?</p>
            <p className="text-body-md text-on-surface-variant">The tenant will be unassigned and the room will become available.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="font-label-md text-on-surface mb-1 block">Select Tenant</label>
              <select value={allocateForm.tenantId} onChange={(e) => setAllocateForm({...allocateForm, tenantId: e.target.value})} className="w-full px-3 py-2 border border-outline-variant rounded-md font-body-md text-on-surface bg-surface">
                <option value="">Choose a tenant...</option>
                {unassignedTenants.map(t => <option key={t._id} value={t._id}>{t.name} ({t.email})</option>)}
              </select>
            </div>
            <FormInput label="Move-in Date" type="date" value={allocateForm.moveInDate} onChange={(e) => setAllocateForm({...allocateForm, moveInDate: e.target.value})} />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Rooms;
