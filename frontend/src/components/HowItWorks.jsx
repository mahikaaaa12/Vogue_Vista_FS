import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Upload, Cpu, Compass, Heart, ShoppingBag } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  {
    num: "01",
    title: "Upload Photo",
    subtitle: "Portrait Submission",
    desc: "Drop an editorial beauty photo or headshot into the AI engine. Our system calibrates to your photo details.",
    icon: Upload
  },
  {
    num: "02",
    title: "AI Analysis",
    subtitle: "Dermal Scan Matrix",
    desc: "Our model maps 68 face structure landmarks and extracts RGB undertone values to define your seasonal palette.",
    icon: Cpu
  },
  {
    num: "03",
    title: "Recommendations",
    subtitle: "Capsule Formulation",
    desc: "Obtain immediate coordinates, fabric suggestions, and interactive 3D accessories designed to complement your lines.",
    icon: Compass
  },
  {
    num: "04",
    title: "Save Looks",
    subtitle: "Atelier Archiving",
    desc: "Catalog your approved looks to your private wardrobe spread, establishing a history of your seasonal styles.",
    icon: Heart
  },
  {
    num: "05",
    title: "Shop boutique",
    subtitle: "Sustainable Purchasing",
    desc: "Direct access to companion items from partner luxury sustainable labels, making styling execution seamless.",
    icon: ShoppingBag
  }
];

