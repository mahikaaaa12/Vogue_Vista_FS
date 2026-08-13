import React, { useState, useEffect, useRef } from 'react';
import { Upload, Check, Sparkles, ArrowLeft, ArrowRight, Camera, FileText } from 'lucide-react';
import ThreeDViewer from '../../../components/ThreeDViewer';

const QUESTIONS = [
  {
    id: 1,
    category: "VEIN COLOUR TEST",
    title: "What colour do the veins on your wrist appear?",
    subtitle: "Natural daylight gives the most accurate result.",
    options: [
      { id: "A", text: "Blue or purple tones", weights: { Cool: 3, Warm: 0, Neutral: 1 } },
      { id: "B", text: "Green or olive tones", weights: { Cool: 0, Warm: 3, Neutral: 1 } },
      { id: "C", text: "Mix of blue and green", weights: { Cool: 1, Warm: 1, Neutral: 3 } }
    ]
  },
  {
    id: 2,
    category: "SUN REACTION TEST",
    title: "What happens when you stay in the sun without sunscreen?",
    subtitle: "Think about how your skin naturally reacts.",
    options: [
      { id: "A", text: "Burn easily then barely tan", weights: { Cool: 3, Warm: 0, Neutral: 1 } },
      { id: "B", text: "Tan easily and rarely burn", weights: { Cool: 0, Warm: 3, Neutral: 1 } },
      { id: "C", text: "Sometimes burn and sometimes tan", weights: { Cool: 1, Warm: 1, Neutral: 3 } }
    ]
  },
  {
    id: 3,
    category: "HAIR SHADE TEST",
    title: "Which group best matches your natural hair colour?",
    subtitle: "Select the palette nearest to your natural roots.",
    options: [
      { id: "A", text: "Black / Dark Brown / Burgundy", weights: { Cool: 2, Warm: 1, Neutral: 2 } },
      { id: "B", text: "Medium Brown / Light Brown / Red / Auburn", weights: { Cool: 0, Warm: 3, Neutral: 1 } },
      { id: "C", text: "Blonde / Golden Blonde / Platinum Blonde", weights: { Cool: 3, Warm: 0, Neutral: 1 } },
      { id: "D", text: "Mixed Tones / Other / Unsure", weights: { Cool: 1, Warm: 1, Neutral: 3 } }
    ]
  },
  {
    id: 4,
    category: "EYE IRIS TEST",
    title: "Which group best matches your natural eye colour?",
    subtitle: "Select your natural iris category.",
    options: [
      { id: "A", text: "Blue / Grey / Slate", weights: { Cool: 3, Warm: 0, Neutral: 1 } },
      { id: "B", text: "Dark Brown / Medium Brown / Light Brown / Amber", weights: { Cool: 0, Warm: 3, Neutral: 1 } },
      { id: "C", text: "Hazel / Green", weights: { Cool: 1, Warm: 1, Neutral: 2 } },
      { id: "D", text: "Black / Mixed / Other / Unsure", weights: { Cool: 1, Warm: 1, Neutral: 3 } }
    ]
  },
  {
    id: 5,
    category: "METALS GLOW TEST",
    title: "Which jewellery metals look best against your bare skin?",
    subtitle: "Think about which metal gives you a radiant glow.",
    options: [
      { id: "A", text: "Silver", weights: { Cool: 3, Warm: 0, Neutral: 1 } },
      { id: "B", text: "Gold", weights: { Cool: 0, Warm: 3, Neutral: 1 } },
      { id: "C", text: "Rose Gold", weights: { Cool: 1, Warm: 2, Neutral: 2 } },
      { id: "D", text: "Both silver and gold", weights: { Cool: 1, Warm: 1, Neutral: 3 } }
    ]
  }
];

const LOG_STEPS_MANUAL = [
  { threshold: 0, text: "> INIT VOGUE_VISTA SCORING_AI ENGINE..." },
  { threshold: 25, text: "> PARSING MANUAL SELECTIONS..." },
  { threshold: 60, text: "> CALCULATING PIGMENT DISTRIBUTIONS..." },
  { threshold: 95, text: "> SPREAD CALIBRATION VERIFIED. WRITING LUXURY REPORT..." }
];

const LOG_STEPS_PHOTO = [
  { threshold: 0, text: "> INIT VOGUE_VISTA SCANNER MATRIX..." },
  { threshold: 20, text: "> T01: IDENTIFYING LANDMARK NODES... [OK]" },
  { threshold: 55, text: "> T02: SAMPLING RGB MELANIN DENSITY..." },
  { threshold: 85, text: "> T03: EVALUATING SPECTRUM TEMPERATURE..." },
  { threshold: 95, text: "> CALIBRATION VERIFIED. WRITING REPORT..." }
];

