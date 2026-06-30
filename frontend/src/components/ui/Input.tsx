import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, className = '', ...props }, ref) => {
  return (
    <div className="w-full flex flex-col gap-1.5 mb-4">
      <label className="text-sm font-medium text-brand-text">
        {label}
      </label>
      <input
        ref={ref}
        className={`w-full px-4 py-2.5 rounded-xl border ${error ? 'border-brand-error focus:ring-brand-error' : 'border-brand-border focus:ring-brand-primary'} bg-brand-bg text-brand-text placeholder-brand-textSecondary focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-brand-error mt-1">{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';
