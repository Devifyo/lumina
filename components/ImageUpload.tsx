import React, { useRef, useState } from 'react';

interface ImageUploadProps {
  onUpload: (base64: string, mime: string) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onUpload }) => {
  const APP_NAME = process.env.APP_NAME || 'Lumina Studio';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onUpload(result, file.type);
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div 
      className={`
        relative border-2 border-dashed rounded-[3.5rem] p-12 flex flex-col items-center justify-center transition-all duration-700 min-h-[500px] backdrop-blur-3xl overflow-hidden
        ${isDragging 
          ? 'border-indigo-400 bg-indigo-500/10 scale-[1.02] shadow-[0_0_120px_rgba(99,102,241,0.3)]' 
          : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900/80 shadow-[0_50px_100px_rgba(0,0,0,0.5)]'}
      `}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleChange} 
        className="hidden" 
        accept="image/*"
      />
      
      {/* Neural glow decorative element */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-indigo-600/5 blur-[120px] pointer-events-none transition-opacity duration-700 ${isDragging ? 'opacity-100' : 'opacity-40'}`}></div>
      
      <div className={`
        relative z-10 w-28 h-28 rounded-[2.5rem] flex items-center justify-center mb-12 transition-all duration-700
        ${isDragging 
          ? 'bg-indigo-500 text-white rotate-12 scale-110 shadow-[0_0_50px_rgba(99,102,241,0.6)]' 
          : 'bg-gradient-to-br from-indigo-600/20 to-violet-600/20 text-indigo-400 border border-indigo-500/30 shadow-[inset_0_0_20px_rgba(99,102,241,0.1)]'}
      `}>
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
        </svg>
      </div>

      <div className="relative z-10 text-center space-y-6 max-w-md mb-14">
        <h3 className="text-5xl lg:text-6xl font-extrabold text-white uppercase tracking-tighter leading-none drop-shadow-[0_15px_15px_rgba(0,0,0,0.9)]">
          Neural Canvas
        </h3>
        <div className="flex flex-col gap-3">
          <p className="text-[14px] font-black text-indigo-400 uppercase tracking-[0.5em] drop-shadow-md">
            Professional Vision Lab
          </p>
          <p className="text-[12px] font-medium text-slate-400 uppercase tracking-widest leading-relaxed opacity-90 px-8">
            Inject your assets for high-fidelity <br/> subject isolation & background erasure
          </p>
        </div>
      </div>

      {/* Massive Premium Studio Button */}
      <button 
        onClick={() => fileInputRef.current?.click()}
        className="group relative z-10 overflow-hidden bg-white text-black px-20 py-8 rounded-[3rem] transition-all duration-500 shadow-[0_30px_70px_rgba(0,0,0,0.6)] hover:shadow-[0_40px_80px_rgba(99,102,241,0.4)] hover:-translate-y-2 active:scale-95 border-4 border-white/20"
      >
        <div className="absolute inset-0 bg-indigo-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
        <span className="relative z-10 text-[15px] font-black uppercase tracking-[0.5em] flex items-center gap-6 group-hover:text-white transition-colors duration-300">
          Initialize Studio
          <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
        </span>
      </button>

      <div className="mt-16 relative z-10 flex flex-wrap justify-center gap-10 lg:gap-14">
        <div className="flex items-center gap-3.5 bg-white/5 px-6 py-3 rounded-2xl border border-white/5 backdrop-blur-md">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]"></div>
          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Alpha-PNG Support</span>
        </div>
        <div className="flex items-center gap-3.5 bg-white/5 px-6 py-3 rounded-2xl border border-white/5 backdrop-blur-md">
          <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.8)]"></div>
          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Pro 1K Engine</span>
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;