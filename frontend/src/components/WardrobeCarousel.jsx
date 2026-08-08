import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Layers, Eye } from 'lucide-react';
import ThreeDViewer from './ThreeDViewer';

const LOOKBOOK_ITEMS = [
  {
    id: 1,
    title: "Silk Editorial Trench",
    category: "CAPSULE COUTURE",
    material: "100% Raw Mulberry Silk",
    color: "#E5D9C4",
    colorName: "Alabaster Beige",
    season: "Warm Spring / Autumn",
    image: "/closet_interior.png",
    description: "Tailored silhouette utilizing lightweight raw silk, draped elegantly for trans-seasonal movement.",
    accessory: "bottle"
  },
  {
    id: 2,
    title: "Minimal Leather Tote",
    category: "FINE ACCESSORIES",
    material: "Full-Grain Pebbled Leather",
    color: "#1A1A1A",
    colorName: "Noir Charcoal",
    season: "Deep Winter / Autumn",
    image: "/flat_lay.png",
    description: "Spacious architectural lines crafted by hand in Florence, equipped with micro gold-clasp hardware.",
    accessory: "bag"
  },
  {
    id: 3,
    title: "Sculpted Gold Band",
    category: "HIGH JEWELRY",
    material: "18-Karat Polished Yellow Gold",
    color: "#C5A880",
    colorName: "Muted Ochre",
    season: "All Warm Spectrum",
    image: "/flat_lay.png",
    description: "An organic, flowing ring profile inspired by desert contours, showcasing a brilliant-cut center diamond.",
    accessory: "jewelry"
  },
  {
    id: 4,
    title: "Linen Tailored Trouser",
    category: "CAPSULE COUTURE",
    material: "100% Belgian Organic Linen",
    color: "#FAF8F5",
    colorName: "Ivory Pearl",
    season: "Light Summer / Spring",
    image: "/closet_interior.png",
    description: "High-waisted structured fit with wide-leg drape, capturing natural soft wrinkles for casual prestige.",
    accessory: "palette"
  }
];

