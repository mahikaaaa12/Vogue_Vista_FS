import React, { useState, useRef, useEffect } from 'react';
import { Camera, ArrowLeft, Upload, RefreshCw, CheckCircle2, ChevronRight, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
// Import the body analysis service for future Python backend integration
import { uploadImages, analyzeBody, getBodyProfile } from '../services/bodyAnalysisService';

export default function PhotoAnalysis({ setScreen }) {
  const [photo, setPhoto] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [scanState, setScanState] = useState('idle'); // idle | uploading | scanning | complete
  const [progress, setProgress] = useState(0);
  const [consoleLog, setConsoleLog] = useState([]);
  const [result, setResult] = useState(null);
  
  const fileInputRef = useRef(null);
  const consoleEndRef = useRef(null);

  // Auto-scroll console logs
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [consoleLog]);

  const addLog = (text) => {
    setConsoleLog((prev) => [...prev, `> ${text}`]);
  };

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
      startAnalysisFlow(file);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      startAnalysisFlow(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // Main interactive calibration flow coordinating with the services
  const startAnalysisFlow = async (file) => {
    try {
      setPhoto(URL.createObjectURL(file));
      setScanState('uploading');
      setProgress(10);
      setConsoleLog([]);
      addLog("INITIALIZING FILE TRANSPORT CHANNEL...");
      
      // Step 1: Upload Image (FastAPI Placeholder)
      addLog(`UPLOADING PORTRAITS: ${file.name} (${(file.size / 1024).toFixed(1)} KB)...`);
      const uploadResp = await uploadImages([file]);
      setProgress(35);
      addLog(`IMAGES RECORDED SECURELY ON CLOUD. GROUP ID: ${uploadResp.imageGroupRef}`);
      
      // Step 2: Trigger Analysis (FastAPI Placeholder)
      setScanState('scanning');
      addLog("DISPATCHING DEEP LEARNING COMPUTER VISION AGENT...");
      addLog("SEGMENTING SILHOUETTE LINES AND SKELETAL BOUNDARIES...");
      const analyzeResp = await analyzeBody(uploadResp.imageGroupRef);
      setProgress(65);
      addLog(`NEURAL ANALYSIS JOB SPUN UP. TASK ID: ${analyzeResp.taskId}`);
      
      // Simulated scan tick updates
      const scanLogs = [
        "CALIBRATING ASPECT HEIGHT RATIO INDEX...",
        "SAMPLING CHEST & WAIST VERTICES...",
        "ANALYZING POSTURE CONTOURS...",
        "CORRELATING HIP TO INSEAM PROPORTIONS... [OK]",
        "COMPUTING BESPOKE SHAPE CALIBRATIONS..."
      ];
      
      for (let i = 0; i < scanLogs.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 400));
        addLog(scanLogs[i]);
        setProgress((prev) => prev + 5);
      }
      
      // Step 3: Fetch Result (FastAPI Placeholder)
      addLog("RETRIEVING COMPILED STYLING PROFILE AND MEASUREMENTS DATA...");
      const finalResult = await getBodyProfile(analyzeResp.taskId);
      setProgress(100);
      addLog("SILHOUETTE PROFILE SYNCHRONIZED SUCCESSFULLY.");
      
      setResult(finalResult);
      setScanState('complete');
    } catch (err) {
      addLog(`CRITICAL ERROR OCCURRED: ${err.message}`);
      setScanState('idle');
    }
  };

  const useSamplePhoto = () => {
    // Elegant beauty portrait that matches the Vogue theme
    fetch('/hero_model.png')
      .then((res) => {
        if (!res.ok) throw new Error("Sample file not found");
        return res.blob();
      })
      .then((blob) => {
        const file = new File([blob], "demo_studio_portrait.png", { type: "image/png" });
        startAnalysisFlow(file);
      })
      .catch(() => {
        // Fallback file generation if local asset is missing
        const file = new File([""], "demo_portrait.png", { type: "image/png" });
        startAnalysisFlow(file);
      });
  };

  const resetScanner = () => {
    setPhoto(null);
    setResult(null);
    setProgress(0);
    setConsoleLog([]);
    setScanState('idle');
  };

  return (
    <section className="min-h-screen py-28 md:py-32 bg-lux-bg-primary text-lux-text-primary relative overflow-hidden flex flex-col">
      {/* Background radial accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,rgba(198,161,106,0.04)_0%,transparent_70%)] pointer-events-none" />

      <div className="mx-auto w-full max-w-[1400px] px-6 md:px-[48px] relative z-10 flex-1 flex flex-col gap-12">
        {/* Header Block */}
        <div className="flex justify-between items-baseline pb-6 border-b border-lux-border-light">
          <div className="flex items-center gap-2">
            <span className="font-serif italic text-lg text-lux-gold">03.2 //</span>
            <h2 className="font-editorial font-light text-3xl md:text-4xl uppercase tracking-wide">
              Photo Silhouette Analysis
            </h2>
          </div>
          <button 
            onClick={() => {
              setScreen('body-analysis');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="font-accent text-xs tracking-widest text-lux-text-muted hover:text-lux-gold transition-colors duration-300 uppercase flex items-center gap-2"
          >
            <ArrowLeft size={12} />
            <span>Return</span>
          </button>
        </div>

        {/* Content Splitting Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch flex-1">
          
          {/* Left Column: UI Controls & Output */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <AnimatePresence mode="wait">
              {/* STATE: IDLE */}
              {scanState === 'idle' && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.5 }}
                  className="rounded-[32px] border border-lux-border-light bg-[#FAF8F5]/60 dark:bg-white/5 backdrop-blur-[24px] p-8 md:p-10 shadow-premium flex flex-col gap-6 text-left"
                >
                  <div className="flex gap-4 items-center mb-2">
                    <div className="p-3 bg-lux-bg-secondary border border-lux-border-light rounded-full text-lux-gold shrink-0">
                      <Camera size={24} />
                    </div>
                    <div>
                      <h3 className="font-editorial text-2xl uppercase tracking-wider text-lux-text-primary">
                        Photo Calibration
                      </h3>
                      <p className="font-ui font-light text-xs text-lux-text-secondary mt-0.5">
                        Upload a front-facing full-body silhouette photograph.
                      </p>
                    </div>
                  </div>

                  <p className="font-ui font-light text-sm text-lux-text-secondary leading-relaxed">
                    Our AI models map coordinates across your shoulders, chest, waist, and hips. Ensure you are wearing fitted clothing and stand against a solid neutral backdrop.
                  </p>

                  {/* Drag and Drop Container */}
                  <div 
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={triggerFileInput}
                    className="border border-dashed border-lux-border-medium rounded-[24px] p-8 text-center cursor-pointer bg-white/10 hover:bg-white/30 dark:bg-white/5 dark:hover:bg-white/10 hover:border-lux-gold transition-all duration-300 flex flex-col items-center justify-center gap-3 min-h-[220px]"
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <Upload size={32} className="text-lux-gold animate-bounce" />
                    <span className="font-accent text-[10px] tracking-widest text-lux-text-primary uppercase font-semibold">
                      Drag & Drop Portrait
                    </span>
                    <span className="font-ui font-light text-xs text-lux-text-muted">
                      or click to explore directory files
                    </span>
                  </div>

                  <button 
                    onClick={useSamplePhoto}
                    className="btn-lux-outline w-full flex items-center justify-center gap-2 py-3 text-[10px] tracking-widest rounded-full"
                  >
                    <Play size={10} className="text-lux-gold" />
                    <span>USE STUDIO DEMO PHOTO</span>
                  </button>
                </motion.div>
              )}

              {/* STATE: PROCESSING / SCANNING */}
              {(scanState === 'uploading' || scanState === 'scanning') && (
                <motion.div
                  key="scanning"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="rounded-[32px] border border-lux-border-light bg-[#FAF8F5]/60 dark:bg-white/5 backdrop-blur-[24px] p-8 md:p-10 shadow-premium flex flex-col gap-6 text-left"
                >
                  <div className="flex justify-between items-center pb-4 border-b border-lux-border-light">
                    <div>
                      <span className="font-accent text-[9px] tracking-widest text-lux-gold uppercase animate-pulse">
                        {scanState === 'uploading' ? 'UPLOADING PORTRAIT' : 'ANALYZING CONTOURS'}
                      </span>
                      <h3 className="font-editorial text-2xl uppercase tracking-wider text-lux-text-primary mt-0.5">
                        Calibration Suite
                      </h3>
                    </div>
                    <div className="relative w-14 h-14 flex items-center justify-center">
                      <svg width="56" height="56" className="transform -rotate-90">
                        <circle cx="28" cy="28" r="24" stroke="var(--border-medium)" strokeWidth="2" fill="transparent" />
                        <circle 
                          cx="28" 
                          cy="28" 
                          r="24" 
                          stroke="var(--accent-gold)" 
                          strokeWidth="2.5" 
                          fill="transparent" 
                          strokeDasharray={2 * Math.PI * 24}
                          strokeDashoffset={2 * Math.PI * 24 * (1 - progress / 100)}
                          className="transition-all duration-300"
                        />
                      </svg>
                      <span className="absolute font-accent text-xs font-semibold text-lux-text-primary">
                        {progress}%
                      </span>
                    </div>
                  </div>

                  {/* Terminal log console */}
                  <div className="bg-[#1C1A22] text-lux-gold font-mono text-[10px] p-4 rounded-xl h-48 overflow-y-auto flex flex-col gap-1.5 shadow-inner">
                    {consoleLog.map((log, idx) => (
                      <div key={idx} className="leading-relaxed break-all whitespace-pre-wrap">{log}</div>
                    ))}
                    <div ref={consoleEndRef} />
                  </div>

                  <p className="font-ui font-light text-xs text-lux-text-muted italic text-center">
                    Processing matrix frames. Keep window active to construct profile lookbook.
                  </p>
                </motion.div>
              )}

              {/* STATE: COMPLETED RESULTS */}
              {scanState === 'complete' && result && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.6 }}
                  className="rounded-[32px] border border-lux-border-light bg-[#FAF8F5]/70 dark:bg-white/5 backdrop-blur-[24px] p-8 md:p-10 shadow-premium flex flex-col gap-6 text-left"
                >
                  <div className="flex items-center gap-3 pb-4 border-b border-lux-border-light">
                    <div className="p-2.5 bg-lux-text-primary text-lux-bg-primary rounded-full shrink-0">
                      <CheckCircle2 size={22} className="text-lux-gold" />
                    </div>
                    <div>
                      <span className="font-accent text-[9px] tracking-[0.2em] text-lux-gold uppercase">PORTRAIT DECODED</span>
                      <h3 className="font-editorial text-2xl uppercase tracking-wider text-lux-text-primary mt-0.5">
                        {result.shape} Silhouette
                      </h3>
                    </div>
                  </div>

                  <p className="font-ui font-light text-sm text-lux-text-secondary leading-relaxed">
                    AI processing identified your height as {result.height} cm with a shoulder-to-waist aspect ratio of {result.proportions.shoulderWaistRatio}. Custom recommendations are calculated.
                  </p>

                  <div className="flex flex-col gap-3">
                    <h4 className="font-accent text-[10px] tracking-widest text-lux-text-primary uppercase font-semibold">
                      ATELIER EDITORIAL RECOMMENDATIONS:
                    </h4>
                    <ul className="flex flex-col gap-3 pl-1">
                      {result.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="w-1.5 h-1.5 rounded-full bg-lux-gold mt-2 shrink-0" />
                          <span className="font-ui font-light text-xs md:text-sm text-lux-text-secondary leading-relaxed">
                            {rec}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="w-full h-px bg-lux-border-light/20 my-2" />

                  <div className="flex gap-4 flex-col sm:flex-row">
                    <button 
                      onClick={resetScanner}
                      className="btn-lux-outline w-full flex items-center justify-center gap-2 py-3.5 text-[9px] tracking-widest rounded-full"
                    >
                      <RefreshCw size={12} />
                      <span>SCAN ANOTHER</span>
                    </button>
                    <button 
                      onClick={() => setScreen('results')}
                      className="btn-lux w-full flex items-center justify-center gap-2 py-3.5 text-[9px] tracking-widest rounded-full"
                    >
                      <span>VIEW LOOKBOOK PRODUCTS</span>
                      <ChevronRight size={12} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column: Visualizer Box */}
          <div className="lg:col-span-7 flex flex-col justify-center min-h-[450px] md:min-h-[550px]">
            <div className="w-full h-full relative rounded-[32px] overflow-hidden border border-lux-border-light bg-[#FAF8F5]/40 dark:bg-[#16141C]/35 backdrop-blur-[24px] shadow-premium flex items-center justify-center">
              {photo ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <img 
                    src={photo} 
                    alt="Scan Target" 
                    className="w-full h-full object-cover filter brightness-95"
                  />
                  
                  {/* Digital outline grid overlays during scan */}
                  {scanState === 'scanning' && (
                    <>
                      {/* Golden scanning line */}
                      <div className="absolute left-0 right-0 h-0.5 bg-lux-gold shadow-[0_0_15px_var(--accent-gold)] z-20" style={{ animation: 'scanLineMove 2.5s infinite linear' }} />
                      
                      {/* Interactive landmarks and target nodes */}
                      <div className="absolute top-[28%] left-[45%] w-2 h-2 bg-lux-gold rounded-full z-20 shadow-[0_0_8px_var(--accent-gold)] animate-ping" />
                      <div className="absolute top-[28%] left-[55%] w-2 h-2 bg-lux-gold rounded-full z-20 shadow-[0_0_8px_var(--accent-gold)] animate-ping" />
                      <div className="absolute top-[42%] left-[42%] w-2.5 h-2.5 bg-lux-gold rounded-full z-20 shadow-[0_0_10px_var(--accent-gold)]" />
                      <div className="absolute top-[42%] left-[58%] w-2.5 h-2.5 bg-lux-gold rounded-full z-20 shadow-[0_0_10px_var(--accent-gold)]" />
                      <div className="absolute top-[58%] left-[40%] w-2.5 h-2.5 bg-lux-gold rounded-full z-20 shadow-[0_0_10px_var(--accent-gold)]" />
                      <div className="absolute top-[58%] left-[60%] w-2.5 h-2.5 bg-lux-gold rounded-full z-20 shadow-[0_0_10px_var(--accent-gold)]" />
                      <div className="absolute top-[80%] left-[44%] w-2 h-2 bg-lux-gold rounded-full z-20 shadow-[0_0_8px_var(--accent-gold)]" />
                      <div className="absolute top-[80%] left-[56%] w-2 h-2 bg-lux-gold rounded-full z-20 shadow-[0_0_8px_var(--accent-gold)]" />

                      {/* Calibrator lines */}
                      <svg className="absolute inset-0 w-full h-full text-lux-gold/30 z-10 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <line x1="45" y1="28" x2="55" y2="28" stroke="currentColor" strokeWidth="0.25" />
                        <line x1="42" y1="42" x2="58" y2="42" stroke="currentColor" strokeWidth="0.25" />
                        <line x1="40" y1="58" x2="60" y2="58" stroke="currentColor" strokeWidth="0.25" />
                        <line x1="44" y1="80" x2="56" y2="80" stroke="currentColor" strokeWidth="0.25" />
                        <line x1="50" y1="10" x2="50" y2="90" stroke="currentColor" strokeWidth="0.25" strokeDasharray="1 1" />
                      </svg>
                    </>
                  )}

                  {scanState === 'complete' && result && (
                    <div className="absolute inset-0 bg-lux-bg-primary/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4 text-center z-20 p-6 animate-fadeIn">
                      <div className="relative w-40 h-72 flex items-center justify-center border border-lux-gold/30 rounded-2xl bg-white/30 dark:bg-black/20 p-4">
                        {/* Dynamic SVG wireframe of calculated result */}
                        <svg width="100" height="240" viewBox="0 0 120 260" className="text-lux-gold">
                          <circle cx="60" cy="40" r="12" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
                          <line x1="60" y1="52" x2="60" y2="62" stroke="currentColor" strokeWidth="1" />
                          
                          {result.shape === 'Hourglass' && (
                            <path d="M40 70 L80 70 M40 70 L48 115 L40 160 L80 160 L72 115 L80 70 Z M40 160 L42 240 M80 160 L78 240" fill="none" stroke="currentColor" strokeWidth="1.5" />
                          )}
                          {result.shape === 'Pear' && (
                            <path d="M44 70 L76 70 M44 70 L46 115 L36 160 L84 160 L74 115 L76 70 Z M36 160 L38 240 M84 160 L82 240" fill="none" stroke="currentColor" strokeWidth="1.5" />
                          )}
                          {result.shape === 'Inverted Triangle' && (
                            <path d="M36 70 L84 70 M36 70 L44 115 L44 160 L76 160 L76 115 L84 70 Z M44 160 L44 240 M76 160 L76 240" fill="none" stroke="currentColor" strokeWidth="1.5" />
                          )}
                          {result.shape === 'Apple' && (
                            <path d="M42 70 L78 70 M42 70 L34 115 L40 160 L80 160 L86 115 L78 70 Z M40 160 L42 240 M80 160 L78 240" fill="none" stroke="currentColor" strokeWidth="1.5" />
                          )}
                          {result.shape === 'Rectangle' && (
                            <path d="M42 70 L78 70 M42 70 L43 115 L42 160 L78 160 L77 115 L78 70 Z M42 160 L42 240 M78 160 L78 240" fill="none" stroke="currentColor" strokeWidth="1.5" />
                          )}
                        </svg>
                        
                        <div className="absolute top-2 right-2 text-[7px] font-accent text-lux-gold tracking-widest text-right leading-relaxed">
                          RATIOS:<br/>
                          S/W: {result.proportions.shoulderWaistRatio}<br/>
                          W/H: {result.proportions.waistHipRatio}
                        </div>
                      </div>
                      <span className="font-accent text-[9px] tracking-widest text-lux-gold uppercase">ATELIER CALIBRATOR PROFILE</span>
                      <p className="font-editorial italic text-lg text-lux-text-primary">
                        Sizing and silhouette vectors mapped successfully.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 text-center p-6 select-none pointer-events-none text-lux-text-muted">
                  <Camera size={48} className="text-lux-border-medium stroke-[1]" />
                  <span className="font-accent text-xs tracking-widest text-lux-gold uppercase">Visualizer Standby</span>
                  <p className="font-ui font-light text-xs text-lux-text-muted max-w-xs leading-relaxed">
                    Upload or drag-and-drop a portrait photo to activate skeletal segmentation grid.
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes scanLineMove {
          0% { top: 0%; }
          100% { top: 100%; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </section>
  );
}