export default function AnalysisExperience({ onScanComplete, theme }) {
  const [mode, setMode] = useState('select'); // select | photo | manual
  const [photo, setPhoto] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [scanState, setScanState] = useState('idle'); // idle | scanning | complete
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [progress, setProgress] = useState(0);
  const [scanLog, setScanLog] = useState('');
  
  // Camera specific states
  const [photoUploadMethod, setPhotoUploadMethod] = useState('upload'); // upload | camera
  const [streamActive, setStreamActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const activeStreamRef = useRef(null);
  const logContainerRef = useRef(null);

  const startCamera = async () => {
    setCameraError('');
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } } 
      });
      activeStreamRef.current = mediaStream;
      setStreamActive(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 100);
    } catch (err) {
      console.error("Camera access error:", err);
      setCameraError('Unable to access camera. Please check permissions or upload an image instead.');
      setStreamActive(false);
    }
  };

  const stopCamera = () => {
    if (activeStreamRef.current) {
      activeStreamRef.current.getTracks().forEach(track => track.stop());
      activeStreamRef.current = null;
    }
    setStreamActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setPhoto(dataUrl);
      stopCamera();
      setScanState('scanning');
      setProgress(0);
      setScanLog('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const calculateUndertoneManual = (userAnswers) => {
    const scores = { Warm: 0, Cool: 0, Neutral: 0 };
    QUESTIONS.forEach((q) => {
      const selectedOptionId = userAnswers[q.id];
      const option = q.options.find(opt => opt.id === selectedOptionId);
      if (option && option.weights) {
        Object.keys(scores).forEach((tone) => {
          scores[tone] = (scores[tone] || 0) + (option.weights[tone] || 0);
        });
      }
    });

    let finalUndertone = 'Neutral';
    let maxScore = -1;
    Object.keys(scores).forEach((tone) => {
      if (scores[tone] > maxScore) {
        maxScore = scores[tone];
        finalUndertone = tone;
      }
    });
    return finalUndertone;
  };

  // ── PHOTO mode: rAF-driven smooth progress (50ms-equivalent ~1% per tick @ 60fps) ──
  useEffect(() => {
    if (!(mode === 'photo' && scanState === 'scanning')) return;
    let rafId;
    let lastTime = null;
    const MS_PER_TICK = 50; // matches old interval cadence
    let accumulated = 0;
    let done = false;

    const tick = (now) => {
      if (done) return;
      if (lastTime === null) lastTime = now;
      accumulated += now - lastTime;
      lastTime = now;

      while (accumulated >= MS_PER_TICK && !done) {
        accumulated -= MS_PER_TICK;
        setProgress((prev) => {
          const next = Math.min(prev + 1, 100);
          const currentLog = LOG_STEPS_PHOTO.find(s => s.threshold <= next && s.threshold > prev);
          if (currentLog) setScanLog(pl => pl ? `${pl}\n${currentLog.text}` : currentLog.text);
          if (next >= 100 && !done) {
            done = true;
            const undertone = photo === '/hero_model.png' ? 'Warm' : ['Cool', 'Warm', 'Neutral'][Math.floor(Math.random() * 3)];
            // Schedule after this render to avoid calling setState during state update
            setTimeout(() => onScanComplete(undertone), 0);
          }
          return next;
        });
      }

      if (!done) rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => { done = true; cancelAnimationFrame(rafId); };
  }, [mode, scanState, photo, onScanComplete]);

  // ── MANUAL mode: rAF-driven smooth progress ──
  useEffect(() => {
    if (!(mode === 'manual' && currentStep === 5)) return;
    let rafId;
    let lastTime = null;
    const MS_PER_TICK = 50;
    let accumulated = 0;
    let done = false;

    const tick = (now) => {
      if (done) return;
      if (lastTime === null) lastTime = now;
      accumulated += now - lastTime;
      lastTime = now;

      while (accumulated >= MS_PER_TICK && !done) {
        accumulated -= MS_PER_TICK;
        setProgress((prev) => {
          const next = Math.min(prev + 1, 100);
          const currentLog = LOG_STEPS_MANUAL.find(s => s.threshold <= next && s.threshold > prev);
          if (currentLog) setScanLog(pl => pl ? `${pl}\n${currentLog.text}` : currentLog.text);
          if (next >= 100 && !done) {
            done = true;
            const undertone = calculateUndertoneManual(answers);
            setTimeout(() => onScanComplete(undertone), 0);
          }
          return next;
        });
      }

      if (!done) rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => { done = true; cancelAnimationFrame(rafId); };
  }, [mode, currentStep, answers, onScanComplete]);

  // Auto-scroll the terminal logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [scanLog]);

  const selectOption = (questionId, optionId) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
    
    setTimeout(() => {
      if (currentStep < 4) {
        setCurrentStep(prev => prev + 1);
      }
    }, 250);
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    } else if (currentStep === 4) {
      setProgress(0);
      setScanLog('');
      setCurrentStep(5);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
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
      setPhoto(URL.createObjectURL(file));
      setScanState('scanning');
      setProgress(0);
      setScanLog('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhoto(URL.createObjectURL(file));
      setScanState('scanning');
      setProgress(0);
      setScanLog('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const useSamplePhoto = () => {
    setPhoto('/hero_model.png');
    setScanState('scanning');
    setProgress(0);
    setScanLog('');
  };

  const resetMode = () => {
    setMode('select');
    setPhoto(null);
    setScanState('idle');
    setCurrentStep(0);
    setAnswers({});
    setProgress(0);
    setScanLog('');
    setPhotoUploadMethod('upload');
    stopCamera();
  };

  useEffect(() => {
    if (mode === 'photo' && photoUploadMethod === 'camera' && scanState === 'idle') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [mode, photoUploadMethod, scanState]);

  return (
    <section 
      style={{
        padding: '4rem 0',
        backgroundColor: 'var(--bg-primary)',
        position: 'relative'
      }}
    >
      <div className="editorial-container" style={{ maxWidth: '960px' }}>
        
        {/* Header navigation */}
        <div 
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2.5rem',
            borderBottom: '1px solid var(--border-light)',
            paddingBottom: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            {mode !== 'select' && (
              <button 
                onClick={resetMode}
                className="back-btn-lux"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.2rem',
                  transition: 'color 0.2s ease'
                }}
                title="Back to Selection"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <h2 className="editorial-glow-title" style={{ fontFamily: 'var(--font-accent)', fontSize: '1.75rem', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.12em', color: 'var(--text-primary)' }}>
              Skin Undertone Analysis
            </h2>
          </div>
          <span 
            style={{
              fontFamily: 'var(--font-accent)',
              fontSize: '0.65rem',
              letterSpacing: '0.15em',
              color: 'var(--text-muted)',
              textTransform: 'uppercase'
            }}
          >
            {mode === 'select' ? "Method Selection" : mode === 'photo' ? "Camera Scan" : currentStep === 5 ? "Telemetry Scan" : `Question ${currentStep + 1} / 5`}
          </span>
        </div>

        {/* Dynamic content card container */}
        <div style={{ minHeight: '380px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          
          {/* 1. SELECTION SCREEN (COMPACT & LUXURIOUS) */}
          {mode === 'select' && (
            <div 
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '2rem',
                width: '100%',
                maxWidth: '780px',
                margin: '0 auto'
              }}
            >
              {/* Option A: Photo Upload / Scan */}
              <div className="analysis-selection-card">
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-gold)' }}>
                  <Camera size={18} />
                </div>
                <h3 style={{ fontFamily: 'var(--font-accent)', fontSize: '1.35rem', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.08em', color: 'var(--text-primary)' }}>
                  AI Portrait Scan
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: '0.5rem 0' }}>
                  Upload a headshot portrait to scan melanin values and perform dermal analysis automatically.
                </p>
                <button 
                  className="btn-lux" 
                  onClick={() => setMode('photo')}
                  style={{ width: '100%', padding: '0.75rem', fontSize: '0.7rem' }}
                >
                  Start Photo Scan
                </button>
              </div>

              {/* Option B: Manual Questionnaire */}
              <div className="analysis-selection-card">
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-gold)' }}>
                  <FileText size={18} />
                </div>
                <h3 style={{ fontFamily: 'var(--font-accent)', fontSize: '1.35rem', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.08em', color: 'var(--text-primary)' }}>
                  Manual Consultation
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: '0.5rem 0' }}>
                  Complete a 5-step questionnaire mapping veins, sun reaction, hair, eyes, and metals.
                </p>
                <button 
                  className="btn-lux-outline" 
                  onClick={() => setMode('manual')}
                  style={{ width: '100%', padding: '0.75rem', fontSize: '0.7rem' }}
                >
                  Start Questionnaire
                </button>
              </div>
            </div>
          )}

          {/* 2. PHOTO PORTRAIT SCAN SCREEN (COMPACT & BALANCED) */}
          {mode === 'photo' && (
            scanState === 'scanning' ? (
              <div style={{ 
                position: 'relative', 
                width: '100%', 
                minHeight: '520px', 
                borderRadius: '16px', 
                overflow: 'hidden', 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                justifyContent: 'center',
                background: theme === 'dark' ? 'radial-gradient(circle at center, #231C2D 0%, #0F0D12 100%)' : 'radial-gradient(circle at center, #FCFAF5 0%, #EFEBE3 100%)'
              }}>
                {/* Centered Overlay content */}
                <div style={{ 
                  position: 'relative', 
                  zIndex: 2, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  gap: '1.8rem',
                  textAlign: 'center',
                  padding: '2rem',
                  width: '100%',
                  maxWidth: '520px'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-accent)', fontSize: '0.75rem', letterSpacing: '0.25em', color: 'var(--accent-gold)', textTransform: 'uppercase', fontWeight: 500, textShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                      Biometric Scan Calculation
                    </span>
                    <h3 style={{ 
                      fontFamily: 'var(--font-editorial)',
                      fontSize: 'clamp(2.2rem, 5vw, 3.2rem)', 
                      textTransform: 'uppercase', 
                      marginTop: '0.5rem', 
                      fontWeight: 300, 
                      color: theme === 'dark' ? '#DFCDA8' : '#111111', 
                      letterSpacing: '0.05em'
                    }}>
                      Analyzing Portrait
                    </h3>
                  </div>

                  {/* Centered photo with scan-line overlay */}
                  <div style={{
                    width: '220px',
                    height: '290px',
                    border: '2px solid var(--accent-gold)',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
                    zIndex: 3,
                    position: 'relative'
                  }}>
                    <img src={photo || '/hero_model.png'} alt="Analysis Portrait" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div className="scan-line" style={{ height: '4px' }} />
                  </div>

                  {/* Glowing SVG Heartbeat Wave Animation (inline with percentage on the right) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', width: '100%', margin: '0.8rem 0' }}>
                    <div style={{ flex: 1, height: '110px', opacity: 0.85, display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
                      <svg viewBox="0 0 800 200" width="100%" height="110" preserveAspectRatio="none">
                        {/* Background ghost path */}
                        <path 
                          d="M 0 100 L 150 100 C 170 10 190 10 210 100 C 230 190 250 190 270 100 C 285 40 295 40 310 100 C 325 160 335 160 350 100 C 360 70 370 70 380 100 C 390 130 400 130 410 100 C 418 85 422 85 428 100 C 434 115 438 115 444 100 L 800 100" 
                          fill="none" 
                          stroke="var(--border-medium)" 
                          strokeWidth="2" 
                          opacity="0.15" 
                        />
                        {/* Progress-reveal: reveals left-to-right as progress increases */}
                        <path 
                          d="M 0 100 L 150 100 C 170 10 190 10 210 100 C 230 190 250 190 270 100 C 285 40 295 40 310 100 C 325 160 335 160 350 100 C 360 70 370 70 380 100 C 390 130 400 130 410 100 C 418 85 422 85 428 100 C 434 115 438 115 444 100 L 800 100" 
                          fill="none" 
                          stroke="var(--accent-gold)" 
                          strokeWidth="3.5" 
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="heartbeat-line"
                          strokeDasharray="1600"
                          strokeDashoffset={1600 - (progress / 100) * 1600}
                          style={{
                            filter: 'drop-shadow(0 0 8px rgba(198, 161, 106, 0.8))'
                          }}
                        />
                        {/* Animated travelling glow dot */}
                        <circle
                          r="5"
                          fill="var(--accent-gold)"
                          className="heartbeat-dot"
                          style={{ filter: 'drop-shadow(0 0 6px rgba(198,161,106,1))' }}
                        />
                      </svg>
                    </div>
                    <span style={{ 
                      fontFamily: 'var(--font-accent)', 
                      fontSize: '1.25rem', 
                      fontWeight: 600, 
                      color: 'var(--accent-gold)', 
                      minWidth: '55px', 
                      textAlign: 'right'
                    }}>
                      {progress}%
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '2rem', alignItems: 'center' }} className="scan-layout">
                {/* Controls Column */}
                <div style={{ gridColumn: 'span 12' }} className="photo-ctrl">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    <h3 style={{ fontFamily: 'var(--font-editorial)', fontSize: '1.8rem', fontWeight: 300, color: 'var(--text-primary)', textTransform: 'none' }}>
                      Initiate biometric scan
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                      Select your preferred input method to calculate melanin value coordinates.
                    </p>

                    {/* Minimal Luxury Tab Switcher */}
                    <div style={{ display: 'flex', gap: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                      <button
                        onClick={() => setPhotoUploadMethod('upload')}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: photoUploadMethod === 'upload' ? 'var(--text-primary)' : 'var(--text-muted)',
                          fontFamily: 'var(--font-accent)',
                          fontSize: '0.75rem',
                          letterSpacing: '0.15em',
                          textTransform: 'uppercase',
                          cursor: 'pointer',
                          paddingBottom: '0.4rem',
                          borderBottom: photoUploadMethod === 'upload' ? '2px solid var(--accent-gold)' : '2px solid transparent',
                          transition: 'all 0.3s ease',
                          fontWeight: photoUploadMethod === 'upload' ? 500 : 300
                        }}
                      >
                        Upload Image
                      </button>
                      <button
                        onClick={() => setPhotoUploadMethod('camera')}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: photoUploadMethod === 'camera' ? 'var(--text-primary)' : 'var(--text-muted)',
                          fontFamily: 'var(--font-accent)',
                          fontSize: '0.75rem',
                          letterSpacing: '0.15em',
                          textTransform: 'uppercase',
                          cursor: 'pointer',
                          paddingBottom: '0.4rem',
                          borderBottom: photoUploadMethod === 'camera' ? '2px solid var(--accent-gold)' : '2px solid transparent',
                          transition: 'all 0.3s ease',
                          fontWeight: photoUploadMethod === 'camera' ? 500 : 300
                        }}
                      >
                        Camera Capture
                      </button>
                    </div>

                    {photoUploadMethod === 'upload' ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div 
                          onDragEnter={handleDrag}
                          onDragOver={handleDrag}
                          onDragLeave={handleDrag}
                          onDrop={handleDrop}
                          onClick={triggerFileInput}
                          className="lux-card drag-drop-box"
                          style={{
                            border: dragActive ? '1px dashed var(--accent-gold)' : '1px dashed var(--border-medium)',
                            padding: '2.5rem 1.5rem',
                            textAlign: 'center',
                            cursor: 'pointer',
                            borderRadius: '10px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.6rem',
                            backgroundColor: 'transparent'
                          }}
                        >
                          <input 
                            type="file" 
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            style={{ display: 'none' }}
                          />
                          <Upload size={24} style={{ color: 'var(--accent-gold)' }} />
                          <span style={{ fontFamily: 'var(--font-accent)', fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                            Drag & Drop Headshot
                          </span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            or select from directories
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {cameraError ? (
                          <div style={{ padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                            {cameraError}
                          </div>
                        ) : (
                          <div style={{ position: 'relative', width: '100%', height: '240px', backgroundColor: '#000', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border-medium)' }}>
                            <video 
                              ref={videoRef} 
                              autoPlay 
                              playsInline 
                              style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} 
                            />
                            {/* Scanning Overlay */}
                            <div style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              border: '2px solid rgba(198, 161, 106, 0.3)',
                              boxShadow: 'inset 0 0 45px rgba(198, 161, 106, 0.15)',
                              pointerEvents: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <div style={{
                                width: '150px',
                                height: '150px',
                                border: '1px dashed var(--accent-gold)',
                                borderRadius: '50%',
                                opacity: 0.6,
                                boxSizing: 'border-box'
                              }} />
                            </div>
                          </div>
                        )}

                        <div style={{ display: 'flex', gap: '1rem' }}>
                          <button
                            className="btn-lux"
                            onClick={capturePhoto}
                            disabled={!streamActive}
                            style={{ flex: 1, padding: '0.65rem 1.5rem', fontSize: '0.65rem', opacity: streamActive ? 1 : 0.5, cursor: streamActive ? 'pointer' : 'not-allowed' }}
                          >
                            Capture Biometrics
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Photo Visualizer Column */}
                <div style={{ gridColumn: 'span 12', height: '340px', position: 'relative' }} className="photo-vis">
                  <div style={{ width: '100%', height: '100%', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-medium)', position: 'relative', overflow: 'hidden', borderRadius: '10px' }}>
                    {photo ? (
                      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                        <img src={photo} alt="Upload Analysis" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ) : (
                      <ThreeDViewer type="scanner" height="100%" />
                    )}
                  </div>
                </div>
              </div>
            )
          )}

          {/* 3. MANUAL ANALYSIS CARD SCREEN (SIMPLIFIED & COMPACT) */}
          {mode === 'manual' && (
            <div style={{ width: '100%', maxWidth: '780px', margin: '0 auto' }}>
              
              {/* Center header section when answering questions */}
              {currentStep < 5 && (
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', marginBottom: '0.8rem' }}>
                    <div style={{ height: '1px', width: '20px', backgroundColor: 'var(--accent-gold)' }} />
                    <span 
                      style={{
                        fontFamily: 'var(--font-accent)',
                        fontSize: '0.7rem',
                        letterSpacing: '0.2em',
                        color: 'var(--accent-gold)',
                        textTransform: 'uppercase',
                        fontWeight: 500
                      }}
                    >
                      Colour Science Analysis
                    </span>
                    <div style={{ height: '1px', width: '20px', backgroundColor: 'var(--accent-gold)' }} />
                  </div>
                  <h2 
                    style={{ 
                      fontFamily: 'var(--font-editorial)', 
                      fontSize: 'clamp(2.2rem, 4vw, 3rem)', 
                      fontWeight: 300, 
                      color: 'var(--text-primary)',
                      textTransform: 'none',
                      lineHeight: '1.15',
                      marginBottom: '1rem'
                    }}
                  >
                    The <span style={{ fontFamily: 'var(--font-cursive)', color: 'var(--accent-gold)', fontSize: '1.2em' }}>Five-Signal</span> Undertone Method
                  </h2>
                  <p 
                    style={{ 
                      fontSize: '0.9rem', 
                      color: 'var(--text-secondary)', 
                      maxWidth: '560px', 
                      margin: '0 auto',
                      lineHeight: '1.5'
                    }}
                  >
                    Each question reveals a unique biological signal. Together, they paint your complete colour portrait.
                  </p>

                  {/* High-end progress indicator steps */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', marginTop: '2rem' }}>
                    {[0, 1, 2, 3, 4].map((step) => {
                      const isActive = currentStep === step;
                      const isCompleted = currentStep > step;
                      return (
                        <React.Fragment key={step}>
                          <div 
                            style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: '50%',
                              border: isActive ? '1px solid var(--accent-gold)' : '1px solid var(--border-medium)',
                              backgroundColor: isActive ? 'transparent' : 'transparent',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontFamily: 'var(--font-accent)',
                              fontSize: '0.8rem',
                              color: isActive ? 'var(--accent-gold)' : isCompleted ? 'var(--text-primary)' : 'var(--text-muted)',
                              position: 'relative',
                              transition: 'all 0.3s ease',
                              boxShadow: isActive ? '0 0 12px rgba(198, 161, 106, 0.2)' : 'none',
                              fontWeight: isActive ? 500 : 300
                            }}
                          >
                            {step + 1}
                          </div>
                          {step < 4 && (
                            <div 
                              style={{
                                width: '30px',
                                height: '1px',
                                backgroundColor: isCompleted ? 'var(--accent-gold)' : 'var(--border-light)',
                                transition: 'background-color 0.3s ease'
                              }}
                            />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Progress Scan on Finish */}
              {currentStep === 5 ? (
                <div style={{ 
                  position: 'relative', 
                  width: '100%', 
                  height: '520px', 
                  borderRadius: '16px', 
                  overflow: 'hidden', 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  justifyContent: 'center',
                  background: theme === 'dark' ? 'radial-gradient(circle at center, #231C2D 0%, #0F0D12 100%)' : 'radial-gradient(circle at center, #FCFAF5 0%, #EFEBE3 100%)'
                }}>
                  {/* Centered Overlay content (without the glass card border/background box) */}
                  <div style={{ 
                    position: 'relative', 
                    zIndex: 2, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    gap: '1.8rem',
                    textAlign: 'center',
                    padding: '2rem',
                    width: '100%',
                    maxWidth: '520px'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ fontFamily: 'var(--font-accent)', fontSize: '0.75rem', letterSpacing: '0.25em', color: 'var(--accent-gold)', textTransform: 'uppercase', fontWeight: 500, textShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                        Telemetry Calculation
                      </span>
                      <h3 style={{ 
                        fontFamily: 'var(--font-editorial)',
                        fontSize: 'clamp(2rem, 5vw, 3.2rem)', 
                        textTransform: 'uppercase', 
                        marginTop: '0.5rem', 
                        fontWeight: 300, 
                        color: theme === 'dark' ? '#DFCDA8' : '#111111', 
                        letterSpacing: '0.05em',
                        textShadow: 'none'
                      }}>
                        Determining Undertone
                      </h3>
                    </div>

                    {/* Glowing SVG Heartbeat Wave Animation (inline with percentage on the right) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', width: '100%', margin: '0.8rem 0' }}>
                      <div style={{ flex: 1, height: '110px', opacity: 0.85, display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
                        <svg viewBox="0 0 800 200" width="100%" height="110" preserveAspectRatio="none">
                          {/* Background ghost path */}
                          <path 
                            d="M 0 100 L 150 100 C 170 10 190 10 210 100 C 230 190 250 190 270 100 C 285 40 295 40 310 100 C 325 160 335 160 350 100 C 360 70 370 70 380 100 C 390 130 400 130 410 100 C 418 85 422 85 428 100 C 434 115 438 115 444 100 L 800 100" 
                            fill="none" 
                            stroke="var(--border-medium)" 
                            strokeWidth="2" 
                            opacity="0.15" 
                          />
                          {/* Progress-reveal: reveals left-to-right as progress increases */}
                          <path 
                            d="M 0 100 L 150 100 C 170 10 190 10 210 100 C 230 190 250 190 270 100 C 285 40 295 40 310 100 C 325 160 335 160 350 100 C 360 70 370 70 380 100 C 390 130 400 130 410 100 C 418 85 422 85 428 100 C 434 115 438 115 444 100 L 800 100" 
                            fill="none" 
                            stroke="var(--accent-gold)" 
                            strokeWidth="3.5" 
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="heartbeat-line"
                            strokeDasharray="1600"
                            strokeDashoffset={1600 - (progress / 100) * 1600}
                            style={{
                              filter: 'drop-shadow(0 0 8px rgba(198, 161, 106, 0.8))'
                            }}
                          />
                          {/* Animated travelling glow dot */}
                          <circle
                            r="5"
                            fill="var(--accent-gold)"
                            className="heartbeat-dot"
                            style={{ filter: 'drop-shadow(0 0 6px rgba(198,161,106,1))' }}
                          />
                        </svg>
                      </div>
                      <span style={{ 
                        fontFamily: 'var(--font-accent)', 
                        fontSize: '1.25rem', 
                        fontWeight: 600, 
                        color: 'var(--accent-gold)', 
                        minWidth: '55px', 
                        textAlign: 'right'
                      }}>
                        {progress}%
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                
                /* QUESTION STEP */
                <div className="lux-card-glass" style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem', borderRadius: '16px', padding: '2.5rem 3rem' }}>
                  <div>
                    <span style={{ fontFamily: 'var(--font-accent)', fontSize: '0.7rem', letterSpacing: '0.2em', color: 'var(--accent-gold)', textTransform: 'uppercase', fontWeight: 500 }}>
                      QUESTION 0{currentStep + 1} OF 05 â€” {QUESTIONS[currentStep].category}
                    </span>
                    <h3 
                      style={{ 
                        fontFamily: 'var(--font-editorial)', 
                        fontSize: '2rem', 
                        fontWeight: 300, 
                        lineHeight: '1.3', 
                        marginTop: '0.4rem', 
                        textTransform: 'none', 
                        color: 'var(--text-primary)' 
                      }}
                    >
                      {QUESTIONS[currentStep].title}
                    </h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
                      {QUESTIONS[currentStep].subtitle}
                    </p>
                  </div>

                  {/* COMPACT WRIST REFERENCE IMAGE */}
                  {QUESTIONS[currentStep].id === 1 && (
                    <div style={{ 
                      borderRadius: '12px', 
                      overflow: 'hidden', 
                      border: '1px solid var(--border-medium)', 
                      padding: '0.8rem', 
                      backgroundColor: '#FFF',
                      maxWidth: '520px',
                      margin: '1rem auto',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.04)'
                    }}>
                      <img 
                        src="/vein_reference.png" 
                        alt="Wrist Vein Chromatic Reference" 
                        style={{ width: '100%', height: 'auto', maxHeight: '320px', objectFit: 'contain' }} 
                      />
                    </div>
                  )}

                  {/* Elegant Option buttons */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    {QUESTIONS[currentStep].options.map((option) => {
                      const isSelected = answers[QUESTIONS[currentStep].id] === option.id;
                      return (
                        <button
                          key={option.id}
                          onClick={() => selectOption(QUESTIONS[currentStep].id, option.id)}
                          className={`analysis-option-btn ${isSelected ? 'selected' : ''}`}
                          style={{
                            padding: '1.1rem 1.6rem',
                            fontSize: '1.1rem',
                            borderRadius: '8px'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span 
                              style={{
                                fontFamily: 'var(--font-accent)',
                                fontSize: '0.8rem',
                                color: isSelected ? 'var(--accent-gold)' : 'var(--text-muted)',
                                border: '1px solid',
                                borderColor: isSelected ? 'var(--accent-gold)' : 'var(--border-medium)',
                                borderRadius: '50%',
                                width: '26px',
                                height: '26px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 500,
                                transition: 'all 0.25s ease'
                              }}
                            >
                              {option.id}
                            </span>
                            <span style={{ color: 'var(--text-primary)', fontWeight: isSelected ? 400 : 300, fontSize: '1.1rem' }}>
                              {option.text}
                            </span>
                          </div>
                          {isSelected && <Check size={18} style={{ color: 'var(--accent-gold)' }} />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Navigation footer */}
                  <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1.5rem', marginTop: '1rem' }}>
                    <div style={{ height: '2px', width: '100%', backgroundColor: 'var(--border-light)', borderRadius: '1px', marginBottom: '1.5rem', position: 'relative' }}>
                      <div 
                        style={{
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          height: '100%',
                          backgroundColor: 'var(--accent-gold)',
                          width: `${((currentStep + 1) / 5) * 100}%`,
                          transition: 'width 0.3s ease'
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <button
                        onClick={handleBack}
                        disabled={currentStep === 0}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          background: 'none',
                          border: 'none',
                          cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
                          color: currentStep === 0 ? 'var(--text-muted)' : 'var(--text-primary)',
                          fontFamily: 'var(--font-accent)',
                          fontSize: '0.75rem',
                          letterSpacing: '0.15em',
                          textTransform: 'uppercase',
                          opacity: currentStep === 0 ? 0.3 : 1,
                          transition: 'color 0.2s ease'
                        }}
                      >
                        <ArrowLeft size={12} />
                        <span>Previous</span>
                      </button>

                      {currentStep === 4 ? (
                        <button
                          onClick={handleNext}
                          disabled={!answers[QUESTIONS[currentStep].id]}
                          className="btn-lux btn-calculate-spread"
                          style={{
                            padding: '0.8rem 2.2rem',
                            fontSize: '0.75rem',
                            letterSpacing: '0.15em',
                            textTransform: 'uppercase',
                            opacity: !answers[QUESTIONS[currentStep].id] ? 0.35 : 1,
                            cursor: !answers[QUESTIONS[currentStep].id] ? 'not-allowed' : 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.6rem',
                            borderRadius: '30px',
                            boxShadow: '0 4px 15px rgba(198, 161, 106, 0.3)',
                          }}
                        >
                          <span>Calculate Spread</span>
                          <Sparkles size={12} />
                        </button>
                      ) : (
                        <button
                          onClick={handleNext}
                          disabled={!answers[QUESTIONS[currentStep].id]}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            background: 'none',
                            border: 'none',
                            cursor: !answers[QUESTIONS[currentStep].id] ? 'not-allowed' : 'pointer',
                            color: !answers[QUESTIONS[currentStep].id] ? 'var(--text-muted)' : 'var(--text-primary)',
                            fontFamily: 'var(--font-accent)',
                            fontSize: '0.75rem',
                            letterSpacing: '0.15em',
                            textTransform: 'uppercase',
                            opacity: !answers[QUESTIONS[currentStep].id] ? 0.35 : 1,
                            transition: 'color 0.2s ease'
                          }}
                        >
                          <span>Next</span>
                          <ArrowRight size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

      </div>

      {/* Styled settings for compact presentation */}
      <style>{`
        .analysis-selection-card {
          background-color: var(--bg-tertiary);
          border: 1px solid var(--border-light);
          border-radius: 12px;
          padding: 2rem 1.5rem;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 0.8rem;
        }
        .analysis-selection-card:hover {
          border-color: var(--accent-gold);
          box-shadow: 0 15px 30px -10px var(--glow-color);
          transform: translateY(-3px);
        }
        .analysis-option-btn {
          background-color: transparent;
          border: 1px solid var(--border-medium);
          border-radius: 6px;
          padding: 0.75rem 1.2rem;
          cursor: pointer;
          width: 100%;
          text-align: left;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: all 0.25s ease;
          font-family: var(--font-ui);
        }
        .analysis-option-btn:hover {
          border-color: var(--accent-gold);
          background-color: var(--bg-tertiary);
        }
        .analysis-option-btn.selected {
          border-color: var(--accent-gold);
          background-color: var(--bg-tertiary);
          box-shadow: 0 0 8px var(--glow-color);
        }
        .back-btn-lux:hover {
          color: var(--text-primary) !important;
        }
        .drag-drop-box:hover {
          border-color: var(--accent-gold) !important;
          background-color: rgba(198, 161, 106, 0.03) !important;
        }
        .scan-running-grid {
          display: flex !important;
          flex-direction: column !important;
        }
        .scan-running-vis {
          width: 100% !important;
        }
        .scan-running-info {
          width: 100% !important;
        }
        @media (min-width: 768px) {
          .scan-layout {
            grid-template-columns: repeat(12, 1fr) !important;
          }
          .photo-ctrl {
            grid-column: span 5 !important;
          }
          .photo-vis {
            grid-column: span 7 !important;
          }
          .scan-running-grid {
            display: grid !important;
            grid-template-columns: repeat(12, 1fr) !important;
            gap: 2.5rem !important;
          }
          .scan-running-vis {
            grid-column: span 7 !important;
          }
          .scan-running-info {
            grid-column: span 5 !important;
          }
        }
        @keyframes blink {
          50% { opacity: 0; }
        }
        .blinking-cursor {
          animation: blink 1s steps(2) infinite;
        }
        /* ── Heartbeat waveform: progressive reveal via strokeDashoffset is driven by
           React props above. The CSS animation adds a continuous shimmer-pulse glow
           so the visible portion never looks frozen. ── */
        .heartbeat-line {
          transition: stroke-dashoffset 0.08s linear;
          animation: heartbeatPulse 1.8s ease-in-out infinite;
        }
        @keyframes heartbeatPulse {
          0%,100% { filter: drop-shadow(0 0 6px rgba(198,161,106,0.6)); }
          50%      { filter: drop-shadow(0 0 14px rgba(198,161,106,1.0)); }
        }
        /* Glow dot travels along the ECG path */
        .heartbeat-dot {
          offset-path: path('M 0 100 L 150 100 C 170 10 190 10 210 100 C 230 190 250 190 270 100 C 285 40 295 40 310 100 C 325 160 335 160 350 100 C 360 70 370 70 380 100 C 390 130 400 130 410 100 C 418 85 422 85 428 100 C 434 115 438 115 444 100 L 800 100');
          animation: dotTravel 5s linear infinite;
          offset-rotate: 0deg;
        }
        @keyframes dotTravel {
          0%   { offset-distance: 0%; opacity: 0; }
          5%   { opacity: 1; }
          95%  { opacity: 1; }
          100% { offset-distance: 100%; opacity: 0; }
        }
      `}</style>
    </section>
  );
}

