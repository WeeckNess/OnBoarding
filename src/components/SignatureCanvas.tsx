'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Eraser, CheckCircle2, PenTool, Type } from 'lucide-react';

interface SignatureCanvasProps {
  onSave: (signatureDataUrl: string) => void;
  initialSignature?: string;
}

export default function SignatureCanvas({ onSave, initialSignature }: SignatureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasContent, setHasContent] = useState(Boolean(initialSignature));
  const [mode, setMode] = useState<'draw' | 'type'>('draw');
  const [typedName, setTypedName] = useState('');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas resolution
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    ctx.strokeStyle = '#E4E4E7';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (initialSignature) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
      };
      img.src = initialSignature;
    }
  }, [initialSignature]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (mode !== 'draw') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || mode !== 'draw') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
    setHasContent(true);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      onSave(canvas.toDataURL());
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    setHasContent(false);
    setTypedName('');
    onSave('');
  };

  const handleTypeSubmit = (name: string) => {
    setTypedName(name);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);

    if (name.trim()) {
      ctx.font = 'italic 32px "Caveat", "Brush Script MT", cursive, sans-serif';
      ctx.fillStyle = '#E4E4E7';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(name, rect.width / 2, rect.height / 2);
      setHasContent(true);
      onSave(canvas.toDataURL());
    } else {
      setHasContent(false);
      onSave('');
    }
  };

  return (
    <div className="space-y-3">
      {/* Mode Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 bg-carbon-850 p-1 rounded-xl border border-white/10 text-xs">
          <button
            type="button"
            onClick={() => setMode('draw')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              mode === 'draw'
                ? 'bg-zinc-100 text-carbon-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Dessiner</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('type')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              mode === 'type'
                ? 'bg-zinc-100 text-carbon-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>Saisie clavier</span>
          </button>
        </div>

        <button
          type="button"
          onClick={clearCanvas}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-400 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-white/5 cursor-pointer"
        >
          <Eraser className="w-3.5 h-3.5" />
          <span>Effacer</span>
        </button>
      </div>

      {/* Typing input if in typing mode */}
      {mode === 'type' && (
        <div>
          <input
            type="text"
            placeholder="Tapez votre nom complet pour générer la signature..."
            value={typedName}
            onChange={(e) => handleTypeSubmit(e.target.value)}
            className="w-full bg-carbon-850 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>
      )}

      {/* Signature Canvas Box */}
      <div data-tour="signature-pad" className="relative border-2 border-dashed border-white/15 hover:border-brand-500/50 rounded-2xl bg-carbon-900 overflow-hidden transition-colors">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className={`w-full h-36 touch-none ${mode === 'draw' ? 'cursor-crosshair' : 'cursor-default'}`}
        />

        {!hasContent && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-500 text-xs">
            {mode === 'draw' ? '✍️ Signez ici à la souris ou au doigt' : 'Tapez votre nom ci-dessus'}
          </div>
        )}

        {hasContent && (
          <div className="absolute top-2 right-2 flex items-center gap-1 text-[10px] text-brand-300 bg-brand-950/80 border border-brand-500/30 px-2.5 py-0.5 rounded-full pointer-events-none font-medium">
            <CheckCircle2 className="w-3 h-3 text-brand-400" />
            <span>Prêt à valider</span>
          </div>
        )}
      </div>
      <p className="text-[11px] text-slate-400 text-center">
        En apposant votre signature électronique, vous certifiez l’exactitude de vos informations et acceptez le règlement intérieur de Data Insight.
      </p>
    </div>
  );
}
