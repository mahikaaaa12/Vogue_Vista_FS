import { useAuth } from '../context/AuthContext';
import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function CTA({ setScreen }) {
  const { isAuthenticated } = useAuth();
  const handleStartScan = () => { if (isAuthenticated) { setScreen('analysis-selection'); } else { setScreen('login'); } window.scrollTo({ top: 0, behavior: 'smooth' }); };
  return (
    <section 
      id="cta"
      className="relative min-h-[90vh] flex items-center justify-center bg-lux-bg-secondary overflow-hidden border-b border-lux-border-light py-20"
    >
      {/* Moving backdrop gradient meshes */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <motion.div 
          animate={{
            x: [0, 40, -30, 0],
            y: [0, -30, 40, 0],
            scale: [1, 1.15, 0.9, 1]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-1/4 -left-1/4 w-[600px] h-[600px] rounded-full bg-radial-gradient from-lux-gold/15 to-transparent filter blur-3xl"
        />
        <motion.div 
          animate={{
            x: [0, -50, 30, 0],
            y: [0, 40, -30, 0],
            scale: [1, 0.9, 1.15, 1]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -bottom-1/4 -right-1/4 w-[600px] h-[600px] rounded-full bg-radial-gradient from-lux-gold/10 to-transparent filter blur-3xl"
        />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none z-10 opacity-30">
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-lux-gold rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0.1, 0.8, 0.1],
              scale: [1, 1.8, 1]
            }}
            transition={{
              duration: 5 + Math.random() * 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 5
            }}
          />
        ))}
      </div>

      <div className="editorial-container mx-auto px-4 md:px-16 max-w-5xl relative z-20">
        <div className="lux-card-glass dark:glass-luxury rounded-sm text-center flex flex-col items-center gap-8 py-16 px-6 md:px-12 md:py-10 border border-lux-border-light relative overflow-hidden">
          {/* Subtle inside background glow */}
          <div className="absolute inset-0 bg-gradient-to-tr from-lux-gold/5 via-transparent to-[#B58BE6]/5 pointer-events-none" />
          
          {/* Subtitle tag */}
          <div className="flex items-center gap-2 justify-center relative z-10">
            <Sparkles size={14} className="text-lux-gold" />
            <span className="font-accent text-xs tracking-widest text-lux-text-muted uppercase">
              ATELIER CALIBRATION
            </span>
          </div>

          {/* Big editorial title */}
          <h2 className="font-editorial font-light text-5xl md:text-7xl lg:text-6xl uppercase tracking-tight leading-[1.05] text-lux-text-primary max-w-4xl relative z-10">
            Begin your <br className="hidden md:inline"/>
            <span className="font-serif italic text-lux-gold">personal style</span> <br/>
            revolution.
          </h2>

          {/* Short description */}
          <p className="font-ui font-light text-xs md:text-sm text-lux-text-secondary leading-relaxed max-w-xl relative z-10">
            Unlock your seasonal palette, custom silhouettes, and a fully interactive 3D wardrobe catalog tailored specifically to your facial structure and undertones.
          </p>

          {/* Animated CTAs */}
          <div className="flex flex-col sm:flex-row gap-6 items-center justify-center mt-6 w-full max-w-md relative z-10">
            <button 
              onClick={handleStartScan}
              className="btn-lux w-full sm:w-auto flex items-center justify-center gap-2 !px-5 !py-3.5 !text-[10px] !tracking-[0.18em] !leading-none group"
            >
              <span>START DIGITAL SCAN</span>
              <Sparkles size={12} className="text-lux-gold group-hover:rotate-12 transition-transform duration-300" />
            </button>
            
            <button 
              onClick={() => {
                setScreen('results');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="btn-lux-outline w-full sm:w-auto flex items-center justify-center gap-2 !px-5 !py-3.5 !text-[10px] !tracking-[0.18em] !leading-none group"
            >
              <span>EXPLORE SAMPLES</span>
              <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </div>

          {/* Bottom copyright tag */}
          <div className="font-accent text-[9px] tracking-widest text-lux-text-muted uppercase mt-4 relative z-10">
            Vogue Vista Â© 2026 // ALL RIGHTS RESERVED
          </div>
        </div>
      </div>
    </section>
  );
}

