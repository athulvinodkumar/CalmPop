import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Droplet, CloudDrizzle } from 'lucide-react';
import { soundEngine } from '../../engine/soundEngine';

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  speed: number;
  color: string;
}

interface LilyPad {
  x: number;
  y: number;
  size: number;
  rotation: number;
}

export const RipplePondGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ripplesRef = useRef<Ripple[]>([]);
  const lilyPadsRef = useRef<LilyPad[]>([]);
  const animIdRef = useRef<number | null>(null);
  const isPointerDownRef = useRef(false);
  const lastDropTimeRef = useRef(0);
  const [softRainActive, setSoftRainActive] = useState(false);

  // Initialize lily pads
  const initPond = useCallback((width: number, height: number) => {
    lilyPadsRef.current = [
      { x: width * 0.22, y: height * 0.35, size: 45, rotation: 0.4 },
      { x: width * 0.78, y: height * 0.65, size: 55, rotation: 1.2 },
      { x: width * 0.35, y: height * 0.75, size: 38, rotation: 2.1 },
      { x: width * 0.72, y: height * 0.28, size: 42, rotation: 3.5 }
    ];
  }, []);

  const addRipple = useCallback((x: number, y: number, isAuto = false) => {
    const pitch = 0.8 + Math.random() * 0.6;
    soundEngine.playWaterDrop(pitch);

    // Random soft pastel aqua tones
    const colors = ['rgba(56, 189, 248, ', 'rgba(20, 184, 166, ', 'rgba(99, 102, 241, '];
    const color = colors[Math.floor(Math.random() * colors.length)];

    ripplesRef.current.push({
      x,
      y,
      radius: 0,
      maxRadius: isAuto ? 120 + Math.random() * 80 : 160 + Math.random() * 100,
      alpha: 0.8,
      speed: 2.2 + Math.random() * 0.8,
      color
    });
  }, []);

  // Main 60fps render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = parent.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    initPond(rect.width, rect.height);

    let lastRainTime = Date.now();

    const render = () => {
      // 1. Water background gradient
      const grad = ctx.createRadialGradient(
        rect.width / 2, rect.height / 2, 20,
        rect.width / 2, rect.height / 2, Math.max(rect.width, rect.height)
      );
      grad.addColorStop(0, '#0c2333');
      grad.addColorStop(0.6, '#071624');
      grad.addColorStop(1, '#030a12');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, rect.width, rect.height);

      // 2. Soft Rain trigger
      if (softRainActive) {
        const now = Date.now();
        if (now - lastRainTime > 800) {
          addRipple(
            Math.random() * rect.width,
            Math.random() * rect.height,
            true
          );
          lastRainTime = now;
        }
      }

      // 3. Render and update expanding ripples
      for (let i = ripplesRef.current.length - 1; i >= 0; i--) {
        const r = ripplesRef.current[i];
        r.radius += r.speed;
        r.alpha = Math.max(0, 0.8 * (1 - r.radius / r.maxRadius));

        if (r.alpha <= 0.01 || r.radius >= r.maxRadius) {
          ripplesRef.current.splice(i, 1);
          continue;
        }

        // Draw multiple wave rings
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `${r.color}${r.alpha})`;
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Secondary echoing wave crest
        if (r.radius > 15) {
          ctx.beginPath();
          ctx.arc(r.x, r.y, r.radius - 12, 0, Math.PI * 2);
          ctx.strokeStyle = `${r.color}${r.alpha * 0.4})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }

      // 4. Render Lily Pads
      lilyPadsRef.current.forEach((pad) => {
        ctx.save();
        ctx.translate(pad.x, pad.y);
        ctx.rotate(pad.rotation);

        // Shadow under pad
        ctx.beginPath();
        ctx.ellipse(2, 4, pad.size, pad.size * 0.85, 0, 0, Math.PI * 1.85);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.fill();

        // Green leaf
        ctx.beginPath();
        ctx.ellipse(0, 0, pad.size, pad.size * 0.85, 0, 0, Math.PI * 1.85);
        ctx.lineTo(0, 0);
        ctx.fillStyle = '#164e3f';
        ctx.fill();
        ctx.strokeStyle = '#227b64';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Center lotus blossom bud
        ctx.beginPath();
        ctx.arc(-pad.size * 0.1, -pad.size * 0.1, 7, 0, Math.PI * 2);
        ctx.fillStyle = '#f472b6';
        ctx.fill();

        ctx.restore();
      });

      animIdRef.current = requestAnimationFrame(render);
    };

    animIdRef.current = requestAnimationFrame(render);

    return () => {
      if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
    };
  }, [addRipple, initPond, softRainActive]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isPointerDownRef.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    addRipple(e.clientX - rect.left, e.clientY - rect.top);
    lastDropTimeRef.current = Date.now();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isPointerDownRef.current) return;
    const now = Date.now();
    // Throttle dragging wave spawn
    if (now - lastDropTimeRef.current > 120) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      addRipple(e.clientX - rect.left, e.clientY - rect.top);
      lastDropTimeRef.current = now;
    }
  };

  const handlePointerUp = () => {
    isPointerDownRef.current = false;
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-between p-4 bg-cyan-950/20">
      {/* Top action toolbar */}
      <div className="w-full max-w-2xl flex items-center justify-between px-4 py-2 rounded-2xl bg-cyan-950/40 backdrop-blur-md border border-cyan-500/20 text-xs text-cyan-200">
        <span className="flex items-center gap-1.5 font-medium">
          <Droplet className="w-3.5 h-3.5 text-cyan-400" />
          <span>Twilight Water Surface</span>
        </span>
        <button
          onClick={() => {
            soundEngine.playBubblePop(1.1);
            setSoftRainActive((prev) => !prev);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition ${
            softRainActive
              ? 'bg-cyan-500 text-white border-cyan-400 shadow-md shadow-cyan-500/30'
              : 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-200 border-cyan-500/30'
          }`}
        >
          <CloudDrizzle className="w-3.5 h-3.5" />
          <span>{softRainActive ? 'Soft Rain (On)' : 'Soft Rain (Off)'}</span>
        </button>
      </div>

      {/* Interactive Water Canvas */}
      <div className="flex-1 w-full max-w-2xl relative my-3 rounded-3xl overflow-hidden border border-cyan-500/30 shadow-2xl">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className="w-full h-full cursor-pointer touch-none select-none block"
        />
      </div>

      <p className="text-xs text-cyan-200/60 text-center pb-2">
        Touch or drag across the water surface to create harmonic concentric ripples.
      </p>
    </div>
  );
};
