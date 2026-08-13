import React, { useEffect, useRef, useState, useMemo, Suspense } from 'react';
import { Ruler, Camera, Sparkles, ArrowRight } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import './AnalysisExperience.css';

// ─── Timing constants ────────────────────────────────────────────────────────
const DISPLAY_DURATION = 5.0;   // seconds each model is fully visible
const FADE_DURATION    = 0.9;   // seconds for fade in / fade out
const CYCLE_DURATION   = DISPLAY_DURATION + FADE_DURATION * 2; // 6.8 s per slot
const TOTAL_CYCLE      = CYCLE_DURATION * 2;                   // 13.6 s full loop

// ─── Shared luxury material factory ─────────────────────────────────────────
function buildLuxuryScene(scene) {
  const clone = scene.clone();
  clone.traverse((child) => {
    if (child.isMesh) {
      child.material = new THREE.MeshStandardMaterial({
        color: '#C6A16A',
        roughness: 0.3,
        metalness: 0.8,
        transparent: true,
        opacity: 0,          // start invisible; opacity driven by useFrame
      });
      child.material.needsUpdate = true;
    }
  });
  return clone;
}

// ─── Helper: compute scale + base position to fit inside cylinder ─────────────
function computeScalePos(clonedScene) {
  const box = new THREE.Box3().setFromObject(clonedScene);
  const size = new THREE.Vector3();
  box.getSize(size);
  const center = new THREE.Vector3();
  box.getCenter(center);
  const targetHeight = 2.2;
  const scale = targetHeight / size.y;
  const yOffset = -1.25 - box.min.y * scale;
  const xOffset = -center.x * scale;
  const zOffset = -center.z * scale;
  return { scale, position: [xOffset, yOffset, zOffset] };
}

// ─── Dual-model showcase component ──────────────────────────────────────────
//   All state is kept in refs — zero React re-renders.
function ShowcaseModels({ ringRef, particlesMatRef }) {
  const { scene: femaleScene } = useGLTF('/female_with_rig4.glb');
  const { scene: maleScene }   = useGLTF('/male_with_rig4.glb');

  const femaleRef = useRef();
  const maleRef   = useRef();

  // Build luxury materials once
  const femaleClone = useMemo(() => buildLuxuryScene(femaleScene), [femaleScene]);
  const maleClone   = useMemo(() => buildLuxuryScene(maleScene),   [maleScene]);

  const femaleScalePos = useMemo(() => computeScalePos(femaleClone), [femaleClone]);
  const maleScalePos   = useMemo(() => computeScalePos(maleClone),   [maleClone]);

  // Collect all mesh materials for opacity drive
  const femaleMats = useMemo(() => {
    const mats = [];
    femaleClone.traverse((c) => { if (c.isMesh) mats.push(c.material); });
    return mats;
  }, [femaleClone]);
  const maleMats = useMemo(() => {
    const mats = [];
    maleClone.traverse((c) => { if (c.isMesh) mats.push(c.material); });
    return mats;
  }, [maleClone]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    // Position within the repeating 13.6-second loop
    const loopT = t % TOTAL_CYCLE;

    // ── Determine opacity for each model ─────────────────────────────────────
    // Female occupies [0, CYCLE_DURATION), Male occupies [CYCLE_DURATION, TOTAL_CYCLE)
    let femaleOpacity, maleOpacity;

    if (loopT < FADE_DURATION) {
      // Female fade-in
      femaleOpacity = loopT / FADE_DURATION;
      maleOpacity   = 0;
    } else if (loopT < FADE_DURATION + DISPLAY_DURATION) {
      // Female fully visible
      femaleOpacity = 1;
      maleOpacity   = 0;
    } else if (loopT < CYCLE_DURATION) {
      // Female fade-out
      femaleOpacity = 1 - (loopT - FADE_DURATION - DISPLAY_DURATION) / FADE_DURATION;
      maleOpacity   = 0;
    } else {
      const mt = loopT - CYCLE_DURATION; // local time for male slot
      femaleOpacity = 0;
      if (mt < FADE_DURATION) {
        maleOpacity = mt / FADE_DURATION;
      } else if (mt < FADE_DURATION + DISPLAY_DURATION) {
        maleOpacity = 1;
      } else {
        maleOpacity = 1 - (mt - FADE_DURATION - DISPLAY_DURATION) / FADE_DURATION;
      }
    }

    // Clamp and apply opacity to all meshes
    const fo = Math.max(0, Math.min(1, femaleOpacity)) * 0.75; // max opacity 0.75
    const mo = Math.max(0, Math.min(1, maleOpacity))   * 0.75;
    femaleMats.forEach((m) => { m.opacity = fo; });
    maleMats.forEach((m)   => { m.opacity = mo; });

    // ── Ring intensity burst during transitions ───────────────────────────────
    // Transition peaks occur at t = 0, CYCLE_DURATION, TOTAL_CYCLE … (fade midpoints)
    const fadeIn1  = FADE_DURATION / 2;                              // ~0.45 s
    const fadeOut1 = FADE_DURATION + DISPLAY_DURATION + FADE_DURATION / 2; // ~6.35 s
    const fadeIn2  = CYCLE_DURATION + FADE_DURATION / 2;            // ~7.25 s
    const fadeOut2 = CYCLE_DURATION + FADE_DURATION + DISPLAY_DURATION + FADE_DURATION / 2;

    const ringBoost = [fadeIn1, fadeOut1, fadeIn2, fadeOut2].reduce((acc, peak) => {
      const d = Math.abs(loopT - peak);
      return acc + Math.max(0, 1 - d / (FADE_DURATION * 0.8));
    }, 0);

    if (ringRef.current) {
      // Slightly brighten ring emissive during transitions (ring material is MeshStandardMaterial)
      const boost = Math.min(ringBoost, 1);
      ringRef.current.material.emissiveIntensity = boost * 0.6;
      ringRef.current.material.emissive = new THREE.Color('#C6A16A');
    }
    if (particlesMatRef.current) {
      particlesMatRef.current.opacity = 0.7 + Math.min(ringBoost, 1) * 0.3;
    }

    // ── Holographic floating animation ───────────────────────────────────────
    // Applied to whichever model is currently visible (or both — it doesn't matter
    // since invisible models simply have opacity 0).
    const animateModel = (ref, scalePos, phaseOffset) => {
      if (!ref.current) return;
      const floatY    = Math.sin(t * ((2 * Math.PI) / 5) + phaseOffset) * 0.09;
      const swayAngle = Math.sin(t * ((2 * Math.PI) / 7) + 1.2 + phaseOffset) * (8 * (Math.PI / 180));
      const tiltAngle = Math.sin(t * ((2 * Math.PI) / 9) + 2.5 + phaseOffset) * (2 * (Math.PI / 180));
      ref.current.position.x = scalePos.position[0];
      ref.current.position.y = scalePos.position[1] + floatY;
      ref.current.position.z = scalePos.position[2];
      ref.current.rotation.y = swayAngle;
      ref.current.rotation.x = tiltAngle;
      ref.current.rotation.z = 0;
    };

    animateModel(femaleRef, femaleScalePos, 0);
    animateModel(maleRef,   maleScalePos,   Math.PI); // offset so they feel independent
  });

  return (
    <>
      <primitive
        ref={femaleRef}
        object={femaleClone}
        scale={femaleScalePos.scale}
        position={femaleScalePos.position}
      />
      <primitive
        ref={maleRef}
        object={maleClone}
        scale={maleScalePos.scale}
        position={maleScalePos.position}
      />
    </>
  );
}

