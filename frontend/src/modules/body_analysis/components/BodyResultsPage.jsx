import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Sparkles, Heart, Share2, Layers, CheckCircle } from 'lucide-react';
import ThreeDViewer from './ThreeDViewer';

const PALETTES = {
  Autumn: [
    { name: "Terracotta", hex: "#C05C46", desc: "A rich, earthy clay red that enhances warm facial undertones." },
    { name: "Sage Olive", hex: "#5C6B57", desc: "A soft, muted botanical green ideal for structured outerwear." },
    { name: "Mustard Gold", hex: "#D9A05B", desc: "A vibrant warm ochre adding metallic luxury to casual knits." },
    { name: "Charcoal Noir", hex: "#2A2A2A", desc: "An editorial neutral providing baseline depth to warm palettes." },
    { name: "Ivory Silk", hex: "#F7F4EB", desc: "A luminous cream layer that acts as a natural canvas highlight." },
    { name: "Burnished Bronze", hex: "#8A6D51", desc: "A deep metallic tan that connects layers together." }
  ],
  Spring: [
    { name: "Peach Blossom", hex: "#FFB097", desc: "A fresh, light coral tone reflecting soft morning illumination." },
    { name: "Warm Olive", hex: "#6D7B4F", desc: "A sunny, translucent green that bridges bright tones." },
    { name: "Marigold Yellow", hex: "#F2B73F", desc: "A saturated warm yellow providing energetic highlights." },
    { name: "Cream Alabaster", hex: "#FAF5EA", desc: "A clean, bright beige suitable for linen blends." },
    { name: "Robin Egg Teal", hex: "#579B9E", desc: "A refreshing warm blue that accents neutral bases." },
    { name: "Warm Camel", hex: "#B8906F", desc: "A light, cozy tan that offers premium neutral balance." }
  ]
};

const SUGGESTIONS = {
  jewelry: {
    material: "18-Karat Polished Yellow Gold & Hammered Bronze",
    desc: "Your warm dermal calibration reflects light best off high-polish yellow metals. Avoid silver or cool platinum, which mute your natural undertones.",
  },
  grooming: {
    shades: "Warm Tints, Hydrated Lip Balms, & Dermal Bronzers",
    desc: "Complement skin highlights with warm clay pigments and light protective barrier tints. Keep grooming details clean with neutral-toned accents."
  },
  hair: {
    style: "Sleek Low Buns, Textured Crops, or Tailored Tapers",
    desc: "Incorporate warm honey highlights or chestnut lowlights to maintain consistency with the seasonal spectrum profile."
  }
};

const OUTFITS = [
  {
    title: "The Editorial Trench & Silk Pant",
    description: "Pair a sage trench coat over silk ivory trousers to establish color hierarchy.",
    details: "Focus on clean drapes rather than tight silhouettes."
  },
  {
    title: "Textured Cashmere & Gold Accents",
    description: "Layer a mustard knit with burnished bronze trousers, accented by yellow gold bands.",
    details: "Incorporate organic textures like raw wool and polished metal."
  },
  {
    title: "Trapezoidal Leather & Earth Layers",
    description: "Assemble a terracotta top under a tailored charcoal blazer, topped with a structure tote.",
    details: "Keep structures minimal with defined shoulder lines."
  }
];

