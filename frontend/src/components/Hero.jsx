import { useAuth } from '../context/AuthContext';
import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import gsap from 'gsap';
import { Canvas, useFrame } from '@react-three/fiber';
import LiquidEther from './LiquidEther';

const COLLECTIONS = [
  {
    category: "SARTORIAL BUSINESS",
    style: "Smart Casual & Business",
    match: "98% Match",
    bestFor: "Business | Smart Casual | Minimal",
    colors: ["#D4B06A", "#16141C", "#7D9575"],
    layer1: { title: "Silk Trench & Trouser", match: "97%", detail: "Relaxed drape, linen fabric base" },
    layer2: { title: "Draped Linen Blazer", match: "98%", detail: "Sartorial crop, pleated finish" },
    layer3: { title: "Oversized Cashmere Crew", match: "96%", detail: "Grade-A wool, neutral hue" },
    accessories: { title: "Leather Tote & Gold Dial", match: "95%", detail: "Full-grain calfskin, custom clasp" }
  },
  {
    category: "MINIMALIST ATELIER",
    style: "Minimalist Atelier",
    match: "99% Match",
    bestFor: "Office | High Tea | Art Gala",
    colors: ["#FAF8F5", "#B58BE6", "#D89D90"],
    layer1: { title: "Flannel Pleated Pant", match: "98%", detail: "Light grey, tailored wool blend" },
    layer2: { title: "Monochrome Silk Suit", match: "99%", detail: "Mulberry silk satin, pearl buttons" },
    layer3: { title: "Unstructured Blazer", match: "97%", detail: "Unlined, soft shoulder construction" },
    accessories: { title: "Suede Editorial Loafer", match: "96%", detail: "Crepe sole, Italian suede leather" }
  },
  {
    category: "CONTEMPORARY NEUTRALS",
    style: "Contemporary Neutrals",
    match: "97% Match",
    bestFor: "Travel | Lounging | Streetwear",
    colors: ["#24182F", "#D4B06A", "#7D9575"],
    layer1: { title: "Boxy Heavyweight Tee", match: "96%", detail: "300gsm cotton, ribbed collar" },
    layer2: { title: "Wide-Leg Drape Lounge", match: "98%", detail: "Satin finish, elasticated waistband" },
    layer3: { title: "Minimal Knit Set", match: "97%", detail: "Ribbed trim, drop shoulder knitwear" },
    accessories: { title: "Acetate D-Frame Shield", match: "94%", detail: "100% UV protection, tortoiseshell" }
  }
];

function LiquidOrbMesh({ mouseX, mouseY, theme }) {
  const meshRef = useRef();

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(elapsed * 0.8) * 0.08;
      meshRef.current.position.x = Math.cos(elapsed * 0.6) * 0.05;
      
      const scaleWobble = 1 + Math.sin(elapsed * 1.5) * 0.04;
      meshRef.current.scale.set(scaleWobble * 1.45, (1 - Math.sin(elapsed * 1.5) * 0.04) * 1.45, scaleWobble * 1.45);

      const targetX = (mouseX.get() / window.innerWidth) * 0.5;
      const targetY = -(mouseY.get() / window.innerHeight) * 0.5;
      meshRef.current.position.x += (targetX - meshRef.current.position.x) * 0.08;
      meshRef.current.position.y += (targetY - meshRef.current.position.y) * 0.08;

      meshRef.current.rotation.y = elapsed * 0.12;
      meshRef.current.rotation.x = elapsed * 0.06;
    }
  });

  const isDark = theme === 'dark';

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 24, 24]} />
      <meshStandardMaterial
        color={isDark ? "#B58BE6" : "#E5D9C4"}
        emissive={isDark ? "#B58BE6" : "#E5D9C4"}
        emissiveIntensity={isDark ? 0.15 : 0.02}
        roughness={isDark ? 0.05 : 0.4}
        metalness={isDark ? 0.9 : 0.05}
        transparent={true}
        opacity={isDark ? 0.35 : 0.06}
      />
    </mesh>
  );
}

