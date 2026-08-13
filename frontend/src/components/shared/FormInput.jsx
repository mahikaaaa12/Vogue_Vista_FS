import React from 'react';

/**
 * Reusable Luxury Form Input Component
 * Uses absolute positioning for the leading icon and Tailwind !pl-14 (56px) utility
 * to guarantee a clean 22px horizontal gap between the 18px icon (left-4 / 16px)
 * and the placeholder text across both light and dark modes.
 */
export default function FormInput({
  label,
  icon: Icon,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  className = '',
  iconSize = 18,
  ...props
}) {
  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <label
          htmlFor={name}
          className="block text-xs uppercase tracking-widest text-[var(--text-secondary)] font-medium"
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center w-full">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-10 text-[var(--text-secondary)]">
            <Icon size={iconSize} />
          </div>
        )}

        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl py-3.5 pr-4 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-gold)] transition-colors ${
            Icon ? '!pl-14' : 'pl-4'
          } ${className}`}
          {...props}
        />
      </div>

      {error && (
        <span className="text-xs text-red-500 ml-1">
          {error}
        </span>
      )}
    </div>
  );
}
