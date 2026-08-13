import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, ArrowRight, Mail } from 'lucide-react';

const GithubIcon = () => (
  <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

const LinkedinIcon = () => (
  <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

export default function Footer({ setScreen }) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-lux-bg-secondary border-t border-lux-border-light pt-20 pb-10 mt-auto">
      
      {/* Premium Animated Gradient Line Divider at the top */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-lux-gold to-transparent opacity-60" />

      <div className="editorial-container mx-auto px-4 md:px-16 max-w-7xl">
        
        {/* Main Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 mb-16">
          
          {/* Brand Manifesto */}
          <div className="md:col-span-4 flex flex-col gap-6">
            <div className="flex items-baseline gap-1">
              <span className="font-editorial text-2xl tracking-widest text-lux-text-primary uppercase">VOGUE</span>
              <span className="font-editorial text-sm italic text-lux-gold">Vista</span>
            </div>
            <p className="font-ui font-light text-xs md:text-sm text-lux-text-secondary leading-relaxed max-w-sm">
              An immersive digital atelier uniting haute couture guidelines with face structural metrics, color calibrations, and personal silhouettes. Elevating daily fashion decisions.
            </p>
          </div>

          {/* Quick Links / Navigation */}
          <div className="md:col-span-3 flex flex-col gap-6">
            <h4 className="font-accent text-[10px] tracking-widest text-lux-text-primary uppercase font-semibold">
              NAVIGATION
            </h4>
            <ul className="flex flex-col gap-3 font-ui font-light text-xs text-lux-text-muted">
              {[
                { label: 'Editorial Home', val: 'home' },
                { label: 'AI Scan Consultant', val: 'analysis' },
                { label: 'Body Analysis', val: 'body-analysis' },
                { label: 'Bespoke Spread', val: 'results' }
              ].map((item, idx) => (
                <li key={idx}>
                  <button 
                    onClick={() => {
                      setScreen(item.val);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-lux-text-primary hover:translate-x-1 transition-all duration-300 text-left"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Socials / Links */}
          <div className="md:col-span-2 flex flex-col gap-6">
            <h4 className="font-accent text-[10px] tracking-widest text-lux-text-primary uppercase font-semibold">
              NETWORKS
            </h4>
            <div className="flex flex-col gap-3 font-ui font-light text-xs text-lux-text-muted">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center gap-2 hover:text-lux-text-primary hover:translate-x-1 transition-all duration-300"
              >
                <GithubIcon />
                <span>GitHub</span>
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center gap-2 hover:text-lux-text-primary hover:translate-x-1 transition-all duration-300"
              >
                <LinkedinIcon />
                <span>LinkedIn</span>
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center gap-2 hover:text-lux-text-primary hover:translate-x-1 transition-all duration-300"
              >
                <InstagramIcon />
                <span>Instagram</span>
              </a>
              <a 
                href="mailto:contact@voguevista.com" 
                className="flex items-center gap-2 hover:text-lux-text-primary hover:translate-x-1 transition-all duration-300"
              >
                <Mail size={12} />
                <span>Contact</span>
              </a>
            </div>
          </div>

          {/* Newsletter subscription */}
          <div className="md:col-span-3 flex flex-col gap-6">
            <h4 className="font-accent text-[10px] tracking-widest text-lux-text-primary uppercase font-semibold">
              THE ATELIER BULLETIN
            </h4>
            <p className="font-ui font-light text-xs text-lux-text-muted leading-relaxed">
              Subscribe to receive weekly lookbooks, color trend analysis updates, and direct notifications for new AI modules.
            </p>
            
            {subscribed ? (
              <p className="font-editorial text-xs italic text-lux-gold mt-2">
                Welcome to the Vogue Vista Journal.
              </p>
            ) : (
              <form 
                onSubmit={handleSubscribe} 
                className="flex border-b border-lux-border-medium pb-2 items-center w-full focus-within:border-lux-gold transition-colors duration-300"
              >
                <input 
                  type="email" 
                  placeholder="Enter email address" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-transparent border-none font-ui font-light text-xs w-full text-lux-text-primary outline-none"
                />
                <button 
                  type="submit" 
                  className="text-lux-text-muted hover:text-lux-text-primary transition-colors duration-300 px-2"
                >
                  <ArrowRight size={14} />
                </button>
              </form>
            )}
          </div>

        </div>

        {/* Divider line */}
        <div className="h-px bg-lux-border-light w-full mb-8"></div>

        {/* Footer Bottom Block */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="font-accent text-[9px] tracking-widest text-lux-text-muted uppercase">
            © 2026 VOGUE VISTA. ALL RIGHTS RESERVED
          </p>

          {/* Scroll to top button */}
          <button 
            onClick={scrollToTop}
            className="flex items-center gap-2 font-accent text-[9px] tracking-widest text-lux-text-muted uppercase hover:text-lux-text-primary group transition-all duration-300"
          >
            <span>SCROLL TO TOP</span>
            <div className="w-8 h-8 rounded-full border border-lux-border-medium flex items-center justify-center group-hover:bg-lux-text-primary group-hover:text-lux-bg-primary transition-all duration-300">
              <ArrowUp size={12} />
            </div>
          </button>
        </div>

      </div>
    </footer>
  );
}
