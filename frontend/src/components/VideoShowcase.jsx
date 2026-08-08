import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Play, Pause, Maximize2 } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function VideoShowcase() {
  const containerRef = useRef(null);
  const mockupRef = useRef(null);
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    const mockup = mockupRef.current;
    if (!mockup) return;

    const ctx = gsap.context(() => {
      // Zoom-in mockup as the user scrolls past this section
      gsap.fromTo(mockup,
        { scale: 0.82, rotateX: 10, y: 50 },
        {
          scale: 1,
          rotateX: 0,
          y: 0,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 80%',
            end: 'bottom bottom',
            scrub: 1,
            invalidateOnRefresh: true,
          }
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <section 
      ref={containerRef}
      id="video-showcase"
      className="relative py-16 md:py-10 bg-lux-bg-primary overflow-hidden border-b border-lux-border-light flex flex-col items-center"
      style={{ perspective: 1500 }}
    >
      {/* Background radial gradient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-radial-gradient from-lux-gold/10 to-transparent pointer-events-none z-0 filter blur-3xl" />

      <div className="editorial-container mx-auto px-4 md:px-16 w-full max-w-7xl relative z-10 flex flex-col items-center">
        
        {/* Header Block */}
        <div className="w-full flex justify-between items-baseline mb-6 pb-6 border-b border-lux-border-light">
          <div className="flex items-center gap-2">
            <span className="editorial-header-num font-serif italic text-lg text-lux-gold">05 //</span>
            <h2 className="font-editorial font-light text-4xl md:text-5xl uppercase tracking-wide text-lux-text-primary">
              Cinematic Preview
            </h2>
          </div>
          <span className="font-accent text-xs tracking-widest text-lux-text-muted uppercase">
            Platform Demo
          </span>
        </div>

        {/* Text descriptions */}
        <div className="text-center max-w-2xl mb-5 flex flex-col gap-1">
          <h3 className="font-editorial text-3xl uppercase tracking-wider text-lux-text-primary">
            The Digital Studio Experience
          </h3>
          <p className="font-ui font-light text-base text-lux-text-secondary leading-relaxed">
            Witness our algorithmic curation mapping coordinates instantly. Drag, pivot, and view your style layout in high-fidelity 3D workspace.
          </p>
        </div>

        {/* Cinematic Device Mockup */}
        <div 
          ref={mockupRef}
          className="relative w-full max-w-4xl aspect-video bg-lux-bg-secondary border border-lux-border-medium shadow-premium p-4 md:p-6 rounded-md transition-all duration-300"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Mockup glass screen container */}
          <div className="relative w-full h-full overflow-hidden bg-black border border-lux-border-light rounded-sm flex items-center justify-center group">
            
            {/* Real high-fashion cosmetic loop video */}
            <video
              ref={videoRef}
              className="w-full h-full object-cover opacity-90 transition-all duration-500 group-hover:scale-[1.01]"
              src="https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c054a4d8d8c3d9ef25d97f25&profile_id=139&oauth2_token_id=57447761"
              autoPlay
              muted
              loop
              playsInline
            />

            {/* Glass screen reflection overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-white/10 to-transparent pointer-events-none mix-blend-overlay z-10" />

            {/* Interactive play overlay HUD */}
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20">
              <button 
                onClick={togglePlay}
                className="w-16 h-16 rounded-full bg-lux-bg-primary/95 text-lux-text-primary flex items-center justify-center shadow-premium border border-lux-gold transition-transform duration-300 hover:scale-110 active:scale-95"
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-1" />}
              </button>
            </div>

            {/* Mockup corner tags */}
            <div className="absolute bottom-4 left-4 z-20 font-accent text-[9px] text-white/60 tracking-widest uppercase pointer-events-none">
              Vogue Vista ATELIER v2.0 // DEMO
            </div>
            <div className="absolute bottom-4 right-4 z-20 text-white/60 pointer-events-none">
              <Maximize2 size={12} />
            </div>
          </div>

          {/* Laptop keyboard pedestal design lines */}
          <div className="absolute -bottom-2 left-[10%] right-[10%] h-2 bg-lux-bg-tertiary border-b border-x border-lux-border-medium rounded-b-md shadow-md z-0" />
        </div>

        {/* Supporting stats or features overlay */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-10 w-full max-w-4xl border-t border-lux-border-light pt-3">
          <div className="flex flex-col gap-2">
            <span className="font-editorial text-lg italic text-lux-gold">Studio Quality //</span>
            <p className="font-ui font-light text-xs text-lux-text-muted leading-relaxed">
              High resolution renders visualizing color palettes and fabric drapes on-screen.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-editorial text-lg italic text-lux-gold">Zero Playtime //</span>
            <p className="font-ui font-light text-xs text-lux-text-muted leading-relaxed">
              Instant loading scans mapping 3D assets procedurally onto lookbook cards.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-editorial text-lg italic text-lux-gold">Tailored Assets //</span>
            <p className="font-ui font-light text-xs text-lux-text-muted leading-relaxed">
              Every detail is generated to complement your dermal calibration spectrum.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
