import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, ArrowLeft, ArrowRight, Star } from 'lucide-react';

const TESTIMONIALS = [
  {
    id: 1,
    quote: "Vogue Vista completely streamlines our personal styling pipelines. The undertone color calibration matches haute couture guidelines flawlessly.",
    author: "Alessandra Rossi",
    role: "Creative Director",
    company: "Milano Atelier",
    rating: 5,
    avatar: "/hero_model.png"
  },
  {
    id: 2,
    quote: "The virtual capsule feature brings a physical fitting room experience onto my client's phone. A total game-changer for sustainable wardrobe coordination.",
    author: "Pierre Laurent",
    role: "Senior Editorial Stylist",
    company: "Parisian Chic",
    rating: 5,
    avatar: "/closet_interior.png"
  },
  {
    id: 3,
    quote: "A wonderful editorial aesthetic layout that feels like browsing a premium fashion journal rather than using a standard SaaS calculator.",
    author: "Sarah Jenkins",
    role: "Fashion Editor",
    company: "The London Review",
    rating: 5,
    avatar: "/flat_lay.png"
  }
];

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);

  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const prevTestimonial = () => {
    setActiveIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  const current = TESTIMONIALS[activeIndex];

  return (
    <section 
      id="testimonials"
      className="py-24 md:py-10 bg-lux-bg-secondary border-b border-lux-border-light relative overflow-hidden"
    >
      {/* Background graphic details */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-48 h-48 rounded-full bg-lux-gold/5 filter blur-2xl pointer-events-none" />

      <div className="editorial-container mx-auto px-4 md:px-16 max-w-7xl relative z-10">
        
        {/* Section Header */}
        <div className="flex justify-between items-baseline mb-20 pb-8 border-b border-lux-border-light">
          <div className="flex items-center gap-2">
            <span className="editorial-header-num font-serif italic text-lg text-lux-gold">07 //</span>
            <h2 className="font-editorial font-light text-4xl md:text-5xl uppercase tracking-wide text-lux-text-primary">
              Industry Reviews
            </h2>
          </div>
          <span className="font-accent text-xs tracking-widest text-lux-text-muted uppercase">
            Testimonials
          </span>
        </div>

        {/* Carousel Container */}
        <div className="flex flex-col items-center justify-center max-w-4xl mx-auto">
          
          {/* Active Card with Perspective Rotation Wrapper */}
          <div 
            className="w-full relative min-h-[380px] md:min-h-[320px] flex items-center justify-center"
            style={{ perspective: 1200 }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, rotateY: 15, scale: 0.95, z: -100 }}
                animate={{ opacity: 1, rotateY: 0, scale: 1, z: 0 }}
                exit={{ opacity: 0, rotateY: -15, scale: 0.95, z: -100 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="w-full absolute bg-lux-bg-tertiary/70 backdrop-blur-md border border-lux-border-light shadow-premium p-8 md:p-12 flex flex-col md:flex-row gap-8 items-center rounded-sm"
              >
                {/* Left: Avatar with golden frame */}
                <div className="relative shrink-0 w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-lux-gold/30 p-1 shadow-md">
                  <img 
                    className="w-full h-full object-cover rounded-full filter grayscale-[10%]" 
                    src={current.avatar} 
                    alt={current.author} 
                  />
                  {/* Floating quote indicator */}
                  <div className="absolute bottom-0 right-0 p-2 bg-lux-text-primary text-lux-bg-primary rounded-full border border-lux-border-light">
                    <Quote size={12} className="text-lux-gold" />
                  </div>
                </div>

                {/* Right: Review details */}
                <div className="flex flex-col gap-6 text-center md:text-left">
                  {/* Rating Stars */}
                  <div className="flex gap-1 justify-center md:justify-start text-lux-gold">
                    {Array.from({ length: current.rating }).map((_, i) => (
                      <Star key={i} size={14} fill="var(--accent-gold)" />
                    ))}
                  </div>

                  {/* Quote Body */}
                  <p className="font-editorial italic text-xl md:text-2xl text-lux-text-secondary leading-relaxed">
                    "{current.quote}"
                  </p>

                  <div className="h-px bg-lux-border-light w-full"></div>

                  {/* Author Meta */}
                  <div className="flex flex-col gap-1">
                    <h4 className="font-editorial text-lg uppercase tracking-wider text-lux-text-primary">
                      {current.author}
                    </h4>
                    <span className="font-accent text-[10px] tracking-widest text-lux-text-muted uppercase">
                      {current.role} // <span className="text-lux-gold">{current.company}</span>
                    </span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Controls */}
          <div className="flex gap-4 mt-12 items-center">
            <button 
              onClick={prevTestimonial}
              className="w-12 h-12 rounded-full border border-lux-border-medium flex items-center justify-center text-lux-text-primary hover:bg-lux-text-primary hover:text-lux-bg-primary transition-all duration-300"
            >
              <ArrowLeft size={16} />
            </button>
            <span className="font-editorial italic text-base text-lux-text-muted">
              {String(activeIndex + 1).padStart(2, '0')} / {String(TESTIMONIALS.length).padStart(2, '0')}
            </span>
            <button 
              onClick={nextTestimonial}
              className="w-12 h-12 rounded-full border border-lux-border-medium flex items-center justify-center text-lux-text-primary hover:bg-lux-text-primary hover:text-lux-bg-primary transition-all duration-300"
            >
              <ArrowRight size={16} />
            </button>
          </div>

        </div>

      </div>
    </section>
  );
}