export default function WardrobeCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [show3D, setShow3D] = useState(false);

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % LOOKBOOK_ITEMS.length);
    setShow3D(false);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + LOOKBOOK_ITEMS.length) % LOOKBOOK_ITEMS.length);
    setShow3D(false);
  };

  const currentItem = LOOKBOOK_ITEMS[activeIndex];

  return (
    <section 
      id="wardrobe"
      style={{
        padding: '2rem 0',
        backgroundColor: 'var(--bg-primary)',
        borderBottom: '1px solid var(--border-light)',
        position: 'relative'
      }}
    >
      <div className="editorial-container">
        {/* Section Header */}
        <div 
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: '1.3rem',
            borderBottom: '1px solid var(--border-light)',
            paddingBottom: '1.5rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="editorial-header-num">03 //</span>
            <h2 style={{ fontSize: '2.5rem', textTransform: 'uppercase', fontWeight: 300 }}>
              Curated Capsule
            </h2>
          </div>
          <span 
            style={{
              fontFamily: 'var(--font-accent)',
              fontSize: '0.75rem',
              letterSpacing: '0.15em',
              color: 'var(--text-muted)',
              textTransform: 'uppercase'
            }}
          >
            Vogue Vista Lookbook
          </span>
        </div>

        <div 
          className="carousel-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gap: '3rem',
            alignItems: 'center'
          }}
        >
          {/* Left Column: Sliding Details Panel */}
          <div 
            style={{ gridColumn: 'span 12' }}
            className="carousel-details"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
              >
                <span 
                  style={{
                    fontFamily: 'var(--font-accent)',
                    fontSize: '0.7rem',
                    letterSpacing: '0.2em',
                    color: 'var(--accent-gold)',
                    textTransform: 'uppercase'
                  }}
                >
                  {currentItem.category}
                </span>

                <h3 
                  style={{
                    fontSize: '3rem',
                    textTransform: 'uppercase',
                    lineHeight: '1.1',
                    fontWeight: 300
                  }}
                >
                  {currentItem.title}
                </h3>

                <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: '1.7' }}>
                  {currentItem.description}
                </p>

                {/* Spec Table */}
                <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-light)', paddingTop: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', fontSize: '0.85rem' }}>
                    <span style={{ fontFamily: 'var(--font-accent)', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>MATERIAL</span>
                    <span style={{ color: 'var(--text-primary)' }}>{currentItem.material}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', fontSize: '0.85rem' }}>
                    <span style={{ fontFamily: 'var(--font-accent)', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>TONAL COMPATIBILITY</span>
                    <span style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ display: 'inline-block', width: '10px', height: '10px', backgroundColor: currentItem.color, borderRadius: '50%', border: '1px solid var(--border-medium)' }} />
                      {currentItem.colorName}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', fontSize: '0.85rem' }}>
                    <span style={{ fontFamily: 'var(--font-accent)', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>IDEAL SPECTRUM</span>
                    <span style={{ color: 'var(--text-primary)' }}>{currentItem.season}</span>
                  </div>
                </div>

                {/* 3D Viewer Selector */}
                <div style={{ marginTop: '1.5rem' }}>
                  <button 
                    className="btn-lux-outline" 
                    style={{ padding: '0.8rem 1.6rem', fontSize: '0.7rem', width: '100%' }}
                    onClick={() => setShow3D(!show3D)}
                  >
                    <Layers size={14} style={{ marginRight: '0.5rem', color: 'var(--accent-gold)' }} />
                    {show3D ? "Show Photography" : "Interactive 3D Studio"}
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Slider Controls */}
            <div 
              style={{
                display: 'flex',
                gap: '1rem',
                marginTop: '3rem',
                alignItems: 'center'
              }}
            >
              <button 
                onClick={prevSlide}
                className="carousel-arrow-btn"
              >
                <ArrowLeft size={18} />
              </button>
              
              <span style={{ fontFamily: 'var(--font-editorial)', fontStyle: 'italic', fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                {String(activeIndex + 1).padStart(2, '0')} / {String(LOOKBOOK_ITEMS.length).padStart(2, '0')}
              </span>

              <button 
                onClick={nextSlide}
                className="carousel-arrow-btn"
              >
                <ArrowRight size={18} />
              </button>
            </div>
          </div>

          {/* Right Column: Visual Frame (Switches between static asset image and 3D webGL canvas) */}
          <div 
            style={{ gridColumn: 'span 12', height: '550px', position: 'relative' }}
            className="carousel-viewer"
          >
            <div 
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-medium)',
                overflow: 'hidden',
                position: 'relative'
              }}
            >
              <AnimatePresence mode="wait">
                {show3D ? (
                  <motion.div
                    key="3d"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    style={{ width: '100%', height: '100%' }}
                  >
                    <ThreeDViewer type={currentItem.accessory} height="100%" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="image"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    style={{ width: '100%', height: '100%' }}
                  >
                    <img 
                      src={currentItem.image} 
                      alt={currentItem.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        filter: 'grayscale(15%) contrast(95%)'
                      }}
                    />
                    
                    {/* Visual details watermark */}
                    <div 
                      style={{
                        position: 'absolute',
                        top: '2rem',
                        right: '2rem',
                        backgroundColor: 'var(--glass-bg)',
                        backdropFilter: 'blur(8px)',
                        padding: '0.6rem 1.2rem',
                        border: '1px solid var(--glass-border)',
                        fontSize: '0.65rem',
                        fontFamily: 'var(--font-accent)',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase'
                      }}
                    >
                      Studio Photography
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 992px) {
          .carousel-grid {
            grid-template-columns: repeat(12, 1fr) !important;
          }
          .carousel-details {
            grid-column: span 5 !important;
          }
          .carousel-viewer {
            grid-column: span 7 !important;
          }
        }
      `}</style>
    </section>
  );
}