// Preload both models once at module init
useGLTF.preload('/female_with_rig4.glb');
useGLTF.preload('/male_with_rig4.glb');

// 3D Cylinder Scanner Component
function HologramCylinder() {
  const cylinderGroupRef = useRef();
  const ringRef          = useRef();
  const particlesRef     = useRef();
  const pedestalRef      = useRef();
  const particlesMatRef  = useRef();

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();
    
    // 1. Subtle floating animation
    if (cylinderGroupRef.current) {
      cylinderGroupRef.current.position.y = Math.sin(elapsed * 0.8) * 0.08;
    }

    // 2. Slowly rotate and translate scanning ring
    if (ringRef.current) {
      ringRef.current.position.y = Math.sin(elapsed * 1.2) * 1.1;
      ringRef.current.rotation.z = elapsed * 0.45;
    }

    // 3. Animate particles vertically (rising)
    if (particlesRef.current) {
      particlesRef.current.rotation.y = elapsed * 0.08;
      
      const positions = particlesRef.current.geometry.attributes.position.array;
      const count = particlesRef.current.geometry.attributes.position.count;
      
      for (let i = 0; i < count; i++) {
        let y = positions[i * 3 + 1];
        y += 0.007;
        if (y > 1.5) {
          y = -1.5;
        }
        positions[i * 3 + 1] = y;
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // 4. Soft glow pulse animation every few seconds
    if (pedestalRef.current) {
      pedestalRef.current.material.opacity = 0.05 + Math.sin(elapsed * 2.5) * 0.03;
    }
  });

  // Generate particle coordinates
  const particleCount = 75;
  const particlePositions = useMemo(() => {
    const arr = new Float32Array(particleCount * 3);
    const radius = 0.95;
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * radius;
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      const y = Math.random() * 3 - 1.5; // y coordinate between -1.5 and 1.5
      arr[i * 3] = x;
      arr[i * 3 + 1] = y;
      arr[i * 3 + 2] = z;
    }
    return arr;
  }, []);

  return (
    <group ref={cylinderGroupRef}>
      {/* Outer Cylinder Grid (Wireframe) */}
      <mesh>
        <cylinderGeometry args={[1.0, 1.0, 3.0, 24, 12, true]} />
        <meshBasicMaterial 
          color="#C6A16A" // Champagne Gold
          transparent 
          opacity={0.14} 
          wireframe 
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Internal Pedestal Beam (Pulsing Glow effect) */}
      <mesh ref={pedestalRef}>
        <cylinderGeometry args={[0.98, 0.98, 3.0, 24, 1, true]} />
        <meshBasicMaterial 
          color="#C6A16A" 
          transparent 
          opacity={0.05} 
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Slowly Rotating Gold Scanning Ring */}
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.05, 0.018, 16, 80]} />
        <meshStandardMaterial 
          color="#C6A16A" 
          roughness={0.15} 
          metalness={0.9} 
        />
      </mesh>

      {/* Vertical particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute 
            attach="attributes-position" 
            count={particleCount} 
            array={particlePositions} 
            itemSize={3} 
          />
        </bufferGeometry>
        <pointsMaterial 
          ref={particlesMatRef}
          color="#C6A16A" 
          size={0.035} 
          transparent 
          opacity={0.7} 
        />
      </points>

      {/* Dual-model showcase — female ↔ male, fading in/out every 5 s */}
      <Suspense fallback={null}>
        <ShowcaseModels ringRef={ringRef} particlesMatRef={particlesMatRef} />
      </Suspense>
    </group>
  );
}