function FashionCard({ title, match, detail, type, x, y, image, bestFor, positionClass }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      style={{ x, y }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`absolute ${positionClass} lux-card-glass dark:glass-luxury rounded-[20px] p-4 shadow-premium border border-lux-border-light w-[180px] md:w-[220px] cursor-pointer z-20 hover:z-30 hover:scale-102 transition-all duration-300 overflow-hidden flex flex-col text-left`}
    >
      {/* Thumbnail */}
      <div className="h-28 md:h-36 overflow-hidden bg-lux-bg-primary/20 rounded-[12px] mb-3 relative">
        <img src={image} alt={title} className="w-full h-full object-cover grayscale-[10%]" />
        
        {/* Slide-over glass detail panel */}
        <AnimatePresence>
          {hovered && (
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="absolute inset-0 bg-lux-bg-secondary/95 backdrop-blur-md p-3 flex flex-col justify-center text-center border-t border-lux-border-light"
            >
              <div className="font-accent text-[8px] tracking-widest text-lux-gold uppercase">ATELIER METRICS</div>
              <div className="font-editorial text-xs text-lux-text-primary mt-1">{type}</div>
              <div className="text-[10px] text-[#C8A46B] font-bold mt-1">{match} Match</div>
              <div className="font-accent text-[7px] tracking-wider text-lux-text-muted mt-2 uppercase leading-relaxed">
                BEST FOR:<br/>{bestFor}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="font-accent text-[8px] tracking-widest text-lux-text-muted uppercase">{type}</div>
      <div className="font-editorial text-xs md:text-sm text-lux-text-primary mt-1 font-light truncate">{title}</div>
      <div className="font-ui text-[9px] text-lux-text-secondary mt-1 truncate">{detail}</div>
    </motion.div>
  );
}

export default function Hero({ setScreen, theme }) {
  const { isAuthenticated } = useAuth();
  const handleInitiateScan = () => { if (isAuthenticated) { setScreen('analysis-selection'); } else { setScreen('login'); } };
  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const descRef = useRef(null);
  const ctaRef = useRef(null);
  const statsRef = useRef(null);
  const compositionRef = useRef(null);

  const [collectionIdx, setCollectionIdx] = useState(0);

  // Auto-cycle collections every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCollectionIdx((prev) => (prev + 1) % COLLECTIONS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const col = COLLECTIONS[collectionIdx];

  // Mouse position tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Separation physics mappings (drift apart symmetrically on mouse movements)
  const card1X = useTransform(mouseX, [-400, 400], [-35, 10]);
  const card1Y = useTransform(mouseY, [-400, 400], [-35, 10]);

  const card2X = useTransform(mouseX, [-400, 400], [10, -35]);
  const card2Y = useTransform(mouseY, [-400, 400], [-35, 10]);

  const card3X = useTransform(mouseX, [-400, 400], [-35, 10]);
  const card3Y = useTransform(mouseY, [-400, 400], [10, -35]);

  const card4X = useTransform(mouseX, [-400, 400], [10, -35]);
  const card4Y = useTransform(mouseY, [-400, 400], [10, -35]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        mouseX.set(x);
        mouseY.set(y);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    // GSAP Entrance Animations
    const ctx = gsap.context(() => {
      const titleLines = titleRef.current.querySelectorAll('.title-line');
      gsap.fromTo(titleLines, 
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, stagger: 0.15, ease: 'power4.out', delay: 0.2 }
      );

      gsap.fromTo(descRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.0, ease: 'power3.out', delay: 0.7 }
      );

      gsap.fromTo(ctaRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.9 }
      );

      gsap.fromTo(statsRef.current,
        { opacity: 0, y: 15 },
        { opacity: 0.85, y: 0, duration: 1.0, ease: 'power3.out', delay: 1.1 }
      );

      gsap.fromTo(compositionRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 1.5, ease: 'power4.out', delay: 0.4 }
      );
    }, containerRef);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      ctx.revert();
    };
  }, [mouseX, mouseY]);

  return (
    <section 
      ref={containerRef}
      id="hero"
      className="relative min-h-[calc(100vh-96px)] flex flex-col items-center justify-center overflow-hidden border-b border-lux-border-light py-24 md:py-32 bg-lux-bg-primary text-center"
    >
      {/* Glow */}
      <motion.div 
        style={{
          position: 'absolute',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, var(--glow-color) 0%, transparent 70%)',
          x: mouseX,
          y: mouseY,
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      {/* WebGL background simulation */}
      <div className={`absolute inset-0 pointer-events-none z-0 transition-opacity duration-500 ${theme === 'dark' ? 'opacity-70' : 'opacity-40'}`}>
        <LiquidEther
          colors={
            theme === 'dark'
              ? ['#D4B06A', '#B58BE6', '#4D2F63']
              : ['#D4B06A', '#DFC7A5', '#FAF8F5']
          }
          mouseForce={15}
          cursorSize={70}
          isViscous={false}
          iterationsPoisson={8}
          resolution={0.25}
          isBounce={false}
          autoDemo={true}
          autoSpeed={0.35}
          autoIntensity={2.0}
          takeoverDuration={0.25}
          autoResumeDelay={3000}
          autoRampDuration={0.6}
        />
      </div>

      {/* Coloured ambient light blobs */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div 
          animate={{
            x: [0, 80, -40, 0],
            y: [0, -60, 50, 0],
            scale: [1, 1.2, 0.9, 1]
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-[350px] h-[350px] rounded-full bg-[#4D2F63]/30 filter blur-[100px]"
        />
        <motion.div 
          animate={{
            x: [0, -70, 60, 0],
            y: [0, 80, -40, 0],
            scale: [1, 0.9, 1.15, 1]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-[#B58BE6]/20 filter blur-[120px]"
        />
      </div>

      <div className="editorial-container mx-auto px-4 md:px-16 w-full max-w-7xl relative z-10 flex flex-col items-center">
        
        {/* Label */}
        <div className="flex items-center gap-2 mb-0.2">
          <span className="font-serif italic text-lg text-lux-gold"></span>
          <span className="font-accent text-xs tracking-widest text-lux-text-muted uppercase">
            YOUR PERSONAL AI FASHION ATELIER
          </span>
        </div>

        {/* Headline */}
        <h1 
          ref={titleRef}
          className="font-editorial font-light text-5xl sm:text-7xl md:text-8xl lg:text-9xl uppercase tracking-tight leading-[0.95] text-lux-text-primary mb-8 max-w-6xl mx-auto"
        >
          <span className="block overflow-hidden h-[1.1em]">
            <span className="title-line block">Personal AI</span>
          </span>
          <span className="block overflow-hidden h-[1.1em]">
            <span className="title-line block font-serif italic text-lux-gold">signature style</span>
          </span>
          <span className="block overflow-hidden h-[1.1em]">
            <span className="title-line block">with Intelligence.</span>
          </span>
        </h1>

        {/* Description */}
        <p 
          ref={descRef}
          className="font-ui font-light text-base md:text-lg text-lux-text-secondary leading-relaxed max-w-2xl mx-auto mb-12"
        >
          An immersive digital atelier aligning classic style guidelines with real-time face metrics, color analysis, and personal silhouettes. Discover your aesthetic spread today.
        </p>

        {/* Floating AI Fashion Capsule Centerpiece Collage */}
        <div 
          ref={compositionRef}
          className="w-full max-w-5xl h-[560px] md:h-[650px] relative mx-auto my-6 flex items-center justify-center select-none"
        >
          {/* 3D Shimmering Glass Refractive Orb in the background */}
          <div className={`absolute w-[400px] h-[400px] md:w-[480px] md:h-[480px] pointer-events-none z-0 ${theme === 'dark' ? 'mix-blend-screen opacity-60' : 'opacity-25'}`}>
            <Canvas 
              camera={{ position: [0, 0, 2.2] }}
              gl={{ antialias: false, powerPreference: "high-performance" }}
              dpr={[1, 1.5]}
            >
              <ambientLight intensity={theme === 'dark' ? 1.5 : 2.5} />
              <directionalLight position={[5, 5, 5]} intensity={theme === 'dark' ? 3.5 : 1.5} />
              <pointLight position={[-5, -5, -5]} intensity={theme === 'dark' ? 2.0 : 0.5} color={theme === 'dark' ? "#B58BE6" : "#D4B06A"} />
              <spotLight position={[0, 10, 0]} intensity={2.0} color="#D4B06A" />
              <LiquidOrbMesh mouseX={mouseX} mouseY={mouseY} theme={theme} />
            </Canvas>
          </div>

          {/* AnimatePresence for smooth transitions between rotating collections */}
          <AnimatePresence mode="wait">
            <motion.div
              key={collectionIdx}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full flex items-center justify-center"
            >
              {/* Centered Recommendation Console */}
              <div className="absolute w-[290px] h-[290px] md:w-[340px] md:h-[340px] rounded-full border border-lux-border-medium bg-lux-bg-secondary/40 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-10 shadow-premium">
                <div className="font-accent text-[8px] tracking-widest text-lux-gold uppercase mb-1">CURATING COLLECTION</div>
                <div className="font-editorial text-2xl md:text-3xl text-lux-text-primary uppercase font-light tracking-wide">{col.category}</div>
                <div className="font-serif italic text-base text-lux-text-secondary mt-0.5">{col.style}</div>
                
                {/* Style score badge */}
                <div className="mt-3 px-3 py-1 bg-lux-text-primary/10 border border-lux-border-light rounded-full text-[9px] font-accent tracking-widest text-lux-text-primary">
                  {col.match}
                </div>

                {/* Color swatches */}
                <div className="flex gap-1.5 mt-5">
                  {col.colors.map((c, i) => (
                    <span key={i} className="w-3.5 h-3.5 rounded-full border border-lux-border-light" style={{ backgroundColor: c }} />
                  ))}
                </div>

                <div className="font-accent text-[8px] tracking-wider text-lux-text-muted mt-5 max-w-[210px] leading-normal uppercase">
                  BEST FOR: <br/> {col.bestFor}
                </div>
              </div>

              {/* 1. Structured Outfit Card (Top-Left) */}
              <FashionCard
                type="Structured Look"
                title={col.layer1.title}
                match={col.layer1.match}
                detail={col.layer1.detail}
                image="/hero_model.png"
                bestFor={col.bestFor}
                x={card1X}
                y={card1Y}
                positionClass="top-4 left-0 md:left-[6%]"
              />

              {/* 2. Fluid Outfit Card (Top-Right) */}
              <FashionCard
                type="Fluid Look"
                title={col.layer2.title}
                match={col.layer2.match}
                detail={col.layer2.detail}
                image="/flat_lay.png"
                bestFor={col.bestFor}
                x={card2X}
                y={card2Y}
                positionClass="top-4 right-0 md:right-[6%]"
              />

              {/* 3. Casual/Knitwear Outfit Card (Bottom-Left) */}
              <FashionCard
                type="Knitwear Look"
                title={col.layer3.title}
                match={col.layer3.match}
                detail={col.layer3.detail}
                image="/closet_interior.png"
                bestFor={col.bestFor}
                x={card3X}
                y={card3Y}
                positionClass="bottom-4 left-0 md:left-[10%]"
              />

              {/* 4. Accessories Card (Bottom-Right) */}
              <FashionCard
                type="Accessory Look"
                title={col.accessories.title}
                match={col.accessories.match}
                detail={col.accessories.detail}
                image="/flat_lay.png"
                bestFor={col.bestFor}
                x={card4X}
                y={card4Y}
                positionClass="bottom-4 right-0 md:right-[10%]"
              />
            </motion.div>
          </AnimatePresence>

          {/* Floating DNA Match Badge (Top-Center Overlay) */}
          <motion.div
            style={{ x: useTransform(mouseX, [-400, 400], [10, -10]), y: useTransform(mouseY, [-400, 400], [5, -5]) }}
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1 lg:top-4 glass-chip py-2 px-4 rounded-full flex items-center gap-2 z-30 text-[9px] font-accent tracking-widest text-lux-text-primary uppercase border border-lux-border-light shadow-lg"
          >
            <Sparkles size={10} className="text-lux-gold" />
            <span>STYLE DNA MATRIX // ACTIVE</span>
          </motion.div>
        </div>

        {/* Centered CTAs */}
        <div 
          ref={ctaRef}
          className="flex justify-center flex-wrap gap-5 items-center mb-16 w-full max-w-md mx-auto relative z-20"
        >
          <button 
            onClick={handleInitiateScan}
            className="btn-lux w-full sm:w-auto flex items-center justify-center gap-3 group px-8 py-4"
          >
            <span>INITIATE AI SCAN</span>
            <Sparkles size={14} className="text-lux-gold group-hover:rotate-12 transition-transform duration-300" />
          </button>

          <button 
            onClick={() => setScreen('results')}
            className="btn-lux-outline w-full sm:w-auto flex items-center justify-center gap-3 group px-8 py-4 dark:glass-luxury"
          >
            <span>VIEW SAMPLE SPREAD</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
          </button>
        </div>

        {/* Centered Micro Stats Banner */}
        <div
          ref={statsRef}
          className="flex justify-center gap-8 md:gap-16 border-t border-lux-border-light pt-8 w-full max-w-4xl relative z-20"
        >
          <div>
            <div className="font-editorial text-2xl md:text-3xl text-lux-text-primary" style={{ fontVariantNumeric: 'lining-nums', fontFeatureSettings: '"lnum" 1' }}>12+</div>
            <div className="font-accent text-[9px] tracking-widest text-lux-text-muted uppercase mt-1">
              SEASON SPECTUMS
            </div>
          </div>
          <div>
            <div className="font-editorial text-2xl md:text-3xl text-lux-text-primary" style={{ fontVariantNumeric: 'lining-nums', fontFeatureSettings: '"lnum" 1' }}>99.2%</div>
            <div className="font-accent text-[9px] tracking-widest text-lux-text-muted uppercase mt-1">
              CALIBRATION RATE
            </div>
          </div>
          <div>
            <div className="font-editorial text-2xl md:text-3xl text-lux-text-primary" style={{ fontVariantNumeric: 'lining-nums', fontFeatureSettings: '"lnum" 1' }}>40K+</div>
            <div className="font-accent text-[9px] tracking-widest text-lux-text-muted uppercase mt-1">
              OUTFITS GENERATED
            </div>
          </div>
        </div>

      </div>

      {/* Animated Scroll Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none opacity-60 z-20">
        <span className="font-accent text-[9px] tracking-widest uppercase text-lux-text-muted">SCROLL</span>
        <motion.div 
          className="w-[1px] h-10 bg-lux-text-primary"
          animate={{
            scaleY: [0, 1, 0],
            originY: [0, 0, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
    </section>
  );
}

