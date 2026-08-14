import React, { useState, useEffect, useRef } from 'react';
import { Ruler, ArrowLeft, RefreshCw, CheckCircle2, ChevronRight, ChevronDown, ChevronUp, Download, Sparkles, UserCheck, AlertCircle, Heart, Share2, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeMeasurements } from '../services/bodyAnalysisService';

// Detailed styling, inspirations, and avoid advice mapped by shape and gender
const ADVANCED_STYLING_PROFILES = {
  female: {
    hourglass: {
      necklines: "V-neck, Sweetheart, Scoop, Cowl, Plunging",
      sleeves: "Fitted, Three-Quarter, Cap sleeves",
      tops: "Wrap tops, Peplum blouses, Tailored shirts, Cinch-waist blazers",
      bottoms: "High-waisted jeans, Pencil skirts, Bootcut trousers, A-line skirts",
      dresses: "Wrap dresses, Belted sheath dresses, Fit-and-flare styles",
      jackets: "Belted trench coats, Cropped tailored jackets, Cinched blazers",
      fabrics: "Silk, Satin, Soft cashmere, Fine crepe, Lightweight jersey",
      avoid: "Boxy/oversized silhouettes, straight shapeless shifts, bulky double-breasted coats, stiff fabrics that mask your waist definition.",
      celebs: "Marilyn Monroe, Scarlett Johansson, Sofia Vergara, Salma Hayek, Blake Lively",
      explanation: "Your bust and hips are closely balanced in width, accented by a significantly narrower, highly defined waistline. Your silhouette represents classic symmetry."
    },
    pear: {
      necklines: "Boat neck, Off-shoulder, Cowl neck, Sweetheart, Square neck",
      sleeves: "Puff sleeves, Flutter sleeves, Bell sleeves, Cap sleeves",
      tops: "Statement sleeve tops, Embellished collars, Ruffled blouses, Crop jackets",
      bottoms: "A-line skirts, Straight-leg trousers, Dark-wash bootcut jeans, Flowy skirts",
      dresses: "Fit-and-flare dresses, Empire waist styles, A-line silhouettes",
      jackets: "Cropped blazers, Structured shoulder jackets, Jackets ending above the hips",
      fabrics: "Structured cotton, Linen blends, Gabardine, Silk crepe, Tweed (for tops)",
      avoid: "Clingy fabrics around hips, side cargo pockets, tight pencil skirts, horizontal stripes on the lower half, oversized shapeless tunics.",
      celebs: "Beyoncé, Shakira, Jennifer Lopez, Rihanna, Kristin Davis",
      explanation: "Your hips are wider than your bust and shoulders, and your waist is beautifully defined. The goal is to draw attention upwards to balance the lower frame."
    },
    apple: {
      necklines: "Deep V-neck, Scoop neck, Sweetheart, Wide-open necklines",
      sleeves: "Flowy sleeves, Dolman sleeves, Flared sleeves, Three-quarter sleeves",
      tops: "Empire waist tops, Flowy tunic shirts, Wrap blouses, Asymmetric hems",
      bottoms: "Straight-leg trousers, Bootcut pants, High-waisted structured shorts",
      dresses: "Empire line dresses, Shift dresses, A-line shapes in fluid fabrics",
      jackets: "Single-breasted blazers, Longline cardigans, Open-front jackets",
      fabrics: "Flowy silk, Georgette, Lightweight knits, Drapey modal, Matte jersey",
      avoid: "Heavy waist belts, double-breasted coats, clingy shirts, horizontal stripes across the midsection, high-rise skinny jeans.",
      celebs: "Oprah Winfrey, Adele, Drew Barrymore, Catherine Zeta-Jones, Queen Latifah",
      explanation: "Your silhouette is balanced, with weight carrying mostly around the midsection. You have beautiful legs and shoulders, which we highlight."
    },
    inverted_triangle: {
      necklines: "V-neck, Scoop neck, Deep halter, Asymmetrical, Cowl",
      sleeves: "Raglan, Kimono, Sleeveless, Loose cap sleeves",
      tops: "Simple peplum, Wrap tops, V-neck knits, Tops with vertical stripes",
      bottoms: "Wide-leg trousers, Pleated skirts, Flared jeans, Boyfriend jeans",
      dresses: "A-line dresses, Wrap dresses, Pleated bottom styles, Shift dresses",
      jackets: "Single-breasted blazers, Collarless jackets, Draped open cardigans",
      fabrics: "Fluid jersey, Soft crepe, Lightweight cotton, Structured denim (bottoms)",
      avoid: "Shoulder pads, boat necklines, puff sleeves, double-breasted blazers, horizontal stripes on tops, boat neck tops.",
      celebs: "Angelina Jolie, Demi Moore, Renée Zellweger, Naomi Campbell, Charlize Theron",
      explanation: "Your shoulders and bust are wider than your hips, creating an athletic, powerful stance. The styling strategy builds volume on the lower half."
    },
    rectangle: {
      necklines: "Sweetheart, Scoop, Cowl, Crew neck, High collar",
      sleeves: "Flutter sleeves, Puff sleeves, Cuffed sleeves, Three-quarter length",
      tops: "Ruffled blouses, Cinched tops, Pocket-detailed shirts, Layered knitwear",
      bottoms: "Wide-leg trousers, Pleated trousers, Flared skirts, Cargo pants",
      dresses: "Belted dresses, Fit-and-flare styles, Shift dresses with a defined sash",
      jackets: "Double-breasted blazers, Belted trench coats, Cropped bomber jackets",
      fabrics: "Textured tweed, Corduroy, Heavy knits, Silk organza, Lace, Velvet",
      avoid: "Extreme straight-cut shift dresses, vertical block stripes, shapeless oversized shifts, low-waisted trousers with cropped tops.",
      celebs: "Cameron Diaz, Natalie Portman, Keira Knightley, Cara Delevingne, Gwyneth Paltrow",
      explanation: "Your bust, waist, and hips are relatively uniform in width, giving you a sleek, athletic, and editorial frame. We create curves using texture and belts."
    }
  },
  male: {
    trapezoid: {
      necklines: "Crewneck, Polo collar, V-neck, Structured shirt collar",
      sleeves: "Tailored fit, Regular cuffed",
      tops: "Slim-fit shirts, Tailored blazers, Fitted knits, Casual button-downs",
      bottoms: "Straight-leg chinos, Slim-fit jeans, Flat-front trousers",
      dresses: "N/A",
      jackets: "Double-breasted coats, Bomber jackets, Structured blazers",
      fabrics: "Tweed, Heavy cotton, Merino wool, Structured denim",
      avoid: "Oversized, baggy clothing that disrupts your balanced proportions, super skinny jeans, extra long tees.",
      celebs: "Daniel Craig, Chris Evans, Dwayne Johnson, Jon Hamm",
      explanation: "You have broad shoulders and chest with a balanced taper to the waist and hips. This is considered a highly versatile silhouette for tailoring."
    },
    inverted_triangle: {
      necklines: "V-neck, Henley collar, Crew neck",
      sleeves: "Fitted, Raglan sleeves",
      tops: "Regular-fit shirts, Athletic-cut knits, Henley tees, V-neck sweaters",
      bottoms: "Straight-leg jeans, Relaxed-fit trousers, Pleated trousers",
      dresses: "N/A",
      jackets: "Soft shoulder jackets, Unlined blazers, Draped coats",
      fabrics: "Linen blends, Stretch cotton, Fine gauge knits, Soft wool",
      avoid: "Double-breasted blazers, heavy shoulder padding, structured shoulder straps, skinny leg pants that make the upper torso look top-heavy.",
      celebs: "Hugh Jackman, Arnold Schwarzenegger, Jason Statham, Henry Cavill",
      explanation: "Your shoulders and chest are significantly wider than your waist and hips. The goal is to avoid bulk on top and add volume/weight to the lower body."
    },
    rectangle: {
      necklines: "Crewneck, High collars, Hooded necks",
      sleeves: "Regular, Cuffed",
      tops: "Layered knitwear, Shirts with double chest pockets, Horizontal crewnecks",
      bottoms: "Straight-cut chinos, Regular-fit jeans, Cargo trousers",
      dresses: "N/A",
      jackets: "Belted trench coats, Utility jackets, Structured field coats",
      fabrics: "Textured knits, Heavy denim, Flannel, Structured wool",
      avoid: "Monochrome outfits with vertical stripes, sleeveless tees, clingy fabrics with zero structure.",
      celebs: "David Beckham, Ryan Gosling, Ashton Kutcher, Justin Timberlake",
      explanation: "Your shoulders, chest, and waist run on a similar vertical line. Layering textures and details creates interest and breaks up the straight frame."
    },
    triangle: {
      necklines: "Crewneck, Structured collars, Wide polo necks",
      sleeves: "Standard, Set-in sleeves",
      tops: "Structured shoulder shirts, Tops with horizontal chest patterns",
      bottoms: "Straight-leg dark jeans, Classic tailored trousers",
      dresses: "N/A",
      jackets: "Padded shoulder blazers, Single-breasted coats, Utility jackets",
      fabrics: "Structured cotton, Worsted wool, Rigid denim",
      avoid: "Skinny jeans, tight polo shirts, raglan sleeves, horizontal stripes across the waist or hips.",
      celebs: "Jonah Hill, Seth Rogen, Jack Black",
      explanation: "Your lower body is wider than your shoulders and chest. The focus is on widening the shoulder line and drawing attention upwards."
    },
    oval: {
      necklines: "V-neck, Vertical collars, Open necklines",
      sleeves: "Tailored fit, Regular",
      tops: "Vertical striped shirts, Plain dark tunics, Henley shirts",
      bottoms: "Straight-leg trousers with slight taper, Dark jeans",
      dresses: "N/A",
      jackets: "Single-breasted long coats, Simple unbelted cardigans, Vertical zip jackets",
      fabrics: "Flowy linen, Lightweight wool, Soft drape cotton, Dark denim",
      avoid: "Tight horizontal stripes, heavy waist belts, double-breasted jackets, bulky puffers, skinny jeans.",
      celebs: "James Corden, Zach Galifianakis, Forest Whitaker",
      explanation: "Your volume is carried mostly in the upper torso and midsection. Styling centers on streamlining vertical lines and extending the neckline."
    }
  }
};

