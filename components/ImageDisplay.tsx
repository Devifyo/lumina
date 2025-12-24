
import React, { useState, useEffect, useRef } from 'react';
import { Selection } from '../types';

interface ImageDisplayProps {
  label: string;
  src: string | null;
  beforeSrc?: string | null;
  isLoading?: boolean;
  showCheckerboard?: boolean;
  onImageClick?: (selection: Selection) => void;
  interactive?: boolean;
  currentSelection?: Selection | null;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({ 
  label, 
  src, 
  beforeSrc,
  isLoading, 
  showCheckerboard, 
  onImageClick,
  interactive,
  currentSelection
}) => {
  const [revealComplete, setRevealComplete] = useState(false);
  const [processingStage, setProcessingStage] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHolding, setIsHolding] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLoading) {
      setRevealComplete(false);
      const interval = setInterval(() => {
        setProcessingStage(prev => (prev + 1) % 4);
      }, 1000);
      return () => clearInterval(interval);
    } else if (src) {
      const timer = setTimeout(() => setRevealComplete(true), 250);
      return () => clearTimeout(timer);
    }
  }, [isLoading, src]);

  const stages = [
    "Analyzing Pixel Vectors",
    "Mapping Geometry",
    "Generative Denoising",
    "Finalizing Asset"
  ];

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current || isLoading) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({ 
      x: e.clientX - rect.left, 
      y: e.clientY - rect.top 
    });
  };

  const handleImageClick = (e: React.MouseEvent) => {
    if (!interactive || !imgRef.current || isLoading || isHolding) return;
    const rect = imgRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    if (x >= 0 && x <= 1 && y >= 0 && y <= 1) onImageClick?.({ x, y });
  };

  const canCompare = !!beforeSrc && !!src && !isLoading;

  return (
    <div className="flex flex-col gap-4 w-full h-full min-h-0 flex-1 select-none group">
      <div className="flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-indigo-500 animate-ping shadow-[0_0_12px_#6366f1]' : 'bg-slate-700'}`}></div>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] font-mono">
            {isHolding ? 'Original' : label} 
            {interactive && !isLoading && !isHolding && (
              <span className={`ml-4 font-black px-2.5 py-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 animate-pulse`}>
                {currentSelection ? 'LOCATION SET' : 'PICK TARGET'}
              </span>
            )}
          </span>
        </div>
      </div>
      
      <div 
        ref={containerRef}
        className={`
          relative flex-1 rounded-[2.5rem] overflow-hidden border transition-all duration-700 flex items-center justify-center w-full min-h-0
          ${showCheckerboard ? 'checkerboard bg-[#080c14]' : 'bg-[#05080f] shadow-inner'}
          ${interactive && !isLoading && !isHolding ? 'cursor-none ring-4 ring-indigo-500/5' : ''}
          ${isHolding ? 'border-amber-500/60 ring-8 ring-amber-500/5 shadow-2xl' : 'border-white/5 hover:border-white/10 shadow-2xl'}
        `}
        onMouseMove={handleMouseMove}
      >
        {isLoading && <div className="scan-line"></div>}

        {isLoading ? (
          <div className="flex flex-col items-center gap-10 z-30 p-10 text-center animate-in fade-in duration-500">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 border-4 border-slate-900 rounded-full opacity-50"></div>
              <div className="absolute inset-0 border-t-4 border-indigo-600 rounded-full animate-spin"></div>
            </div>
            <div className="space-y-3">
              <p className="text-[10px] font-black text-indigo-500 tracking-[0.5em] uppercase font-mono mb-1">
                Synthesizing
              </p>
              <p className="text-[12px] font-black text-slate-300 tracking-widest uppercase">
                {stages[processingStage]}
              </p>
            </div>
          </div>
        ) : src ? (
          <div className="relative w-full h-full flex items-center justify-center p-4 lg:p-8" onClick={handleImageClick}>
            <div className="relative w-full h-full flex items-center justify-center">
              {beforeSrc && (
                <img 
                  src={beforeSrc} 
                  alt="Original" 
                  className={`max-w-full max-h-full w-auto h-auto object-contain transition-opacity duration-200 select-none pointer-events-none ${isHolding ? 'opacity-100' : 'opacity-0'}`}
                />
              )}

              <img 
                ref={imgRef}
                src={src} 
                alt="Render" 
                className={`
                  max-w-full max-h-full w-auto h-auto object-contain transition-all duration-500 select-none
                  ${beforeSrc ? 'absolute' : ''}
                  ${isHolding ? 'opacity-0 scale-98 pointer-events-none blur-xl' : 'opacity-100 scale-100'}
                  ${!revealComplete && 'opacity-0 scale-95 blur-lg'}
                `}
              />

              {/* Action Overlay: Download */}
              {!isHolding && revealComplete && (
                <div className="absolute top-6 right-6 z-50 animate-in fade-in zoom-in duration-500">
                  <a 
                    href={src} 
                    download={`lumina-${Date.now()}.png`}
                    className="flex items-center gap-3 px-6 py-3.5 bg-black/60 backdrop-blur-3xl text-white border border-white/10 rounded-2xl hover:bg-indigo-600 hover:border-indigo-400 transition-all shadow-2xl active:scale-95 group overflow-hidden"
                  >
                    <svg className="w-4 h-4 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    <span className="text-[10px] font-black uppercase tracking-widest">Download PNG</span>
                  </a>
                </div>
              )}

              {/* Holding Label */}
              {isHolding && (
                <div className="absolute top-6 left-1/2 -translate-x-1/2 z-40 bg-amber-500 text-black text-[9px] font-black px-6 py-2 rounded-full shadow-2xl tracking-[0.3em] uppercase">
                  Comparing Original
                </div>
              )}

              {/* Interactive Tool Button */}
              {canCompare && (
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 w-full flex justify-center px-10">
                  <button
                    onMouseDown={() => setIsHolding(true)}
                    onMouseUp={() => setIsHolding(false)}
                    onMouseLeave={() => setIsHolding(false)}
                    onTouchStart={(e) => { e.preventDefault(); setIsHolding(true); }}
                    onTouchEnd={() => setIsHolding(false)}
                    className={`
                      px-10 py-4.5 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.3em] transition-all shadow-2xl active:scale-95 border whitespace-nowrap
                      ${isHolding ? 'bg-amber-500 text-black border-amber-400 scale-110 shadow-amber-500/30' : 'bg-black/40 backdrop-blur-3xl text-white border-white/10 hover:bg-white/10'}
                    `}
                  >
                    Hold to Compare
                  </button>
                </div>
              )}
            </div>
            
            {/* Visual Aids */}
            {interactive && !isLoading && !isHolding && (
              <div 
                className="absolute pointer-events-none z-50 transition-transform duration-75 ease-out"
                style={{ left: mousePos.x + 'px', top: mousePos.y + 'px', transform: 'translate(-50%, -50%)' }}
              >
                <div className="w-14 h-14 border border-indigo-500/40 rounded-full flex items-center justify-center">
                   <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full shadow-[0_0_10px_#6366f1]"></div>
                   <div className="absolute top-0 w-px h-3 bg-indigo-500/50"></div>
                   <div className="absolute bottom-0 w-px h-3 bg-indigo-500/50"></div>
                   <div className="absolute left-0 h-px w-3 bg-indigo-500/50"></div>
                   <div className="absolute right-0 h-px w-3 bg-indigo-500/50"></div>
                </div>
              </div>
            )}

            {currentSelection && !isHolding && (
              <div 
                className="absolute z-10 pointer-events-none"
                style={{ left: `calc(${currentSelection.x * 100}% )`, top: `calc(${currentSelection.y * 100}% )`, transform: 'translate(-50%, -50%)' }}
              >
                <div className="relative">
                   <div className="w-6 h-6 bg-indigo-500/20 rounded-full border border-indigo-500 animate-ping"></div>
                   <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full shadow-[0_0_8px_#6366f1]"></div>
                   </div>
                   <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 bg-indigo-600 text-white text-[8px] font-black px-3 py-1.5 rounded-full whitespace-nowrap shadow-xl border border-white/10">
                      TARGET SET
                   </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6 opacity-10">
            <div className="w-20 h-20 border-2 border-slate-700 rounded-[2rem] flex items-center justify-center">
               <svg className="w-8 h-8 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <p className="text-[11px] font-black text-slate-600 uppercase tracking-[0.6em] font-mono">Standby</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageDisplay;
