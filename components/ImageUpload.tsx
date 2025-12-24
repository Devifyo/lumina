
import React, { useRef, useState } from 'react';

interface ImageUploadProps {
  onUpload: (base64: string, mime: string) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onUpload }) => {
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
        relative border-2 border-dashed rounded-[3rem] p-12 flex flex-col items-center justify-center transition-all duration-500 min-h-[420px] backdrop-blur-3xl
        ${isDragging 
          ? 'border-indigo-500 bg-indigo-500/10 scale-[1.02] shadow-[0_0_80px_rgba(99,102,241,0.2)]' 
          : 'border-slate-800 bg-slate-900/40 hover:border-slate-600 hover:bg-slate-900/60 shadow-2xl'}
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
      
      <div className={`
        w-24 h-24 rounded-3xl flex items-center justify-center mb-8 transition-all duration-500
        ${isDragging ? 'bg-indigo-500 text-white rotate-12 scale-110' : 'bg-indigo-600/10 text-indigo-400'}
      `}>
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
        </svg>
      </div>

      <div className="text-center space-y-4 max-w-sm mb-10">
        <h3 className="text-2xl font-black text-white uppercase tracking-tight">
          Upload Source Image
        </h3>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-relaxed">
          Drag and drop assets into the workspace or click to browse local storage
        </p>
      </div>

      <button 
        onClick={() => fileInputRef.current?.click()}
        className="group relative overflow-hidden bg-indigo-600 hover:bg-indigo-500 text-white px-12 py-5 rounded-[2rem] transition-all shadow-2xl active:scale-95"
      >
        <span className="relative z-10 text-[11px] font-black uppercase tracking-[0.4em] flex items-center gap-3">
          Initialize Studio
        </span>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
      </button>

      <div className="mt-14 flex flex-wrap justify-center gap-8 lg:gap-12">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Lossless Synthesis</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]"></div>
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Edge Refinement</span>
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;
