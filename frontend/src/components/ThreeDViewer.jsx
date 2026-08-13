import React, { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// 1. Procedural Perfume Bottle Mesh
function PerfumeBottle() {
  const bottleRef = useRef();
  
  useFrame((state) => {
    if (bottleRef.current) {
      bottleRef.current.rotation.y = state.clock.getElapsedTime() * 0.5;
      bottleRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 1.5) * 0.15;
    }
  });

  return (
    <group ref={bottleRef} position={[0, -0.4, 0]}>
      {/* Liquid inside */}
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.55, 0.55, 0.8, 32]} />
        <meshStandardMaterial 
          color="#DFCDA8" 
          roughness={0.2} 
          metalness={0.1} 
          transparent 
          opacity={0.7} 
        />
      </mesh>
      
      {/* Outer Glass Body */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.6, 0.6, 1.1, 32]} />
        <meshPhysicalMaterial 
          color="#ffffff" 
          transparent 
          opacity={0.3} 
          roughness={0.05} 
          transmission={0.9} 
          thickness={0.2} 
          clearcoat={1.0}
          clearcoatRoughness={0.1}
        />
      </mesh>
      
      {/* Gold Collar / Spray cap */}
      <mesh position={[0, 1.15, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.2, 32]} />
        <meshStandardMaterial 
          color="#C5A880" 
          roughness={0.15} 
          metalness={0.9} 
        />
      </mesh>
      
      {/* Luxury Rectangular Cap */}
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[0.5, 0.5, 0.3]} />
        <meshPhysicalMaterial 
          color="#C5A880" 
          transparent 
          opacity={0.4} 
          roughness={0.01} 
          transmission={0.9} 
          thickness={0.4}
        />
      </mesh>
    </group>
  );
}

// 2. Procedural Jewelry (Gold Diamond Ring)
function JewelryRing() {
  const ringRef = useRef();

  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.y = state.clock.getElapsedTime() * 0.6;
      ringRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.2;
      ringRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 2) * 0.1;
    }
  });

  return (
    <group ref={ringRef} scale={1.2}>
      {/* Main Gold Band */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.7, 0.1, 16, 100]} />
        <meshStandardMaterial 
          color="#C5A880" 
          roughness={0.1} 
          metalness={0.95} 
        />
      </mesh>
      
      {/* Diamond Prong Setting */}
      <mesh position={[0, 0.75, 0]}>
        <cylinderGeometry args={[0.15, 0.08, 0.15, 6]} />
        <meshStandardMaterial 
          color="#d1d5db" 
          roughness={0.2} 
          metalness={0.9} 
        />
      </mesh>
      
      {/* Diamond Gemstone */}
      <mesh position={[0, 0.9, 0]} rotation={[0, Math.PI / 4, 0]}>
        <octahedronGeometry args={[0.22]} />
        <meshPhysicalMaterial 
          color="#ffffff" 
          transparent 
          opacity={0.8}
          transmission={0.9}
          roughness={0.0}
          clearcoat={1.0}
          ior={2.42} // Diamond index of refraction
        />
      </mesh>
    </group>
  );
}

// 3. Procedural Luxury Handbag
function Handbag() {
  const bagRef = useRef();

  useFrame((state) => {
    if (bagRef.current) {
      bagRef.current.rotation.y = state.clock.getElapsedTime() * 0.4;
      bagRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 1.2) * 0.1;
    }
  });

  return (
    <group ref={bagRef} position={[0, -0.3, 0]}>
      {/* Bag Body (Elegant trapezoidal box) */}
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[1.2, 0.8, 0.5]} />
        {/* Soft premium matte leather look */}
        <meshStandardMaterial 
          color="#1A1A1A" 
          roughness={0.65} 
          metalness={0.15} 
        />
      </mesh>
      
      {/* Gold Trim / Buckle */}
      <mesh position={[0, 0.4, 0.26]}>
        <boxGeometry args={[0.15, 0.15, 0.05]} />
        <meshStandardMaterial 
          color="#C5A880" 
          roughness={0.15} 
          metalness={0.9} 
        />
      </mesh>

      {/* Bag Handle (Metallic Ring) */}
      <mesh position={[0, 0.88, 0]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.35, 0.05, 16, 50, Math.PI]} />
        <meshStandardMaterial 
          color="#C5A880" 
          roughness={0.1} 
          metalness={0.9} 
        />
      </mesh>
    </group>
  );
}

