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
    background: 'rgba(18, 18, 20, 0.65)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '1.25rem',
    padding: '1.75rem',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    position: 'relative',
    overflow: 'hidden',
    ...style
  };

  return (
    <motion.div
      whileHover={hoverable ? { y: -4, borderColor: 'rgba(198, 161, 106, 0.4)' } : {}}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      style={cardStyle}
      className={className}
      {...props}
    >
      {(title || Icon) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          {Icon && (
            <div style={{ padding: '0.5rem', borderRadius: '0.5rem', background: 'rgba(198, 161, 106, 0.1)', color: '#C6A16A' }}>
              <Icon size={20} />
            </div>
          )}
          <div>
            {title && <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: '1.15rem', fontWeight: 600, color: '#FAF8F5', margin: 0 }}>{title}</h3>}
            {subtitle && <p style={{ fontSize: '0.8rem', color: '#A1A1AA', margin: 0 }}>{subtitle}</p>}
          </div>
        </div>
      )}
      {children}
    </motion.div>
  );
}