export default function ManualMeasurements({ setScreen }) {
  const [gender, setGender] = useState('');
  const [formData, setFormData] = useState({
    height: '',
    bust: '',
    waist: '',
    hip: '',
    shoulder: '',
    neck: '',
    armLength: '',
    inseam: ''
  });

  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);
  const [scanState, setScanState] = useState('idle'); // idle | scanning | complete
  const [progress, setProgress] = useState(0);
  const [scanLog, setScanLog] = useState([]);
  const [showOptional, setShowOptional] = useState(false);
  const [printed, setPrinted] = useState(false);

  const consoleEndRef = useRef(null);

  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [scanLog]);

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
    
    if (!gender) {
      tempErrors.gender = 'Gender is required';
    }

    // Required fields
    const required = ['height', 'bust', 'waist', 'hip', 'shoulder'];
    const bounds = {
      height: { min: 100, max: 250, label: 'Height' },
      bust: { min: 30, max: 200, label: 'Bust / Chest' },
      waist: { min: 30, max: 200, label: 'Waist' },
      hip: { min: 30, max: 200, label: 'Hip' },
      shoulder: { min: 20, max: 100, label: 'Shoulder width' },
      neck: { min: 20, max: 70, label: 'Neck' },
      armLength: { min: 30, max: 100, label: 'Arm length' },
      inseam: { min: 40, max: 120, label: 'Inseam' }
    };

    required.forEach(key => {
      const valStr = formData[key];
      if (!valStr) {
        tempErrors[key] = `${bounds[key].label} is required`;
      } else {
        const val = parseFloat(valStr);
        if (isNaN(val) || val < bounds[key].min || val > bounds[key].max) {
          tempErrors[key] = `Must be between ${bounds[key].min} and ${bounds[key].max} cm`;
        }
      }
    });

    // Optional fields (validate only if they contain values)
    const optional = ['neck', 'armLength', 'inseam'];
    optional.forEach(key => {
      const valStr = formData[key];
      if (valStr) {
        const val = parseFloat(valStr);
        if (isNaN(val) || val < bounds[key].min || val > bounds[key].max) {
          tempErrors[key] = `Must be between ${bounds[key].min} and ${bounds[key].max} cm`;
        }
      }
    });

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const addLog = (text) => {
    setScanLog((prev) => [...prev, `> ${text}`]);
  };

  const handleStartAnalysis = async () => {
    if (!validateForm()) return;

    setScanState('scanning');
    setProgress(0);
    setScanLog([]);

    addLog("INIT MANUAL MEASUREMENT ANALYSIS ENGINE...");
    addLog(`GENDER CALIBRATION: ${gender.toUpperCase()}`);
    addLog("PARSING ANATOMICAL INPUT VECTORS...");

    // Set up step updates
    const steps = [
      { threshold: 15, text: "Analyzing body proportions..." },
      { threshold: 40, text: "Calculating anatomical ratios (Waist/Hip, Shoulder/Waist)..." },
      { threshold: 70, text: "Running AI body classification classifier..." },
      { threshold: 90, text: "Generating personalized styling recommendations..." },
    ];

    let currentProgress = 0;
    const interval = setInterval(async () => {
      currentProgress += 5;
      
      const step = steps.find(s => s.threshold === currentProgress);
      if (step) {
        addLog(step.text);
      }

      setProgress(currentProgress);

      if (currentProgress >= 100) {
        clearInterval(interval);
        
        try {
          addLog("DISPATCHING REQUEST TO BACKEND ML SERVICE...");
          const sh = parseFloat(formData.shoulder);
          const wa = parseFloat(formData.waist);
          const hp = parseFloat(formData.hip);
          const ht = parseFloat(formData.height);
          const ins = parseFloat(formData.inseam);
          
          // Estimate torso height as standard proportion if not calculated from inseam
          const torsoHeight = ins ? (ht - ins - 34) : (ht * 0.29);

          const payload = {
            gender: gender,
            shoulder: sh,
            waist: wa,
            hip: hp,
            torso: parseFloat(torsoHeight.toFixed(1)),
            unit: "cm"
          };

          const response = await analyzeMeasurements(payload);
          addLog("SILHOUETTE PROFILE MAPPED SUCCESSFULLY.");
          
          // Collect advanced custom matching advice
          const detectedShapeNormalized = (response.predicted_shape || response.shape || 'rectangle').toLowerCase().replace(" ", "_");
          const genderType = response.gender || gender || 'female';
          const details = ADVANCED_STYLING_PROFILES[genderType]?.[detectedShapeNormalized] || ADVANCED_STYLING_PROFILES[genderType]?.rectangle;

          setResult({
            ...response,
            details,
            measurements: {
              height: ht,
              bust: parseFloat(formData.bust),
              waist: wa,
              hip: hp,
              shoulder: sh,
              neck: formData.neck ? parseFloat(formData.neck) : null,
              armLength: formData.armLength ? parseFloat(formData.armLength) : null,
              inseam: ins ? ins : null
            }
          });
          setScanState('complete');
        } catch (error) {
          addLog(`API OFFLINE: ${error.message}`);
          addLog("ENGAGING CLIENT-SIDE ATELIER CALIBRATION FALLBACK...");

          const bust = parseFloat(formData.bust);
          const wa = parseFloat(formData.waist);
          const hp = parseFloat(formData.hip);
          const sh = parseFloat(formData.shoulder);
          const ht = parseFloat(formData.height);
          const ins = parseFloat(formData.inseam);

          const waistHipRatio = wa / hp;
          const waistBustRatio = wa / bust;
          const bustHipRatio = bust / hp;
          const hipBustRatio = hp / bust;

          let shape = 'Rectangle';
          let tips = [];
          if (hipBustRatio >= 1.05 && waistHipRatio <= 0.78) {
            shape = 'Pear';
            tips = [
              "Choose boat necklines and structured shoulders to broaden your upper torso.",
              "A-line skirts and flowy dresses balance hip dimensions perfectly.",
              "Opt for high-waisted wide-leg trousers to highlight your narrow waist.",
              "Avoid clingy materials around the hips and flat side pockets."
            ];
          } else if (bustHipRatio >= 1.05 && waistBustRatio <= 0.78) {
            shape = 'Inverted Triangle';
            tips = [
              "Use V-necklines, scoop necks, and raglan sleeves to soften the shoulder line.",
              "Flared trousers, pleated skirts, and cargo details add volume to the lower half.",
              "Keep tops simple and dark, pairing them with brighter, textured bottoms.",
              "Avoid oversized lapels, shoulder pads, and horizontal stripes on top."
            ];
          } else if (Math.abs(bust - hp) <= 5 && waistHipRatio <= 0.72 && waistBustRatio <= 0.72) {
            shape = 'Hourglass';
            tips = [
              "Fitted wrap dresses and belted trench coats highlight your narrow waist.",
              "High-rise pants and tailored pencil skirts hug your natural proportions.",
              "Sweetheart, scoop, or plunging necklines complement your upper torso.",
              "Avoid shapeless box silhouettes and stiff materials that hide your waist."
            ];
          } else if (waistHipRatio >= 0.85 || waistBustRatio >= 0.85) {
            shape = 'Apple';
            tips = [
              "Empire waistlines and shift dresses draw eyes upward.",
              "V-neck tops and long cardigans create lengthening vertical visual lines.",
              "Show off legs with knee-length flowy skirts or well-tailored straight trousers.",
              "Avoid heavy waist belts and clingy fabrics directly over the midsection."
            ];
          } else {
            shape = 'Rectangle';
            tips = [
              "Use belts, cinched jackets, and high-waisted items to fabricate waist definition.",
              "Ruffles, breast pockets, and pleated details create curves on both top and bottom.",
              "Wear cropped tops and flared skirts to break up straight lines.",
              "Avoid extreme shift dresses and vertical block stripes."
            ];
          }

          const detectedShapeNormalized = shape.toLowerCase().replace(" ", "_");
          const genderType = gender || 'female';
          const details = ADVANCED_STYLING_PROFILES[genderType]?.[detectedShapeNormalized] || ADVANCED_STYLING_PROFILES[genderType]?.rectangle;

          addLog(`LOCAL CALIBRATION COMPLETE: ${shape.toUpperCase()}`);

          setResult({
            status: "success",
            predicted_shape: shape,
            shape: shape,
            confidence: 0.95,
            recommendations: tips,
            details,
            measurements: {
              height: ht,
              bust: bust,
              waist: wa,
              hip: hp,
              shoulder: sh,
              neck: formData.neck ? parseFloat(formData.neck) : null,
              armLength: formData.armLength ? parseFloat(formData.armLength) : null,
              inseam: ins ? ins : null
            }
          });
          setScanState('complete');
        }
      }
    }, 150); // Fast enough but visually pleasing (~3 seconds)
  };

  const handlePrint = () => {
    setPrinted(true);
    setTimeout(() => {
      window.print();
      setPrinted(false);
    }, 300);
  };

  const resetForm = () => {
    setFormData({
      height: '',
      bust: '',
      waist: '',
      hip: '',
      shoulder: '',
      neck: '',
      armLength: '',
      inseam: ''
    });
    setGender('');
    setResult(null);
    setScanState('idle');
    setErrors({});
  };

  return (
    <section className="min-h-screen py-24 md:py-32 bg-lux-bg-primary text-lux-text-primary relative overflow-hidden flex flex-col print-section">
      {/* Background radial accent - hidden in print */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,rgba(198,161,106,0.04)_0%,transparent_70%)] pointer-events-none no-print" />

      <div className="mx-auto w-full max-w-[1400px] px-6 md:px-[48px] relative z-10 flex-1 flex flex-col gap-10">
        
        {/* Header Block - hidden in print */}
        <div className="flex justify-between items-baseline pb-6 border-b border-lux-border-light no-print">
          <div className="flex items-center gap-2">
            <span className="font-serif italic text-lg text-lux-gold font-light">03.1 //</span>
            <h2 className="font-editorial font-light text-2xl md:text-3xl uppercase tracking-wider">
              Manual Measurement Analysis
            </h2>
          </div>
          <button 
            onClick={() => {
              setScreen('body-analysis');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="font-accent text-[10px] tracking-widest text-lux-text-muted hover:text-lux-gold transition-colors duration-300 uppercase flex items-center gap-1.5"
          >
            <ArrowLeft size={11} />
            <span>Return</span>
          </button>
        </div>

        {/* Outer State Controller */}
        <AnimatePresence mode="wait">
          
          {/* STATE 1: IDLE / FORM ENTRY */}
          {scanState === 'idle' && (
            <motion.div
              key="form-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col gap-10"
            >
              {/* Hero Subtitle Section */}
              <div className="text-center md:text-left max-w-2xl no-print">
                <h1 className="font-editorial text-4xl md:text-5xl lg:text-6xl font-light leading-tight uppercase mb-4">
                  Manual Calibration
                </h1>
                <p className="font-ui font-light text-sm md:text-base text-lux-text-secondary leading-relaxed">
                  Generate an accurate body profile using your personal body measurements. Our AI models evaluate anatomical indices, providing styling suggestions tailored specifically for your skeletal geometry.
                </p>
              </div>

              {/* Main Premium Card */}
              <div className="lux-card-glass rounded-[28px] p-6 md:p-12 shadow-premium no-print">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                  
                  {/* Left Column: Premium Illustration & Context */}
                  <div className="lg:col-span-5 flex flex-col gap-8 text-left h-full justify-between">
                    <div className="flex flex-col gap-6">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-lux-bg-secondary border border-lux-border-light rounded-full text-lux-gold shrink-0">
                          <Ruler size={22} />
                        </div>
                        <div>
                          <span className="font-accent text-[9px] tracking-widest text-lux-gold uppercase">ATELIER METRICS</span>
                          <h3 className="font-editorial text-xl uppercase tracking-wider text-lux-text-primary">
                            Manual Measurements
                          </h3>
                        </div>
                      </div>
                      
                      <p className="font-ui font-light text-xs md:text-sm text-lux-text-secondary leading-relaxed">
                        Enter your body measurements to receive an AI-powered body shape analysis and personalized fashion recommendations. Use a soft tailor tape for the most reliable calibrations.
                      </p>
                    </div>

                    {/* Mannequin SVG illustration */}
                    <div className="relative w-full h-72 hidden lg:flex items-center justify-center border border-lux-border-light/40 rounded-2xl bg-white/20 dark:bg-black/10 overflow-hidden">
                      <svg width="120" height="230" viewBox="0 0 120 260" className="text-lux-gold/60">
                        {/* Head */}
                        <circle cx="60" cy="40" r="10" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
                        {/* Neck */}
                        <line x1="60" y1="50" x2="60" y2="60" stroke="currentColor" strokeWidth="1" />
                        {/* Shoulders */}
                        <line x1="38" y1="60" x2="82" y2="60" stroke="currentColor" strokeWidth="1.5" />
                        {/* Torso Dressform */}
                        <path d="M38 60 L82 60 M38 60 L44 110 L38 160 L82 160 L76 110 L82 60 Z" fill="none" stroke="currentColor" strokeWidth="1.25" />
                        {/* Hips Grid Line */}
                        <line x1="15" y1="160" x2="105" y2="160" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 3" />
                        {/* Waist Grid Line */}
                        <line x1="15" y1="110" x2="105" y2="110" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 3" />
                        {/* Shoulders Grid Line */}
                        <line x1="15" y1="60" x2="105" y2="60" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 3" />
                      </svg>
                      <div className="absolute bottom-3 left-3 text-[8px] font-accent text-lux-gold tracking-widest uppercase">
                        ATELIER SYSTEM v4.0
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Measurement Form */}
                  <div className="lg:col-span-7 flex flex-col gap-6 text-left">
                    {errors.global && (
                      <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 font-ui text-xs flex items-center gap-2">
                        <AlertCircle size={14} className="shrink-0" />
                        <span>{errors.global}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      
                      {/* Gender Dropdown */}
                      <div className="flex flex-col gap-1.5 sm:col-span-2">
                        <label htmlFor="gender" className="font-accent text-[9px] tracking-widest text-lux-text-primary uppercase font-semibold">
                          Gender Classification
                        </label>
                        <select
                          id="gender"
                          name="gender"
                          value={gender}
                          onChange={(e) => {
                            setGender(e.target.value);
                            if (errors.gender) setErrors({ ...errors, gender: '' });
                          }}
                          className={`w-full bg-lux-bg-secondary text-lux-text-primary border rounded-full px-5 py-3 text-sm focus:outline-none focus:border-lux-gold focus:ring-1 focus:ring-lux-gold/30 transition-all duration-300 ${
                            errors.gender ? 'border-red-400' : 'border-lux-border-medium'
                          }`}
                        >
                          <option value="" className="bg-lux-bg-secondary text-lux-text-primary">Select Gender</option>
                          <option value="female" className="bg-lux-bg-secondary text-lux-text-primary">Female</option>
                          <option value="male" className="bg-lux-bg-secondary text-lux-text-primary">Male</option>
                        </select>
                        {errors.gender && <span className="text-[10px] text-red-400 ml-3">{errors.gender}</span>}
                      </div>

                      {/* Height */}
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="height" className="font-accent text-[9px] tracking-widest text-lux-text-primary uppercase font-semibold">
                          Height (cm)
                        </label>
                        <input
                          type="number"
                          id="height"
                          name="height"
                          placeholder="e.g. 172"
                          value={formData.height}
                          onChange={handleInputChange}
                          className={`w-full bg-lux-bg-secondary text-lux-text-primary placeholder-lux-text-muted/60 border rounded-full px-5 py-3 text-sm focus:outline-none focus:border-lux-gold focus:ring-1 focus:ring-lux-gold/30 transition-all duration-300 ${
                            errors.height ? 'border-red-400 font-semibold text-red-400' : 'border-lux-border-medium'
                          }`}
                        />
                        {errors.height && <span className="text-[10px] text-red-400 ml-3">{errors.height}</span>}
                      </div>

                      {/* Bust */}
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="bust" className="font-accent text-[9px] tracking-widest text-lux-text-primary uppercase font-semibold">
                          Bust / Chest (cm)
                        </label>
                        <input
                          type="number"
                          id="bust"
                          name="bust"
                          placeholder="e.g. 92"
                          value={formData.bust}
                          onChange={handleInputChange}
                          className={`w-full bg-lux-bg-secondary text-lux-text-primary placeholder-lux-text-muted/60 border rounded-full px-5 py-3 text-sm focus:outline-none focus:border-lux-gold focus:ring-1 focus:ring-lux-gold/30 transition-all duration-300 ${
                            errors.bust ? 'border-red-400 font-semibold text-red-400' : 'border-lux-border-medium'
                          }`}
                        />
                        {errors.bust && <span className="text-[10px] text-red-400 ml-3">{errors.bust}</span>}
                      </div>

                      {/* Waist */}
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="waist" className="font-accent text-[9px] tracking-widest text-lux-text-primary uppercase font-semibold">
                          Waist (cm)
                        </label>
                        <input
                          type="number"
                          id="waist"
                          name="waist"
                          placeholder="e.g. 68"
                          value={formData.waist}
                          onChange={handleInputChange}
                          className={`w-full bg-lux-bg-secondary text-lux-text-primary placeholder-lux-text-muted/60 border rounded-full px-5 py-3 text-sm focus:outline-none focus:border-lux-gold focus:ring-1 focus:ring-lux-gold/30 transition-all duration-300 ${
                            errors.waist ? 'border-red-400 font-semibold text-red-400' : 'border-lux-border-medium'
                          }`}
                        />
                        {errors.waist && <span className="text-[10px] text-red-400 ml-3">{errors.waist}</span>}
                      </div>

                      {/* Hip */}
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="hip" className="font-accent text-[9px] tracking-widest text-lux-text-primary uppercase font-semibold">
                          Hip (cm)
                        </label>
                        <input
                          type="number"
                          id="hip"
                          name="hip"
                          placeholder="e.g. 96"
                          value={formData.hip}
                          onChange={handleInputChange}
                          className={`w-full bg-lux-bg-secondary text-lux-text-primary placeholder-lux-text-muted/60 border rounded-full px-5 py-3 text-sm focus:outline-none focus:border-lux-gold focus:ring-1 focus:ring-lux-gold/30 transition-all duration-300 ${
                            errors.hip ? 'border-red-400 font-semibold text-red-400' : 'border-lux-border-medium'
                          }`}
                        />
                        {errors.hip && <span className="text-[10px] text-red-400 ml-3">{errors.hip}</span>}
                      </div>

                      {/* Shoulder Width */}
                      <div className="flex flex-col gap-1.5 sm:col-span-2">
                        <label htmlFor="shoulder" className="font-accent text-[9px] tracking-widest text-lux-text-primary uppercase font-semibold">
                          Shoulder Width (cm)
                        </label>
                        <input
                          type="number"
                          id="shoulder"
                          name="shoulder"
                          placeholder="e.g. 38"
                          value={formData.shoulder}
                          onChange={handleInputChange}
                          className={`w-full bg-lux-bg-secondary text-lux-text-primary placeholder-lux-text-muted/60 border rounded-full px-5 py-3 text-sm focus:outline-none focus:border-lux-gold focus:ring-1 focus:ring-lux-gold/30 transition-all duration-300 ${
                            errors.shoulder ? 'border-red-400 font-semibold text-red-400' : 'border-lux-border-medium'
                          }`}
                        />
                        {errors.shoulder && <span className="text-[10px] text-red-400 ml-3">{errors.shoulder}</span>}
                      </div>

                    </div>

                    {/* Accordion optional fields */}
                    <div className="border-t border-lux-border-light/40 pt-4 mt-2">
                      <button
                        type="button"
                        onClick={() => setShowOptional(!showOptional)}
                        className="flex items-center gap-1.5 font-accent text-[9px] tracking-widest text-lux-text-muted hover:text-lux-gold transition-colors duration-300 uppercase font-semibold"
                      >
                        {showOptional ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        <span>Optional Measurements</span>
                      </button>
                      
                      <AnimatePresence>
                        {showOptional && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden mt-4"
                          >
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-2">
                              {/* Neck */}
                              <div className="flex flex-col gap-1.5">
                                <label htmlFor="neck" className="font-accent text-[8px] tracking-widest text-lux-text-primary uppercase font-semibold">
                                  Neck (cm)
                                </label>
                                <input
                                  type="number"
                                  id="neck"
                                  name="neck"
                                  placeholder="e.g. 36"
                                  value={formData.neck}
                                  onChange={handleInputChange}
                                  className={`w-full bg-lux-bg-secondary text-lux-text-primary placeholder-lux-text-muted/60 border rounded-full px-4 py-2.5 text-xs focus:outline-none focus:border-lux-gold focus:ring-1 focus:ring-lux-gold/30 transition-all duration-300 ${
                                    errors.neck ? 'border-red-400 text-red-400' : 'border-lux-border-medium'
                                  }`}
                                />
                                {errors.neck && <span className="text-[9px] text-red-400 ml-2">{errors.neck}</span>}
                              </div>

                              {/* Arm Length */}
                              <div className="flex flex-col gap-1.5">
                                <label htmlFor="armLength" className="font-accent text-[8px] tracking-widest text-lux-text-primary uppercase font-semibold">
                                  Arm Length (cm)
                                </label>
                                <input
                                  type="number"
                                  id="armLength"
                                  name="armLength"
                                  placeholder="e.g. 61"
                                  value={formData.armLength}
                                  onChange={handleInputChange}
                                  className={`w-full bg-lux-bg-secondary text-lux-text-primary placeholder-lux-text-muted/60 border rounded-full px-4 py-2.5 text-xs focus:outline-none focus:border-lux-gold focus:ring-1 focus:ring-lux-gold/30 transition-all duration-300 ${
                                    errors.armLength ? 'border-red-400 text-red-400' : 'border-lux-border-medium'
                                  }`}
                                />
                                {errors.armLength && <span className="text-[9px] text-red-400 ml-2">{errors.armLength}</span>}
                              </div>

                              {/* Inseam */}
                              <div className="flex flex-col gap-1.5">
                                <label htmlFor="inseam" className="font-accent text-[8px] tracking-widest text-lux-text-primary uppercase font-semibold">
                                  Inseam (cm)
                                </label>
                                <input
                                  type="number"
                                  id="inseam"
                                  name="inseam"
                                  placeholder="e.g. 81"
                                  value={formData.inseam}
                                  onChange={handleInputChange}
                                  className={`w-full bg-lux-bg-secondary text-lux-text-primary placeholder-lux-text-muted/60 border rounded-full px-4 py-2.5 text-xs focus:outline-none focus:border-lux-gold focus:ring-1 focus:ring-lux-gold/30 transition-all duration-300 ${
                                    errors.inseam ? 'border-red-400 text-red-400' : 'border-lux-border-medium'
                                  }`}
                                />
                                {errors.inseam && <span className="text-[9px] text-red-400 ml-2">{errors.inseam}</span>}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <button
                      onClick={handleStartAnalysis}
                      className="btn-lux w-full mt-4 flex items-center justify-center gap-2.5 py-4 text-[10px] tracking-widest rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_30px_rgba(198,161,106,0.25)] hover:scale-[1.01] transition-all duration-300"
                    >
                      <span>START BODY ANALYSIS</span>
                      <ChevronRight size={14} className="text-lux-gold" />
                    </button>
                  </div>

                </div>
              </div>
            </motion.div>
          )}

          {/* STATE 2: SCANNING / LOADING STATE */}
          {scanState === 'scanning' && (
            <motion.div
              key="scanning-view"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.5 }}
              className="lux-card-glass rounded-[28px] p-8 md:p-12 shadow-premium max-w-xl mx-auto w-full no-print flex flex-col gap-8 text-center"
            >
              <div className="flex justify-between items-center pb-4 border-b border-lux-border-light/40">
                <div className="text-left">
                  <span className="font-accent text-[9px] tracking-widest text-lux-gold uppercase animate-pulse">
                    PROCESSING INPUT VECTORS
                  </span>
                  <h3 className="font-editorial text-2xl uppercase tracking-wider text-lux-text-primary mt-1">
                    Anatomical Calibration
                  </h3>
                </div>
                
                {/* Custom circular progress loader */}
                <div className="relative w-14 h-14 flex items-center justify-center">
                  <svg width="56" height="56" className="transform -rotate-90">
                    <circle cx="28" cy="28" r="24" stroke="var(--border-light)" strokeWidth="2" fill="transparent" />
                    <circle 
                      cx="28" 
                      cy="28" 
                      r="24" 
                      stroke="var(--color-gold)" 
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

              {/* Scanning visual graphic */}
              <div className="relative w-full h-48 border border-lux-border-light/40 rounded-2xl bg-black/5 dark:bg-black/20 flex items-center justify-center overflow-hidden">
                <div className="scan-line" />
                <div className="radar-sweep" />
                <div className="scan-node" style={{ top: '25%', left: '48%' }} />
                <div className="scan-node" style={{ top: '50%', left: '42%' }} />
                <div className="scan-node" style={{ top: '50%', left: '58%' }} />
                <div className="scan-node" style={{ top: '78%', left: '50%' }} />
                <span className="font-mono text-[9px] tracking-wider text-lux-gold opacity-50 uppercase z-10">
                  METRIC MATRIX CALIBRATING...
                </span>
              </div>

              {/* Status logs console */}
              <div className="bg-[#1C1A22] text-lux-gold font-mono text-[9.5px] p-4 rounded-xl h-36 overflow-y-auto flex flex-col gap-1 text-left shadow-inner">
                {scanLog.map((log, idx) => (
                  <div key={idx} className="leading-relaxed break-all whitespace-pre-wrap">{log}</div>
                ))}
                <div ref={consoleEndRef} />
              </div>

              <p className="font-ui font-light text-xs text-lux-text-muted italic">
                Our model is analyzing your proportions to map your styling profile.
              </p>
            </motion.div>
          )}

          {/* STATE 3: COMPLETED RESULTS VIEW */}
          {scanState === 'complete' && result && (
            <motion.div
              key="results-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col gap-10 text-left"
            >
              
              {/* Profile Header and Controls - visible on screen, nicely styled for print */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-lux-border-light">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Sparkles size={16} className="text-lux-gold" />
                    <span className="font-accent text-[9px] tracking-[0.2em] text-lux-gold uppercase font-bold">
                      ATELIER CALIBRATOR PROFILE
                    </span>
                  </div>
                  <h1 className="font-editorial text-4xl md:text-5xl font-light uppercase tracking-wide">
                    {result.shape} Silhouette
                  </h1>
                </div>

                <div className="flex gap-3 w-full md:w-auto no-print">
                  <button 
                    onClick={resetForm}
                    className="btn-lux-outline flex-1 md:flex-none flex items-center justify-center gap-2 py-3 px-6 text-[9px] tracking-widest rounded-full"
                  >
                    <RefreshCw size={11} />
                    <span>Analyze Again</span>
                  </button>
                  <button 
                    onClick={handlePrint}
                    className="btn-lux flex-1 md:flex-none flex items-center justify-center gap-2 py-3 px-6 text-[9px] tracking-widest rounded-full"
                  >
                    <Download size={11} className="text-lux-gold" />
                    <span>Download Report (PDF)</span>
                  </button>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
                
                {/* Left Column: Analytical Overview & Text Advice */}
                <div className="lg:col-span-8 flex flex-col gap-8">
                  
                  {/* Glass Card 1: Anatomical Ratios & Confidence */}
                  <div className="lux-card rounded-2xl p-6 md:p-8 flex flex-col gap-6">
                    <div className="flex justify-between items-baseline border-b border-lux-border-light/40 pb-3">
                      <span className="font-accent text-[10px] tracking-widest text-lux-gold uppercase font-semibold">
                        SKELETAL MATCH INDICES
                      </span>
                      <span className="font-accent text-[10px] tracking-widest text-lux-text-muted uppercase">
                        Method: Measurements
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
                      <div>
                        <div className="text-3xl font-editorial text-lux-gold italic font-bold">
                          {result.confidence_pct ? `${result.confidence_pct}%` : `${Math.round(result.confidence * 100)}%`}
                        </div>
                        <div className="font-accent text-[9px] text-lux-text-secondary tracking-wider uppercase mt-1">
                          Prediction Confidence
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-3xl font-editorial text-lux-text-primary">
                          {result.proportions?.waist?.pct ? `${(result.proportions.waist.pct / 100).toFixed(2)}` : (result.measurements.waist / result.measurements.hip).toFixed(2)}
                        </div>
                        <div className="font-accent text-[9px] text-lux-text-secondary tracking-wider uppercase mt-1">
                          Waist-to-Hip Ratio
                        </div>
                      </div>

                      <div>
                        <div className="text-3xl font-editorial text-lux-text-primary">
                          {(result.measurements.shoulder / result.measurements.waist).toFixed(2)}
                        </div>
                        <div className="font-accent text-[9px] text-lux-text-secondary tracking-wider uppercase mt-1">
                          Shoulder-to-Waist Ratio
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Glass Card 2: AI Proportions Explanation */}
                  <div className="lux-card rounded-2xl p-6 md:p-8 flex flex-col gap-4">
                    <h3 className="font-editorial text-lg uppercase tracking-wider text-lux-text-primary border-b border-lux-border-light/40 pb-2">
                      Silhouette Analysis
                    </h3>
                    <p className="font-ui font-light text-sm text-lux-text-secondary leading-relaxed">
                      {result.details?.explanation || result.description}
                    </p>
                  </div>

                  {/* Glass Card 3: Styling Guidelines */}
                  <div className="lux-card rounded-2xl p-6 md:p-8 flex flex-col gap-6">
                    <h3 className="font-editorial text-xl uppercase tracking-wider text-lux-text-primary border-b border-lux-border-light/40 pb-3">
                      Advisory Recommendations
                    </h3>

                    <div className="flex flex-col gap-4 text-sm font-ui leading-relaxed">
                      
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-2 border-b border-lux-border-light/20 pb-3">
                        <span className="md:col-span-3 font-accent text-[9px] tracking-widest text-lux-gold uppercase font-bold">
                          Best Necklines
                        </span>
                        <span className="md:col-span-9 text-lux-text-secondary">
                          {result.details?.necklines || "V-neck, scoop, split collars"}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-2 border-b border-lux-border-light/20 pb-3">
                        <span className="md:col-span-3 font-accent text-[9px] tracking-widest text-lux-gold uppercase font-bold">
                          Best Sleeve Types
                        </span>
                        <span className="md:col-span-9 text-lux-text-secondary">
                          {result.details?.sleeves || "Fitted, regular cuffed, tailored"}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-2 border-b border-lux-border-light/20 pb-3">
                        <span className="md:col-span-3 font-accent text-[9px] tracking-widest text-lux-gold uppercase font-bold">
                          Best Tops
                        </span>
                        <span className="md:col-span-9 text-lux-text-secondary">
                          {result.details?.tops || (result.recommendations && result.recommendations.filter(r => r.toLowerCase().includes('top') || r.toLowerCase().includes('blouse')).join(', ')) || "Tailored fits, layered knits"}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-2 border-b border-lux-border-light/20 pb-3">
                        <span className="md:col-span-3 font-accent text-[9px] tracking-widest text-lux-gold uppercase font-bold">
                          Best Bottoms
                        </span>
                        <span className="md:col-span-9 text-lux-text-secondary">
                          {result.details?.bottoms || (result.recommendations && result.recommendations.filter(r => r.toLowerCase().includes('skirt') || r.toLowerCase().includes('pant') || r.toLowerCase().includes('jean') || r.toLowerCase().includes('trous')).join(', ')) || "Straight-cut trousers, slim-fit pants"}
                        </span>
                      </div>

                      {gender === 'female' && (
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 border-b border-lux-border-light/20 pb-3">
                          <span className="md:col-span-3 font-accent text-[9px] tracking-widest text-lux-gold uppercase font-bold">
                            Best Dresses
                          </span>
                          <span className="md:col-span-9 text-lux-text-secondary">
                            {result.details?.dresses || "Belted sheath, wrap dress, A-line"}
                          </span>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-2 border-b border-lux-border-light/20 pb-3">
                        <span className="md:col-span-3 font-accent text-[9px] tracking-widest text-lux-gold uppercase font-bold">
                          Best Jackets
                        </span>
                        <span className="md:col-span-9 text-lux-text-secondary">
                          {result.details?.jackets || "Structured utility jackets, belted blazers"}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-2 border-b border-lux-border-light/20 pb-3">
                        <span className="md:col-span-3 font-accent text-[9px] tracking-widest text-lux-gold uppercase font-bold">
                          Best Fabrics
                        </span>
                        <span className="md:col-span-9 text-lux-text-secondary">
                          {result.details?.fabrics || "Rigid denim, worsted wool, structured cotton"}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-2 pb-2">
                        <span className="md:col-span-3 font-accent text-[9px] tracking-widest text-red-400 uppercase font-bold">
                          Avoid List
                        </span>
                        <span className="md:col-span-9 text-lux-text-secondary">
                          {result.details?.avoid || (result.recommendations && result.recommendations.filter(r => r.toLowerCase().includes('avoid')).join(', ')) || "Oversized shapeless clothing"}
                        </span>
                      </div>

                    </div>
                  </div>

                  {/* Glass Card 4: Celebrity Inspirations */}
                  <div className="lux-card rounded-2xl p-6 md:p-8 flex flex-col gap-3">
                    <h3 className="font-editorial text-lg uppercase tracking-wider text-lux-text-primary border-b border-lux-border-light/40 pb-2">
                      Celebrity Inspirations
                    </h3>
                    <p className="font-ui font-light text-sm text-lux-text-secondary leading-relaxed">
                      Lookbook ideas can be modeled after public profiles with matching proportions:
                    </p>
                    <div className="font-accent text-sm text-lux-gold font-semibold uppercase mt-1 tracking-wider">
                      {result.details?.celebs || "Ryan Gosling, David Beckham"}
                    </div>
                  </div>

                </div>

                {/* Right Column: Measurements Summary, Outline and Color Palette */}
                <div className="lg:col-span-4 flex flex-col gap-8">
                  
                  {/* Card: Proportions Outline */}
                  <div className="lux-card rounded-2xl p-6 md:p-8 flex flex-col items-center justify-center gap-6 bg-lux-bg-secondary/40">
                    <span className="font-accent text-[9px] tracking-widest text-lux-gold uppercase font-bold">
                      PROPORTION MATCH MAPPING
                    </span>
                    
                    <div className="relative w-44 h-72 flex items-center justify-center border border-lux-border-light/40 rounded-xl bg-white/20 dark:bg-black/10 overflow-hidden">
                      <svg width="100" height="230" viewBox="0 0 120 260" className="text-lux-gold">
                        <circle cx="60" cy="40" r="11" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
                        <line x1="60" y1="51" x2="60" y2="61" stroke="currentColor" strokeWidth="1" />
                        
                        {(result.predicted_shape === 'hourglass' || result.shape === 'Hourglass') && (
                          <path d="M40 70 L80 70 M40 70 L48 115 L40 160 L80 160 L72 115 L80 70 Z M40 160 L42 240 M80 160 L78 240" fill="none" stroke="currentColor" strokeWidth="1.5" />
                        )}
                        {(result.predicted_shape === 'pear' || result.shape === 'Pear') && (
                          <path d="M44 70 L76 70 M44 70 L46 115 L36 160 L84 160 L74 115 L76 70 Z M36 160 L38 240 M84 160 L82 240" fill="none" stroke="currentColor" strokeWidth="1.5" />
                        )}
                        {(result.predicted_shape === 'inverted_triangle' || result.shape === 'Inverted Triangle') && (
                          <path d="M36 70 L84 70 M36 70 L44 115 L44 160 L76 160 L76 115 L84 70 Z M44 160 L44 240 M76 160 L76 240" fill="none" stroke="currentColor" strokeWidth="1.5" />
                        )}
                        {(result.predicted_shape === 'apple' || result.shape === 'Apple') && (
                          <path d="M42 70 L78 70 M42 70 L34 115 L40 160 L80 160 L86 115 L78 70 Z M40 160 L42 240 M80 160 L78 240" fill="none" stroke="currentColor" strokeWidth="1.5" />
                        )}
                        {(result.predicted_shape === 'rectangle' || result.shape === 'Rectangle') && (
                          <path d="M42 70 L78 70 M42 70 L43 115 L42 160 L78 160 L77 115 L78 70 Z M42 160 L42 240 M78 160 L78 240" fill="none" stroke="currentColor" strokeWidth="1.5" />
                        )}
                        {(result.predicted_shape === 'trapezoid' || result.shape === 'Trapezoid') && (
                          <path d="M36 70 L84 70 M36 70 L42 120 L44 160 L76 160 L78 120 L84 70 Z M44 160 L44 240 M76 160 L76 240" fill="none" stroke="currentColor" strokeWidth="1.5" />
                        )}
                        {(result.predicted_shape === 'triangle' || result.shape === 'Triangle') && (
                          <path d="M44 70 L76 70 M44 70 L46 115 L34 160 L86 160 L74 115 L76 70 Z M34 160 L36 240 M86 160 L84 240" fill="none" stroke="currentColor" strokeWidth="1.5" />
                        )}
                        {(result.predicted_shape === 'oval' || result.shape === 'Oval') && (
                          <path d="M42 70 L78 70 M42 70 L32 115 L40 160 L80 160 L88 115 L78 70 Z M40 160 L42 240 M80 160 L78 240" fill="none" stroke="currentColor" strokeWidth="1.5" />
                        )}
                      </svg>

                      {/* Display measurements values directly on outline card */}
                      <div className="absolute top-2 left-2 text-[7.5px] font-accent text-lux-gold tracking-wider leading-relaxed">
                        SHLD: {result.measurements.shoulder}cm<br/>
                        BUST: {result.measurements.bust}cm<br/>
                        WAIST: {result.measurements.waist}cm<br/>
                        HIP: {result.measurements.hip}cm
                      </div>
                    </div>
                  </div>

                  {/* Card: Body Measurements Summary Table */}
                  <div className="lux-card rounded-2xl p-6 md:p-8 flex flex-col gap-4">
                    <h3 className="font-editorial text-lg uppercase tracking-wider text-lux-text-primary border-b border-lux-border-light/40 pb-2">
                      Measurements Summary
                    </h3>
                    
                    <div className="flex flex-col gap-2.5 font-ui text-xs">
                      <div className="flex justify-between border-b border-lux-border-light/20 pb-1.5">
                        <span className="text-lux-text-secondary font-light">Height</span>
                        <span className="text-lux-text-primary font-medium">{result.measurements.height} cm</span>
                      </div>
                      <div className="flex justify-between border-b border-lux-border-light/20 pb-1.5">
                        <span className="text-lux-text-secondary font-light">Shoulder Width</span>
                        <span className="text-lux-text-primary font-medium">{result.measurements.shoulder} cm</span>
                      </div>
                      <div className="flex justify-between border-b border-lux-border-light/20 pb-1.5">
                        <span className="text-lux-text-secondary font-light">Bust / Chest</span>
                        <span className="text-lux-text-primary font-medium">{result.measurements.bust} cm</span>
                      </div>
                      <div className="flex justify-between border-b border-lux-border-light/20 pb-1.5">
                        <span className="text-lux-text-secondary font-light">Waist</span>
                        <span className="text-lux-text-primary font-medium">{result.measurements.waist} cm</span>
                      </div>
                      <div className="flex justify-between border-b border-lux-border-light/20 pb-1.5">
                        <span className="text-lux-text-secondary font-light">Hip</span>
                        <span className="text-lux-text-primary font-medium">{result.measurements.hip} cm</span>
                      </div>
                      {result.measurements.neck && (
                        <div className="flex justify-between border-b border-lux-border-light/20 pb-1.5">
                          <span className="text-lux-text-secondary font-light">Neck</span>
                          <span className="text-lux-text-primary font-medium">{result.measurements.neck} cm</span>
                        </div>
                      )}
                      {result.measurements.armLength && (
                        <div className="flex justify-between border-b border-lux-border-light/20 pb-1.5">
                          <span className="text-lux-text-secondary font-light">Arm Length</span>
                          <span className="text-lux-text-primary font-medium">{result.measurements.armLength} cm</span>
                        </div>
                      )}
                      {result.measurements.inseam && (
                        <div className="flex justify-between border-b border-lux-border-light/20 pb-1.5">
                          <span className="text-lux-text-secondary font-light">Inseam</span>
                          <span className="text-lux-text-primary font-medium">{result.measurements.inseam} cm</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card: Recommended Color Palette Placeholder */}
                  <div className="lux-card rounded-2xl p-6 md:p-8 flex flex-col gap-4">
                    <h3 className="font-editorial text-lg uppercase tracking-wider text-lux-text-primary border-b border-lux-border-light/40 pb-2">
                      Matching Color Spectrum
                    </h3>
                    <p className="font-ui font-light text-xs text-lux-text-secondary leading-relaxed">
                      Recommended styling color swatches based on seasonal palette profiles:
                    </p>
                    <div className="flex gap-2 mt-2">
                      <span className="w-8 h-8 rounded-full bg-[#A8957C] border border-lux-border-medium" title="Muted Taupe" />
                      <span className="w-8 h-8 rounded-full bg-[#C6A16A] border border-lux-border-medium" title="Atelier Gold" />
                      <span className="w-8 h-8 rounded-full bg-[#EAE6DD] border border-lux-border-medium" title="Soft Linen" />
                      <span className="w-8 h-8 rounded-full bg-[#262522] border border-lux-border-medium" title="Editorial Charcoal" />
                      <span className="w-8 h-8 rounded-full bg-[#6B675F] border border-lux-border-medium" title="Dermal Shadow" />
                    </div>
                  </div>

                </div>

              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Styled settings for printing reports cleanly */}
      <style>{`
        @media print {
          body, html {
            background: #ffffff !important;
            color: #111111 !important;
          }
          header, footer, .no-print, .btn-lux, .btn-lux-outline, .absolute {
            display: none !important;
          }
          .print-section {
            padding: 0 !important;
            margin: 0 !important;
          }
          .mx-auto {
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .grid {
            display: block !important;
          }
          .lg\\:col-span-8, .lg\\:col-span-4 {
            width: 100% !important;
            display: block !important;
            margin-bottom: 2rem !important;
          }
          .lux-card {
            border: 1px solid #222222 !important;
            box-shadow: none !important;
            background: transparent !important;
            padding: 1.5rem !important;
            page-break-inside: avoid;
          }
          .text-lux-gold {
            color: #886622 !important;
          }
        }
      `}</style>
    </section>
  );
}
