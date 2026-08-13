import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import gsap from 'gsap';
import OptionWheel from './OptionWheel';
import LiquidEther from './LiquidEther';

const WHEEL_ITEMS = [
  {
    title: "AI Stylist",
    category: "AI Fashion Intelligence",
    heading: "Your Personal AI Stylist",
    description: "Receive intelligent outfit recommendations tailored to your wardrobe, personality, lifestyle and preferences.",
    features: ["Personalized Styling", "Smart Outfit Suggestions", "Fashion Insights", "AI Recommendations"],
    image: "/ai_stylist.jpg"
  },
  {
    title: "Body Shape Analysis",
    category: "Silhouette Mapping",
    heading: "Understand Your Perfect Fit",
    description: "Analyze body proportions to receive silhouettes and outfit recommendations that naturally complement your shape.",
    features: ["Body Mapping", "Fit Suggestions", "Tailoring Advice", "Smart Measurements"],
    image: "/body_shape.jpg"
  },
  {
    title: "Color Intelligence",
    category: "Chromatic Calibration",
    heading: "Colors That Define You",
    description: "Discover colours that naturally enhance your appearance using intelligent palette analysis and seasonal recommendations.",
    features: ["Personal Palette", "Seasonal Colors", "Skin Tone Analysis", "Smart Matching"],
    image: "/color_intelligence.jpg"
  },
  {
    title: "Virtual Wardrobe",
    category: "Digital Apparel Management",
    heading: "Your Digital Closet",
    description: "Store, organize and style your wardrobe effortlessly with AI-powered outfit combinations.",
    features: ["Outfit Builder", "Closet Organizer", "Mix & Match", "Smart Collections"],
    image: "/virtual_wardrobe.jpg"
  },
  {
    title: "Trend Radar",
    category: "Aesthetic Forecasting",
    heading: "Stay Ahead Of Fashion",
    description: "Explore global trends curated through AI and fashion intelligence before they become mainstream.",
    features: ["Runway Trends", "Fashion News", "Seasonal Picks", "Trend Forecasts"],
    image: "/trend_radar.jpg"
  },
  {
    title: "Style DNA",
    category: "Aesthetic Identity",
    heading: "Your Unique Style DNA",
    description: "Understand your fashion identity through intelligent analysis of preferences, lifestyle and wardrobe choices.",
    features: ["Style Personality", "Fashion Identity", "Preference Analysis", "Signature Looks"],
    image: "/style_dna.jpg"
  },
  {
    title: "Occasion Styling",
    category: "Contextual Dressing",
    heading: "Dress For Every Moment",
    description: "Receive curated outfit recommendations for every occasion with effortless elegance.",
    features: ["Casual Wear", "Workwear", "Evening Looks", "Celebration Outfits"],
    image: "/occasion_styling.jpg"
  },
  {
    title: "Capsule Closet",
    category: "Minimalist Wardrobe",
    heading: "Build A Timeless Wardrobe",
    description: "Create a versatile capsule wardrobe with fewer pieces that work beautifully together.",
    features: ["Essential Pieces", "Wardrobe Planning", "Minimal Fashion", "Smart Shopping"],
    image: "/capsule_closet.jpg"
  }
];

