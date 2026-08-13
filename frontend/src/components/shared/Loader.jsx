import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function Loader({ message = 'Analyzing Neural Metrics...', progress = 0 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem', textAlign: 'center' }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        style={{ width: '4rem', height: '4rem', borderRadius: '50%', border: '2px solid rgba(198, 161, 106, 0.15)', borderTopColor: '#C6A16A', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}
      >
        <Sparkles size={20} color="#C6A16A" />
      </motion.div>
      <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: '1.25rem', color: '#FAF8F5', marginBottom: '0.5rem' }}>{message}</h3>
      {progress > 0 && (
        <div style={{ width: '100%', maxWidth: '16rem', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden', marginTop: '1rem' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
            style={{ height: '100%', background: 'linear-gradient(90deg, #C6A16A, #FB923C)' }}
          />
        </div>
      )}
    </div>
  );
}
