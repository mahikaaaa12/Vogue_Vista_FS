import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Sparkles, Cpu, Eye, Layers } from 'lucide-react';
import * as THREE from 'three';

// 3D Glass-Metallic Orb for Left side
function FloatingOrb() {
  const orbRef = useRef();
  const wireRef = useRef();

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();
    if (orbRef.current) {
      orbRef.current.position.y = Math.sin(elapsed * 1.5) * 0.15;
      orbRef.current.rotation.y = elapsed * 0.3;
    }
    if (wireRef.current) {
      wireRef.current.rotation.y = -elapsed * 0.15;
      wireRef.current.rotation.x = elapsed * 0.1;
    }
  });

  return (
    <group>
      {/* Outer Wireframe Globe */}
      <mesh ref={wireRef}>
        <sphereGeometry args={[1.1, 24, 24]} />
        <meshBasicMaterial 
          color="#C5A880" 
          wireframe 
          transparent 
          opacity={0.15} 
        />
      </mesh>

      {/* Main Glass/Chrome Orb */}
      <mesh ref={orbRef}>
        <sphereGeometry args={[0.8, 24, 24]} />
        <meshStandardMaterial
          color="#FAF8F5"
          metalness={0.95}
          roughness={0.05}
          transparent
          opacity={0.65}
        />
      </mesh>

      {/* Floating internal particles */}
      <points>
        <bufferGeometry>
          <bufferAttribute 
            attach="attributes-position" 
            count={40} 
            array={new Float32Array(Array.from({ length: 120 }, () => (Math.random() - 0.5) * 1.2))}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial color="#C5A880" size={0.04} transparent opacity={0.6} />
      </points>
    </group>
  );
}

const CAPABILITIES = [
  {
    icon: Eye,
    title: "Neural Pattern Recognition",
    desc: "Analyzes 68 facial points and structural geometry mapping to locate anatomical proportions and contrast profiles instantly."
  },
  {
    icon: Cpu,
    title: "Dermal Contrast Calibration",
    desc: "Simulates studio lighting filters to calculate precise skin, hair, and eye RGB pigment ratios, matching you to a seasonal color spectrum."
  },
  {
    icon: Layers,
    title: "Silhouette Aspect Ratio Sweep",
    desc: "Examines anatomical proportions and skeletal lines, comparing shoulder, waist, and hip alignments to suggest structured tailoring guides."
  },
  {
    icon: Sparkles,
    title: "Editorial Capsule Mapping",
    desc: "Matches your biometric profile against historical archives, styling rules from haute couture design houses, and interactive 3D accessories."
  }
];

function AccordionItem({ item, isOpen, onClick }) {
  const Icon = item.icon;
  return (
    <div className="border-b border-lux-border-light py-5">
      <button
        onClick={onClick}
        className="w-full flex justify-between items-center text-left focus:outline-none group"
      >
        <div className="flex items-center gap-4">
          <div className="p-2 bg-lux-bg-secondary rounded-full border border-lux-border-light text-lux-gold group-hover:bg-lux-text-primary group-hover:text-lux-bg-primary transition-colors duration-500">
            <Icon size={16} />
          </div>
          <h3 className="font-editorial text-lg md:text-xl uppercase tracking-wide text-lux-text-primary transition-colors duration-300 group-hover:text-lux-gold">
            {item.title}
          </h3>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-lux-text-muted group-hover:text-lux-text-primary transition-colors duration-300"
        >
          <ChevronDown size={18} />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="font-ui font-light text-sm text-lux-text-secondary leading-relaxed pl-14 pt-4 pb-2 max-w-xl">
              {item.desc}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AICapabilities() {
  const [openIdx, setOpenIdx] = useState(0);

  return (
    <section 
      id="ai-capabilities"
      className="py-16 md:py-10 bg-lux-bg-primary border-b border-lux-border-light"
    >
      <div className="editorial-container mx-auto px-4 md:px-16 max-w-7xl">
        
        {/* Section Header */}
        <div className="flex justify-between items-baseline mb-10 pb-6 border-b border-lux-border-light">
          <div className="flex items-center gap-2">
            <span className="editorial-header-num font-serif italic text-lg text-lux-gold">06 //</span>
            <h2 className="font-editorial font-light text-4xl md:text-5xl uppercase tracking-wide text-lux-text-primary">
              AI Capabilities
            </h2>
          </div>
          <span className="font-accent text-xs tracking-widest text-lux-text-muted uppercase">
            Platform Science
          </span>
        </div>

        {/* Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left Column: 3D Orb and floating effects */}
          <div className="lg:col-span-5 h-[400px] md:h-[450px] relative lux-card-glass dark:glass-luxury rounded-sm overflow-hidden flex items-center justify-center shadow-premium border border-lux-border-medium">
            
            {/* Canvas overlay */}
            <div className="absolute inset-0 w-full h-full">
              <Canvas 
                style={{ background: 'transparent' }} 
                camera={{ position: [0, 0, 2.8] }}
                gl={{ antialias: false, powerPreference: "high-performance" }}
                dpr={[1, 1.5]}
              >
                <ambientLight intensity={1.5} />
                <directionalLight position={[5, 5, 5]} intensity={2.0} />
                <pointLight position={[-5, -5, -5]} intensity={1.0} color="#C5A880" />
                <FloatingOrb />
                <OrbitControls enableZoom={false} enablePan={false} />
              </Canvas>
            </div>

            {/* Static HUD labels */}
            <div className="absolute top-6 left-6 font-accent text-[9px] tracking-widest text-lux-text-muted uppercase">
              COUTURE_ORB // CORE_CALIBRATOR
            </div>
            <div className="absolute bottom-6 right-6 font-accent text-[9px] tracking-widest text-lux-gold uppercase animate-pulse">
              ACTIVE DETECT STATE
            </div>

          </div>

          {/* Right Column: Premium Accordion */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <span className="font-accent text-xs tracking-widest text-lux-gold uppercase block">
              ALGORITHMIC PILLARS
            </span>
            <h3 className="font-editorial text-3xl md:text-4xl uppercase tracking-wide text-lux-text-primary leading-tight max-w-xl">
              Precision Styling Calibrated by Artificial Intelligence
            </h3>
            
            <div className="h-px bg-lux-border-light w-full my-4"></div>

            <div className="flex flex-col">
              {CAPABILITIES.map((item, idx) => (
                <AccordionItem
                  key={idx}
                  item={item}
                  isOpen={openIdx === idx}
                  onClick={() => setOpenIdx(openIdx === idx ? -1 : idx)}
                />
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
