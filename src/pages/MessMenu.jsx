import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/common/Modal';
import { messService } from '../services/messService';
import { useToast } from '../components/common/Toast';

const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const fullDayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const defaultMenu = fullDayNames.map((day, i) => ({
  dayOfWeek: day, day: dayNames[i], date: '', breakfast: [], lunch: [], dinner: [], isVeg: true, note: ''
}));

const MessMenu = () => {
  const { user, isAdmin } = useAuth();
  const toast = useToast();
  const [weeklyMenu, setWeeklyMenu] = useState(defaultMenu);
  const [mealPrefs, setMealPrefs] = useState({ breakfast: true, lunch: true, dinner: false });
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRateModal, setShowRateModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [editForm, setEditForm] = useState({ breakfast: '', lunch: '', dinner: '', isVeg: true, note: '' });
  const [messRate, setMessRate] = useState(60);
  const [optInStats, setOptInStats] = useState({ breakfast: 0, lunch: 0, dinner: 0 });
  const [bill, setBill] = useState({ totalBill: 0, mealsCount: 0 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const today = new Date().getDay();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [menuData, rateData, statsData, billData] = await Promise.all([
        messService.getWeeklyMenu().catch(() => []),
        messService.getMessRate().catch(() => ({ ratePerMeal: 60 })),
        isAdmin ? messService.getStats().catch(() => ({ breakfast: 0, lunch: 0, dinner: 0 })) : Promise.resolve(null),
        !isAdmin ? messService.getBill(user?.id, new Date().getMonth() + 1, new Date().getFullYear()).catch(() => ({ totalBill: 0, mealsCount: 0 })) : Promise.resolve(null)
      ]);

      if (menuData && Array.isArray(menuData)) {
        const fullMenu = [...defaultMenu];
        menuData.forEach(item => {
          const idx = fullDayNames.indexOf(item.dayOfWeek);
          if (idx !== -1) {
            fullMenu[idx] = { ...fullMenu[idx], ...item, day: dayNames[idx] };
          }
        });
        setWeeklyMenu(fullMenu);
      }
      
      setMessRate(rateData?.ratePerMeal || 60);
      if (statsData) setOptInStats(statsData);
      if (billData) setBill(billData);

    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSaveMenu = async () => {
    setActionLoading(true);
    try {
      await messService.updateMenu({
        dayOfWeek: selectedDay.dayOfWeek,
        breakfast: editForm.breakfast.split(',').map(s => s.trim()).filter(s => s),
        lunch: editForm.lunch.split(',').map(s => s.trim()).filter(s => s),
        dinner: editForm.dinner.split(',').map(s => s.trim()).filter(s => s),
        isVeg: editForm.isVeg,
        note: editForm.note
      });
      toast.success('Menu updated successfully');
      setShowEditModal(false);
      fetchData();
    } catch (err) {
      toast.error('Failed to update menu');
    } finally { setActionLoading(false); }
  };

  const handleSaveRate = async () => {
    setActionLoading(true);
    try {
      await messService.updateMessRate(messRate);
      toast.success('Mess rate updated');
      setShowRateModal(false);
      fetchData();
    } catch (err) {
      toast.error('Failed to update rate');
    } finally { setActionLoading(false); }
  };

  const saveMealPrefs = async () => {
    setActionLoading(true);
    try {
      const meals = Object.entries(mealPrefs);
      for (const [meal, optIn] of meals) {
        if (optIn) {
          await messService.optIn({ tenantId: user?.id, date: new Date().toISOString(), mealType: meal, cost: messRate }).catch(() => {});
        } else {
          await messService.optOut({ tenantId: user?.id, date: new Date().toISOString(), mealType: meal }).catch(() => {});
        }
      }
      toast.success('Preferences saved');
      fetchData();
    } catch (err) {
      toast.error('Failed to save preferences');
    } finally { setActionLoading(false); }
  };

  // ═══ ADMIN VIEW ═══
  if (isAdmin) {
    return (
      <div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-h1 font-h1 text-on-background">Mess Menu</h2>
            <p className="text-body-md text-on-surface-variant mt-1">Manage weekly meal menu</p>
          </div>
          <button onClick={() => { setSelectedDay(weeklyMenu[today]); setEditForm({ breakfast: (weeklyMenu[today].breakfast || []).join(', '), lunch: (weeklyMenu[today].lunch || []).join(', '), dinner: (weeklyMenu[today].dinner || []).join(', '), isVeg: weeklyMenu[today].isVeg, note: weeklyMenu[today].note || '' }); setShowEditModal(true); }} className="bg-secondary-container hover:bg-secondary text-on-primary font-label-md px-4 py-2.5 rounded shadow-sm transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">edit_calendar</span>
            Update Today's Menu
          </button>
        </div>

        {/* Mess Rate Setting */}
        <div className="bg-surface-container-lowest rounded-lg p-4 mb-6 border border-outline-variant shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05)] flex items-center justify-between">
          <div>
            <p className="font-label-md text-on-surface-variant">Mess Rate</p>
            <p className="font-h3 text-primary">₹{messRate} per meal</p>
          </div>
          <button onClick={() => setShowRateModal(true)} className="px-4 py-2 border border-outline-variant rounded-md text-on-surface font-label-md hover:bg-surface-container-low transition-colors">
            Edit Rate
          </button>
        </div>

        {/* Today's Opt-in Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Breakfast', key: 'breakfast', icon: 'egg_alt' },
            { label: 'Lunch', key: 'lunch', icon: 'lunch_dining' },
            { label: 'Dinner', key: 'dinner', icon: 'dinner_dining' }
          ].map((meal) => (
            <div key={meal.key} className="bg-surface-container-lowest rounded-lg p-4 border border-outline-variant shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05)] text-center">
              <span className="material-symbols-outlined text-[24px] text-secondary-container">{meal.icon}</span>
              <p className="font-h3 text-on-background mt-2">{optInStats[meal.key] || 0}</p>
              <p className="text-body-md text-on-surface-variant">tenants opted for {meal.label}</p>
            </div>
          ))}
        </div>

        {/* Weekly Menu Calendar */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {weeklyMenu.map((day, idx) => {
            const isToday = idx === today;
            return (
              <div key={idx} className={`bg-surface-container-lowest rounded-lg p-4 border ${isToday ? 'border-secondary-container border-2' : 'border-outline-variant'} shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05)]`}>
                <p className="font-label-md text-on-surface">{dayNames[idx]}</p>
                <p className="text-[12px] text-on-surface-variant mb-3">{isToday ? 'Today' : ''}</p>

                {/* Meals */}
                {['breakfast', 'lunch', 'dinner'].map((mealType) => (
                  <div key={mealType} className="mb-2">
                    <p className="text-[11px] font-label-sm text-on-surface-variant uppercase mb-1">{mealType}</p>
                    <div className="flex flex-wrap gap-1">
                      {(day[mealType] || []).length > 0 ? (
                        day[mealType].map((item, i) => (
                          <span key={i} className="text-[11px] px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant">{item}</span>
                        ))
                      ) : (
                        <span className="text-[11px] text-on-surface-variant italic">Not set</span>
                      )}
                    </div>
                  </div>
                ))}

                {day.isVeg && (
                  <div className="flex items-center gap-1 mt-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <span className="text-[11px] text-green-700">Veg</span>
                  </div>
                )}

                <button onClick={() => { setSelectedDay(day); setEditForm({ breakfast: (day.breakfast || []).join(', '), lunch: (day.lunch || []).join(', '), dinner: (day.dinner || []).join(', '), isVeg: day.isVeg, note: day.note || '' }); setShowEditModal(true); }} className="text-secondary-container font-label-md hover:underline mt-2 text-[12px]">
                  Edit
                </button>
              </div>
            );
          })}
        </div>

        {/* Edit Menu Modal */}
        <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title={`Edit Menu — ${selectedDay?.dayOfWeek || ''}`}
          footer={
            <>
              <button onClick={() => setShowEditModal(false)} className="px-4 py-2 border border-outline-variant rounded text-on-surface font-label-md hover:bg-surface-container-low">Cancel</button>
              <button onClick={handleSaveMenu} disabled={actionLoading} className="px-4 py-2 bg-secondary-container hover:bg-secondary text-on-primary rounded font-label-md disabled:opacity-50">
                {actionLoading ? 'Saving...' : 'Save Menu'}
              </button>
            </>
          }
        >
          <div className="space-y-4">
            <div>
              <label className="font-label-md text-on-surface mb-1 block">Breakfast Items (comma separated)</label>
              <input type="text" value={editForm.breakfast} onChange={(e) => setEditForm({...editForm, breakfast: e.target.value})} className="w-full px-3 py-2 border border-outline-variant rounded-md font-body-md text-on-surface bg-surface focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Idli, Dosa, Chutney" />
            </div>
            <div>
              <label className="font-label-md text-on-surface mb-1 block">Lunch Items</label>
              <input type="text" value={editForm.lunch} onChange={(e) => setEditForm({...editForm, lunch: e.target.value})} className="w-full px-3 py-2 border border-outline-variant rounded-md font-body-md text-on-surface bg-surface focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Rice, Dal, Sabji" />
            </div>
            <div>
              <label className="font-label-md text-on-surface mb-1 block">Dinner Items</label>
              <input type="text" value={editForm.dinner} onChange={(e) => setEditForm({...editForm, dinner: e.target.value})} className="w-full px-3 py-2 border border-outline-variant rounded-md font-body-md text-on-surface bg-surface focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Roti, Curry, Salad" />
            </div>
            <div className="flex items-center gap-3">
              <label className="font-label-md text-on-surface">Veg/Non-veg</label>
              <button onClick={() => setEditForm({...editForm, isVeg: !editForm.isVeg})} className={`w-12 h-6 rounded-full cursor-pointer transition-colors duration-200 relative ${editForm.isVeg ? 'bg-green-500' : 'bg-red-400'}`}>
                <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform duration-200 shadow ${editForm.isVeg ? 'translate-x-6' : 'translate-x-1'}`}></div>
              </button>
              <span className="text-body-md">{editForm.isVeg ? 'Veg' : 'Non-Veg'}</span>
            </div>
            <div>
              <label className="font-label-md text-on-surface mb-1 block">Special Note</label>
              <textarea value={editForm.note} onChange={(e) => setEditForm({...editForm, note: e.target.value})} rows={2} className="w-full px-3 py-2 border border-outline-variant rounded-md font-body-md text-on-surface bg-surface focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Any special notes..." />
            </div>
          </div>
        </Modal>

        {/* Edit Rate Modal */}
        <Modal isOpen={showRateModal} onClose={() => setShowRateModal(false)} title="Edit Mess Rate"
          footer={
            <>
              <button onClick={() => setShowRateModal(false)} className="px-4 py-2 border border-outline-variant rounded text-on-surface font-label-md hover:bg-surface-container-low">Cancel</button>
              <button onClick={handleSaveRate} disabled={actionLoading} className="px-4 py-2 bg-secondary-container hover:bg-secondary text-on-primary rounded font-label-md disabled:opacity-50">
                {actionLoading ? 'Saving...' : 'Save'}
              </button>
            </>
          }
        >
          <div>
            <label className="font-label-md text-on-surface mb-1 block">Rate per Meal (₹)</label>
            <input type="number" value={messRate} onChange={(e) => setMessRate(Number(e.target.value))} className="w-full px-3 py-2 border border-outline-variant rounded-md font-body-md text-on-surface bg-surface focus:outline-none focus:ring-2 focus:ring-primary" />
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
          <h2 className="text-h1 font-h1 text-on-background">Mess Menu</h2>
          <p className="text-body-md text-on-surface-variant mt-1">Weekly menu and meal preferences</p>
        </div>
      </div>

      {/* Today's Meal Opt-in */}
      <div className="bg-primary-container rounded-lg p-6 mb-6">
        <h3 className="font-h3 text-on-primary-container">Today's Meals</h3>
        <p className="text-body-md text-on-primary-container/70 mb-4">Set your meal preferences for today</p>

        <div className="space-y-0">
          {[
            { emoji: '🍳', label: 'Breakfast', key: 'breakfast' },
            { emoji: '🍱', label: 'Lunch', key: 'lunch' },
            { emoji: '🍽️', label: 'Dinner', key: 'dinner' },
          ].map((meal, idx) => (
            <div key={meal.key} className={`flex justify-between items-center py-3 ${idx < 2 ? 'border-b border-on-primary-container/20' : ''}`}>
              <span className="font-label-md text-on-primary-container">{meal.emoji} {meal.label}</span>
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

        <button onClick={saveMealPrefs} disabled={actionLoading} className="w-full mt-4 bg-secondary-container text-on-primary py-2.5 rounded font-label-md hover:bg-secondary transition-colors disabled:opacity-50">
          {actionLoading ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>

      {/* Weekly Menu (read only) */}
      <h3 className="font-h3 text-on-background mb-4">This Week's Menu</h3>
      <div className="grid grid-cols-1 md:grid-cols-7 gap-3 mb-6">
        {weeklyMenu.map((day, idx) => {
          const isToday = idx === today;
          return (
            <div key={idx} className={`bg-surface-container-lowest rounded-lg p-4 border ${isToday ? 'border-secondary-container border-2' : 'border-outline-variant'}`}>
              <p className="font-label-md text-on-surface">{dayNames[idx]}</p>
              <p className="text-[12px] text-on-surface-variant mb-3">{isToday ? 'Today' : ''}</p>
              {['breakfast', 'lunch', 'dinner'].map((mealType) => (
                <div key={mealType} className="mb-2">
                  <p className="text-[11px] font-label-sm text-on-surface-variant uppercase mb-1">{mealType}</p>
                  <div className="flex flex-wrap gap-1">
                    {(day[mealType] || []).length > 0 ? (
                      day[mealType].map((item, i) => (
                        <span key={i} className="text-[11px] px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant">{item}</span>
                      ))
                    ) : (
                      <span className="text-[11px] text-on-surface-variant italic">Not set</span>
                    )}
                  </div>
                </div>
              ))}
              {day.isVeg && (
                <div className="flex items-center gap-1 mt-2">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  <span className="text-[11px] text-green-700">Veg</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* My Mess Bill */}
      <div className="bg-surface-container-lowest rounded-lg p-6 border border-outline-variant shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05)]">
        <h3 className="font-h3 text-on-background mb-4">My Mess Bill — {new Date().toLocaleString('default', { month: 'long' })}</h3>
        <div className="grid grid-cols-3 gap-4 mb-4 text-center">
          <div className="p-3 bg-surface-container rounded-lg">
            <p className="font-h3 text-on-background">{bill.mealsCount || 0}</p>
            <p className="text-body-md text-on-surface-variant">Total Meals</p>
          </div>
          <div className="p-3 bg-surface-container rounded-lg">
            <p className="font-h3 text-primary">₹{messRate}</p>
            <p className="text-body-md text-on-surface-variant">Rate/Meal</p>
          </div>
          <div className="p-3 bg-surface-container rounded-lg">
            <p className="font-h3 text-secondary-container">₹{bill.totalBill || 0}</p>
            <p className="text-body-md text-on-surface-variant">Total</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessMenu;
