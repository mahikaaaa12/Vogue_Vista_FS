import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{ position: 'absolute', inset: 0, background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)' }}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          style={{ position: 'relative', width: '100%', maxWidth: '32rem', background: '#121214', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '1.25rem', padding: '2rem', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', zIndex: 1001 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            {title && <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: '1.25rem', color: '#FAF8F5', margin: 0 }}>{title}</h3>}
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#A1A1AA', cursor: 'pointer', padding: '0.25rem' }}>
              <X size={20} />
            </button>
          </div>
          {children}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
