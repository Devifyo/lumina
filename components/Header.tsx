
import React from 'react';

interface HeaderProps {
  onChangeImage?: () => void;
  onToggleHistory?: () => void;
  hasHistory?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onChangeImage, onToggleHistory, hasHistory }) => {
  const APP_NAME = process.env.APP_NAME || 'Lumina Studio';
  
  return (
    <header className="fixed top-0 left-0 right-0 bg-black/80 border-b border-white/5 z-[200] backdrop-blur-2xl">
      <div className="container mx-auto px-4 lg:px-10 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3 lg:gap-5">
          <div className="w-9 h-9 lg:w-11 lg:h-11 bg-indigo-600 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.4)] rotate-3">
            <svg className="w-5 h-5 lg:w-6 lg:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11l-7-7-7 7m14 4l-7-7-7 7" />
            </svg>
          </div>
          <div>
            <h1 className="text-base lg:text-xl font-black text-white tracking-tighter uppercase leading-none flex items-center gap-1.5">
              {APP_NAME} <span className="hidden sm:inline-block text-indigo-500 font-mono text-[8px] lg:text-[9px] align-top px-1.5 lg:py-1 rounded bg-indigo-500/10 border border-indigo-500/20">PRO</span>
            </h1>
            <p className="text-[7px] lg:text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] lg:tracking-[0.4em] mt-0.5">Neural Synthesis Studio</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 lg:gap-8">
          <div className="hidden xl:flex gap-10 text-[9px] font-black uppercase tracking-widest text-slate-500">
            <span className="hover:text-white cursor-pointer transition-all hover:tracking-[0.2em]">Inpainting</span>
            <span className="hover:text-white cursor-pointer transition-all hover:tracking-[0.2em]">Segmentation</span>
            <span className="hover:text-white cursor-pointer transition-all hover:tracking-[0.2em]">HD Restore</span>
          </div>
          
          <div className="flex items-center gap-2">
            {onToggleHistory && (
              <button 
                onClick={onToggleHistory}
                className={`p-2.5 lg:p-3 rounded-xl lg:rounded-2xl border transition-all flex items-center gap-2 group ${hasHistory ? 'bg-slate-900 border-indigo-500/30 text-indigo-400 hover:bg-slate-800' : 'bg-transparent border-slate-800 text-slate-600 cursor-not-allowed opacity-50'}`}
                title="Open Archive Stack"
              >
                <svg className="w-4 h-4 lg:w-5 lg:h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="hidden lg:block text-[9px] font-black uppercase tracking-widest">Archive</span>
              </button>
            )}

            {onChangeImage && (
              <button 
                onClick={onChangeImage}
                className="bg-white/5 hover:bg-white/10 text-white text-[8px] lg:text-[9px] font-black uppercase tracking-widest px-3 lg:px-6 py-2.5 lg:py-3 rounded-xl lg:rounded-2xl border border-white/5 transition-all flex items-center gap-2 lg:gap-3 group"
              >
                <svg className="w-3 h-3 lg:w-4 lg:h-4 group-hover:-rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="sm:inline">New</span><span className="hidden sm:inline">Project</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