export default function HowItWorks() {
  const containerRef = useRef(null);
  const timelineRef = useRef(null);
  const svgRef = useRef(null);
  const pathRef = useRef(null);
  const glowPathRef = useRef(null);
  const dotRef = useRef(null);
  const loopTweenRef = useRef(null);
  const hasAnimatedRef = useRef(false);

  const [activeStep, setActiveStep] = useState(-1);

  // Function to calculate and draw the SVG connector path
  const calculatePath = () => {
    requestAnimationFrame(() => {
      if (!timelineRef.current || !pathRef.current || !glowPathRef.current) return;

      const timeline = timelineRef.current;
      const path = pathRef.current;
      const glowPath = glowPathRef.current;

      const wrappers = timeline.querySelectorAll('.timeline-step-wrapper');
      const timelineRect = timeline.getBoundingClientRect();

      const points = [];
      wrappers.forEach((wrapper) => {
        const rect = wrapper.getBoundingClientRect();
        // Calculate coordinates relative to the scrolling track container
        const left = rect.left - timelineRect.left;
        const right = rect.right - timelineRect.left;
        const top = rect.top - timelineRect.top;
        const centerY = top + rect.height / 2;

        points.push({ left, right, centerY });
      });

      if (points.length < 2) return;

      // Construct a single continuous SVG path
      let pathD = '';
      for (let i = 0; i < points.length - 1; i++) {
        const current = points[i];
        const next = points[i + 1];

        const startX = current.right;
        const startY = current.centerY;
        const endX = next.left;
        const endY = next.centerY;

        const gap = endX - startX;
        const controlOffset = Math.max(gap * 0.35, 40);

        // Gentle alternate wave offset to give a luxury organic feel
        const waveOffset = (i % 2 === 0) ? -25 : 25;
        const c1x = startX + controlOffset;
        const c1y = startY + waveOffset;
        const c2x = endX - controlOffset;
        const c2y = endY - waveOffset;

        if (i === 0) {
          pathD += `M ${startX} ${startY}`;
        } else {
          // Connect previous endX, endY to this startX, startY with a straight line behind the card
          pathD += ` L ${startX} ${startY}`;
        }
        pathD += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${endX} ${endY}`;
      }

      // Update the SVG paths
      path.setAttribute('d', pathD);
      glowPath.setAttribute('d', pathD);

      const totalLength = path.getTotalLength();

      // Trigger entrance timeline on first load
      if (!hasAnimatedRef.current) {
        hasAnimatedRef.current = true;

        // Hide dot and set paths to undrawn state
        gsap.set([path, glowPath], {
          strokeDasharray: totalLength,
          strokeDashoffset: totalLength
        });
        gsap.set(dotRef.current, { opacity: 0 });

        const entranceTl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 60%",
            toggleActions: "play none none none",
          },
          onComplete: () => {
            startLoopingDot(totalLength);
          }
        });

        // 1. Draw path line
        entranceTl.to([path, glowPath], {
          strokeDashoffset: 0,
          duration: 3,
          ease: "power2.out"
        }, 0);

        // 2. Animate the dot along with the line drawing
        const dotObj = { progress: 0 };
        entranceTl.to(dotObj, {
          progress: 1,
          duration: 3,
          ease: "power2.out",
          onStart: () => {
            gsap.set(dotRef.current, { opacity: 1 });
          },
          onUpdate: () => {
            updateDotPosition(dotObj.progress, totalLength);
          }
        }, 0);

        // 3. Stagger the cards fading up
        entranceTl.fromTo(wrappers,
          { opacity: 0, y: 55 },
          { opacity: 1, y: 0, duration: 1.2, ease: "power3.out", stagger: 0.3 },
          0.4
        );
      } else {
        // Handle resizing when the loop is already running
        if (loopTweenRef.current) {
          loopTweenRef.current.kill();
          startLoopingDot(totalLength);
        }
      }
    });
  };

  // Start the continuous looping dot animation
  const startLoopingDot = (totalLength) => {
    const loopObj = { progress: 0 };
    loopTweenRef.current = gsap.to(loopObj, {
      progress: 1,
      duration: 10, // slow elegant pace
      repeat: -1,
      ease: "none",
      onUpdate: () => {
        updateDotPosition(loopObj.progress, totalLength);
      }
    });
  };

  // Update dot coordinate and update the active card index
  const updateDotPosition = (progress, totalLength) => {
    const path = pathRef.current;
    const dot = dotRef.current;
    if (!path || !dot) return;

    const point = path.getPointAtLength(progress * totalLength);
    gsap.set(dot, { x: point.x, y: point.y });

    // Track proximity of dot to each card center
    const timeline = timelineRef.current;
    if (!timeline) return;

    const wrappers = timeline.querySelectorAll('.timeline-step-wrapper');
    const timelineRect = timeline.getBoundingClientRect();

    let closestIndex = -1;
    let minDistance = Infinity;

    wrappers.forEach((wrapper, index) => {
      const rect = wrapper.getBoundingClientRect();
      const cardCenterX = rect.left + rect.width / 2 - timelineRect.left;
      const cardCenterY = rect.top + rect.height / 2 - timelineRect.top;

      const dist = Math.hypot(point.x - cardCenterX, point.y - cardCenterY);
      if (dist < minDistance) {
        minDistance = dist;
        closestIndex = index;
      }
    });

    const targetStep = minDistance < 160 ? closestIndex : -1;
    setActiveStep((prev) => {
      if (prev !== targetStep) {
        return targetStep;
      }
      return prev;
    });
  };

  useEffect(() => {
    const container = containerRef.current;
    const timeline = timelineRef.current;
    if (!container || !timeline) return;

    // Pin timeline and handle horizontal scroll
    const getScrollAmount = () => {
      return timeline.scrollWidth - window.innerWidth + window.innerWidth * 0.15;
    };

    const ctx = gsap.context(() => {
      const pinTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: () => `+=${getScrollAmount()}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
        }
      });

      // Animate horizontal translate
      pinTimeline.to(timeline, {
        x: () => -getScrollAmount(),
        ease: "none"
      });

      // Slowly move the gradient stops to create a flow effect along the path
      gsap.fromTo('#champagne-gradient',
        { attr: { x1: '-100%', x2: '0%' } },
        { attr: { x1: '100%', x2: '200%' }, duration: 7, repeat: -1, ease: "none" }
      );
    }, container);

    // Watch for size changes of the timeline to recalculate the connector path
    const observer = new ResizeObserver(() => {
      calculatePath();
    });
    observer.observe(timeline);

    return () => {
      ctx.revert();
      observer.disconnect();
      if (loopTweenRef.current) loopTweenRef.current.kill();
    };
  }, []);

  return (
    <section 
      ref={containerRef}
      id="how-it-works"
      className="relative h-screen bg-lux-bg-secondary overflow-hidden border-b border-lux-border-light flex flex-col justify-between py-10"
    >
      {/* Top Section Header */}
      <div className="editorial-container mx-auto px-4 md:px-10 w-full max-w-7xl z-10">
        <div className="flex justify-between items-baseline mb-1 pb-4 border-b border-lux-border-light">
          <div className="flex items-center gap-2">
            <span className="editorial-header-num font-serif italic text-lg text-lux-gold">04 //</span>
            <h2 className="font-editorial font-light text-3xl md:text-4xl uppercase tracking-wide text-lux-text-primary">
              The Atelier Journey
            </h2>
          </div>
          <span className="font-accent text-xs tracking-widest text-lux-text-muted uppercase">
            Process Timeline
          </span>
        </div>
      </div>

      {/* Middle: Horizontal Scrolling container */}
      <div className="relative w-full flex-grow flex items-center overflow-hidden">
        {/* Horizontal timeline track */}
        <div 
          ref={timelineRef}
          className="flex gap-5 md:gap-36 items-center px-[10vw] relative h-[500px]"
          style={{ willChange: 'transform' }}
        >
          {/* Animated Connecting SVG Path Overlay */}
          <svg 
            ref={svgRef}
            className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible"
          >
            <defs>
              {/* Champagne Gold flowing linear gradient */}
              <linearGradient id="champagne-gradient" x1="0%" y1="0%" x2="100%" y2="0%" gradientUnits="objectBoundingBox">
                <stop offset="0%" stopColor="var(--accent-gold)" stopOpacity="0.4" />
                <stop offset="50%" stopColor="var(--accent-gold-light)" stopOpacity="1" />
                <stop offset="100%" stopColor="var(--accent-gold)" stopOpacity="0.4" />
              </linearGradient>

              {/* Luxury neon glow filter */}
              <filter id="glow-filter" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Glowing background path line */}
            <path
              ref={glowPathRef}
              fill="none"
              stroke="var(--accent-gold)"
              strokeWidth="6"
              opacity="0.15"
              filter="url(#glow-filter)"
            />

            {/* Main elegant foreground connector path */}
            <path
              ref={pathRef}
              fill="none"
              stroke="url(#champagne-gradient)"
              strokeWidth="2"
            />

            {/* Glowing dot representing the flow progress */}
            <g ref={dotRef}>
              <circle r="8" fill="var(--accent-gold-light)" opacity="0.6" filter="url(#glow-filter)" />
              <circle r="3.5" fill="#FFF" />
            </g>
          </svg>

          {/* Timeline Cards */}
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isActive = activeStep === idx;
            return (
              <div 
                key={idx}
                className="timeline-step-wrapper relative flex justify-center py-2 shrink-0 z-10 w-[280px] md:w-[320px]"
              >
                <div 
                  className={`timeline-step-item relative flex flex-col gap-6 w-full bg-lux-bg-tertiary border p-8 shadow-premium rounded-sm transition-all duration-500 ease-lux hover:-translate-y-3 hover:shadow-premium-hover ${
                    isActive 
                      ? 'border-lux-gold/60 shadow-[0_0_20px_rgba(198,161,106,0.25)] scale-[1.02]' 
                      : 'border-lux-border-light'
                  }`}
                >
                  {/* Step circle */}
                  <div className={`absolute -top-6 left-8 w-12 h-12 rounded-full flex items-center justify-center font-accent text-sm font-semibold border-4 border-lux-bg-secondary transition-all duration-500 ${
                    isActive 
                      ? 'bg-lux-gold text-lux-bg-primary border-lux-bg-tertiary scale-110 shadow-md' 
                      : 'bg-lux-text-primary text-lux-bg-primary'
                  }`}>
                    {step.num}
                  </div>

                  {/* Step Header */}
                  <div className="flex justify-between items-center mt-2">
                    <div>
                      <span className="font-accent text-[10px] tracking-widest text-lux-gold uppercase block">
                        {step.subtitle}
                      </span>
                      <h3 className="font-editorial text-2xl uppercase tracking-wide text-lux-text-primary mt-1">
                        {step.title}
                      </h3>
                    </div>
                    <div className={`p-2 rounded-full border transition-all duration-500 ${
                      isActive 
                        ? 'text-lux-bg-primary bg-lux-gold border-lux-gold' 
                        : 'text-lux-gold bg-lux-bg-secondary border-lux-border-light'
                    }`}>
                      <Icon size={18} />
                    </div>
                  </div>

                  <div className="h-px bg-lux-border-light w-full"></div>

                  <p className="font-ui font-light text-sm text-lux-text-secondary leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Progress hint */}
      <div className="editorial-container mx-auto px-4 md:px-16 w-full max-w-7xl flex justify-between items-center text-lux-text-muted font-accent text-[10px] tracking-widest uppercase z-10">
        <span>SCROLL DOWN TO PROGRESS</span>
        <span className="animate-pulse">➔</span>
      </div>
    </section>
  );
}