// 4. Orbiting Color Palette Spheres
function PaletteSpheres() {
  const groupRef = useRef();

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
  });

  const colors = ["#C5A880", "#8D7A68", "#1A1A1A", "#EAE0D5", "#5A544F"];

  return (
    <group ref={groupRef}>
      {/* Central Base Sphere */}
      <mesh>
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshStandardMaterial color="#FAF8F5" roughness={0.4} metalness={0.1} />
      </mesh>
      
      {/* Orbiting Palettes */}
      {colors.map((color, index) => {
        const angle = (index / colors.length) * Math.PI * 2;
        const radius = 1.0;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        return (
          <mesh key={index} position={[x, Math.sin(index) * 0.2, z]}>
            <sphereGeometry args={[0.2, 32, 32]} />
            <meshStandardMaterial color={color} roughness={0.2} metalness={0.1} />
          </mesh>
        );
      })}
    </group>
  );
}

// 5. Premium 3D Head + Holographic Scanner Ring & Particles
function HologramScanner() {
  const headRef = useRef();
  const scannerRef = useRef();
  const particlesRef = useRef();

  const { scene } = useGLTF('/head.glb');

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();
    if (headRef.current) {
      headRef.current.rotation.y = elapsed * 0.2;
    }
    if (scannerRef.current) {
      scannerRef.current.position.y = Math.sin(elapsed * 2.5) * 0.8;
    }
    if (particlesRef.current) {
      particlesRef.current.rotation.y = elapsed * 0.2;
    }
  });

  // Generate particle points
  const points = [];
  for (let i = 0; i < 60; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r = Math.random() * 0.9 + 0.1;
    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;
    const y = Math.random() * 2 - 1;
    points.push(new THREE.Vector3(x, y, z));
  }

  return (
    <group>
      {/* 3D Model in the center */}
      <group ref={headRef} position={[0, 0, 0]}>
        <primitive
          object={scene}
          scale={5.2}
          position={[0, -0.7, 0]}
          rotation={[0, 0, 0]}
        />
      </group>

      {/* Scanning Ring */}
      <mesh ref={scannerRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.9, 0.03, 16, 100]} />
        <meshBasicMaterial color="#C5A880" transparent opacity={0.8} wireframe />
      </mesh>

      {/* Floating particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute 
            attach="attributes-position" 
            count={points.length} 
            array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))} 
            itemSize={3} 
          />
        </bufferGeometry>
        <pointsMaterial color="#C5A880" size={0.05} transparent opacity={0.6} />
      </points>

      {/* Center pedestal / cylinder beam */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.85, 0.85, 2, 32, 1, true]} />
        <meshBasicMaterial 
          color="#C5A880" 
          transparent 
          opacity={0.12} 
          side={THREE.DoubleSide} 
          wireframe 
        />
      </mesh>
    </group>
  );
}

// Preload head model at module init
useGLTF.preload('/head.glb');
// 6. Procedural Fashion-Inspired Abstract Sculpture
function AbstractSculpture() {
  const sculptureRef = useRef();

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();
    if (sculptureRef.current) {
      sculptureRef.current.rotation.y = elapsed * 0.25;
      sculptureRef.current.rotation.x = Math.sin(elapsed * 0.15) * 0.2;
      sculptureRef.current.position.y = Math.sin(elapsed * 1.0) * 0.12;
    }
  });

  return (
    <group ref={sculptureRef}>
      <mesh castShadow receiveShadow>
        <torusKnotGeometry args={[0.7, 0.22, 180, 16, 3, 5]} />
        <meshPhysicalMaterial 
          color="#C5A880"
          metalness={0.9}
          roughness={0.1}
          clearcoat={1.0}
          clearcoatRoughness={0.1}
          transmission={0.3}
          thickness={0.5}
        />
      </mesh>
      
      <mesh position={[1.1, 0.5, -0.2]}>
        <sphereGeometry args={[0.08, 32, 32]} />
        <meshStandardMaterial color="#2B221D" roughness={0.1} metalness={0.9} />
      </mesh>
      <mesh position={[-1.2, -0.4, 0.3]}>
        <sphereGeometry args={[0.06, 32, 32]} />
        <meshStandardMaterial color="#C5A880" roughness={0.05} metalness={0.95} />
      </mesh>
    </group>
  );
}

// 7. Floating Fabric Wave Mesh
function FabricWaves() {
  const meshRef = useRef();
  
  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y = elapsed * 0.1;
      meshRef.current.rotation.z = Math.sin(elapsed * 0.3) * 0.1;
      
      const position = meshRef.current.geometry.attributes.position;
      const count = position.count;
      for (let i = 0; i < count; i++) {
        const x = position.getX(i);
        const y = position.getY(i);
        const zangle = x * 2 + elapsed * 1.5;
        const zangle2 = y * 2 + elapsed * 1.2;
        const z = Math.sin(zangle) * 0.15 + Math.cos(zangle2) * 0.1;
        position.setZ(i, z);
      }
      position.needsUpdate = true;
    }
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 3, 0, 0]} castShadow receiveShadow>
      <planeGeometry args={[2.5, 2.5, 30, 30]} />
      <meshPhysicalMaterial 
        color="#FAF8F5" 
        side={THREE.DoubleSide}
        roughness={0.3}
        metalness={0.05}
        clearcoat={0.5}
        transparent
        opacity={0.7}
        transmission={0.5}
        thickness={0.8}
      />
    </mesh>
  );
}

