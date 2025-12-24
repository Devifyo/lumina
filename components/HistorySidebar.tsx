
import React from 'react';
import { HistoryItem } from '../types';

interface HistorySidebarProps {
  items: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
}

const HistorySidebar: React.FC<HistorySidebarProps> = ({ items, onSelect, onDelete }) => {
  return (
    <aside className="flex flex-col h-full bg-[#020617] w-full max-w-full overflow-hidden">
      {/* Header Container with specific spacing for close button */}
      <div className="p-6 lg:p-8 border-b border-white/5 shrink-0">
        <div className="pr-12 lg:pr-0"> {/* Padding to prevent overlap with X button on mobile */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-[10px] lg:text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] lg:tracking-[0.4em] font-mono truncate">Archive Stack</h2>
              <span className="text-[8px] lg:text-[9px] font-bold tabular-nums bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-500/20 shrink-0">{items.length} units</span>
            </div>
            <p className="text-[8px] lg:text-[9px] text-slate-600 font-bold uppercase tracking-widest leading-tight">Asset history manager</p>
          </div>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto p-4 lg:p-6 space-y-4 no-scrollbar pb-32 lg:pb-12">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-12 text-center opacity-20">
            <svg className="w-12 h-12 mb-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">Stack Buffer Clear</p>
          </div>
        ) : (
          items.map((item) => (
            <div 
              key={item.id}
              className="group relative bg-slate-900/30 border border-white/5 rounded-[2rem] p-4 hover:border-indigo-500/30 transition-all duration-500 hover:shadow-2xl hover:bg-slate-900/50"
            >
              <div className="flex gap-4 relative z-10 cursor-pointer" onClick={() => onSelect(item)}>
                <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl overflow-hidden bg-black checkerboard flex-shrink-0 border border-white/5 group-hover:border-indigo-500/30 transition-all">
                  <img src={item.edited} alt="State Preview" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                </div>
                <div className="flex flex-col justify-center min-w-0 flex-grow">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[9px] lg:text-[10px] font-mono text-indigo-400 font-bold tracking-tighter">
                      ID-{item.id.slice(-6)}
                    </p>
                    <p className="text-[8px] lg:text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <p className="text-[11px] lg:text-xs font-bold text-slate-200 truncate tracking-tight group-hover:text-white transition-colors">
                    {item.prompt}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                     <span className="w-1 h-1 lg:w-1.5 lg:h-1.5 rounded-full bg-emerald-500"></span>
                     <span className="text-[7px] lg:text-[8px] font-black text-slate-600 uppercase tracking-[0.2em]">Validated State</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                <button 
                  onClick={(e) => { e.stopPropagation(); onSelect(item); }}
                  className="text-[9px] font-black text-indigo-400 hover:text-white uppercase tracking-widest px-2 py-1 transition-colors"
                >
                  Recall State
                </button>
                <div className="flex items-center gap-2">
                  <a 
                    href={item.edited} 
                    download={`lumina-${item.id}.png`}
                    className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                    title="Export asset"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                  </a>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                    className="p-2 text-slate-700 hover:text-red-400 hover:bg-red-400/5 rounded-xl transition-all"
                    title="Purge unit"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
};

export default HistorySidebar;
