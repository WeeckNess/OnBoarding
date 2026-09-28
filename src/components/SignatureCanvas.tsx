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

    ctx.strokeStyle = '#00E5FF';
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
      ctx.fillStyle = '#00E5FF';
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
        <div className="flex items-center gap-2 bg-slate-900/80 p-1 rounded-lg border border-white/10 text-xs">
          <button
            type="button"
            onClick={() => setMode('draw')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors ${
              mode === 'draw'
                ? 'bg-brand-600 text-white font-medium shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Dessiner</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('type')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors ${
              mode === 'type'
                ? 'bg-brand-600 text-white font-medium shadow-sm'
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
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-400 transition-colors px-2 py-1 rounded hover:bg-white/5"
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
            placeholder="Tape ton nom complet pour générer ta signature..."
            value={typedName}
            onChange={(e) => handleTypeSubmit(e.target.value)}
            className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-accent-cyan"
          />
        </div>
      )}

      {/* Signature Canvas Box */}
      <div className="relative border-2 border-dashed border-slate-700 hover:border-brand-500/50 rounded-xl bg-slate-950/60 overflow-hidden transition-colors">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className={`w-full h-36 ${mode === 'draw' ? 'cursor-crosshair' : 'cursor-default'}`}
        />

        {!hasContent && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-500 text-xs">
            {mode === 'draw' ? '✍️ Signe ici à la souris ou au doigt' : 'Tape ton nom dans le champ ci-dessus'}
          </div>
        )}

        {hasContent && (
          <div className="absolute top-2 right-2 flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full pointer-events-none">
            <CheckCircle2 className="w-3 h-3" />
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
