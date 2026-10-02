import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Waves, Sparkles } from 'lucide-react';
import { soundEngine } from '../../engine/soundEngine';

interface Point {
  x: number;
  y: number;
}

export const ZenSandGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<Point | null>(null);
  const audioThrottleRef = useRef(0);
  const [isSmoothing, setIsSmoothing] = useState(false);

  // Setup canvas resolution and base sand texture
  const drawBaseSand = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Rich warm Japanese sand gradient
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#e5d3b3');
    grad.addColorStop(0.5, '#deb887');
    grad.addColorStop(1, '#d2b48c');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Subtle grain texture
    ctx.fillStyle = 'rgba(0, 0, 0, 0.02)';
    for (let i = 0; i < width; i += 6) {
      for (let j = 0; j < height; j += 6) {
        if ((i + j) % 5 === 0) {
          ctx.fillRect(i, j, 2, 2);
        }
      }
    }

    // Place a few calming Zen stones
    drawZenStone(ctx, width * 0.25, height * 0.35, 38, 28, '#475569');
    drawZenStone(ctx, width * 0.72, height * 0.65, 45, 34, '#334155');
    drawZenStone(ctx, width * 0.77, height * 0.68, 22, 16, '#64748b');
  }, []);

  const drawZenStone = (
    ctx: CanvasRenderingContext2D, 
    x: number, 
    y: number, 
    rx: number, 
    ry: number, 
    color: string
  ) => {
    ctx.save();
    // Drop shadow
    ctx.shadowColor = 'rgba(60, 40, 20, 0.35)';
    ctx.shadowBlur = 14;
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 6;

    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, Math.PI / 6, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();

    // Specular highlight on stone
    ctx.shadowColor = 'transparent';
    ctx.beginPath();
    ctx.ellipse(x - rx * 0.3, y - ry * 0.3, rx * 0.4, ry * 0.3, Math.PI / 6, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.fill();

    ctx.restore();
  };

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = parent.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
      drawBaseSand(ctx, rect.width, rect.height);
    }
  }, [drawBaseSand]);

  useEffect(() => {
    initCanvas();
    window.addEventListener('resize', initCanvas);
    return () => window.removeEventListener('resize', initCanvas);
  }, [initCanvas]);

  // Draw 3-tine rake lines
  const drawRake = (from: Point, to: Point) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const len = Math.hypot(dx, dy);
    if (len < 1) return;

    // Perpendicular vector for 3 tines
    const px = -dy / len;
    const py = dx / len;
    const tineSpacing = 10;

    const offsets = [-tineSpacing, 0, tineSpacing];

    offsets.forEach((offset) => {
      const x1 = from.x + px * offset;
      const y1 = from.y + py * offset;
      const x2 = to.x + px * offset;
      const y2 = to.y + py * offset;

      // Draw shadow ridge (trench depth)
      ctx.beginPath();
      ctx.moveTo(x1 + 1.5, y1 + 1.5);
      ctx.lineTo(x2 + 1.5, y2 + 1.5);
      ctx.strokeStyle = 'rgba(80, 50, 20, 0.22)';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Draw sand groove (lighter highlight)
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = 'rgba(255, 245, 225, 0.4)';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.stroke();
    });

    // Sound effect with throttle
    const now = Date.now();
    if (now - audioThrottleRef.current > 80) {
      soundEngine.playSandRake();
      audioThrottleRef.current = now;
    }
  };

  const getCanvasCoords = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDrawingRef.current = true;
    lastPointRef.current = getCanvasCoords(e);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !lastPointRef.current) return;
    const current = getCanvasCoords(e);
    drawRake(lastPointRef.current, current);
    lastPointRef.current = current;
  };

  const handlePointerUp = () => {
    isDrawingRef.current = false;
    lastPointRef.current = null;
  };

  // Smooth the sand wave animation reset
  const handleSmoothSand = () => {
    if (isSmoothing) return;
    setIsSmoothing(true);
    soundEngine.playWaterDrop(0.9);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = parent.getBoundingClientRect();

    let waveX = 0;
    const speed = rect.width / 35;

    const animFrame = () => {
      waveX += speed;
      ctx.save();
      ctx.fillStyle = 'rgba(230, 205, 170, 0.35)';
      ctx.fillRect(waveX - speed * 2, 0, speed * 2, rect.height);
      ctx.restore();

      if (waveX < rect.width + speed * 2) {
        requestAnimationFrame(animFrame);
      } else {
        drawBaseSand(ctx, rect.width, rect.height);
        setIsSmoothing(false);
        soundEngine.playSuccessChord();
      }
    };
    requestAnimationFrame(animFrame);
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-between p-4 bg-amber-950/20">
      {/* Top action bar */}
      <div className="w-full max-w-2xl flex items-center justify-between px-4 py-2 rounded-2xl bg-amber-950/40 backdrop-blur-md border border-amber-500/20 text-xs text-amber-200">
        <span className="flex items-center gap-1.5 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>3-Tine Bamboo Rake</span>
        </span>
        <button
          onClick={handleSmoothSand}
          disabled={isSmoothing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 transition active:scale-95 disabled:opacity-50"
        >
          <Waves className="w-3.5 h-3.5" />
          <span>{isSmoothing ? 'Smoothing Sand...' : 'Smooth The Sand'}</span>
        </button>
      </div>

      {/* Canvas container */}
      <div className="flex-1 w-full max-w-2xl relative my-3 rounded-3xl overflow-hidden border border-amber-600/30 shadow-2xl">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className="w-full h-full cursor-crosshair touch-none select-none block"
        />
      </div>

      <p className="text-xs text-amber-200/70 text-center pb-2">
        Glide your cursor or finger to carve concentric waves in the sand.
      </p>
    </div>
  );
};
