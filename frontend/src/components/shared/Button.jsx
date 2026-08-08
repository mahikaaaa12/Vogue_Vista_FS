import React from 'react';
import { motion } from 'framer-motion';

export default function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary', // primary | secondary | outline | ghost
  size = 'md',        // sm | md | lg
  disabled = false,
  loading = false,
  icon: Icon,
  className = '',
  style = {},
  ...props
}) {
  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 600,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    borderRadius: '9999px',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    border: 'none',
    outline: 'none',
    opacity: disabled ? 0.6 : 1,
    position: 'relative',
    overflow: 'hidden'
  };

  const sizes = {
    sm: { padding: '0.4rem 1rem', fontSize: '0.75rem' },
    md: { padding: '0.75rem 1.75rem', fontSize: '0.85rem' },
    lg: { padding: '1rem 2.5rem', fontSize: '0.95rem' }
  };

  const variants = {
    primary: {
      background: 'linear-gradient(135deg, #C6A16A, #E5C38F)',
      color: '#0A0A0B',
      boxShadow: '0 4px 20px rgba(198, 161, 106, 0.25)'
    },
    secondary: {
      background: 'rgba(255, 255, 255, 0.08)',
      color: '#FFFFFF',
      border: '1px solid rgba(255, 255, 255, 0.15)',
      backdropFilter: 'blur(12px)'
    },
    outline: {
      background: 'transparent',
      color: '#C6A16A',
      border: '1px solid #C6A16A'
    },
    ghost: {
      background: 'transparent',
      color: 'inherit',
      border: 'none'
    }
  };

  const currentSize = sizes[size] || sizes.md;
  const currentVariant = variants[variant] || variants.primary;

  return (
    <motion.button
      type={type}
      onClick={disabled || loading ? undefined : onClick}
      disabled={disabled || loading}
      whileHover={disabled || loading ? {} : { scale: 1.02 }}
      whileTap={disabled || loading ? {} : { scale: 0.98 }}
      style={{ ...baseStyle, ...currentSize, ...currentVariant, ...style }}
      className={className}
      {...props}
    >
      {loading ? (
        <span style={{ display: 'inline-block', width: '1rem', height: '1rem', border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      ) : Icon ? (
        <Icon size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />
      ) : null}
      <span>{children}</span>
    </motion.button>
  );
}