export default function About({ theme }) {
  const containerRef = useRef(null);
  const headingRef = useRef(null);
  const descriptionRef = useRef(null);
  const featuresRef = useRef(null);
  const imageContainerRef = useRef(null);

  const [activeIdx, setActiveIdx] = useState(0);
  const [prevIdx, setPrevIdx] = useState(0);
  const [wheelParams, setWheelParams] = useState({
    fontSize: 3.2,
    spacing: 1.45,
    inset: 30,
    tilt: 8
  });

  const isDark = theme === 'dark';

  // Smooth mouse-parallax coordinates for the image display card
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const imageX = useTransform(mouseX, [-300, 300], [-10, 10]);
  const imageY = useTransform(mouseY, [-300, 300], [-10, 10]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    gsap.to(mouseX, { value: 0, duration: 0.6, ease: 'power2.out' });
    gsap.to(mouseY, { value: 0, duration: 0.6, ease: 'power2.out' });
  };

  // Responsively scale option wheel params on viewports to prevent clipping
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w < 768) {
        setWheelParams({
          fontSize: 1.6,
          spacing: 1.4,
          inset: 10,
          tilt: 6
        });
      } else if (w < 1200) {
        setWheelParams({
          fontSize: 2.2,
          spacing: 1.45,
          inset: 15,
          tilt: 7
        });
      } else {
        setWheelParams({
          fontSize: 3.2,
          spacing: 1.45,
          inset: 20,
          tilt: 8
        });
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // GSAP animation triggers whenever activeIdx updates
  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Cross-fade slide-up and scale transition for image shifts
      const oldImg = imageContainerRef.current?.querySelector('.old-image');
      if (oldImg) {
        gsap.fromTo(oldImg, 
          { scale: 1, opacity: 1 },
          { scale: 1.08, opacity: 0, duration: 0.7, ease: 'power3.out' }
        );
      }
      
      const newImg = imageContainerRef.current?.querySelector('.new-image');
      if (newImg) {
        gsap.fromTo(newImg,
          { y: 40, scale: 1.05, opacity: 0 },
          { y: 0, scale: 1, opacity: 1, duration: 0.7, ease: 'power3.out' }
        );
      }

      // 2. Heading Split reveal transition
      if (headingRef.current) {
        gsap.fromTo(headingRef.current,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' }
        );
      }

      // 3. Paragraph fade-up
      if (descriptionRef.current) {
        gsap.fromTo(descriptionRef.current,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', delay: 0.1 }
        );
      }

      // 4. Feature pills staggered entrance
      const pills = featuresRef.current?.querySelectorAll('.feature-pill');
      if (pills && pills.length > 0) {
        gsap.fromTo(pills,
          { y: 15, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out', stagger: 0.08, delay: 0.2 }
        );
      }
    }, containerRef);

    // Track active image layers
    const timer = setTimeout(() => {
      setPrevIdx(activeIdx);
    }, 700);

    return () => {
      ctx.revert();
      clearTimeout(timer);
    };
  }, [activeIdx]);

  const handleWheelChange = (index, item) => {
    setActiveIdx(index);
    // Silent hash update matching editorial flow
    const newHash = `#${item.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    window.history.pushState(null, null, newHash);
  };

  // Background glow palettes representing sections
  const GLOW_COLORS = {
    0: isDark ? ['#24182F', '#4D2F63', '#C8A46B', '#16141C'] : ['#FAF8F5', '#F3EBE0', '#E5D9C4', '#DFC7A5'],
    1: isDark ? ['#1A1525', '#3E2A4F', '#A79DAF', '#2B221D'] : ['#FAF8F5', '#EFEBE4', '#DFD9CE', '#C5BEB0'],
    2: isDark ? ['#3C2A1E', '#C8A46B', '#8A704C', '#FAF8F5'] : ['#FAF8F5', '#F5E6D3', '#EBD2B4', '#DFBCA0'],
    3: isDark ? ['#211E26', '#4D6B5A', '#A3A69C', '#1C1A20'] : ['#FAF8F5', '#EBF2ED', '#D4E2D8', '#BDD0C3'],
    4: isDark ? ['#3E1E4F', '#B58BE6', '#C8A46B', '#24182F'] : ['#FAF8F5', '#F5EBFC', '#EAD4FA', '#D6B4F5'],
    5: isDark ? ['#16141C', '#2F2E36', '#A79DAF', '#FAF8F5'] : ['#FAF8F5', '#F0F0F2', '#E1E1E6', '#CCD0D6'],
    6: isDark ? ['#42213D', '#B58BE6', '#C8A46B', '#1A1525'] : ['#FAF8F5', '#FBEBF6', '#F5D3EE', '#EBAADF'],
    7: isDark ? ['#FAF8F5', '#F3EBE0', '#C8A46B', '#2B221D'] : ['#FAF8F5', '#F3EBE0', '#E5D9C4', '#DFC7A5']
  };

  return (
    <section 
      ref={containerRef}
      id="about"
      className={`relative py-16 md:py-10 overflow-hidden border-b border-lux-border-light select-none transition-colors duration-500 ${
        isDark ? 'bg-[#1A1525] text-[#F5F1EB]' : 'bg-[#FAF8F5] text-[#2B221D]'
      }`}
    >
      {/* Background Liquid Ether - subtle dark/light glow matching active theme */}
      <div className={`absolute inset-0 pointer-events-none z-0 transition-opacity duration-500 ${isDark ? 'opacity-20' : 'opacity-8'} filter blur-[80px]`}>
        <LiquidEther
          colors={GLOW_COLORS[activeIdx] || GLOW_COLORS[0]}
          mouseForce={10}
          cursorSize={60}
          isViscous={false}
          iterationsPoisson={8}
          resolution={0.2}
          isBounce={false}
          autoDemo={true}
          autoSpeed={0.2}
          autoIntensity={1.5}
        />
      </div>

      <div className="editorial-container mx-auto px-6 md:px-[48px] max-w-[1600px] relative z-10">
        
        {/* Title */}
        <div className="w-full text-left mb-16">
          <span className="font-serif italic text-lg text-[#C8A46B] block mb-2">01 //</span>
          <h2 className={`font-editorial font-light text-4xl md:text-5xl lg:text-6xl uppercase tracking-wide leading-none transition-colors duration-500 ${
            isDark ? 'text-[#F5F1EB]' : 'text-[#2B221D]'
          }`}>
            The Atelier Philosophy
          </h2>
          <p className={`font-ui font-light text-sm mt-3 max-w-xl transition-colors duration-500 ${
            isDark ? 'text-[#A79DAF]' : 'text-[#70655E]'
          }`}>
            A luxury fashion exhibition driving a beautifully synchronized style timeline. Drag or scroll the options wheel to navigate chapters.
          </p>
        </div>

        {/* Cinematic Split Layout Grid */}
        <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-center w-full">
          
          {/* Left Column (OptionWheel with dedicated width to prevent clipping) */}
          <div className="w-full md:w-[480px] lg:w-[600px] flex-shrink-0 flex items-center justify-start relative h-[380px] md:h-[600px] overflow-visible pr-4 z-20">
            <div className="w-full h-full overflow-visible">
              <OptionWheel
                items={WHEEL_ITEMS.map(item => item.title)}
                defaultSelected={0}
                textColor={isDark ? "#A79DAF" : "#70655E"}
                activeColor="#C8A46B"
                side="left"
                fontSize={wheelParams.fontSize}
                spacing={wheelParams.spacing}
                curve={1.15}
                tilt={wheelParams.tilt}
                blur={2}
                fade={0.28}
                smoothing={220}
                draggable={true}
                onChange={handleWheelChange}
                inset={wheelParams.inset}
              />
            </div>
          </div>

          {/* Right Column (Glass Card) */}
          <div className="flex-1 flex justify-center items-center w-full z-10">
            <div 
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className={`w-full rounded-[32px] border backdrop-blur-[24px] p-8 md:p-12 relative flex flex-col lg:flex-row gap-8 lg:gap-12 items-center lg:items-stretch z-10 overflow-hidden transition-all duration-500 ${
                isDark 
                  ? 'border-white/8 bg-white/5 shadow-[0_30px_80px_rgba(0,0,0,0.4)]' 
                  : 'border-[#2B221D]/8 bg-[#F3EBE0]/45 shadow-[0_30px_80px_rgba(43,34,29,0.06)]'
              }`}
            >
              
              {/* Glass Inner Reflection Glow */}
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

              {/* Image Frame with sliding crossfade & cursor parallax */}
              <motion.div 
                ref={imageContainerRef}
                style={{ x: imageX, y: imageY }}
                className={`relative w-full sm:w-[280px] h-[340px] md:h-[400px] rounded-[28px] overflow-hidden shadow-lg flex-shrink-0 select-none border transition-colors duration-500 ${
                  isDark ? 'border-white/10' : 'border-[#2B221D]/10'
                }`}
              >
                {prevIdx !== activeIdx && (
                  <img 
                    key={`old-${prevIdx}`}
                    src={WHEEL_ITEMS[prevIdx].image} 
                    className="old-image absolute inset-0 w-full h-full object-cover" 
                    alt="" 
                  />
                )}
                <img 
                  key={`new-${activeIdx}`}
                  src={WHEEL_ITEMS[activeIdx].image} 
                  className="new-image absolute inset-0 w-full h-full object-cover" 
                  alt="" 
                />
              </motion.div>

              {/* Content text block */}
              <div className="flex-1 flex flex-col justify-center py-2 text-left w-full">
                <div>
                  <span className={`font-accent text-[12px] tracking-[0.2em] uppercase block mb-3 transition-colors duration-500 ${
                    isDark ? 'text-[#A79DAF]' : 'text-[#70655E]'
                  }`}>
                    {WHEEL_ITEMS[activeIdx].category}
                  </span>
                  
                  <h3 
                    ref={headingRef}
                    className={`font-editorial text-4xl md:text-[52px] xl:text-[60px] font-light leading-[1.1] mb-6 transition-colors duration-500 ${
                      isDark ? 'text-[#F5F1EB]' : 'text-[#2B221D]'
                    }`}
                  >
                    {WHEEL_ITEMS[activeIdx].heading}
                  </h3>
                  
                  <p 
                    ref={descriptionRef}
                    className={`font-ui text-[16px] md:text-[18px] font-light leading-relaxed mb-8 transition-colors duration-500 ${
                      isDark ? 'text-[#A79DAF]' : 'text-[#70655E]'
                    }`}
                  >
                    {WHEEL_ITEMS[activeIdx].description}
                  </p>

                  {/* Feature list pills */}
                  <div 
                    ref={featuresRef}
                    className="flex flex-wrap gap-2"
                  >
                    {WHEEL_ITEMS[activeIdx].features.map((feat, i) => (
                      <span 
                        key={i} 
                        className={`feature-pill px-3.5 py-1.5 rounded-full border text-[9px] font-accent tracking-widest whitespace-nowrap transition-all duration-500 ${
                          isDark 
                            ? 'border-white/8 bg-white/5 text-[#F5F1EB]' 
                            : 'border-[#2B221D]/8 bg-[#2B221D]/5 text-[#2B221D]'
                        }`}
                      >
                        ✓ {feat}
                      </span>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