// Custom Error Boundary to prevent R3F failures from crashing the React tree
class CanvasErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.warn("R3F Canvas Error Boundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export default function ThreeDViewer({ type = 'bottle', height = '450px' }) {
  const [hovered, setHovered] = useState(false);
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

  const fallbackImages = {
    bottle: '/flat_lay.png',
    jewelry: '/flat_lay.png',
    bag: '/flat_lay.png',
    palette: '/closet_interior.png',
    scanner: '/closet_interior.png',
    sculpture: '/hero_model.png',
    waves: '/closet_interior.png'
  };

  const labelTexts = {
    bottle: 'CURATED SCENT PROFILE',
    jewelry: 'HIGH JEWELRY ACCENT',
    bag: 'GEOMETRIC HANDBAG',
    palette: 'PIGMENT SPECTRUM ORBIT',
    scanner: 'RADAR STANDBY',
    sculpture: 'EDITORIAL ABSTRACT SCULPTURE',
    waves: 'FLOATING COUTURE DRAPE'
  };

  const renderFallback = () => (
    <div 
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        backgroundColor: 'var(--bg-secondary)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        border: '1px solid var(--border-medium)'
      }}
    >
      <img 
        src={fallbackImages[type]} 
        alt={type} 
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: 0.6,
          filter: 'grayscale(30%)'
        }}
      />
      <div 
        style={{
          position: 'absolute',
          textAlign: 'center',
          backgroundColor: 'var(--glass-bg)',
          backdropFilter: 'blur(8px)',
          border: '1px solid var(--glass-border)',
          padding: '1rem 2rem',
          maxWidth: '80%'
        }}
      >
        <span style={{ fontFamily: 'var(--font-accent)', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--accent-gold)' }}>
          {labelTexts[type]}
        </span>
        <h4 style={{ fontFamily: 'var(--font-editorial)', fontSize: '1.1rem', marginTop: '0.2rem', textTransform: 'uppercase' }}>
          {type} STUDIO VIEW
        </h4>
      </div>
    </div>
  );

  if (!webGLAvailable) {
    return (
      <div className="threed-viewer-container" style={{ width: '100%', height: height }}>
        {renderFallback()}
      </div>
    );
  }

  return (
    <div 
      className="threed-viewer-container" 
      style={{ 
        width: '100%', 
        height: height, 
        position: 'relative',
        cursor: hovered ? 'grab' : 'default',
        transition: 'all 0.5s ease'
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <CanvasErrorBoundary fallback={renderFallback()}>
        <Canvas 
          style={{ background: 'transparent' }} 
          gl={{ antialias: false, powerPreference: "high-performance" }}
          dpr={[1, 1.5]}
          shadows
        >
          {/* Cinematic Studio Lights */}
          <ambientLight intensity={1.2} />
          <directionalLight position={[5, 10, 5]} intensity={2.0} castShadow />
          <pointLight position={[-5, 5, -5]} intensity={1.0} color="#FAF8F5" />
          <spotLight position={[0, 15, 0]} angle={0.3} penumbra={1} intensity={1.5} color="#DFCDA8" />
          
          <PerspectiveCamera makeDefault position={[0, 0, 3.2]} fov={50} />
          
          {/* Render correct mesh */}
          {type === 'bottle' && <PerfumeBottle />}
          {type === 'jewelry' && <JewelryRing />}
          {type === 'bag' && <Handbag />}
          {type === 'palette' && <PaletteSpheres />}
          {type === 'scanner' && <Suspense fallback={null}><HologramScanner /></Suspense>}
          {type === 'sculpture' && <AbstractSculpture />}
          {type === 'waves' && <FabricWaves />}
          
          <OrbitControls 
            enableZoom={false} 
            enablePan={false}
            maxPolarAngle={Math.PI / 1.7} 
            minPolarAngle={Math.PI / 2.3} 
          />
        </Canvas>
      </CanvasErrorBoundary>
      
      {/* Decorative luxury overlay tag */}
      <div 
        style={{
          position: 'absolute',
          bottom: '1rem',
          right: '1rem',
          fontSize: '0.65rem',
          fontFamily: 'var(--font-accent)',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          pointerEvents: 'none',
          opacity: 0.6
        }}
      >
        Drag to Rotate / Studio View
      </div>
    </div>
  );
}
