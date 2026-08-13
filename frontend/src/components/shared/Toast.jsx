import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Info, AlertTriangle } from 'lucide-react';

export default function Toast({ message, type = 'success', isVisible, onClose }) {
  if (!isVisible) return null;

  const icons = {
    success: <CheckCircle2 size={18} color="#4ADE80" />,
    info: <Info size={18} color="#38BDF8" />,
    warning: <AlertTriangle size={18} color="#FB923C" />
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.9 }}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          zIndex: 1100,
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.85rem 1.5rem',
          background: 'rgba(18, 18, 20, 0.9)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '9999px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
          color: '#FAF8F5',
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: '0.875rem'
        }}
      >
        {icons[type] || icons.success}
        <span>{message}</span>
      </motion.div>
    </AnimatePresence>
  );
}
