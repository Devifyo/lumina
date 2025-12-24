
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
        relative border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center transition-all duration-300 min-h-[400px]
        ${isDragging ? 'border-indigo-500 bg-indigo-50/50 scale-[1.01]' : 'border-slate-300 bg-white hover:border-slate-400'}
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
      
      <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
        <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
        </svg>
      </div>

      <h3 className="text-xl font-semibold mb-2">Upload your image</h3>
      <p className="text-slate-500 mb-8 text-center max-w-xs">
        Drag and drop your photo here, or click to browse. Supports JPG, PNG, and WebP.
      </p>

      <button 
        onClick={() => fileInputRef.current?.click()}
        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-full transition-all shadow-lg shadow-indigo-200 active:scale-95"
      >
        Choose a File
      </button>

      <div className="mt-12 flex gap-4 text-xs font-medium text-slate-400">
        <span className="flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"/></svg>
          No Quality Loss
        </span>
        <span className="flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"/></svg>
          Secure & Private
        </span>
      </div>
    </div>
  );
};

export default ImageUpload;
