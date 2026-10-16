import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Compass, RefreshCw } from 'lucide-react';
import { soundEngine } from '../../engine/soundEngine';

interface Point {
  x: number;
  y: number;
}

export const MandalaGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<Point | null>(null);
  const hueRef = useRef(260); // Starts at violet
  const audioThrottleRef = useRef(0);
  const [activeHue, setActiveHue] = useState(260);

  const drawRadialGuides = useCallback((ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number) => {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    // 8 radial axes
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
      ctx.stroke();
    }
    // Subtle concentric reference circles
    [radius * 0.3, radius * 0.6, radius * 0.9].forEach((r) => {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    });
    ctx.restore();
  }, []);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = parent.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);

    ctx.scale(dpr, dpr);
    ctx.fillStyle = '#0f0a1c';
    ctx.fillRect(0, 0, rect.width, rect.height);
    drawRadialGuides(ctx, rect.width / 2, rect.height / 2, Math.min(rect.width, rect.height) * 0.44);
  }, [drawRadialGuides]);

  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = parent.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const newWidth = Math.floor(rect.width * dpr);
    const newHeight = Math.floor(rect.height * dpr);

    if (canvas.width > 0 && canvas.height > 0) {
      const temp = document.createElement('canvas');
      temp.width = canvas.width;
      temp.height = canvas.height;
      const tCtx = temp.getContext('2d');
      if (tCtx) tCtx.drawImage(canvas, 0, 0);

      canvas.width = newWidth;
      canvas.height = newHeight;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(temp, 0, 0, temp.width, temp.height, 0, 0, newWidth, newHeight);
      }
    } else {
      clearCanvas();
    }
  }, [clearCanvas]);

  useEffect(() => {
    handleResize();

    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    let observer: ResizeObserver | null = null;

    if (parent && typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => {
        handleResize();
      });
      observer.observe(parent);
    }

    const handleOrientation = () => {
      setTimeout(handleResize, 100);
    };

    window.addEventListener('orientationchange', handleOrientation);
    window.addEventListener('resize', handleResize);

    return () => {
      if (observer) observer.disconnect();
      window.removeEventListener('orientationchange', handleOrientation);
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);

  const drawSymmetricLine = (from: Point, to: Point) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();

    const cx = rect.width / 2;
    const cy = rect.height / 2;

    // Convert to relative coordinates centered at (0,0)
    const p1x = from.x - cx;
    const p1y = from.y - cy;
    const p2x = to.x - cx;
    const p2y = to.y - cy;

    // Shifting color spectrum
    hueRef.current = (hueRef.current + 0.8) % 360;
    setActiveHue(Math.round(hueRef.current));
    const strokeColor = `hsl(${hueRef.current}, 85%, 68%)`;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = strokeColor;
    ctx.shadowBlur = 8;

    // 8-Fold Symmetry: 4 rotations + reflection
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);

      // Normal rotated line
      const rot1x = p1x * cos - p1y * sin;
      const rot1y = p1x * sin + p1y * cos;
      const rot2x = p2x * cos - p2y * sin;
      const rot2y = p2x * sin + p2y * cos;

      ctx.beginPath();
      ctx.moveTo(rot1x, rot1y);
      ctx.lineTo(rot2x, rot2y);
      ctx.stroke();

      // Mirrored line across radial axis
      const mir1x = p1x * cos + p1y * sin;
      const mir1y = p1x * sin - p1y * cos;
      const mir2x = p2x * cos + p2y * sin;
      const mir2y = p2x * sin - p2y * cos;

      ctx.beginPath();
      ctx.moveTo(mir1x, mir1y);
      ctx.lineTo(mir2x, mir2y);
      ctx.stroke();
    }

    ctx.restore();

    // Harmonic pentatonic tone chime throttled
    const now = Date.now();
    if (now - audioThrottleRef.current > 110) {
      const noteIdx = Math.floor((hueRef.current / 45) % 8);
      soundEngine.playPentatonicNote(noteIdx, 4);
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
    drawSymmetricLine(lastPointRef.current, current);
    lastPointRef.current = current;
  };

  const handlePointerUp = () => {
    isDrawingRef.current = false;
    lastPointRef.current = null;
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-between p-4 bg-purple-950/20">
      {/* Top action toolbar */}
      <div className="w-full max-w-2xl flex items-center justify-between px-4 py-2 rounded-2xl bg-purple-950/40 backdrop-blur-md border border-purple-500/20 text-xs text-purple-200">
        <div className="flex items-center gap-2">
          <Compass className="w-3.5 h-3.5 text-purple-400" />
          <span>8-Way Radial Symmetry</span>
          <span 
            className="w-3 h-3 rounded-full transition-colors"
            style={{ backgroundColor: `hsl(${activeHue}, 85%, 68%)` }}
            title="Current Stroke Hue"
          />
        </div>

        <button
          onClick={() => {
            soundEngine.playBubblePop(0.9);
            clearCanvas();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/30 transition active:scale-95"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Clear Canvas</span>
        </button>
      </div>

      {/* Drawing Canvas */}
      <div className="flex-1 w-full max-w-2xl relative my-3 rounded-3xl overflow-hidden border border-purple-500/30 shadow-2xl">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className="w-full h-full cursor-crosshair touch-none select-none block"
        />
      </div>

      <p className="text-xs text-purple-200/60 text-center pb-2">
        Draw anywhere. 8 mirrored strokes bloom simultaneously in shifting pastel light.
      </p>
    </div>
  );
};
