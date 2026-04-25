import React from 'react';

const DataTable = ({ columns, data, onRowClick, actions, pagination }) => {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-surface-container-low border-b border-outline-variant">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className="px-6 py-4 font-label-sm text-on-surface-variant uppercase tracking-wider">
                  {col.header}
                </th>
              ))}
              {actions && (
                <th className="px-6 py-4 font-label-sm text-on-surface-variant uppercase tracking-wider text-right">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {data.map((row, rowIdx) => (
              <tr 
                key={rowIdx} 
                className={`hover:bg-surface-container-low transition-colors group ${onRowClick ? 'cursor-pointer' : ''} ${row.inactive ? 'opacity-70' : ''}`}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className="px-6 py-4 font-body-md text-on-surface">
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
                {actions && (
                  <td className="px-6 py-4 font-body-md text-on-surface text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end gap-2">
                      {actions(row)}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="bg-surface-container-lowest px-6 py-4 border-t border-outline-variant flex items-center justify-between">
          <div className="font-body-md text-on-surface-variant">
            Showing {pagination.start} to {pagination.end} of {pagination.total} items
          </div>
          <div className="flex items-center gap-2">
            <button 
              disabled={pagination.currentPage === 1}
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              className="p-1 rounded text-on-surface-variant hover:bg-surface-container-low disabled:opacity-50 flex items-center"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            {Array.from({ length: pagination.totalPages }).map((_, idx) => {
              const pageNum = idx + 1;
              const isActive = pageNum === pagination.currentPage;
              return (
                <button
                  key={pageNum}
                  onClick={() => pagination.onPageChange(pageNum)}
                  className={isActive 
                    ? "px-3 py-1 rounded bg-primary-fixed text-on-primary-fixed font-label-sm"
                    : "px-3 py-1 rounded text-on-surface-variant hover:bg-surface-container-low font-label-sm"}
                >
                  {pageNum}
                </button>
              );
            })}
            <button 
              disabled={pagination.currentPage === pagination.totalPages}
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              className="p-1 rounded text-on-surface-variant hover:bg-surface-container-low disabled:opacity-50 flex items-center"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
