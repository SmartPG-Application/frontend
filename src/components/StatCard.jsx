import React from 'react';

const StatCard = ({ icon, label, value, trend, trendDirection, iconBg }) => {
  const trendColor = trendDirection === 'up' ? 'bg-green-50 text-green-700' : trendDirection === 'down' ? 'bg-red-50 text-red-700' : 'bg-slate-50 text-slate-600';

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-6 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05)]">
      <div className="flex items-start justify-between">
        <div>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${iconBg || 'bg-primary-container'}`}>
            <span className="material-symbols-outlined text-[24px]">{icon}</span>
          </div>
          <div className="text-h1 font-h1 text-on-background">{value}</div>
          <div className="text-body-md text-on-surface-variant mt-1">{label}</div>
        </div>
        {trend && (
          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full font-label-sm ${trendColor}`}>
            {trendDirection === 'up' && <span className="material-symbols-outlined text-[14px]">trending_up</span>}
            {trendDirection === 'down' && <span className="material-symbols-outlined text-[14px]">trending_down</span>}
            {trend}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