function CylinderScannerVisual() {
  const [webGLAvailable] = useState(() => {
    try {
      const canvas = document.createElement('canvas');
      return !!(
        window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
      );
    } catch (e) {
      return false;
    }
  });

  if (!webGLAvailable) {
    return (
      <div className="w-full h-[450px] md:h-[520px] bg-transparent flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(198,161,106,0.06)_0%,transparent_70%)]" />
        <span className="font-accent text-xs tracking-widest text-lux-gold uppercase animate-pulse">SCANNER STANDBY</span>
        <p className="font-ui font-light text-sm text-lux-text-muted mt-2">
          WebGL graphics not supported in your browser session.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-[450px] md:h-[550px] relative overflow-hidden bg-transparent">
      <Canvas style={{ background: 'transparent' }} gl={{ alpha: true }} camera={{ position: [0, 0, 3.2], fov: 50 }}>
        <ambientLight intensity={1.5} />
        <directionalLight position={[5, 10, 5]} intensity={2.0} />
        <spotLight position={[0, 10, 0]} intensity={1.5} color="#C6A16A" />
        <HologramCylinder />
        <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 1.8} minPolarAngle={Math.PI / 2.2} />
      </Canvas>

      {/* Floating text description */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center p-6 select-none">
        <h4 className="font-accent text-xs tracking-[0.25em] text-lux-gold uppercase animate-pulse">
          SCANNER STANDBY
        </h4>
        <p className="font-ui font-light text-xs text-lux-text-muted mt-2 max-w-xs leading-relaxed">
          Select an analysis method to calibrate depth grid
        </p>
      </div>

      <div className="absolute bottom-4 right-6 text-[9px] font-accent tracking-widest text-lux-text-muted uppercase pointer-events-none opacity-60">
        Drag to Orbit / 3D Grid
      </div>
    </div>
  );
}

// Main Page Component
export default function AnalysisExperience({ setScreen }) {
  const pageRef = useRef(null);
  const headerRef = useRef(null);
  const rightContentRef = useRef(null);
  const cardsRef = useRef([]);

  // GSAP Entrance Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Section Header Fade In
      gsap.fromTo(headerRef.current, 
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
      );

      // 2. Right Column Editorial content slide-up & fade-in
      const rightElements = rightContentRef.current.children;
      gsap.fromTo(rightElements,
        { opacity: 0, y: 30 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 1.1, 
          stagger: 0.15, 
          ease: 'power3.out',
          delay: 0.2
        }
      );

      // 3. Right Selection Cards stagger entrance
      gsap.fromTo(cardsRef.current,
        { opacity: 0, y: 40 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 1.2, 
          stagger: 0.18, 
          ease: 'power4.out',
          delay: 0.5
        }
      );
    }, pageRef);

    return () => ctx.revert();
  }, []);

  const addToCardsRef = (el) => {
    if (el && !cardsRef.current.includes(el)) {
      cardsRef.current.push(el);
    }
  };

  const handleNavigation = (screenName) => {
    setScreen(screenName);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section 
      ref={pageRef}
      className="min-h-screen py-24 md:py-32 bg-lux-bg-primary text-lux-text-primary relative overflow-hidden transition-colors duration-500"
    >
      {/* Editorial Vignette & Radial Light Accent */}
      <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-[radial-gradient(circle,rgba(198,161,106,0.035)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(181,139,230,0.02)_0%,transparent_70%)] pointer-events-none" />

      <div className="mx-auto w-full max-w-[1600px] px-6 md:px-[48px] relative z-10 flex flex-col gap-16">
        
        {/* SECTION HEADER */}
        <div 
          ref={headerRef}
          className="flex justify-between items-baseline mb-4 pb-6 border-b border-lux-border-light"
        >
          <div className="flex items-center gap-3">
            <span className="font-serif italic text-lg text-lux-gold">03 //</span>
            <h1 className="font-editorial font-light text-4xl md:text-5xl uppercase tracking-wide">
              Body Analysis
            </h1>
          </div>
          <span className="font-accent text-xs tracking-widest text-lux-text-muted uppercase hidden sm:inline">
            Personal Body Profile
          </span>
        </div>

        {/* Thin Gold Divider */}
        <div className="thin-gold-line -mt-12 mb-4" />

        {/* MAIN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* LEFT HERO CONTENT (45%) */}
          <div className="lg:col-span-5 w-full h-full order-2 lg:order-1">
            <CylinderScannerVisual />
          </div>

          {/* RIGHT CONTENT (55%) */}
          <div 
            ref={rightContentRef}
            className="lg:col-span-7 flex flex-col gap-8 items-start text-left order-1 lg:order-2"
          >
            <div className="flex flex-col gap-5 items-start">
              {/* Luxury Badge */}
              <div className="badge-luxury px-4 py-1.5 rounded-full text-[9px] font-accent tracking-[0.25em] uppercase flex items-center gap-1.5 shadow-sm">
                <Sparkles size={10} className="animate-pulse" />
                <span>AI Powered Styling</span>
              </div>

              <h2 className="font-editorial font-light text-4xl md:text-5xl lg:text-6.5xl leading-[1.1] uppercase tracking-wide">
                Choose Your Body Analysis Method
              </h2>

              <p className="font-ui font-light text-base md:text-lg text-lux-text-secondary leading-relaxed max-w-xl">
                Select how you would like VogueVista to understand your body profile. Choose manual measurements for precise dimensions or upload photos for AI-powered body shape detection.
              </p>
            </div>

            {/* SELECTION CARDS CONTAINER */}
            <div className="flex flex-col gap-5 md:gap-6 w-full mt-2">
              
              {/* OPTION 01: MANUAL MEASUREMENTS */}
              <div 
                ref={addToCardsRef}
                className="selection-card rounded-[24px] border border-lux-border-light p-6 md:p-8 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between"
              >
                <div className="flex gap-4 items-start sm:items-center flex-1">
                  <div className="card-icon-container p-3 bg-lux-bg-secondary border border-lux-border-light rounded-full text-lux-gold shrink-0">
                    <Ruler size={20} className="card-icon" />
                  </div>
                  <div className="flex flex-col gap-1 text-left">
                    <h3 className="font-editorial text-xl uppercase tracking-wider text-lux-text-primary">
                      Manual Measurements
                    </h3>
                    <p className="font-ui font-light text-xs text-lux-text-secondary leading-relaxed">
                      Enter your body measurements manually to generate an accurate body profile and personalized outfit recommendations.
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => handleNavigation('body-analysis-measurements')}
                  className="btn-lux w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 text-[8px] tracking-widest py-2.5 px-5 rounded-full"
                >
                  <span>Start Measurement →</span>
                </button>
              </div>

              {/* OPTION 02: PHOTO ANALYSIS */}
              <div 
                ref={addToCardsRef}
                className="selection-card rounded-[24px] border border-lux-border-light p-6 md:p-8 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between"
              >
                <div className="flex gap-4 items-start sm:items-center flex-1">
                  <div className="card-icon-container p-3 bg-lux-bg-secondary border border-lux-border-light rounded-full text-lux-gold shrink-0">
                    <Camera size={20} className="card-icon" />
                  </div>
                  <div className="flex flex-col gap-1 text-left">
                    <h3 className="font-editorial text-xl uppercase tracking-wider text-lux-text-primary">
                      Photo Analysis
                    </h3>
                    <p className="font-ui font-light text-xs text-lux-text-secondary leading-relaxed">
                      Upload your front, side and back photos to let AI estimate body proportions and recommend the best-fitting styles.
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => handleNavigation('body-analysis-photo')}
                  className="btn-lux w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 text-[8px] tracking-widest py-2.5 px-5 rounded-full"
                >
                  <span>Analyze via Photo →</span>
                </button>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
