import React, { useRef, useState, useCallback, useEffect } from 'react';

const DEFAULT_ITEMS = [
  'Style DNA',
  'Colour Palette',
  'Body Analysis',
  'Accessories',
  'Outfit Recommendation',
  'Wardrobe'
];

const OptionWheel = ({
  items = DEFAULT_ITEMS,
  defaultSelected = 0,
  onChange,
  textColor = '#a6a6a6',
  activeColor = '#ffffff',
  side = 'left',
  fontSize = 2,
  spacing = 1.6,
  curve = 1,
  tilt = 12,
  blur = 1.5,
  fade = 0.3,
  minOpacity = 0.05,
  smoothing = 200,
  inset = 40,
  loop = true,
  draggable = true,
  soundUrl = '',
  soundVolume = 0.5,
  className = ''
}) => {
  const rootRef = useRef(null);
  const itemRefs = useRef([]);
  const posRef = useRef(defaultSelected);
  const targetRef = useRef(defaultSelected);
  const rafRef = useRef(null);
  const lastRef = useRef(0);
  const cfgRef = useRef({});
  const selectedRef = useRef(defaultSelected);
  const wheelTimerRef = useRef(null);
  const dragRef = useRef(null);
  const dragMovedRef = useRef(false);
  const audioRef = useRef(null);
  const audioUrlRef = useRef('');
  const lastTickRef = useRef(0);
  
  const [selectedIndex, setSelectedIndex] = useState(defaultSelected);
  const [isDragging, setIsDragging] = useState(false);

  // High performance physics refs
  const velocityRef = useRef(0);
  const lastTimeRef = useRef(0);
  const lastYRef = useRef(0);
  const isSpinningRef = useRef(false);
  const isDraggingRef = useRef(false);

  const remPx = typeof window !== 'undefined' ? parseFloat(getComputedStyle(document.documentElement).fontSize) || 16 : 16;

  cfgRef.current = {
    count: items.length,
    items,
    rowH: Math.max(fontSize * spacing * remPx, 1),
    curve,
    tilt,
    blur,
    fade,
    minOpacity,
    side,
    loop,
    smoothing,
    draggable,
    soundUrl,
    soundVolume
  };

  const playTick = useCallback(() => {
    const { soundUrl, soundVolume } = cfgRef.current;
    if (!soundUrl) return;
    const now = performance.now();
    if (now - lastTickRef.current < 70) return;
    lastTickRef.current = now;
    if (!audioRef.current || audioUrlRef.current !== soundUrl) {
      audioRef.current = new Audio(soundUrl);
      audioRef.current.preload = 'auto';
      audioUrlRef.current = soundUrl;
    }
    const audio = audioRef.current;
    audio.volume = Math.min(Math.max(soundVolume, 0), 1);
    audio.currentTime = 0;
    audio.play()?.catch(() => {});
  }, []);

  // Stable references to prevent render loop collisions
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const playTickRef = useRef(playTick);
  playTickRef.current = playTick;

  const applyTargetRef = useRef(null);

  // 1. GPU-Accelerated 3D Cylinder rendering loop
  const runFrame = useCallback((now) => {
    const dt = Math.min((now - lastRef.current) / 1000, 0.05);
    lastRef.current = now;
    const cfg = cfgRef.current;

    // Friction & Damped Inertia Physics
    if (isSpinningRef.current) {
      const friction = 0.94; // mechanical dial heaviness coefficient
      velocityRef.current *= Math.pow(friction, dt * 60);
      targetRef.current += velocityRef.current * dt * 1000;
      posRef.current = targetRef.current;

      if (Math.abs(velocityRef.current) < 0.002) {
        isSpinningRef.current = false;
        applyTargetRef.current?.(targetRef.current, true);
      }
    } else {
      const tau = Math.max(cfg.smoothing, 1) / 1000;
      const k = 1 - Math.exp(-dt / tau);
      const target = targetRef.current;
      const cur = posRef.current;
      let next = cur + (target - cur) * k;
      const settled = Math.abs(target - next) < 0.001;
      if (settled) next = target;
      posRef.current = next;
    }

    const next = posRef.current;
    const els = itemRefs.current;
    const n = cfg.count;

    const mirror = cfg.side === 'right' ? -1 : 1;
    const tiltRad = (cfg.tilt * Math.PI) / 180;
    const R = tiltRad > 0.0005 ? cfg.rowH / tiltRad : 0;

    // Check active item index
    const activeIndex = ((Math.round(next) % n) + n) % n;
    if (activeIndex !== selectedRef.current && !isDraggingRef.current) {
      selectedRef.current = activeIndex;
      setSelectedIndex(activeIndex);
      onChangeRef.current?.(activeIndex, cfg.items[activeIndex]);
      playTickRef.current();
    }

    for (let i = 0; i < n; i++) {
      const el = els[i];
      if (!el) continue;
      
      let d = i - next;
      if (cfg.loop && n > 1) {
        d = ((d % n) + n) % n;
        if (d > n / 2) d -= n;
      }
      const dist = Math.abs(d);

      // Virtualization: limit rendered coordinates to max 7 items
      if (dist > 3.5) {
        el.style.display = 'none';
        continue;
      }

      el.style.display = 'block';

      let x = 0;
      let y = d * cfg.rowH;
      let z = 0;
      let rotZ = 0;
      let rotY = 0;

      if (R > 0) {
        const ang = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, d * tiltRad));
        y = R * Math.sin(ang);
        z = -Math.abs(R * (1 - Math.cos(ang))) * 1.8; 
        rotZ = (mirror * ang * 180) / Math.PI;
        rotY = -mirror * ang * (180 / Math.PI) * 0.55; // horizontal cylinder curve factor
        x = -mirror * R * (1 - Math.cos(ang)) * cfg.curve;
      }

      // Smooth continuous scaling and progressive opacity fading
      const itemScale = dist < 1 ? 1.05 - (dist * 0.05) : Math.max(0.75, 1.0 - (dist - 1) * 0.08);
      const itemOpacity = dist < 1 ? 1.0 - (dist * 0.4) : Math.max(0.0, 0.6 - (dist - 1) * 0.15);

      el.style.transform = `translate3d(${x.toFixed(2)}px, calc(${y.toFixed(2)}px - 50%), ${z.toFixed(2)}px) scale(${itemScale.toFixed(3)}) rotateZ(${rotZ.toFixed(3)}deg) rotateY(${rotY.toFixed(3)}deg)`;
      el.style.opacity = String(itemOpacity);

      // Dynamic blur filters
      const blurVal = dist > 0.5 ? Math.min((dist - 0.5) * 1.5, 3.5) : 0;
      el.style.filter = blurVal > 0.2 ? `blur(${blurVal.toFixed(1)}px)` : 'none';
    }

    const settled = Math.abs(targetRef.current - next) < 0.001 && !isSpinningRef.current;
    rafRef.current = settled ? null : requestAnimationFrame(runFrame);
  }, []);

  // 2. Start loop scheduling
  const startLoop = useCallback(() => {
    if (rafRef.current != null) return;
    lastRef.current = performance.now();
    rafRef.current = requestAnimationFrame(runFrame);
  }, [runFrame]);

  // 3. Apply target positioning physics
  const applyTarget = useCallback(
    (value, snap) => {
      const cfg = cfgRef.current;
      let v = value;
      if (!cfg.loop) v = Math.min(Math.max(v, 0), Math.max(cfg.count - 1, 0));
      if (snap) v = Math.round(v);
      targetRef.current = v;
      const idx = ((Math.round(v) % cfg.count) + cfg.count) % cfg.count;
      if (idx !== selectedRef.current) {
        selectedRef.current = idx;
        setSelectedIndex(idx);
        onChangeRef.current?.(idx, cfg.items[idx]);
        playTickRef.current();
      }
      startLoop();
    },
    [startLoop]
  );

  applyTargetRef.current = applyTarget;

  // Pointer touch & drag events
  const handlePointerDown = useCallback((e) => {
    if (!cfgRef.current.draggable) return;
    dragRef.current = { y: e.clientY, start: targetRef.current, id: e.pointerId };
    lastTimeRef.current = performance.now();
    lastYRef.current = e.clientY;
    velocityRef.current = 0;
    isSpinningRef.current = false;
    isDraggingRef.current = true;
    dragMovedRef.current = false;
    setIsDragging(true);
  }, []);

  const handlePointerMove = useCallback(
    (e) => {
      const drag = dragRef.current;
      if (!drag) return;
      
      const now = performance.now();
      const dt = now - lastTimeRef.current;
      const dy = e.clientY - drag.y;

      if (dt > 10) {
        const deltaY = e.clientY - lastYRef.current;
        velocityRef.current = -deltaY / cfgRef.current.rowH / dt;
        lastTimeRef.current = now;
        lastYRef.current = e.clientY;
      }

      if (!dragMovedRef.current && Math.abs(dy) > 4) {
        dragMovedRef.current = true;
        rootRef.current?.setPointerCapture(drag.id);
      }
      
      if (dragMovedRef.current) {
        applyTargetRef.current(drag.start - dy / cfgRef.current.rowH, false);
      }
    },
    []
  );

  const handlePointerEnd = useCallback(() => {
    if (!dragRef.current) return;
    dragRef.current = null;
    setIsDragging(false);
    isDraggingRef.current = false;

    if (Math.abs(velocityRef.current) > 0.05) {
      isSpinningRef.current = true;
      lastRef.current = performance.now();
      startLoop();
    } else {
      applyTargetRef.current(targetRef.current, true);
    }
  }, [startLoop]);

  // Keyboard navigation & accessibility controls
  const handleKeyDown = useCallback(
    (e) => {
      const n = cfgRef.current.count;
      let targetVal = null;
      
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        targetVal = Math.round(targetRef.current) - 1;
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        targetVal = Math.round(targetRef.current) + 1;
      } else if (e.key === 'Home') {
        targetVal = 0;
      } else if (e.key === 'End') {
        targetVal = n - 1;
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const idx = ((Math.round(targetRef.current) % n) + n) % n;
        onChangeRef.current?.(idx, cfgRef.current.items[idx]);
        return;
      }
      
      if (targetVal !== null) {
        e.preventDefault();
        isSpinningRef.current = false;
        applyTargetRef.current(targetVal, true);
      }
    },
    []
  );

  // Wheel scrolling (touchpad precision coefficient)
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const onWheel = (e) => {
      e.preventDefault();
      const cfg = cfgRef.current;
      const delta = e.deltaMode === 1 ? e.deltaY * 24 : e.deltaY;
      const step = delta / (cfg.rowH * 4.5);
      
      isSpinningRef.current = false;
      applyTargetRef.current(targetRef.current + step, false);
      
      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
      wheelTimerRef.current = setTimeout(() => applyTargetRef.current(targetRef.current, true), 140);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', onWheel);
      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
    };
  }, []);

  const handleItemClick = useCallback(
    (index) => {
      if (dragMovedRef.current) return;
      const cfg = cfgRef.current;
      const cur = targetRef.current;
      let d = index - (((cur % cfg.count) + cfg.count) % cfg.count);
      if (cfg.loop && cfg.count > 1) {
        if (d > cfg.count / 2) d -= cfg.count;
        else if (d < -cfg.count / 2) d += cfg.count;
      }
      isSpinningRef.current = false;
      applyTargetRef.current(cur + d, true);
    },
    []
  );

  useEffect(() => {
    applyTargetRef.current(targetRef.current, false);
  }, [items, fontSize, spacing, curve, tilt, blur, fade, minOpacity, side, loop, smoothing]);

  // Hook layout-recovery to apply coordinates on re-renders
  useEffect(() => {
    startLoop();
  });

  useEffect(
    () => () => {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      audioRef.current?.pause();
    },
    []
  );

  return (
    <div
      ref={rootRef}
      role="listbox"
      tabIndex={0}
      aria-label="Option wheel"
      className={`relative h-full w-full select-none overflow-visible outline-none [touch-action:none] ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      }${className ? ` ${className}` : ''}`}
      style={{
        '--ow-text-color': textColor,
        '--ow-active-color': activeColor,
        '--ow-font-size': `${fontSize}rem`,
        '--ow-inset': `${inset}px`,
        perspective: '1200px',
        transformStyle: 'preserve-3d',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,1) 8%, rgba(0,0,0,1) 92%, transparent 100%)',
        maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,1) 8%, rgba(0,0,0,1) 92%, transparent 100%)'
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onKeyDown={handleKeyDown}
    >
      {items.map((label, index) => (
        <div
          key={`${label}-${index}`}
          ref={el => {
            itemRefs.current[index] = el;
          }}
          role="option"
          aria-selected={selectedIndex === index}
          className={`option-wheel-item absolute top-1/2 cursor-pointer whitespace-nowrap leading-none will-change-[transform,opacity] [font-size:var(--ow-font-size)] transition-colors duration-300 [backface-visibility:hidden] [transform-style:preserve-3d] ${
            side === 'right' ? 'right-[var(--ow-inset)] origin-right' : 'left-[var(--ow-inset)] origin-left'
          } ${
            selectedIndex === index 
              ? 'font-semibold tracking-wide text-[var(--ow-active-color)] drop-shadow-[0_2px_10px_rgba(200,164,107,0.4)] z-[99]' 
              : 'font-light text-[var(--ow-text-color)] z-[1]'
          }`}
          onClick={() => handleItemClick(index)}
        >
          {label}
        </div>
      ))}
    </div>
  );
};

export default OptionWheel;
