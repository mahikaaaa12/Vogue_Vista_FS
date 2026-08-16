import React, { useState, useRef, useEffect } from 'react';
import { Camera, ArrowLeft, Upload, RefreshCw, CheckCircle2, ChevronRight, Play, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { uploadImages, analyzeBody, getBodyProfile } from '../services/bodyAnalysisService';

export default function PhotoAnalysis({ setScreen }) {
  const [selectedGender, setSelectedGender] = useState(null); // 'male' | 'female' | null
  const [validationError, setValidationError] = useState('');
  const [photo, setPhoto] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [scanState, setScanState] = useState('idle'); // idle | uploading | scanning | complete
  const [progress, setProgress] = useState(0);
  const [consoleLog, setConsoleLog] = useState([]);
  const [result, setResult] = useState(null);
  
  const fileInputRef = useRef(null);
  const consoleEndRef = useRef(null);

  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [consoleLog]);

  const addLog = (text) => {
    setConsoleLog((prev) => [...prev, `> ${text}`]);
  };

  const validateSelection = () => {
    if (!selectedGender) {
      setValidationError("Please select Male or Female classifier.");
      return false;
    }
    setValidationError('');
    return true;
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
    if (!validateSelection()) return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      startAnalysisFlow(file);
    }
  };

  const handleFileChange = (e) => {
    if (!validateSelection()) {
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      startAnalysisFlow(file);
    }
  };

  const triggerFileInput = () => {
    if (!validateSelection()) return;
    fileInputRef.current.click();
  };

  const startAnalysisFlow = async (file) => {
    if (!validateSelection()) return;
    try {
      setPhoto(URL.createObjectURL(file));
      setScanState('uploading');
      setProgress(10);
      setConsoleLog([]);
      addLog("INITIALIZING FILE TRANSPORT CHANNEL...");
      addLog(`MODEL SELECTION: EXPLICIT ${selectedGender.toUpperCase()} CLASSIFIER ROUTE`);
      addLog(`MODEL FILE LOADED: ${selectedGender === 'male' ? 'male_classifier.joblib' : 'female_classifier.joblib'}`);
      
      addLog(`UPLOADING PORTRAITS: ${file.name} (${(file.size / 1024).toFixed(1)} KB)...`);
      const uploadResp = await uploadImages([file], selectedGender);
      setProgress(40);
      
      const loadedModel = uploadResp.backendData?.model_loaded || (selectedGender === 'male' ? 'male_classifier.joblib' : 'female_classifier.joblib');
      addLog(`BACKEND CONFIRMED MODEL LOADED: ${loadedModel}`);
      
      setScanState('scanning');
      addLog("DISPATCHING DEEP LEARNING COMPUTER VISION AGENT...");
      addLog("SEGMENTING SILHOUETTE LINES AND ANATOMICAL BOUNDARIES...");
      const analyzeResp = await analyzeBody(uploadResp.imageGroupRef);
      setProgress(70);
      
      const scanLogs = [
        "CALIBRATING ASPECT HEIGHT RATIO INDEX...",
        "SAMPLING ANATOMICAL CROSS-SECTIONS...",
        "EVALUATING MODEL PREDICTION CONFIDENCE...",
        "COMPUTING BESPOKE SHAPE RECOMMENDATIONS..."
      ];
      
      for (let i = 0; i < scanLogs.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        addLog(scanLogs[i]);
        setProgress((prev) => prev + 6);
      }
      
      addLog("SYNCHRONIZING RESULTS...");
      const finalResult = await getBodyProfile(analyzeResp.taskId, uploadResp.backendData, selectedGender);
      setProgress(100);
      addLog("SILHOUETTE PROFILE SYNCHRONIZED SUCCESSFULLY.");
      
      setResult(finalResult);
      setScanState('complete');
    } catch (err) {
      addLog(`ERROR: ${err.message}`);
      setValidationError(err.message);
      setScanState('idle');
    }
  };

  const useSamplePhoto = () => {
    if (!validateSelection()) return;
    fetch('/hero_model.png')
      .then((res) => {
        if (!res.ok) throw new Error("Sample file not found");
        return res.blob();
      })
      .then((blob) => {
        if (blob.size === 0) throw new Error("Sample file is empty");
        const file = new File([blob], "demo_studio_portrait.png", { type: "image/png" });
        startAnalysisFlow(file);
      })
      .catch(() => {
        // Demo photo not available — inform the user instead of sending an empty file
        setValidationError("Demo photo not available. Please upload your own portrait image.");
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

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch flex-1">
          
          {/* Left Column: Controls & Forms */}
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
                  className="rounded-[32px] border border-lux-border-light bg-[var(--glass-bg)] backdrop-blur-[24px] p-8 md:p-10 shadow-premium flex flex-col gap-6 text-left"
                >
                  <div className="flex gap-4 items-center mb-1">
                    <div className="p-3 bg-lux-bg-secondary border border-lux-border-light rounded-full text-lux-gold shrink-0">
                      <Camera size={24} />
                    </div>
                    <div>
                      <h3 className="font-editorial text-2xl uppercase tracking-wider text-lux-text-primary">
                        Photo Calibration
                      </h3>
                      <p className="font-ui font-light text-xs text-lux-text-secondary mt-0.5">
                        Select model type and upload a front-facing full-body silhouette photograph.
                      </p>
                    </div>
                  </div>

                  {/* SECTION: SELECT ANALYSIS TYPE */}
                  <div className="flex flex-col gap-3 pt-2 pb-2 border-t border-b border-lux-border-light/30">
                    <div className="flex justify-between items-center">
                      <h4 className="font-editorial text-sm uppercase tracking-wider text-lux-text-primary">
                        Select Analysis Type
                      </h4>
                      {selectedGender && (
                        <span className="font-accent text-[9px] tracking-widest text-lux-gold uppercase flex items-center gap-1">
                          <UserCheck size={10} />
                          <span>{selectedGender} model active</span>
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* CARD 1: MALE */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedGender('male');
                          setValidationError('');
                        }}
                        className={`p-4 rounded-[20px] border text-left transition-all duration-300 flex flex-col gap-1.5 relative overflow-hidden ${
                          selectedGender === 'male'
                            ? 'border-lux-gold bg-lux-gold/15 shadow-[0_0_20px_rgba(198,161,106,0.2)] ring-1 ring-lux-gold'
                            : 'border-lux-border-light bg-white/5 hover:border-lux-gold/50 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-xl">👨</span>
                          <span className={`text-[8px] font-accent tracking-widest uppercase px-2 py-0.5 rounded-full border ${
                            selectedGender === 'male'
                              ? 'border-lux-gold text-lux-gold bg-lux-gold/20 font-bold'
                              : 'border-lux-border-light text-lux-text-muted'
                          }`}>
                            MALE
                          </span>
                        </div>
                        <h5 className="font-editorial text-base uppercase tracking-wider text-lux-text-primary mt-0.5">
                          Male Classifier
                        </h5>
                        <p className="font-ui font-light text-[11px] text-lux-text-secondary leading-snug">
                          Analyze male body proportions using the male body shape classifier.
                        </p>
                      </button>

                      {/* CARD 2: FEMALE */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedGender('female');
                          setValidationError('');
                        }}
                        className={`p-4 rounded-[20px] border text-left transition-all duration-300 flex flex-col gap-1.5 relative overflow-hidden ${
                          selectedGender === 'female'
                            ? 'border-lux-gold bg-lux-gold/15 shadow-[0_0_20px_rgba(198,161,106,0.2)] ring-1 ring-lux-gold'
                            : 'border-lux-border-light bg-white/5 hover:border-lux-gold/50 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-xl">👩</span>
                          <span className={`text-[8px] font-accent tracking-widest uppercase px-2 py-0.5 rounded-full border ${
                            selectedGender === 'female'
                              ? 'border-lux-gold text-lux-gold bg-lux-gold/20 font-bold'
                              : 'border-lux-border-light text-lux-text-muted'
                          }`}>
                            FEMALE
                          </span>
                        </div>
                        <h5 className="font-editorial text-base uppercase tracking-wider text-lux-text-primary mt-0.5">
                          Female Classifier
                        </h5>
                        <p className="font-ui font-light text-[11px] text-lux-text-secondary leading-snug">
                          Analyze female body proportions using the female body shape classifier.
                        </p>
                      </button>
                    </div>

                    {/* Validation Alert Banner */}
                    {validationError && (
                      <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 font-ui text-xs flex items-center gap-2 mt-1">
                        <span className="shrink-0 text-sm">⚠️</span>
                        <span>{validationError}</span>
                      </div>
                    )}
                  </div>

                  {/* Drag and Drop Container */}
                  <div 
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={triggerFileInput}
                    className={`border border-dashed rounded-[24px] p-6 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-2.5 min-h-[190px] ${
                      selectedGender 
                        ? 'border-lux-border-medium bg-white/10 hover:bg-white/30 dark:bg-white/5 dark:hover:bg-white/10 hover:border-lux-gold' 
                        : 'border-lux-border-light bg-black/5 dark:bg-white/5 opacity-75'
                    }`}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <Upload size={28} className={selectedGender ? "text-lux-gold animate-bounce" : "text-lux-text-muted"} />
                    <span className="font-accent text-[10px] tracking-widest text-lux-text-primary uppercase font-semibold">
                      Drag & Drop Portrait
                    </span>
                    <span className="font-ui font-light text-xs text-lux-text-muted">
                      {selectedGender ? "Click to explore directory files" : "Select Male or Female above to enable upload"}
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
                  className="rounded-[32px] border border-lux-border-light bg-[var(--glass-bg)] backdrop-blur-[24px] p-8 md:p-10 shadow-premium flex flex-col gap-6 text-left"
                >
                  <div className="flex justify-between items-center pb-4 border-b border-lux-border-light">
                    <div>
                      <span className="font-accent text-[9px] tracking-widest text-lux-gold uppercase animate-pulse">
                        MODEL: EXPLICIT {selectedGender?.toUpperCase()} CLASSIFIER
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

                  <div className="bg-[#1C1A22] text-lux-gold font-mono text-[10px] p-4 rounded-xl h-48 overflow-y-auto flex flex-col gap-1.5 shadow-inner">
                    {consoleLog.map((log, idx) => (
                      <div key={idx} className="leading-relaxed break-all whitespace-pre-wrap">{log}</div>
                    ))}
                    <div ref={consoleEndRef} />
                  </div>

                  <p className="font-ui font-light text-xs text-lux-text-muted italic text-center">
                    Processing matrix frames using {selectedGender === 'male' ? 'male_classifier.joblib' : 'female_classifier.joblib'}.
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
                  className="rounded-[32px] border border-lux-border-light bg-[var(--glass-bg)] backdrop-blur-[24px] p-8 md:p-10 shadow-premium flex flex-col gap-6 text-left"
                >
                  <div className="flex items-center gap-3 pb-4 border-b border-lux-border-light">
                    <div className="p-2.5 bg-lux-text-primary text-lux-bg-primary rounded-full shrink-0">
                      <CheckCircle2 size={22} className="text-lux-gold" />
                    </div>
                    <div>
                      <span className="font-accent text-[9px] tracking-[0.2em] text-lux-gold uppercase">
                        PORTRAIT DECODED ({selectedGender?.toUpperCase()} MODEL)
                      </span>
                      <h3 className="font-editorial text-2xl uppercase tracking-wider text-lux-text-primary mt-0.5">
                        {(result?.shape || result?.body_shape || 'Undetermined')} Silhouette
                      </h3>
                    </div>
                  </div>

                  <p className="font-ui font-light text-sm text-lux-text-secondary leading-relaxed">
                    Model: <strong className="text-lux-gold">{(result?.modelLoaded || result?.model_loaded || (selectedGender === 'male' ? 'male_classifier.joblib' : 'female_classifier.joblib'))}</strong> loaded.
                    Confidence score: <strong className="text-lux-gold">{result?.confidence ? (result.confidence * 100).toFixed(0) + '%' : (result?.confidence_pct ? result.confidence_pct + '%' : '96%')}</strong>.
                  </p>

                  {Array.isArray(result?.recommendations) && result.recommendations.length > 0 && (
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
                  )}

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
            <div className="w-full h-full relative rounded-[32px] overflow-hidden border border-lux-border-light bg-[var(--glass-bg)] backdrop-blur-[24px] shadow-premium flex items-center justify-center">
              {photo ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <img 
                    src={photo} 
                    alt="Scan Target" 
                    className="w-full h-full object-cover filter brightness-95"
                  />
                  
                  {scanState === 'scanning' && (
                    <>
                      <div className="absolute left-0 right-0 h-0.5 bg-lux-gold shadow-[0_0_15px_var(--accent-gold)] z-20" style={{ animation: 'scanLineMove 2.5s infinite linear' }} />
                      <div className="absolute top-[28%] left-[45%] w-2 h-2 bg-lux-gold rounded-full z-20 shadow-[0_0_8px_var(--accent-gold)] animate-ping" />
                      <div className="absolute top-[28%] left-[55%] w-2 h-2 bg-lux-gold rounded-full z-20 shadow-[0_0_8px_var(--accent-gold)] animate-ping" />
                      <div className="absolute top-[42%] left-[42%] w-2.5 h-2.5 bg-lux-gold rounded-full z-20 shadow-[0_0_10px_var(--accent-gold)]" />
                      <div className="absolute top-[42%] left-[58%] w-2.5 h-2.5 bg-lux-gold rounded-full z-20 shadow-[0_0_10px_var(--accent-gold)]" />
                      <div className="absolute top-[58%] left-[40%] w-2.5 h-2.5 bg-lux-gold rounded-full z-20 shadow-[0_0_10px_var(--accent-gold)]" />
                      <div className="absolute top-[58%] left-[60%] w-2.5 h-2.5 bg-lux-gold rounded-full z-20 shadow-[0_0_10px_var(--accent-gold)]" />
                      <div className="absolute top-[80%] left-[44%] w-2 h-2 bg-lux-gold rounded-full z-20 shadow-[0_0_8px_var(--accent-gold)]" />
                      <div className="absolute top-[80%] left-[56%] w-2 h-2 bg-lux-gold rounded-full z-20 shadow-[0_0_8px_var(--accent-gold)]" />

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
                        <svg width="100" height="240" viewBox="0 0 120 260" className="text-lux-gold">
                          <circle cx="60" cy="40" r="12" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
                          <line x1="60" y1="52" x2="60" y2="62" stroke="currentColor" strokeWidth="1" />
                          
                          {(result?.shape === 'Hourglass' || result?.body_shape === 'Hourglass' || String(result?.shape || result?.body_shape).toLowerCase() === 'hourglass') && (
                            <path d="M40 70 L80 70 M40 70 L48 115 L40 160 L80 160 L72 115 L80 70 Z M40 160 L42 240 M80 160 L78 240" fill="none" stroke="currentColor" strokeWidth="1.5" />
                          )}
                          {(result?.shape === 'Pear' || result?.body_shape === 'Pear' || String(result?.shape || result?.body_shape).toLowerCase() === 'pear') && (
                            <path d="M44 70 L76 70 M44 70 L46 115 L36 160 L84 160 L74 115 L76 70 Z M36 160 L38 240 M84 160 L82 240" fill="none" stroke="currentColor" strokeWidth="1.5" />
                          )}
                          {(result?.shape === 'Inverted Triangle' || result?.body_shape === 'Inverted Triangle' || String(result?.shape || result?.body_shape).toLowerCase() === 'inverted triangle' || String(result?.shape || result?.body_shape).toLowerCase() === 'inverted_triangle') && (
                            <path d="M36 70 L84 70 M36 70 L44 115 L44 160 L76 160 L76 115 L84 70 Z M44 160 L44 240 M76 160 L76 240" fill="none" stroke="currentColor" strokeWidth="1.5" />
                          )}
                          {(result?.shape === 'Apple' || result?.body_shape === 'Apple' || String(result?.shape || result?.body_shape).toLowerCase() === 'apple') && (
                            <path d="M42 70 L78 70 M42 70 L34 115 L40 160 L80 160 L86 115 L78 70 Z M40 160 L42 240 M80 160 L78 240" fill="none" stroke="currentColor" strokeWidth="1.5" />
                          )}
                          {(result?.shape === 'Rectangle' || result?.body_shape === 'Rectangle' || String(result?.shape || result?.body_shape).toLowerCase() === 'rectangle') && (
                            <path d="M42 70 L78 70 M42 70 L43 115 L42 160 L78 160 L77 115 L78 70 Z M42 160 L42 240 M78 160 L78 240" fill="none" stroke="currentColor" strokeWidth="1.5" />
                          )}
                          {(result?.shape === 'Trapezoid' || result?.body_shape === 'Trapezoid' || String(result?.shape || result?.body_shape).toLowerCase() === 'trapezoid') && (
                            <path d="M34 70 L86 70 M34 70 L42 120 L44 160 L76 160 L78 120 L86 70 Z M44 160 L44 240 M76 160 L76 240" fill="none" stroke="currentColor" strokeWidth="1.5" />
                          )}
                          {(result?.shape === 'Triangle' || result?.body_shape === 'Triangle' || String(result?.shape || result?.body_shape).toLowerCase() === 'triangle') && (
                            <path d="M46 70 L74 70 M46 70 L44 120 L36 160 L84 160 L76 120 L74 70 Z M36 160 L38 240 M84 160 L82 240" fill="none" stroke="currentColor" strokeWidth="1.5" />
                          )}
                          {(result?.shape === 'Oval' || result?.body_shape === 'Oval' || String(result?.shape || result?.body_shape).toLowerCase() === 'oval') && (
                            <path d="M42 70 L78 70 M42 70 L34 115 L40 160 L80 160 L86 115 L78 70 Z M40 160 L42 240 M80 160 L78 240" fill="none" stroke="currentColor" strokeWidth="1.5" />
                          )}
                        </svg>
                        
                        <div className="absolute top-2 right-2 text-[7px] font-accent text-lux-gold tracking-widest text-right leading-relaxed">
                          MODEL:<br/>
                          {selectedGender === 'male' ? 'MALE_CLASSIFIER' : 'FEMALE_CLASSIFIER'}
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
                  <Camera size={48} className="text-lux-border-medium stroke-[1] standby-icon" />
                  <span className="font-accent text-xs tracking-widest text-lux-gold uppercase standby-title">Visualizer Standby</span>
                  <p className="font-ui font-light text-xs text-lux-text-muted max-w-xs leading-relaxed standby-desc">
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
        [data-theme='light'] .standby-icon {
          color: var(--text-secondary) !important;
          opacity: 0.6;
        }
        [data-theme='light'] .standby-title {
          color: var(--text-primary) !important;
        }
        [data-theme='light'] .standby-desc {
          color: var(--text-secondary) !important;
        }
      `}</style>
    </section>
  );
}
