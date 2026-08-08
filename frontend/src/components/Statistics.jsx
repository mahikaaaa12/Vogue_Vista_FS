import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function Counter({ endValue, duration = 2.5, suffix = "", decimals = 0 }) {
  const [val, setVal] = useState(0);
  const elementRef = useRef(null);

  useEffect(() => {
    const obj = { value: 0 };
    const trigger = ScrollTrigger.create({
      trigger: elementRef.current,
      start: "top 85%",
      onEnter: () => {
        gsap.to(obj, {
          value: endValue,
          duration: duration,
          ease: "power2.out",
          onUpdate: () => {
            setVal(obj.value);
          }
        });
      }
    });

    return () => trigger.kill();
  }, [endValue, duration]);

  const formatted = val.toFixed(decimals);
  const displayVal = decimals > 0 
    ? parseFloat(formatted).toFixed(decimals) 
    : Math.floor(val).toLocaleString();

  return (
    <span ref={elementRef}>
      {displayVal}{suffix}
    </span>
  );
}

const STATS_DATA = [
  {
    value: 25000,
    suffix: "+",
    label: "FASHION ITEMS",
    desc: "Curated designer pieces from <span class='font-semibold text-lux-gold'>500+</span> global brands.",
    decimals: 0
  },
  {
    value: 420000,
    suffix: "+",
    label: "HAPPY MEMBERS",
    desc: "Community of fashion lovers and <span class='font-semibold text-lux-gold'>trendsetters</span> growing every day.",
    decimals: 0
  },
  {
    value: 1.8,
    suffix: "M+",
    label: "OUTFITS STYLED",
    desc: "AI-powered styling sessions that help you <span class='font-semibold text-lux-gold'>look and feel your best.</span>",
    decimals: 1
  },
  {
    value: 99.2,
    suffix: "%",
    label: "SATISFACTION RATE",
    desc: "Loved by our community for <span class='font-semibold text-lux-gold'>style, quality, and experience.</span>",
    decimals: 1
  }
];

export default function Statistics() {
  return (
    <section 
      id="statistics"
      className="py-24 md:py-10 bg-lux-bg-primary border-b border-lux-border-light relative overflow-hidden"
    >
      <div className="editorial-container mx-auto px-4 md:px-16 max-w-7xl">
        
        {/* Section Header */}
        <div className="flex justify-between items-baseline mb-20 pb-6 border-b border-lux-border-light">
          <div className="flex items-center gap-2">
            <span className="editorial-header-num font-serif italic text-lg text-lux-gold">09 //</span>
            <h2 className="font-editorial font-light text-4xl md:text-5xl uppercase tracking-wide text-lux-text-primary">
              Platform Metrics
            </h2>
          </div>
          <span className="font-accent text-xs tracking-widest text-lux-text-muted uppercase">
            Data Ledger
          </span>
        </div>

        {/* Asymmetric grid of statistics counters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {STATS_DATA.map((stat, idx) => (
            <div 
              key={idx}
              className="flex flex-col gap-4 border-l border-lux-border-light pl-6 md:pl-8 group"
            >
              {/* Stat number */}
              <div 
                className="font-editorial font-light text-5xl md:text-6xl text-lux-text-primary group-hover:text-lux-gold transition-colors duration-500"
                style={{ fontVariantNumeric: 'lining-nums', fontFeatureSettings: '"lnum" 1' }}
              >
                <Counter 
                  endValue={stat.value} 
                  suffix={stat.suffix} 
                  decimals={stat.decimals}
                />
              </div>

              {/* Label */}
              <h3 className="font-accent text-xs tracking-widest text-lux-text-muted uppercase font-semibold">
                {stat.label}
              </h3>

              <div className="w-8 h-px bg-lux-border-medium group-hover:w-16 transition-all duration-500"></div>

              {/* Description */}
              <p 
                className="font-ui font-light text-xs text-lux-text-secondary leading-relaxed max-w-[220px]"
                dangerouslySetInnerHTML={{ __html: stat.desc }}
              />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
