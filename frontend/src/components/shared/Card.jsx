import React from 'react';
import { motion } from 'framer-motion';

export default function Card({
  children,
  title,
  subtitle,
  icon: Icon,
  className = '',
  style = {},
  hoverable = true,
  ...props
}) {
  const cardStyle = {
    background: 'var(--glass-bg)',
    backdropFilter: 'blur(var(--glass-blur))',
    border: '1px solid var(--glass-border)',
    borderRadius: '1.25rem',
    padding: '1.75rem',
    boxShadow: 'var(--shadow-premium)',
    position: 'relative',
    overflow: 'hidden',
    transition: 'background-color 0.5s var(--transition-lux), border-color 0.5s var(--transition-lux), box-shadow 0.5s var(--transition-lux)',
    ...style
  };

  return (
    <motion.div
      whileHover={hoverable ? { y: -4, borderColor: 'var(--accent-gold)' } : {}}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      style={cardStyle}
      className={className}
      {...props}
    >
      {(title || Icon) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          {Icon && (
            <div style={{ padding: '0.5rem', borderRadius: '0.5rem', background: 'rgba(198, 161, 106, 0.1)', color: 'var(--accent-gold)' }}>
              <Icon size={20} />
            </div>
          )}
          <div>
            {title && <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{title}</h3>}
            {subtitle && <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>{subtitle}</p>}
          </div>
        </div>
      )}
      {children}
    </motion.div>
  );
}
