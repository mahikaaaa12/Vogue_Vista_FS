import React, { useState } from 'react';
import { Ruler, ArrowLeft, RefreshCw, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ManualMeasurements({ setScreen }) {
  const [formData, setFormData] = useState({
    height: '',
    weight: '',
    bust: '',
    waist: '',
    hips: '',
    inseam: ''
  });

  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);
  const [calculating, setCalculating] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Clear error
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const tempErrors = {};
    Object.keys(formData).forEach((key) => {
      const val = parseFloat(formData[key]);
      if (!formData[key]) {
        tempErrors[key] = 'This field is required';
      } else if (isNaN(val) || val <= 0) {
        tempErrors[key] = 'Please enter a valid positive number';
      }
    });
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const calculateBodyShape = () => {
    if (!validateForm()) return;

    setCalculating(true);

    setTimeout(() => {
      const bust = parseFloat(formData.bust);
      const waist = parseFloat(formData.waist);
      const hips = parseFloat(formData.hips);

      let shape = 'Rectangle';
      let description = '';
      let tips = [];

      // Sizing calculation formulas
      const waistHipRatio = waist / hips;
      const waistBustRatio = waist / bust;
      const bustHipRatio = bust / hips;
      const hipBustRatio = hips / bust;

      if (hipBustRatio >= 1.05 && waistHipRatio <= 0.78) {
        shape = 'Pear';
        description = 'Your hips are wider than your bust, and your waist is beautifully defined. This creates a classic, feminine silhouette.';
        tips = [
          "Choose boat necklines and structured shoulders to broaden your upper torso.",
          "A-line skirts and flowy dresses balance hip dimensions perfectly.",
          "Opt for high-waisted wide-leg trousers to highlight your narrow waist.",
          "Avoid clingy materials around the hips and flat side pockets."
        ];
      } else if (bustHipRatio >= 1.05 && waistBustRatio <= 0.78) {
        shape = 'Inverted Triangle';
        description = 'Your shoulders and bust are wider than your hips, creating an athletic, powerful stance with clean lines.';
        tips = [
          "Use V-necklines, scoop necks, and raglan sleeves to soften the shoulder line.",
          "Flared trousers, pleated skirts, and cargo details add volume to the lower half.",
          "Keep tops simple and dark, pairing them with brighter, textured bottoms.",
          "Avoid oversized lapels, shoulder pads, and horizontal stripes on top."
        ];
      } else if (Math.abs(bust - hips) <= 5 && waistHipRatio <= 0.72 && waistBustRatio <= 0.72) {
        shape = 'Hourglass';
        description = 'Your bust and hips are closely balanced in width, accented by a significantly narrower, highly defined waistline.';
        tips = [
          "Fitted wrap dresses and belted trench coats highlight your narrow waist.",
          "High-rise pants and tailored pencil skirts hug your natural proportions.",
          "Sweetheart, scoop, or plunging necklines complement your upper torso.",
          "Avoid shapeless box silhouettes and stiff materials that hide your waist."
        ];
      } else if (waistHipRatio >= 0.85 || waistBustRatio >= 0.85) {
        shape = 'Apple';
        description = 'Your silhouette is balanced, with weight carrying mostly around the midsection. You have beautiful legs and shoulders.';
        tips = [
          "Empire waistlines and shift dresses draw eyes upward.",
          "V-neck tops and long cardigans create lengthening vertical visual lines.",
          "Show off legs with knee-length flowy skirts or well-tailored straight trousers.",
          "Avoid heavy waist belts and clingy fabrics directly over the midsection."
        ];
      } else {
        shape = 'Rectangle';
        description = 'Your bust, waist, and hips are relatively uniform in width, giving you an athletic and sleek editorial silhouette.';
        tips = [
          "Use belts, cinched jackets, and high-waisted items to fabricate waist definition.",
          "Ruffles, breast pockets, and pleated details create curves on both top and bottom.",
          "Wear cropped tops and flared skirts to break up straight lines.",
          "Avoid extreme shift dresses and vertical block stripes."
        ];
      }

      setResult({
        shape,
        description,
        tips,
        ratios: {
          waistHip: waistHipRatio.toFixed(2),
          waistBust: waistBustRatio.toFixed(2)
        }
      });
      setCalculating(false);
    }, 1500);
  };

  const resetForm = () => {
    setFormData({
      height: '',
      weight: '',
      bust: '',
      waist: '',
      hips: '',
      inseam: ''
    });
    setResult(null);
  };

  return (
    <section className="min-h-screen py-28 md:py-32 bg-lux-bg-primary text-lux-text-primary relative overflow-hidden flex flex-col">
      {/* Background radial accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,rgba(198,161,106,0.04)_0%,transparent_70%)] pointer-events-none" />

      <div className="mx-auto w-full max-w-[1400px] px-6 md:px-[48px] relative z-10 flex-1 flex flex-col gap-12">
        {/* Header Block */}
        <div className="flex justify-between items-baseline pb-6 border-b border-lux-border-light">
          <div className="flex items-center gap-2">
            <span className="font-serif italic text-lg text-lux-gold">03.1 //</span>
            <h2 className="font-editorial font-light text-3xl md:text-4xl uppercase tracking-wide">
              Manual Measurements
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
          {/* Left Column: Form Entry (or result displays) */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            <AnimatePresence mode="wait">
              {!result ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="rounded-[32px] border border-lux-border-light bg-[#FAF8F5]/60 dark:bg-white/5 backdrop-blur-[24px] p-8 md:p-10 shadow-premium flex flex-col gap-6"
                >
                  <div className="flex gap-4 items-center mb-2">
                    <div className="p-3 bg-lux-bg-secondary border border-lux-border-light rounded-full text-lux-gold shrink-0">
                      <Ruler size={24} />
                    </div>
                    <div className="text-left">
                      <h3 className="font-editorial text-2xl uppercase tracking-wider text-lux-text-primary">
                        Atelier Calibration
                      </h3>
                      <p className="font-ui font-light text-xs text-lux-text-secondary leading-relaxed">
                        Input measurements in centimeters for immediate silhouette matching.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-left">
                    {/* Height */}
                    <div className="flex flex-col gap-2">
                      <label htmlFor="height" className="font-accent text-[9px] tracking-widest text-lux-text-primary uppercase font-semibold">Height (cm)</label>
                      <input 
                        type="number" 
                        id="height" 
                        name="height" 
                        placeholder="e.g. 172"
                        value={formData.height}
                        onChange={handleInputChange}
                        className={`w-full bg-[#FAF8F5]/80 dark:bg-[#1C1A22] border rounded-full px-5 py-3 text-sm focus:outline-none focus:border-lux-gold transition-colors duration-300 ${errors.height ? 'border-red-400' : 'border-lux-border-medium'}`}
                      />
                      {errors.height && <span className="text-[10px] text-red-400 ml-2">{errors.height}</span>}
                    </div>

                    {/* Weight */}
                    <div className="flex flex-col gap-2">
                      <label htmlFor="weight" className="font-accent text-[9px] tracking-widest text-lux-text-primary uppercase font-semibold">Weight (kg)</label>
                      <input 
                        type="number" 
                        id="weight" 
                        name="weight" 
                        placeholder="e.g. 62"
                        value={formData.weight}
                        onChange={handleInputChange}
                        className={`w-full bg-[#FAF8F5]/80 dark:bg-[#1C1A22] border rounded-full px-5 py-3 text-sm focus:outline-none focus:border-lux-gold transition-colors duration-300 ${errors.weight ? 'border-red-400' : 'border-lux-border-medium'}`}
                      />
                      {errors.weight && <span className="text-[10px] text-red-400 ml-2">{errors.weight}</span>}
                    </div>

                    {/* Bust */}
                    <div className="flex flex-col gap-2">
                      <label htmlFor="bust" className="font-accent text-[9px] tracking-widest text-lux-text-primary uppercase font-semibold">Chest / Bust (cm)</label>
                      <input 
                        type="number" 
                        id="bust" 
                        name="bust" 
                        placeholder="e.g. 92"
                        value={formData.bust}
                        onChange={handleInputChange}
                        className={`w-full bg-[#FAF8F5]/80 dark:bg-[#1C1A22] border rounded-full px-5 py-3 text-sm focus:outline-none focus:border-lux-gold transition-colors duration-300 ${errors.bust ? 'border-red-400' : 'border-lux-border-medium'}`}
                      />
                      {errors.bust && <span className="text-[10px] text-red-400 ml-2">{errors.bust}</span>}
                    </div>

                    {/* Waist */}
                    <div className="flex flex-col gap-2">
                      <label htmlFor="waist" className="font-accent text-[9px] tracking-widest text-lux-text-primary uppercase font-semibold">Waist (cm)</label>
                      <input 
                        type="number" 
                        id="waist" 
                        name="waist" 
                        placeholder="e.g. 68"
                        value={formData.waist}
                        onChange={handleInputChange}
                        className={`w-full bg-[#FAF8F5]/80 dark:bg-[#1C1A22] border rounded-full px-5 py-3 text-sm focus:outline-none focus:border-lux-gold transition-colors duration-300 ${errors.waist ? 'border-red-400' : 'border-lux-border-medium'}`}
                      />
                      {errors.waist && <span className="text-[10px] text-red-400 ml-2">{errors.waist}</span>}
                    </div>

                    {/* Hips */}
                    <div className="flex flex-col gap-2">
                      <label htmlFor="hips" className="font-accent text-[9px] tracking-widest text-lux-text-primary uppercase font-semibold">Hips (cm)</label>
                      <input 
                        type="number" 
                        id="hips" 
                        name="hips" 
                        placeholder="e.g. 96"
                        value={formData.hips}
                        onChange={handleInputChange}
                        className={`w-full bg-[#FAF8F5]/80 dark:bg-[#1C1A22] border rounded-full px-5 py-3 text-sm focus:outline-none focus:border-lux-gold transition-colors duration-300 ${errors.hips ? 'border-red-400' : 'border-lux-border-medium'}`}
                      />
                      {errors.hips && <span className="text-[10px] text-red-400 ml-2">{errors.hips}</span>}
                    </div>

                    {/* Inseam */}
                    <div className="flex flex-col gap-2">
                      <label htmlFor="inseam" className="font-accent text-[9px] tracking-widest text-lux-text-primary uppercase font-semibold">Inseam (cm)</label>
                      <input 
                        type="number" 
                        id="inseam" 
                        name="inseam" 
                        placeholder="e.g. 81"
                        value={formData.inseam}
                        onChange={handleInputChange}
                        className={`w-full bg-[#FAF8F5]/80 dark:bg-[#1C1A22] border rounded-full px-5 py-3 text-sm focus:outline-none focus:border-lux-gold transition-colors duration-300 ${errors.inseam ? 'border-red-400' : 'border-lux-border-medium'}`}
                      />
                      {errors.inseam && <span className="text-[10px] text-red-400 ml-2">{errors.inseam}</span>}
                    </div>
                  </div>

                  <button 
                    onClick={calculateBodyShape}
                    disabled={calculating}
                    className="btn-lux w-full mt-4 flex items-center justify-center gap-3 py-4 text-[10px] tracking-widest rounded-full disabled:opacity-60"
                  >
                    {calculating ? (
                      <>
                        <RefreshCw className="animate-spin" size={14} />
                        <span>CALIBRATING DATA...</span>
                      </>
                    ) : (
                      <>
                        <span>CALCULATE SILHOUETTE</span>
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="rounded-[32px] border border-lux-border-light bg-[#FAF8F5]/70 dark:bg-white/5 backdrop-blur-[24px] p-8 md:p-10 shadow-premium flex flex-col gap-6 text-left"
                >
                  <div className="flex items-center gap-3 pb-4 border-b border-lux-border-light">
                    <div className="p-2.5 bg-lux-text-primary text-lux-bg-primary rounded-full shrink-0">
                      <CheckCircle2 size={22} className="text-lux-gold" />
                    </div>
                    <div>
                      <span className="font-accent text-[9px] tracking-[0.2em] text-lux-gold uppercase">PROFILE GENERATED</span>
                      <h3 className="font-editorial text-2xl uppercase tracking-wider text-lux-text-primary mt-0.5">
                        {result.shape} Silhouette
                      </h3>
                    </div>
                  </div>

                  <p className="font-ui font-light text-sm md:text-base text-lux-text-secondary leading-relaxed">
                    {result.description}
                  </p>

                  <div className="flex flex-col gap-3">
                    <h4 className="font-accent text-[10px] tracking-widest text-lux-text-primary uppercase font-semibold">
                      ATELIER EDITORIAL RECOMMENDATIONS:
                    </h4>
                    <ul className="flex flex-col gap-3.5 pl-1">
                      {result.tips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="w-1.5 h-1.5 rounded-full bg-lux-gold mt-2 shrink-0" />
                          <span className="font-ui font-light text-xs md:text-sm text-lux-text-secondary leading-relaxed">
                            {tip}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="w-full h-px bg-lux-border-light/20 my-2" />

                  <div className="flex gap-4 flex-col sm:flex-row">
                    <button 
                      onClick={resetForm}
                      className="btn-lux-outline w-full flex items-center justify-center gap-2 py-3.5 text-[9px] tracking-widest rounded-full"
                    >
                      <RefreshCw size={12} />
                      <span>RECALCULATE</span>
                    </button>
                    <button 
                      onClick={() => handleNavigation('results')}
                      className="btn-lux w-full flex items-center justify-center gap-2 py-3.5 text-[9px] tracking-widest rounded-full"
                    >
                      <span>VIEW LOOKBOOK PRODUCTS</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column: Dynamic Editorial Graphics */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            <div className="rounded-[32px] border border-lux-border-light p-6 md:p-8 bg-[#FAF8F5]/30 dark:bg-[#16141C]/25 backdrop-blur-[12px] flex flex-col items-center gap-6 justify-center h-full min-h-[400px]">
              {/* Silhouette graphics outline */}
              <div className="relative w-48 h-80 flex items-center justify-center border border-lux-border-light/40 rounded-[24px] overflow-hidden bg-white/20 dark:bg-black/10">
                <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_45%,var(--accent-gold)_50%,transparent_55%)] opacity-30 select-none pointer-events-none animate-pulse" style={{ backgroundSize: '100% 200%' }} />
                
                {/* SVG representing styling outlines based on result */}
                <svg width="120" height="260" viewBox="0 0 120 260" className="text-lux-gold select-none pointer-events-none">
                  {/* Head */}
                  <circle cx="60" cy="40" r="12" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
                  {/* Neck */}
                  <line x1="60" y1="52" x2="60" y2="62" stroke="currentColor" strokeWidth="1" />
                  
                  {/* Torso Outline according to active shape */}
                  {result?.shape === 'Hourglass' && (
                    <path d="M40 70 L80 70 M40 70 L48 115 L40 160 L80 160 L72 115 L80 70 Z M40 160 L42 240 M80 160 L78 240" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  )}
                  {result?.shape === 'Pear' && (
                    <path d="M44 70 L76 70 M44 70 L46 115 L36 160 L84 160 L74 115 L76 70 Z M36 160 L38 240 M84 160 L82 240" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  )}
                  {result?.shape === 'Inverted Triangle' && (
                    <path d="M36 70 L84 70 M36 70 L44 115 L44 160 L76 160 L76 115 L84 70 Z M44 160 L44 240 M76 160 L76 240" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  )}
                  {result?.shape === 'Apple' && (
                    <path d="M42 70 L78 70 M42 70 L34 115 L40 160 L80 160 L86 115 L78 70 Z M40 160 L42 240 M80 160 L78 240" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  )}
                  {(!result || result.shape === 'Rectangle') && (
                    <path d="M42 70 L78 70 M42 70 L43 115 L42 160 L78 160 L77 115 L78 70 Z M42 160 L42 240 M78 160 L78 240" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  )}
                  
                  {/* Grid calibrations overlays */}
                  <line x1="10" y1="70" x2="110" y2="70" stroke="currentColor" strokeWidth="0.5" opacity="0.3" strokeDasharray="1 3" />
                  <line x1="10" y1="115" x2="110" y2="115" stroke="currentColor" strokeWidth="0.5" opacity="0.3" strokeDasharray="1 3" />
                  <line x1="10" y1="160" x2="110" y2="160" stroke="currentColor" strokeWidth="0.5" opacity="0.3" strokeDasharray="1 3" />
                </svg>

                {/* Measurements annotations */}
                {result && (
                  <div className="absolute top-2 left-2 text-[8px] font-accent tracking-widest text-lux-gold uppercase leading-normal">
                    CALIBRATED:<br/>
                    H: {formData.height}cm<br/>
                    W: {formData.weight}kg
                  </div>
                )}
                {result && (
                  <div className="absolute bottom-2 right-2 text-[8px] font-accent tracking-widest text-lux-gold uppercase text-right leading-normal">
                    RATIOS:<br/>
                    W/H: {result.ratios.waistHip}<br/>
                    W/B: {result.ratios.waistBust}
                  </div>
                )}
              </div>

              <div className="text-center flex flex-col gap-2 max-w-sm">
                <span className="font-accent text-[9px] tracking-widest text-lux-gold uppercase font-semibold">
                  Sizing Guidelines & Mathematics
                </span>
                <p className="font-ui font-light text-xs text-lux-text-secondary leading-relaxed">
                  Our calculations reference tailors' structural metrics. The system evaluates waist-to-hip and bust-to-hip proportions to map your silhouette category accurately.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
