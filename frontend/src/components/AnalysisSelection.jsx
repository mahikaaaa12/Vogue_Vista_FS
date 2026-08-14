import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Palette, Sparkles, ChevronRight, ArrowLeft } from 'lucide-react';
import Card from './shared/Card';
import Button from './shared/Button';

export default function AnalysisSelection({ setScreen }) {
  return (
    <section className="min-h-screen py-28 md:py-36 relative overflow-hidden flex flex-col justify-center bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-500">
      {/* Subtle Background Radial Accent */}
      <div className="absolute inset-0 pointer-events-none opacity-30 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[var(--color-gold)]/10 via-transparent to-transparent" />

      <div className="container-custom max-w-5xl relative z-10 px-4 mx-auto text-center">
        
        {/* Back Button */}
        <div className="flex justify-start mb-8">
          <motion.button
            whileHover={{ x: -4 }}
            onClick={() => setScreen('home')}
            className="flex items-center gap-2 text-xs uppercase tracking-widest text-[var(--color-gold)] font-medium cursor-pointer"
          >
            <ArrowLeft size={16} /> Return to Home
          </motion.button>
        </div>

        {/* Header Title Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-14"
        >
          <span className="text-xs uppercase tracking-[0.3em] text-[var(--color-gold)] font-semibold mb-3 flex items-center justify-center gap-1.5">
            <Sparkles size={14} /> Vogue Vista Atelier Suite
          </span>
          <h1 className="font-serif text-4xl md:text-5xl font-light tracking-wide text-[var(--text-primary)] mb-4">
            Select Your Analysis Experience
          </h1>
          <p className="font-sans text-sm md:text-base text-[var(--text-secondary)] max-w-xl mx-auto font-light leading-relaxed">
            Choose the analysis experience you would like to begin.
          </p>
        </motion.div>

        {/* Two Premium Selection Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left max-w-4xl mx-auto">

          {/* Card 1: Body Shape Analysis */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <Card
              hoverable={true}
              style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: '1px solid rgba(198, 161, 106, 0.25)',
                padding: '2.25rem'
              }}
            >
              <div>
                <div style={{ padding: '0.75rem', background: 'rgba(198, 161, 106, 0.12)', color: '#C6A16A', width: 'fit-content', borderRadius: '0.85rem', marginBottom: '1.5rem' }}>
                  <Activity size={26} />
                </div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-gold)] font-bold mb-1 block">
                  Interactive Morphometry
                </span>
                <h3 className="font-serif text-2xl font-normal text-[var(--text-primary)] mb-3">
                  Body Shape Analysis
                </h3>
                <p className="text-xs md:text-sm text-[var(--text-secondary)] font-light leading-relaxed mb-8">
                  Discover your body proportions and receive personalized fashion recommendations.
                </p>
              </div>

              <Button
                variant="primary"
                onClick={() => setScreen('body-analysis')}
                style={{ width: '100%' }}
              >
                Start Body Analysis <ChevronRight size={16} />
              </Button>
            </Card>
          </motion.div>

          {/* Card 2: Color Palette Analysis */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <Card
              hoverable={true}
              style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                padding: '2.25rem'
              }}
            >
              <div>
                <div style={{ padding: '0.75rem', background: 'rgba(56, 189, 248, 0.12)', color: '#38BDF8', width: 'fit-content', borderRadius: '0.85rem', marginBottom: '1.5rem' }}>
                  <Palette size={26} />
                </div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#38BDF8] font-bold mb-1 block">
                  OpenCV Chromatic Matrix
                </span>
                <h3 className="font-serif text-2xl font-normal text-[var(--text-primary)] mb-3">
                  Color Palette Analysis
                </h3>
                <p className="text-xs md:text-sm text-[var(--text-secondary)] font-light leading-relaxed mb-8">
                  Identify your personal color season and receive curated palette recommendations.
                </p>
              </div>

              <Button
                variant="secondary"
                onClick={() => setScreen('color-analysis')
                  
                }
                style={{ width: '100%', border: '1px solid rgba(56, 189, 248, 0.4)', color: '#38BDF8' }}
              >
                Start Color Analysis <ChevronRight size={16} />
              </Button>
            </Card>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
