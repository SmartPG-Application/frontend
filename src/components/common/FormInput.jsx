import React from 'react';

const FormInput = ({ label, error, type = 'text', readOnly, ...props }) => {
  return (
    <div>
      {label && (
        <label className="font-label-md text-on-surface mb-1 block">{label}</label>
      )}
      {type === 'textarea' ? (
        <textarea
          {...props}
          readOnly={readOnly}
          className={`w-full px-3 py-2 border border-outline-variant rounded-md font-body-md text-on-surface bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${readOnly ? 'bg-slate-100 cursor-not-allowed' : ''} ${error ? 'border-error' : ''}`}
        />
      ) : type === 'select' ? (
        <select
          {...props}
          disabled={readOnly}
          className={`w-full px-3 py-2 border border-outline-variant rounded-md font-body-md text-on-surface bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${readOnly ? 'bg-slate-100 cursor-not-allowed' : ''} ${error ? 'border-error' : ''}`}
        >
          {props.children}
        </select>
      ) : (
        <input
          type={type}
          {...props}
          readOnly={readOnly}
          className={`w-full px-3 py-2 border border-outline-variant rounded-md font-body-md text-on-surface bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${readOnly ? 'bg-slate-100 cursor-not-allowed' : ''} ${error ? 'border-error' : ''}`}
        />
      )}
      {error && <p className="text-error text-[12px] mt-1">{error}</p>}
    </div>
  );
};

export default FormInput;
