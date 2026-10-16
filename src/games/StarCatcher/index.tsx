import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Moon, Sparkles } from 'lucide-react';
import { soundEngine } from '../../engine/soundEngine';

interface Star {
  id: number;
  x: number;
  y: number;
  radius: number;
  speed: number;
  opacity: number;
  pulsePhase: number;
  hue: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  color: string;
}

export const StarCatcherGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const starsRef = useRef<Star[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const animIdRef = useRef<number | null>(null);
  const [caughtCount, setCaughtCount] = useState(0);

  // Initialize stars pool
  const spawnStar = (width: number, fromTop = true): Star => {
    return {
      id: Math.random(),
      x: 30 + Math.random() * (width - 60),
      y: fromTop ? -20 - Math.random() * 80 : Math.random() * 500,
      radius: 9 + Math.random() * 7,
      speed: 0.6 + Math.random() * 0.7, // Slow, peaceful drift
      opacity: 0.8 + Math.random() * 0.2,
      pulsePhase: Math.random() * Math.PI * 2,
      hue: Math.random() > 0.5 ? 210 : 270 // Blue or Violet pastel
    };
  };

  const catchStarAt = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = clientX - rect.left;
    const clickY = clientY - rect.top;

    // Check hit against stars
    for (let i = starsRef.current.length - 1; i >= 0; i--) {
      const star = starsRef.current[i];
      const dist = Math.hypot(clickX - star.x, clickY - star.y);
      // Generous touch hit box for effortless, calming interaction
      if (dist < star.radius * 2.8) {
        // Spawn star burst particles
        for (let p = 0; p < 18; p++) {
          const angle = Math.random() * Math.PI * 2;
          const spd = 1.5 + Math.random() * 3.5;
          particlesRef.current.push({
            x: star.x,
            y: star.y,
            vx: Math.cos(angle) * spd,
            vy: Math.sin(angle) * spd,
            radius: 2 + Math.random() * 2.5,
            alpha: 1,
            color: `hsl(${star.hue + (Math.random() * 40 - 20)}, 90%, 75%)`
          });
        }

        // Sound chime with celestial pitch
        const pitch = 0.9 + Math.random() * 0.5;
        soundEngine.playStarChime(pitch);

        // Remove star and respawn
        starsRef.current.splice(i, 1);
        starsRef.current.push(spawnStar(rect.width, true));
        setCaughtCount((c) => c + 1);
        break;
      }
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    let width = parent.clientWidth || 300;
    let height = parent.clientHeight || 400;

    const setupCanvas = () => {
      const p = canvas.parentElement;
      if (!p) return;
      const rect = p.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }

      // Initialize stars if empty or adjust star positions
      if (starsRef.current.length === 0) {
        const starRadius = Math.max(8, Math.min(18, width * 0.025));
        starsRef.current = Array.from({ length: 9 }, () => {
          const s = spawnStar(width, false);
          s.radius = starRadius;
          return s;
        });
      }
    };

    setupCanvas();

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => setupCanvas());
      observer.observe(parent);
    }

    const handleOrientation = () => {
      setTimeout(setupCanvas, 100);
    };
    window.addEventListener('orientationchange', handleOrientation);

    let lastFrameTime = performance.now();

    const render = (now: number) => {
      if (document.hidden) {
        // Paused while tab is hidden
        return;
      }

      const frameDelta = now - lastFrameTime;
      lastFrameTime = now;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Frame time check: If device is lagging (>24ms per frame, < 42fps), cap particle count
      const isSlowDevice = frameDelta > 24;
      const maxParticles = isSlowDevice ? 20 : 60;
      if (particlesRef.current.length > maxParticles) {
        particlesRef.current.splice(0, particlesRef.current.length - maxParticles);
      }

      // Twilight Sky Gradient
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, '#090d16');
      grad.addColorStop(0.5, '#0f172a');
      grad.addColorStop(1, '#1e1b4b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Distant micro twinkling stars
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      for (let i = 0; i < 25; i++) {
        const sx = ((i * 73) % width);
        const sy = ((i * 137) % height);
        ctx.fillRect(sx, sy, 1.5, 1.5);
      }

      // Update and draw falling stars
      starsRef.current.forEach((star) => {
        star.y += star.speed;
        star.pulsePhase += 0.03;

        // If falls past bottom, loop to top
        if (star.y > height + 30) {
          star.y = -20;
          star.x = 30 + Math.random() * (width - 60);
        }

        // Draw star aura glow
        const glowRadius = star.radius * (1.8 + 0.3 * Math.sin(star.pulsePhase));
        ctx.save();
        ctx.beginPath();
        ctx.arc(star.x, star.y, glowRadius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${star.hue}, 90%, 75%, 0.25)`;
        ctx.fill();

        // 4-point star shape
        ctx.beginPath();
        const r = star.radius;
        ctx.moveTo(star.x, star.y - r * 1.4);
        ctx.quadraticCurveTo(star.x, star.y, star.x + r * 1.4, star.y);
        ctx.quadraticCurveTo(star.x, star.y, star.x, star.y + r * 1.4);
        ctx.quadraticCurveTo(star.x, star.y, star.x - r * 1.4, star.y);
        ctx.quadraticCurveTo(star.x, star.y, star.x, star.y - r * 1.4);

        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = `hsl(${star.hue}, 90%, 75%)`;
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.restore();
      });

      // Update and draw sparkle particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05; // soft gravity
        p.alpha -= 0.022;

        if (p.alpha <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      animIdRef.current = requestAnimationFrame(render);
    };

    animIdRef.current = requestAnimationFrame(render);

    const handleVisibility = () => {
      if (!document.hidden) {
        lastFrameTime = performance.now();
        animIdRef.current = requestAnimationFrame(render);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
      if (observer) observer.disconnect();
      window.removeEventListener('orientationchange', handleOrientation);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    catchStarAt(e.clientX, e.clientY);
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-between p-4 bg-indigo-950/20">
      {/* Top Bar */}
      <div className="w-full max-w-2xl flex items-center justify-between px-4 py-2 rounded-2xl bg-indigo-950/40 backdrop-blur-md border border-indigo-500/20 text-xs text-indigo-200">
        <div className="flex items-center gap-2">
          <Moon className="w-3.5 h-3.5 text-indigo-400" />
          <span>Twilight Sky</span>
        </div>
        <div className="flex items-center gap-1.5 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Stars Caught: <strong className="text-white font-mono">{caughtCount}</strong></span>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 w-full max-w-2xl relative my-3 rounded-3xl overflow-hidden border border-indigo-500/30 shadow-2xl">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          className="w-full h-full cursor-pointer touch-none select-none block"
        />
      </div>

      <p className="text-xs text-indigo-200/60 text-center pb-2">
        Tap the slow drifting stars to catch them in a shower of celestial sparks and chimes.
      </p>
    </div>
  );
};
