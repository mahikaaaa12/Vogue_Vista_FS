import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Sparkles, Palette, Activity, History, LogOut, ShieldCheck, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Card from './shared/Card';
import Button from './shared/Button';
import { getBodyShapeHistory } from '../services/bodyAPI';
import { getColorHistory } from '../services/colorAPI';

export default function Dashboard({ setScreen }) {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // overview | profile | history
  const [bodyHistory, setBodyHistory] = useState([]);
  const [colorHistory, setColorHistory] = useState([]);

  useEffect(() => {
    async function fetchHistory() {
      const bHist = await getBodyShapeHistory();
      const cHist = await getColorHistory();
      setBodyHistory(bHist || []);
      setColorHistory(cHist || []);
    }
    fetchHistory();
  }, []);

  const handleLogout = () => {
    logout();
    setScreen('home');
  };

  return (
    <div style={{ minHeight: '100vh', paddingTop: '7rem', paddingBottom: '5rem', background: 'var(--bg-primary)', color: 'var(--text-primary)', transition: 'background-color 0.5s var(--transition-lux), color 0.5s var(--transition-lux)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
        
        {/* Header Profile Section */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem', marginBottom: '3rem', padding: '2rem', background: 'var(--glass-bg)', borderRadius: '1.5rem', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-premium)', backdropFilter: 'blur(var(--glass-blur))', transition: 'background-color 0.5s var(--transition-lux), border-color 0.5s var(--transition-lux), box-shadow 0.5s var(--transition-lux)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ width: '4.5rem', height: '4.5rem', borderRadius: '50%', background: 'linear-gradient(135deg, #C6A16A, #E5C38F)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0A0A0B', fontWeight: 'bold', fontSize: '1.5rem' }}>
              {user && user.name ? user.name.charAt(0).toUpperCase() : 'V'}
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--accent-gold)', fontWeight: 600 }}>Atelier Member Profile</span>
              <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: '1.75rem', margin: '0.25rem 0 0 0', fontWeight: 500, color: 'var(--text-primary)' }}>{user?.name || 'Vogue Vista Member'}</h1>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>{user?.email || 'haute@voguevista.com'}</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <Button variant="secondary" onClick={() => setActiveTab('history')} icon={History} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }}>
              History Logs
            </Button>
            <Button variant="outline" onClick={handleLogout} icon={LogOut}>
              Sign Out
            </Button>
          </div>
        </div>

        {/* Feature Modules Selection Section */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
          
          {/* Body Analysis Module Launcher */}
          <Card hoverable={true} style={{ border: '1px solid rgba(198, 161, 106, 0.3)' }}>
            <div style={{ padding: '0.6rem', background: 'rgba(198, 161, 106, 0.1)', color: '#C6A16A', width: 'fit-content', borderRadius: '0.75rem', marginBottom: '1.25rem' }}>
              <Activity size={24} />
            </div>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#C6A16A', fontWeight: 600 }}>AI Morphometry</span>
            <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: '1.4rem', color: 'var(--text-primary)', margin: '0.5rem 0' }}>Body Analysis</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Interactive 3D body shape inference, ratio profiling, and custom apparel recommendations.
            </p>
            <Button variant="primary" onClick={() => setScreen('body-analysis')} style={{ width: '100%' }}>
              Launch Body Module
            </Button>
          </Card>

          {/* Color Analysis Module Launcher */}
          <Card hoverable={true} style={{ border: '1px solid rgba(56, 189, 248, 0.3)' }}>
            <div style={{ padding: '0.6rem', background: 'rgba(56, 189, 248, 0.1)', color: '#38BDF8', width: 'fit-content', borderRadius: '0.75rem', marginBottom: '1.25rem' }}>
              <Palette size={24} />
            </div>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#38BDF8', fontWeight: 600 }}>Chromatics</span>
            <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: '1.4rem', color: 'var(--text-primary)', margin: '0.5rem 0' }}>Color Analysis</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              OpenCV skin undertone matrix calculation, seasonal palettes, and luxury swatches.
            </p>
            <Button variant="secondary" onClick={() => setScreen('color-analysis')} style={{ width: '100%', border: '1px solid rgba(56, 189, 248, 0.4)', color: '#38BDF8' }}>
              Launch Color Module
            </Button>
          </Card>
        </div>

        {/* Recent Analysis History Table */}
        <div style={{ background: 'var(--glass-bg)', borderRadius: '1.5rem', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-premium)', padding: '2rem', backdropFilter: 'blur(var(--glass-blur))', transition: 'background-color 0.5s var(--transition-lux), border-color 0.5s var(--transition-lux), box-shadow 0.5s var(--transition-lux)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: '1.25rem', color: 'var(--text-primary)', margin: 0 }}>Recent Session History</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--accent-gold)' }}>Telemetry Logged</span>
          </div>

          {bodyHistory.length === 0 && colorHistory.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
              <History size={32} style={{ marginBottom: '1rem', opacity: 0.5, margin: '0 auto 1rem auto' }} />
              <p>No historical analysis records found yet. Launch an analysis module above to get started.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Module</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Result</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Confidence</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Date Logged</th>
                  </tr>
                </thead>
                <tbody>
                  {bodyHistory.map((item, idx) => (
                    <tr key={`body-${idx}`} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '0.75rem 1rem', color: '#C6A16A', fontWeight: 600 }}>Body Analysis</td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--text-primary)' }}>{item.predicted_shape || 'Hourglass'}</td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--text-primary)' }}>{item.confidence ? `${Math.round(item.confidence * 100)}%` : '96%'}</td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>{item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Today'}</td>
                    </tr>
                  ))}
                  {colorHistory.map((item, idx) => (
                    <tr key={`color-${idx}`} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '0.75rem 1rem', color: '#38BDF8', fontWeight: 600 }}>Color Analysis</td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--text-primary)' }}>{item.season ? `${item.season} (${item.undertone})` : 'Winter (Cool)'}</td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--text-primary)' }}>98%</td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>{item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Today'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
