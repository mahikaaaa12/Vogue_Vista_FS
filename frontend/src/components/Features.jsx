import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Camera, FolderHeart, Compass, Ruler, Palette, ShoppingBag, LineChart } from 'lucide-react';

const FEATURE_DATA = [
  {
    num: "03.1",
    title: "AI Personal Stylist",
    desc: "A neural advisor simulating a high-end personal shopping assistant, providing real-time feedback.",
    icon: Sparkles,
    image: "/stylist_wardrobe.jpg",
    gridSpan: "md:col-span-8"
  },
  {
    num: "03.2",
    title: "Virtual Try-on",
    desc: "Visualize garments mapped procedurally onto your 3D portrait model to evaluate sizing and drape.",
    icon: Camera,
    image: "/virtual_tryon.jpg",
    gridSpan: "md:col-span-4"
  },
  {
    num: "03.3",
    title: "Atelier Wardrobe",
    desc: "Digitize and catalog your clothing items into capsule coordinates with instant compatibility indexes.",
    icon: FolderHeart,
    image: "/atelier_flatlay.jpg",
    gridSpan: "md:col-span-4"
  },
  {
    num: "03.4",
    title: "Smart Recommendations",
    desc: "Algorithmic recommendations referencing weather reports, social codes, and seasonal color spectrums.",
    icon: Compass,
    image: "/smart_recommendations.jpg",
    gridSpan: "md:col-span-8"
  },
  {
    num: "03.5",
    title: "Body Silhouette Mapping",
    desc: "Calculate structural shoulder-to-waist ratios to suggest tailoring guidelines that highlight your natural line.",
    icon: Ruler,
    image: "/silhouette_mapping.jpg",
    gridSpan: "md:col-span-6"
  },
  {
    num: "03.6",
    title: "Color Spectrum Calibration",
    desc: "Detect melanin undertones under high-precision studio lighting simulations to unlock custom pigment profiles.",
    icon: Palette,
    image: "/color_calibration.jpg",
    gridSpan: "md:col-span-6"
  },
  {
    num: "03.7",
    title: "Bespoke Shopping Prompts",
    desc: "Receive links to high-quality companion items from luxury sustainable brands to round out lookbook cards.",
    icon: ShoppingBag,
    image: "/capsule_closet.jpg",
    gridSpan: "md:col-span-4"
  },
  {
    num: "03.8",
    title: "Fashion Index Analytics",
    desc: "Analyze look history, wear rates, and wardrobe diversity index stats to track your style trajectory.",
    icon: LineChart,
    image: "/trend_radar.jpg",
    gridSpan: "md:col-span-8"
  }
];

// Interactive 3D Tilt Card Component
function FeatureCard({ num, title, desc, icon: Icon, image, gridSpan }) {
  const cardRef = useRef(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    // Normalize coordinates (-0.5 to 0.5)
    setCoords({ x: x / (rect.width / 2), y: y / (rect.height / 2) });
  };

  const handleMouseLeave = () => {
    setHovered(false);
    setCoords({ x: 0, y: 0 });
  };

  // 3D rotations based on mouse position
  const rotateX = coords.y * -10; // Max 10 degrees tilt
  const rotateY = coords.x * 10;

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      className={`relative ${gridSpan} h-[380px] overflow-hidden border border-lux-border-light bg-lux-bg-tertiary transition-colors duration-500 hover:border-lux-gold group`}
      style={{
        perspective: 1000,
        transformStyle: 'preserve-3d'
      }}
    >
      {/* Background image overlay on hover */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-700 ease-out opacity-15 filter brightness-[0.75] contrast-[0.95] grayscale-[20%] group-hover:opacity-75 group-hover:scale-105 group-hover:brightness-[0.25] group-hover:contrast-[1.1] group-hover:grayscale-0"
        style={{ backgroundImage: `url(${image})` }}
      />

      {/* Radial glow effect */}
      {hovered && (
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: `radial-gradient(circle 240px at ${(coords.x + 1) * 50}% ${(coords.y + 1) * 50}%, rgba(198, 161, 106, 0.08) 0%, transparent 100%)`
          }}
        />
      )}

      {/* Border glow */}
      <div 
        className="absolute inset-0 pointer-events-none border border-transparent z-20 transition-all duration-500 group-hover:border-lux-gold/30" 
      />

      {/* Card Content Wrapper for 3D Tilt */}
      <div
        className="relative z-30 h-full p-8 md:p-10 flex flex-col justify-between transition-transform duration-300 ease-out"
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`
        }}
      >
        {/* Top: Icon & Index */}
        <div className="flex justify-between items-start">
          <div className="p-3 bg-lux-bg-secondary border border-lux-border-light rounded-full text-lux-gold transition-colors duration-500 group-hover:bg-[#FAF8F5] group-hover:text-lux-text-primary">
            <Icon size={20} />
          </div>
          <span className="font-editorial italic text-lg text-lux-gold">{num}</span>
        </div>

        {/* Bottom: Text Advisory */}
        <div className="flex flex-col gap-3">
          <h3 className="font-editorial text-2xl md:text-3xl uppercase tracking-wider text-lux-text-primary transition-colors duration-300 group-hover:text-lux-gold">
            {title}
          </h3>
          <p className="font-ui font-light text-sm text-lux-text-secondary leading-relaxed max-w-md transition-colors duration-300 group-hover:text-[#FAF8F5]/85">
            {desc}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Features() {
  return (
    <section 
      id="features"
      className="py-10 md:py-10 bg-lux-bg-primary border-b border-lux-border-light"
    >
      <div className="editorial-container mx-auto px-4 md:px-16 max-w-7xl">
        
        {/* Header Block */}
        <div className="flex justify-between items-baseline mb-5 pb-6 border-b border-lux-border-light">
          <div className="flex items-center gap-2">
            <span className="editorial-header-num font-serif italic text-lg text-lux-gold">02 //</span>
            <h2 className="font-editorial font-light text-4xl md:text-5xl uppercase tracking-wide text-lux-text-primary">
              Styling Capabilities
            </h2>
          </div>
          <span className="font-accent text-xs tracking-widest text-lux-text-muted uppercase">
            Feature Matrix
          </span>
        </div>

        {/* Description Panel */}
        <div className="mb-8 max-w-2xl">
          <p className="font-editorial italic text-2xl text-lux-text-secondary leading-relaxed">
            An advanced suite designed to replicate an elite, bespoke luxury fitting salon in real-time digital space.
          </p>
        </div>

        {/* Asymmetric Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {FEATURE_DATA.map((feat, idx) => (
            <FeatureCard
              key={idx}
              num={feat.num}
              title={feat.title}
              desc={feat.desc}
              icon={feat.icon}
              image={feat.image}
              gridSpan={feat.gridSpan}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
