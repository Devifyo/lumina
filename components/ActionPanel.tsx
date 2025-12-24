
import React, { useState } from 'react';
import { EditMode } from '../types';

interface ActionPanelProps {
  onEdit: (mode: EditMode, prompt?: string) => void;
  isProcessing: boolean;
  onReset: () => void;
  onChangeImage: () => void;
  onToggleSelect: () => void;
  isSelectMode: boolean;
  hasSelection: boolean;
}

const ActionPanel: React.FC<ActionPanelProps> = ({ 
  onEdit, 
  isProcessing, 
  onReset, 
  onChangeImage,
  onToggleSelect, 
  isSelectMode,
  hasSelection
}) => {
  const [activeTab, setActiveTab] = useState<'remove' | 'enhance' | 'edit'>('remove');
  const [lastMode, setLastMode] = useState<EditMode | null>(null);
  const [objectToRemove, setObjectToRemove] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');

  const handleModeAction = (mode: EditMode, prompt?: string) => {
    setLastMode(mode);
    onEdit(mode, prompt);
  };

  const handleRemoveObject = () => {
    if (!objectToRemove.trim() && !hasSelection) return;
    handleModeAction(EditMode.REMOVE_OBJECT, objectToRemove);
  };

  return (
    <div className="flex flex-col h-full bg-[#020617] w-full max-w-full overflow-hidden">
      <div className="p-6 lg:p-10 pb-6 shrink-0">
        <h2 className="text-[10px] lg:text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] lg:tracking-[0.5em] mb-6 lg:mb-8 font-mono border-l-2 border-indigo-600 pl-4">Neural Engine v3.1</h2>
        
        <div className="flex flex-col gap-1.5 lg:gap-2 bg-slate-900/20 p-2 rounded-[1.5rem] lg:rounded-[2rem] border border-white/5 mb-6 lg:mb-10">
          <button 
            onClick={() => setActiveTab('remove')}
            className={`flex items-center gap-3 lg:gap-4 py-3 lg:py-4 px-4 lg:px-6 rounded-xl lg:rounded-2xl text-[9px] lg:text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'remove' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 ring-1 ring-white/10' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
          >
            <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1v3M4 7h16" /></svg>
            ERASER
          </button>
          <button 
            onClick={() => setActiveTab('enhance')}
            className={`flex items-center gap-3 lg:gap-4 py-3 lg:py-4 px-4 lg:px-6 rounded-xl lg:rounded-2xl text-[9px] lg:text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'enhance' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 ring-1 ring-white/10' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
          >
            <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            RETOUCH
          </button>
          <button 
            onClick={() => setActiveTab('edit')}
            className={`flex items-center gap-3 lg:gap-4 py-3 lg:py-4 px-4 lg:px-6 rounded-xl lg:rounded-2xl text-[9px] lg:text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'edit' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 ring-1 ring-white/10' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
          >
            <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
            CREATIVE
          </button>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto px-6 lg:px-10 no-scrollbar">
        <div className="pb-40 lg:pb-32">
          {activeTab === 'remove' ? (
            <div className="space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
              <div className="grid grid-cols-1 gap-4 lg:gap-5">
                <button 
                  onClick={() => handleModeAction(EditMode.REMOVE_BACKGROUND)}
                  disabled={isProcessing}
                  className={`group flex items-center gap-4 lg:gap-5 p-5 lg:p-6 border-2 rounded-[1.5rem] lg:rounded-[2rem] transition-all disabled:opacity-50 text-left ${lastMode === EditMode.REMOVE_BACKGROUND ? 'bg-indigo-600/10 border-indigo-500 shadow-2xl shadow-indigo-600/10' : 'bg-slate-900/40 border-slate-800/60 hover:border-slate-700'}`}
                >
                  <div className="w-10 h-10 lg:w-14 lg:h-14 bg-indigo-500/10 rounded-xl lg:rounded-2xl flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 lg:w-8 lg:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                  </div>
                  <div>
                    <span className="font-black text-[11px] lg:text-[12px] text-white uppercase tracking-widest block">Cutout</span>
                    <span className="text-[9px] lg:text-[10px] text-slate-500 font-medium">Clear PNG</span>
                  </div>
                </button>

                <div className="pt-4 lg:pt-6 space-y-4 lg:space-y-5">
                   <p className="text-[9px] lg:text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] px-2 flex items-center gap-3">
                     <span className="h-px bg-slate-800 flex-grow"></span>
                     Eraser
                     <span className="h-px bg-slate-800 flex-grow"></span>
                   </p>
                   <button 
                    onClick={onToggleSelect}
                    disabled={isProcessing}
                    className={`w-full group flex items-center gap-4 lg:gap-5 p-5 lg:p-6 border-2 rounded-[1.5rem] lg:rounded-[2rem] transition-all disabled:opacity-50 text-left ${isSelectMode ? 'bg-indigo-600 border-indigo-400 shadow-2xl shadow-indigo-600/20' : 'bg-slate-900/40 border-slate-800/60 hover:border-slate-700'}`}
                  >
                    <div className="w-10 h-10 lg:w-14 lg:h-14 bg-indigo-500/10 rounded-xl lg:rounded-2xl flex items-center justify-center text-indigo-400">
                      <svg className="w-6 h-6 lg:w-8 lg:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" /></svg>
                    </div>
                    <div>
                      <span className="font-black text-[11px] lg:text-[12px] text-white uppercase tracking-widest block">{hasSelection ? 'Locked' : 'Pick Area'}</span>
                      <span className="text-[9px] lg:text-[10px] text-slate-500 font-medium">Click on canvas</span>
                    </div>
                  </button>

                  <div className="relative group bg-slate-900/60 p-2 rounded-[1.8rem] lg:rounded-[2.2rem] border border-white/5 transition-all focus-within:ring-2 focus-within:ring-indigo-500/30">
                    <input 
                      type="text" 
                      value={objectToRemove}
                      onChange={(e) => setObjectToRemove(e.target.value)}
                      placeholder={hasSelection ? "Locked..." : "Type object..."}
                      disabled={hasSelection}
                      className="w-full bg-transparent border-none rounded-2xl lg:rounded-3xl pl-4 pr-[80px] lg:pl-6 lg:pr-[120px] py-4 lg:py-5 text-sm focus:ring-0 transition-all text-slate-100 placeholder-slate-700 font-bold"
                    />
                    <button 
                      onClick={handleRemoveObject}
                      disabled={isProcessing || (!objectToRemove.trim() && !hasSelection)}
                      className={`absolute right-2 top-2 bottom-2 px-4 lg:px-8 rounded-[1rem] lg:rounded-[1.5rem] text-[10px] lg:text-[11px] font-black uppercase tracking-widest transition-all ${hasSelection ? 'bg-green-600 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-30'}`}
                    >
                      OK
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'enhance' ? (
            <div className="space-y-4 lg:space-y-5 animate-in fade-in slide-in-from-left-4 duration-500">
              {[
                { id: EditMode.ENHANCE, title: 'Restore', desc: 'Sharpen textures', icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z' },
                { id: EditMode.BLUR_BACKGROUND, title: 'Portrait', desc: 'Neural bokeh', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' },
              ].map((item) => (
                <button 
                  key={item.id}
                  onClick={() => handleModeAction(item.id as EditMode)}
                  disabled={isProcessing}
                  className={`w-full group flex items-center gap-4 lg:gap-6 p-5 lg:p-7 border-2 rounded-[1.8rem] lg:rounded-[2.2rem] transition-all disabled:opacity-50 text-left ${lastMode === item.id ? 'bg-indigo-600/10 border-indigo-500 shadow-2xl shadow-indigo-600/10' : 'bg-slate-900/40 border-slate-800/60 hover:border-slate-700'}`}
                >
                  <div className="w-10 h-10 lg:w-14 lg:h-14 bg-indigo-500/10 rounded-xl lg:rounded-2xl flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
                    <svg className="w-6 h-6 lg:w-8 lg:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={item.icon} /></svg>
                  </div>
                  <div>
                    <p className="font-black text-[11px] lg:text-[12px] text-white uppercase tracking-widest">{item.title}</p>
                    <p className="text-[9px] lg:text-[10px] text-slate-500 mt-1 font-medium">{item.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-4 lg:space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
              <div className="relative bg-slate-900/40 rounded-[1.8rem] lg:rounded-[2.5rem] border border-white/5 p-3">
                <textarea 
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Describe vision..."
                  className="w-full h-40 lg:h-64 bg-transparent border-none rounded-2xl lg:rounded-3xl px-4 lg:px-6 py-4 lg:py-6 text-sm focus:ring-0 transition-all text-slate-100 resize-none placeholder-slate-700 font-bold"
                />
              </div>
              <button 
                onClick={() => handleModeAction(EditMode.CUSTOM_PROMPT, customPrompt)}
                disabled={isProcessing || !customPrompt.trim()}
                className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-5 lg:py-7 rounded-[1.8rem] lg:rounded-[2.2rem] font-black uppercase tracking-[0.3em] lg:tracking-[0.5em] text-[10px] lg:text-[11px] hover:shadow-[0_24px_48px_-12px_rgba(79,70,229,0.5)] transition-all disabled:opacity-30 border border-white/10"
              >
                Synthesize
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 lg:p-10 border-t border-white/5 bg-[#020617]/95 backdrop-blur-3xl sticky bottom-0 z-10 pb-28 lg:pb-10">
        <div className="flex items-center justify-between gap-4 lg:gap-6">
           <button 
              onClick={onReset}
              className="flex-1 text-[9px] lg:text-[11px] font-black text-slate-500 hover:text-white uppercase tracking-[0.2em] lg:tracking-[0.3em] transition-colors flex items-center justify-center gap-2 lg:gap-3 py-3 lg:py-4 bg-slate-900/40 rounded-xl lg:rounded-2xl border border-white/5"
            >
              Flush
            </button>
            <button 
              onClick={onChangeImage}
              className="flex-1 text-[9px] lg:text-[11px] font-black text-slate-500 hover:text-red-400 uppercase tracking-[0.2em] lg:tracking-[0.3em] transition-colors flex items-center justify-center gap-2 lg:gap-3 py-3 lg:py-4 bg-slate-900/40 rounded-xl lg:rounded-2xl border border-white/5"
            >
              New
            </button>
        </div>
      </div>
    </div>
  );
};

export default ActionPanel;
