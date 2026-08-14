import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, setScreen }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    if (setScreen) {
      setScreen('login');
    }
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-primary)' }}>
        <h2>Session Required</h2>
        <p>Please log in to access this analysis module.</p>
        <button 
          onClick={() => setScreen && setScreen('login')}
          style={{ padding: '0.75rem 1.5rem', background: 'var(--accent-gold)', color: 'var(--cta-text)', borderRadius: '9999px', border: 'none', cursor: 'pointer', fontWeight: 600, marginTop: '1rem' }}
        >
          Go to Login
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
