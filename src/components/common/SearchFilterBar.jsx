import React from 'react';

const SearchFilterBar = ({ searchValue, onSearchChange, placeholder, filters, onExport }) => {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-4 mb-6 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05)] flex flex-wrap gap-4 items-center justify-between">
      {/* Search input */}
      <div className="flex-1 min-w-[300px] relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
        <input
          type="text"
          placeholder={placeholder || 'Search...'}
          value={searchValue || ''}
          onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-surface border border-outline-variant rounded-md font-body-md text-on-surface focus:outline-none focus:border-primary"
        />
      </div>

      {/* Filter/Export buttons */}
      <div className="flex items-center gap-3">
        {filters && filters.map((filter, idx) => (
          <div key={idx} className="relative">
            {filter.type === 'select' ? (
              <select
                value={filter.value}
                onChange={(e) => filter.onChange(e.target.value)}
                className="flex items-center gap-2 px-4 py-2 border border-outline-variant rounded-md bg-surface-container-lowest text-on-surface font-label-md hover:bg-surface-container-low appearance-none pr-8 cursor-pointer"
              >
                {filter.options.map((opt, i) => (
                  <option key={i} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            ) : (
              <button
                onClick={filter.onClick}
                className="flex items-center gap-2 px-4 py-2 border border-outline-variant rounded-md bg-surface-container-lowest text-on-surface font-label-md hover:bg-surface-container-low transition-colors"
              >
                {filter.icon && <span className="material-symbols-outlined text-[18px]">{filter.icon}</span>}
                {filter.label}
              </button>
            )}
          </div>
        ))}
        {onExport && (
          <button
            onClick={onExport}
            className="flex items-center gap-2 px-4 py-2 border border-outline-variant rounded-md bg-surface-container-lowest text-on-surface font-label-md hover:bg-surface-container-low transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchFilterBar;