export default function ResultsPage() {
  const [selectedSeason, setSelectedSeason] = useState('Autumn');
  const [activeSwatch, setActiveSwatch] = useState(0);
  const [printed, setPrinted] = useState(false);

  const activePalette = PALETTES[selectedSeason];
  const currentSwatch = activePalette[activeSwatch];

  const handlePrint = () => {
    setPrinted(true);
    setTimeout(() => {
      window.print();
      setPrinted(false);
    }, 300);
  };

  return (
    <section 
      style={{
        padding: '6rem 0',
        backgroundColor: 'var(--bg-primary)',
        position: 'relative'
      }}
      className="print-section"
    >
      <div className="editorial-container">
        
        {/* Editorial Title Block */}
        <div 
          style={{
            textAlign: 'center',
            marginBottom: '5rem',
            borderBottom: '1px solid var(--border-medium)',
            paddingBottom: '3rem'
          }}
          className="no-print"
        >
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem' }}>
            <Sparkles size={16} style={{ color: 'var(--accent-gold)' }} />
            <span style={{ fontFamily: 'var(--font-accent)', fontSize: '0.75rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              AUTOMATED ANALYSIS RESULTS
            </span>
          </div>
          
          <h1 
            style={{
              fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
              textTransform: 'uppercase',
              fontWeight: 300,
              lineHeight: '1.1'
            }}
          >
            Personal Chromatic Spread
          </h1>
          
          <p style={{ marginTop: '1.5rem', fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '1.5rem auto 0 auto' }}>
            A bespoke fashion review generated from face metric scanning, skin undertone extraction, and editorial lookbook integration.
          </p>

          {/* Quick controls */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2.5rem' }}>
            <button 
              className={`btn-lux${selectedSeason === 'Autumn' ? '' : '-outline'}`}
              style={{ padding: '0.6rem 1.6rem', fontSize: '0.65rem' }}
              onClick={() => { setSelectedSeason('Autumn'); setActiveSwatch(0); }}
            >
              WARM AUTUMN
            </button>
            <button 
              className={`btn-lux${selectedSeason === 'Spring' ? '' : '-outline'}`}
              style={{ padding: '0.6rem 1.6rem', fontSize: '0.65rem' }}
              onClick={() => { setSelectedSeason('Spring'); setActiveSwatch(0); }}
            >
              LIGHT SPRING
            </button>
          </div>
        </div>

        {/* Visual Print Template (Always visible in print, formatted nicely on screen) */}
        <div 
          className="print-layout-container"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gap: '3rem'
          }}
        >
          {/* LEFT COLUMN: Metric Badges & Color Matrix */}
          <div style={{ gridColumn: 'span 12' }} className="results-col-left">
            <div 
              className="lux-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '2rem',
                backgroundColor: 'var(--bg-secondary)',
                marginBottom: '2rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontFamily: 'var(--font-accent)', fontSize: '0.75rem', letterSpacing: '0.15em', color: 'var(--text-muted)' }}>
                  DERMAL SPECTRUM INDEX
                </span>
                <span style={{ fontSize: '1.8rem', fontFamily: 'var(--font-editorial)', fontStyle: 'italic', color: 'var(--accent-gold)' }}>
                  Warm undertone
                </span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-light)', paddingTop: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '2.4rem', fontFamily: 'var(--font-editorial)', color: 'var(--text-primary)' }}>98.6%</div>
                  <div style={{ fontFamily: 'var(--font-accent)', fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>MATCH CONFIDENCE</div>
                </div>
                <div>
                  <div style={{ fontSize: '2.4rem', fontFamily: 'var(--font-editorial)', color: 'var(--text-primary)' }}>GOLD</div>
                  <div style={{ fontFamily: 'var(--font-accent)', fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>RECOMMENDED METAL</div>
                </div>
                <div>
                  <div style={{ fontSize: '2.4rem', fontFamily: 'var(--font-editorial)', color: 'var(--text-primary)' }}>CLASSIC</div>
                  <div style={{ fontFamily: 'var(--font-accent)', fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>SILHOUETTE ARCHIVE</div>
                </div>
              </div>
            </div>

            {/* Interactive Palette Grid */}
            <div className="lux-card" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div>
                <span className="editorial-header-num">03.1 /</span>
                <h3 style={{ fontSize: '1.8rem', textTransform: 'uppercase', display: 'inline-block' }}>
                  The seasonal pigment spectrum
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  Click on swatches to unpack individual styling guidelines.
                </p>
              </div>

              {/* Swatch circle list */}
              <div 
                style={{
                  display: 'flex',
                  gap: '1.2rem',
                  flexWrap: 'wrap',
                  margin: '1rem 0'
                }}
              >
                {activePalette.map((swatch, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveSwatch(idx)}
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      backgroundColor: swatch.hex,
                      border: activeSwatch === idx ? '3px solid var(--text-primary)' : '1px solid var(--border-medium)',
                      cursor: 'pointer',
                      boxShadow: 'var(--shadow-premium)',
                      transform: activeSwatch === idx ? 'scale(1.15)' : 'scale(1)',
                      transition: 'all 0.3s ease'
                    }}
                  />
                ))}
              </div>

              {/* Swatch detail card */}
              <div 
                style={{
                  borderTop: '1px solid var(--border-light)',
                  paddingTop: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: currentSwatch.hex }} />
                  <span style={{ fontFamily: 'var(--font-accent)', fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600 }}>
                    {currentSwatch.name}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'Courier New' }}>
                    {currentSwatch.hex}
                  </span>
                </div>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  {currentSwatch.desc}
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Style Details & 3D Orbit Component */}
          <div style={{ gridColumn: 'span 12' }} className="results-col-right">
            
            {/* Style Advisory Guidelines */}
            <div className="lux-card" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginBottom: '2rem' }}>
              <div>
                <span className="editorial-header-num">03.2 /</span>
                <h3 style={{ fontSize: '1.8rem', textTransform: 'uppercase', display: 'inline-block' }}>
                  Beauty & Accessories
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <h4 style={{ fontFamily: 'var(--font-accent)', fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--accent-gold)' }}>
                    HAUT COUTURE JEWELRY
                  </h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                    {SUGGESTIONS.jewelry.material}
                  </p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    {SUGGESTIONS.jewelry.desc}
                  </p>
                </div>
                <div style={{ height: '1px', backgroundColor: 'var(--border-light)' }} />
                <div>
                  <h4 style={{ fontFamily: 'var(--font-accent)', fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--accent-gold)' }}>
                    EDITORIAL GROOMING
                  </h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                    {SUGGESTIONS.grooming.shades}
                  </p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    {SUGGESTIONS.grooming.desc}
                  </p>
                </div>
                <div style={{ height: '1px', backgroundColor: 'var(--border-light)' }} />
                <div>
                  <h4 style={{ fontFamily: 'var(--font-accent)', fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--accent-gold)' }}>
                    EDITORIAL HAIRSTYLE
                  </h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                    {SUGGESTIONS.hair.style}
                  </p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    {SUGGESTIONS.hair.desc}
                  </p>
                </div>
              </div>
            </div>

            {/* Orbit preview pane */}
            <div 
              style={{
                border: '1px solid var(--border-medium)',
                overflow: 'hidden',
                backgroundColor: 'var(--bg-secondary)',
                position: 'relative'
              }}
              className="no-print"
            >
              <ThreeDViewer type="palette" height="320px" />
              <div 
                style={{
                  position: 'absolute',
                  top: '1rem',
                  left: '1rem',
                  fontSize: '0.65rem',
                  fontFamily: 'var(--font-accent)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)'
                }}
              >
                PROPORTIONAL SPECTRUM ORBITS
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: Recommended Outfits Spread */}
        <div style={{ marginTop: '3rem' }}>
          <div className="lux-card" style={{ width: '100%' }}>
            <span className="editorial-header-num">03.3 /</span>
            <h3 style={{ fontSize: '1.8rem', textTransform: 'uppercase', display: 'inline-block', marginBottom: '2.5rem' }}>
              Personal Wardrobe Combinations
            </h3>

            <div 
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '2rem'
              }}
            >
              {OUTFITS.map((outfit, index) => (
                <div 
                  key={index}
                  style={{
                    padding: '1.5rem',
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-light)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.8rem'
                  }}
                >
                  <span style={{ fontSize: '1.25rem', fontFamily: 'var(--font-editorial)', fontStyle: 'italic', color: 'var(--accent-gold)' }}>
                    LOOK {String(index + 1).padStart(2, '0')}
                  </span>
                  <h4 style={{ fontSize: '1.2rem', textTransform: 'uppercase' }}>{outfit.title}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{outfit.description}</p>
                  <div style={{ height: '1px', backgroundColor: 'var(--border-light)', marginTop: 'auto' }} />
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>{outfit.details}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Panel (Print, Share, Download PDF) */}
        <div 
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1.5rem',
            marginTop: '4rem',
            borderTop: '1px solid var(--border-light)',
            paddingTop: '3rem'
          }}
          className="no-print"
        >
          <button 
            className="btn-lux"
            onClick={handlePrint}
            style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}
          >
            <Download size={14} style={{ color: 'var(--accent-gold)' }} />
            <span>{printed ? "Formatting..." : "Download Bespoke Spread (PDF)"}</span>
          </button>
        </div>

      </div>

      {/* Style settings for printing layouts cleanly */}
      <style>{`
        @media (min-width: 992px) {
          .print-layout-container {
            grid-template-columns: repeat(12, 1fr) !important;
          }
          .results-col-left {
            grid-column: span 6 !important;
          }
          .results-col-right {
            grid-column: span 6 !important;
          }
        }
        @media print {
          *, *::before, *::after {
            background-color: transparent !important;
            color: #000000 !important;
            box-shadow: none !important;
            text-shadow: none !important;
          }
          body {
            background-color: #ffffff !important;
            color: #000000 !important;
          }
          header, footer, .no-print, .btn-lux, .btn-lux-outline, .threed-viewer-container {
            display: none !important;
          }
          .print-section {
            padding: 0 !important;
            margin: 0 !important;
          }
          .editorial-container {
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .results-col-left, .results-col-right {
            grid-column: span 12 !important;
            width: 100% !important;
          }
          .lux-card {
            border: 1px solid #111111 !important;
            box-shadow: none !important;
            background-color: transparent !important;
            padding: 1.5rem !important;
            page-break-inside: avoid;
          }
        }
      `}</style>
    </section>
  );
}
