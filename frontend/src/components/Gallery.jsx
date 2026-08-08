import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, ArrowUpRight } from 'lucide-react';

const CATEGORIES = ["ALL", "HAUTE COUTURE", "PRET-A-PORTER", "ACCESSORIES"];

const LOOKBOOK_ITEMS = [
  {
    id: 1,
    title: "Atelier Silk Trench",
    category: "HAUTE COUTURE",
    material: "100% Mulberry Silk",
    image: "/closet_interior.png",
    height: "h-[450px]"
  },
  {
    id: 2,
    title: "Minimal Leather Tote",
    category: "ACCESSORIES",
    material: "Pebbled Calf Leather",
    image: "/flat_lay.png",
    height: "h-[300px]"
  },
  {
    id: 3,
    title: "Sculpted Diamond Ring",
    category: "ACCESSORIES",
    material: "18k Polished Gold",
    image: "/flat_lay.png",
    height: "h-[350px]"
  },
  {
    id: 4,
    title: "Belgian Linen Trousers",
    category: "PRET-A-PORTER",
    material: "Organic Belgian Linen",
    image: "/closet_interior.png",
    height: "h-[400px]"
  },
  {
    id: 5,
    title: "Studio Dermal Calibrator",
    category: "HAUTE COUTURE",
    material: "AI Calibration Overlay",
    image: "/hero_model.png",
    height: "h-[500px]"
  },
  {
    id: 6,
    title: "Structured Capsule Set",
    category: "PRET-A-PORTER",
    material: "Hand-carded Wool Blend",
    image: "/flat_lay.png",
    height: "h-[320px]"
  },
  {
    id: 7,
    title: "Silk Atelier Overshirt",
    category: "PRET-A-PORTER",
    material: "Raw Charmeuse Silk",
    image: "/closet_interior.png",
    height: "h-[420px]"
  }
];

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState("ALL");

  const filteredItems = activeCategory === "ALL" 
    ? LOOKBOOK_ITEMS 
    : LOOKBOOK_ITEMS.filter(item => item.category === activeCategory);

  return (
    <section 
      id="gallery"
      className="py-24 md:py-36 bg-lux-bg-secondary border-b border-lux-border-light"
    >
      <div className="editorial-container mx-auto px-4 md:px-16 max-w-7xl">
        
        {/* Section Header */}
        <div className="flex justify-between items-baseline mb-16 pb-6 border-b border-lux-border-light">
          <div className="flex items-center gap-2">
            <span className="editorial-header-num font-serif italic text-lg text-lux-gold">06 //</span>
            <h2 className="font-editorial font-light text-4xl md:text-5xl uppercase tracking-wide text-lux-text-primary">
              Interactive Catalog
            </h2>
          </div>
          <span className="font-accent text-xs tracking-widest text-lux-text-muted uppercase">
            Lookbook Gallery
          </span>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-4 mb-16 justify-center md:justify-start">
          {CATEGORIES.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => setActiveCategory(cat)}
              className={`font-accent text-[11px] tracking-widest uppercase py-3 px-8 border rounded-full transition-all duration-300 ${
                activeCategory === cat 
                  ? "bg-lux-text-primary text-lux-bg-primary border-lux-text-primary" 
                  : "bg-transparent text-lux-text-muted border-lux-border-medium hover:border-lux-text-muted"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Masonry Columns Layout */}
        <motion.div 
          layout
          className="columns-1 sm:columns-2 lg:columns-3 gap-6 [column-fill:_auto]"
        >
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className={`break-inside-avoid mb-6 luxury-editorial-card ${item.height}`}
              >
                {/* Visual frame containing image and active cream overlay */}
                <div className="card-image-frame">
                  <img 
                    className="card-image"
                    src={item.image} 
                    alt={item.title} 
                  />
                  <div className="card-overlay" />
                </div>

                {/* Fixed text overlay sitting above the cream overlay */}
                <div className="card-text-overlay">
                  <div className="flex justify-between items-start w-full">
                    <span className="font-accent text-[9px] tracking-widest uppercase py-1 px-3 bg-lux-text-primary/10 border border-lux-text-primary/20 text-lux-text-primary rounded-full backdrop-blur-sm pointer-events-auto">
                      {item.category}
                    </span>
                    <div className="w-9 h-9 rounded-full bg-lux-bg-primary text-lux-text-primary flex items-center justify-center border border-lux-border-medium hover:bg-lux-text-primary hover:text-lux-bg-primary transition-all duration-300 pointer-events-auto">
                      <ArrowUpRight size={14} />
                    </div>
                  </div>

                  <div className="card-text-container">
                    <h3 className="font-editorial text-lg md:text-xl uppercase tracking-wider text-lux-text-primary">
                      {item.title}
                    </h3>
                    <div className="h-px bg-lux-text-primary/10 w-full my-2"></div>
                    <span className="font-accent text-[9px] tracking-wider text-lux-text-muted uppercase block">
                      {item.material}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

      </div>
    </section>
  );
}
