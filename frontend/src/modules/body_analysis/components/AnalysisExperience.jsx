import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Cpu, Check, AlertCircle, Maximize2 } from 'lucide-react';
import ThreeDViewer from './ThreeDViewer';

export default function AnalysisExperience({ onScanComplete }) {
  const [photo, setPhoto] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [scanState, setScanState] = useState('idle'); // idle | scanning | complete
  const [progress, setProgress] = useState(0);
  const [scanLog, setScanLog] = useState('');
  const fileInputRef = useRef(null);

  // Scan steps and logs to display sequentially
  const logSteps = [
    { threshold: 0, text: "> INIT VOGUE_VISTA CORE_AI ENGINE..." },
    { threshold: 10, text: "> T01: SCANNING FACE STRUCTURE MATRIX..." },
    { threshold: 25, text: "> T01: IDENTIFYING 68 LANDMARK NODES... [OK]" },
    { threshold: 40, text: "> T02: SAMPLING MELANIN UNDERTONE RGB DENSITY..." },
    { threshold: 55, text: "> T02: EXTRACTING PEAK CHROMATIC TEMPERATURE... [COOL SUMMER]" },
    { threshold: 70, text: "> T03: EVALUATING SILHOUETTE ASPECT RATIO..." },
    { threshold: 85, text: "> T04: MATCHING REEL STYLING ARCHIVES..." },
    { threshold: 95, text: "> ALL MODULES VERIFIED. WRITING STYLING REPORT..." }
  ];

  useEffect(() => {
    let interval;
    if (scanState === 'scanning') {
      interval = setInterval(() => {
        setProgress((prev) => {
          const next = prev + 1;
          
          // Update log outputs based on progress milestones
          const currentLog = logSteps.find(step => step.threshold === next);
          if (currentLog) {
            setScanLog(prevLog => prevLog ? `${prevLog}\n${currentLog.text}` : currentLog.text);
          }

          if (next >= 100) {
            clearInterval(interval);
            setScanState('complete');
            setTimeout(() => {
              // Trigger final transition callback to Results screen
              onScanComplete();
            }, 1200);
            return 100;
          }
          return next;
        });
      }, 50); // Speed: 100 steps * 50ms = 5 seconds total scan time
    }
    return () => clearInterval(interval);
  }, [scanState]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setPhoto(URL.createObjectURL(file));
      setScanState('scanning');
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhoto(URL.createObjectURL(file));
      setScanState('scanning');
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const useSamplePhoto = () => {
    // Elegant beauty portrait that matches the Vogue theme
    setPhoto('/hero_model.png');
    setScanState('scanning');
  };

  return (
    <section 
      style={{
        padding: '6rem 0',
        backgroundColor: 'var(--bg-primary)',
        borderBottom: '1px solid var(--border-light)',
        position: 'relative'
      }}
    >
      <div className="editorial-container">
        {/* Section Title */}
        <div 
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: '4rem',
            borderBottom: '1px solid var(--border-light)',
            paddingBottom: '1.5rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="editorial-header-num">03 //</span>
            <h2 style={{ fontSize: '2.5rem', textTransform: 'uppercase', fontWeight: 300 }}>
              AI Analysis Suite
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
            Real-time Dermal scan
          </span>
        </div>

        <div 
          className="scan-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gap: '3rem',
            alignItems: 'center'
          }}
        >
          {/* Left Column: UI interaction (Upload / Scanning Progress Log) */}
          <div style={{ gridColumn: 'span 12' }} className="scan-control-panel">
            <AnimatePresence mode="wait">
              
              {/* STATE: IDLE / UPLOAD */}
              {scanState === 'idle' && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <h3 
                    style={{
                      fontFamily: 'var(--font-editorial)',
                      fontSize: '2.4rem',
                      textTransform: 'uppercase',
                      marginBottom: '1.5rem',
                      fontWeight: 300
                    }}
                  >
                    Initiate styling assessment.
                  </h3>
                  <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '2.5rem', maxWidth: '480px' }}>
                    Upload an editorial headshot or beauty portrait. Our AI matrix will assess dermal undertones, facial geometric landmarks, and structural lines to align you with Vogue style palettes.
                  </p>

                  {/* Drag and Drop Container */}
                  <div 
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={triggerFileInput}
                    className="lux-card"
                    style={{
                      border: dragActive ? '1px dashed var(--accent-gold)' : '1px dashed var(--border-medium)',
                      padding: '4rem 2rem',
                      textAlign: 'center',
                      cursor: 'pointer',
                      backgroundColor: dragActive ? 'rgba(197, 168, 128, 0.04)' : 'transparent',
                      transition: 'all 0.4s var(--transition-lux)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '1rem'
                    }}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      style={{ display: 'none' }}
                    />
                    <Upload size={36} style={{ color: 'var(--accent-gold)', marginBottom: '0.5rem' }} />
                    <span style={{ fontFamily: 'var(--font-accent)', fontSize: '0.8rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-primary)' }}>
                      Drag & Drop Portrait
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      or click to explore directory files
                    </span>
                  </div>

                  {/* Sample Option */}
                  <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
                    <button 
                      className="btn-lux-outline"
                      onClick={useSamplePhoto}
                      style={{ padding: '0.8rem 2rem', fontSize: '0.7rem' }}
                    >
                      Use Demo Studio Portrait
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STATE: SCANNING */}
              {(scanState === 'scanning' || scanState === 'complete') && (
                <motion.div
                  key="scanning"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontFamily: 'var(--font-accent)', fontSize: '0.65rem', letterSpacing: '0.15em', color: 'var(--accent-gold)', textTransform: 'uppercase' }}>
                        {scanState === 'scanning' ? "ANALYSIS RUNNING" : "COMPLETED"}
                      </span>
                      <h3 style={{ fontSize: '2rem', textTransform: 'uppercase', marginTop: '0.2rem' }}>
                        Dermal Calibration
                      </h3>
                    </div>
                    {/* Ring Percentage display */}
                    <div style={{ position: 'relative', width: '70px', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="70" height="70" style={{ transform: 'rotate(-90deg)' }}>
                        <circle cx="35" cy="35" r="30" stroke="var(--border-medium)" strokeWidth="2" fill="transparent" />
                        <circle 
                          cx="35" 
                          cy="35" 
                          r="30" 
                          stroke="var(--accent-gold)" 
                          strokeWidth="2" 
                          fill="transparent" 
                          strokeDasharray={2 * Math.PI * 30}
                          strokeDashoffset={2 * Math.PI * 30 * (1 - progress / 100)}
                          style={{ transition: 'stroke-dashoffset 0.1s ease' }}
                        />
                      </svg>
                      <span style={{ position: 'absolute', fontFamily: 'var(--font-accent)', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                        {progress}%
                      </span>
                    </div>
                  </div>

                  {/* Simulated Terminal console */}
                  <div 
                    className="dark:glass-luxury"
                    style={{
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--border-medium)',
                      padding: '1.5rem',
                      fontFamily: 'Courier New, monospace',
                      fontSize: '0.8rem',
                      color: 'var(--accent-gold)',
                      minHeight: '180px',
                      maxHeight: '180px',
                      overflowY: 'auto',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.4rem',
                      boxShadow: 'inset 0 4px 20px rgba(0, 0, 0, 0.05)',
                      transition: 'all 0.5s ease'
                    }}
                  >
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap', color: 'var(--text-primary)', opacity: 0.95 }}>{scanLog}</pre>
                    <span className="blinking-cursor" style={{ width: '8px', height: '15px', backgroundColor: 'var(--accent-gold)', display: 'inline-block', verticalAlign: 'middle', animation: 'blink 1s steps(2) infinite' }} />
                  </div>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    Mapping color points... Keep this page open to construct the Vogue spread file.
                  </p>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* Right Column: Dynamic Scan Display */}
          <div style={{ gridColumn: 'span 12', height: '580px', position: 'relative' }} className="scan-visualizer">
            <div 
              className="lux-card-glass dark:glass-luxury"
              style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                overflow: 'hidden',
                padding: 0
              }}
            >
              <AnimatePresence mode="wait">
                {photo ? (
                  <motion.div 
                    key="photo"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ width: '100%', height: '100%', position: 'relative' }}
                  >
                    <img 
                      src={photo} 
                      alt="Uploaded Portrait" 
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                    
                    {scanState === 'scanning' && (
                      <>
                        {/* Golden scanning line */}
                        <div className="scan-line" />
                        
                        {/* Circular sweep radar */}
                        <div className="radar-sweep" style={{ top: '35%', left: '42%' }} />
                        
                        {/* Connecting Landmark Dots */}
                        <div className="scan-node" style={{ top: '25%', left: '42%' }} />
                        <div className="scan-node" style={{ top: '25%', left: '58%' }} />
                        <div className="scan-node" style={{ top: '38%', left: '50%' }} />
                        <div className="scan-node" style={{ top: '48%', left: '44%' }} />
                        <div className="scan-node" style={{ top: '48%', left: '56%' }} />
                        <div className="scan-node" style={{ top: '60%', left: '50%' }} />
                        <div className="scan-node" style={{ top: '44%', left: '33%' }} />
                        <div className="scan-node" style={{ top: '44%', left: '67%' }} />

                        {/* Digital frame targets */}
                        <div 
                          style={{
                            position: 'absolute',
                            top: '15%',
                            left: '25%',
                            right: '25%',
                            bottom: '15%',
                            border: '1px solid rgba(197, 168, 128, 0.3)',
                            pointerEvents: 'none'
                          }}
                        >
                          <Maximize2 size={16} style={{ position: 'absolute', top: '-8px', left: '-8px', color: 'var(--accent-gold)', transform: 'rotate(-45deg)' }} />
                          <Maximize2 size={16} style={{ position: 'absolute', top: '-8px', right: '-8px', color: 'var(--accent-gold)', transform: 'rotate(45deg)' }} />
                          <Maximize2 size={16} style={{ position: 'absolute', bottom: '-8px', left: '-8px', color: 'var(--accent-gold)', transform: 'rotate(-135deg)' }} />
                          <Maximize2 size={16} style={{ position: 'absolute', bottom: '-8px', right: '-8px', color: 'var(--accent-gold)', transform: 'rotate(135deg)' }} />
                        </div>
                      </>
                    )}

                    {scanState === 'complete' && (
                      <div 
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          backgroundColor: 'rgba(250, 248, 245, 0.85)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '1rem',
                          animation: 'fadeIn 0.5s ease-out forwards'
                        }}
                      >
                        <div 
                          style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--text-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--bg-primary)'
                          }}
                        >
                          <Check size={30} />
                        </div>
                        <h4 style={{ fontFamily: 'var(--font-accent)', fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                          CALIBRATION COMPLETE
                        </h4>
                        <p style={{ fontFamily: 'var(--font-editorial)', fontStyle: 'italic', fontSize: '1.2rem' }}>
                          Assembling editorial profile...
                        </p>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div 
                    key="default"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ width: '100%', height: '100%' }}
                  >
                    <ThreeDViewer type="scanner" height="100%" />
                    
                    {/* Standby scanning helper */}
                    <div 
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        textAlign: 'center',
                        pointerEvents: 'none'
                      }}
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
                        Scanner Standby
                      </span>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                        Upload photography to initialize depth grid
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blink {
          50% { opacity: 0; }
        }
        @media (min-width: 992px) {
          .scan-grid {
            grid-template-columns: repeat(12, 1fr) !important;
          }
          .scan-control-panel {
            grid-column: span 5 !important;
          }
          .scan-visualizer {
            grid-column: span 7 !important;
          }
        }
      `}</style>
    </section>
  );
}
