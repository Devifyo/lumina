import React, { useState, useRef, useEffect } from 'react';
import { EditMode, HistoryItem, Selection } from './types';
import { editImage } from './services/geminiService';
import Header from './components/Header';
import ImageUpload from './components/ImageUpload';
import ActionPanel from './components/ActionPanel';
import ImageDisplay from './components/ImageDisplay';
import HistorySidebar from './components/HistorySidebar';
import LegalModal, { LegalPageType } from './components/LegalModal';

type MobileTab = 'view' | 'edit' | 'history';

interface ConfirmationState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  confirmStyle?: 'danger' | 'primary';
}

const App: React.FC = () => {
  const APP_NAME = process.env.APP_NAME || 'Lumina Studio';
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [originalMimeType, setOriginalMimeType] = useState<string>('image/png');
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<{ message: string; isNotFound?: boolean; isQuota?: boolean } | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [pendingSelection, setPendingSelection] = useState<Selection | null>(null);
  const [applyToResult, setApplyToResult] = useState(true);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  
  const [activeLegalPage, setActiveLegalPage] = useState<LegalPageType | null>(null);

  const [confirm, setConfirm] = useState<ConfirmationState>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const [activeTab, setActiveTab] = useState<MobileTab>('view');
  const previewAreaRef = useRef<HTMLDivElement>(null);

  const handleOpenKeySelector = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setError(null);
    }
  };

  const handleUpload = (base64: string, mime: string) => {
    setOriginalImage(base64);
    setOriginalMimeType(mime);
    setEditedImage(null);
    setError(null);
    setPendingSelection(null);
    setIsSelectMode(false);
    setApplyToResult(true);
    setHistory([]);
    setActiveTab('view');
  };

  const handleEdit = async (mode: EditMode, prompt?: string, selection?: Selection) => {
    const baseImage = (applyToResult && editedImage) ? editedImage : originalImage;
    if (!baseImage) return;

    setIsProcessing(true);
    setError(null);
    setActiveTab('view'); 
    setIsHistoryOpen(false);
    
    try {
      const cleanBase64 = baseImage.split(',')[1];
      const targetSelection = selection || pendingSelection || undefined;
      const result = await editImage(cleanBase64, originalMimeType, mode, prompt, targetSelection as Selection);

      if (result) {
        setEditedImage(result);
        let promptText = prompt || 'Neural Transformation';
        if (mode === EditMode.REMOVE_BACKGROUND) promptText = 'Alpha Extraction';
        if (mode === EditMode.ENHANCE) promptText = 'Visual Polish';
        if (mode === EditMode.BLUR_BACKGROUND) promptText = 'Depth Focus';
        if (targetSelection && mode === EditMode.REMOVE_OBJECT) promptText = `Smart Erasure`;

        const newHistoryItem: HistoryItem = {
          id: Date.now().toString(),
          original: baseImage,
          edited: result,
          prompt: promptText,
          timestamp: Date.now(),
        };
        setHistory(prev => [newHistoryItem, ...prev]);
      } else {
        setError({ message: "Engine was unable to generate an image for this request. Try adjusting your parameters or picking a different area." });
      }
    } catch (err: any) {
      const msg = err.message || "";
      const errorStr = JSON.stringify(err);
      const isEntityNotFound = msg.includes("Requested entity was not found") || errorStr.includes("NOT_FOUND") || msg.includes("404");
      const isQuota = msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED") || msg.includes("quota") || msg.includes("limit");
      
      if (isEntityNotFound) {
        setError({ 
          message: "API Entity mismatch. Your current project may not have access to these vision models.",
          isNotFound: true
        });
      } else if (isQuota) {
        setError({ 
          message: "Vision Lab Quota Exceeded. Please try again in a moment or switch to a paid API key for higher throughput.",
          isQuota: true
        });
      } else if (msg.includes("403") || msg.includes("PERMISSION_DENIED") || errorStr.includes("403")) {
        setError({ 
          message: "Permission Denied. Ensure your API project has Billing enabled for these specific models.",
          isNotFound: true 
        });
      } else {
        setError({ message: msg || "Neural Synthesis encountered an unexpected error." });
      }
    } finally {
      setIsProcessing(false);
      setIsSelectMode(false);
      setPendingSelection(null);
    }
  };

  const showConfirm = (title: string, message: string, onConfirm: () => void, style: 'danger' | 'primary' = 'danger') => {
    setConfirm({ isOpen: true, title, message, onConfirm, confirmStyle: style });
  };

  const handleDeleteHistory = (id: string) => {
    showConfirm(
      "Purge Asset?", 
      "This specific mutation will be permanently removed from your history buffer.", 
      () => {
        const newHistory = history.filter(item => item.id !== id);
        setHistory(newHistory);
        if (newHistory.length > 0) {
          setEditedImage(newHistory[0].edited);
        } else {
          setEditedImage(null);
        }
        setConfirm(prev => ({ ...prev, isOpen: false }));
      }
    );
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    showConfirm(
      "Revert Mutation?", 
      "Discard your most recent changes and restore the previous state?",
      () => {
        const newHistory = [...history];
        newHistory.shift();
        setHistory(newHistory);
        setEditedImage(newHistory.length > 0 ? newHistory[0].edited : null);
        setConfirm(prev => ({ ...prev, isOpen: false }));
      },
      'primary'
    );
  };

  const handleChangeImage = () => {
    showConfirm(
      "Discard Session?", 
      "Warning: This will clear your current canvas and purge your entire history stack.", 
      () => {
        setOriginalImage(null);
        setEditedImage(null);
        setError(null);
        setIsSelectMode(false);
        setPendingSelection(null);
        setHistory([]);
        setActiveTab('view');
        setIsHistoryOpen(false);
        setConfirm(prev => ({ ...prev, isOpen: false }));
      }
    );
  };

  const handleReset = () => {
    showConfirm(
      "Reset Canvas?", 
      "Revert to the raw original image and clear all mutations?", 
      () => {
        setEditedImage(null);
        setError(null);
        setPendingSelection(null);
        setIsSelectMode(false);
        setHistory([]);
        setConfirm(prev => ({ ...prev, isOpen: false }));
      }
    );
  };

  const handleSelectFromHistory = (item: HistoryItem) => {
    setEditedImage(item.edited);
    setPendingSelection(null);
    setIsSelectMode(false);
    setActiveTab('view');
    setIsHistoryOpen(false);
  };

  const isAnyHistoryOpen = isHistoryOpen || activeTab === 'history';

  return (
    <div className="min-h-screen flex flex-col bg-[#020617] text-slate-100 overflow-x-hidden pt-20">
      <Header 
        onChangeImage={originalImage ? handleChangeImage : undefined} 
        onToggleHistory={originalImage ? () => {
          setIsHistoryOpen(!isHistoryOpen);
          if (activeTab === 'history') setActiveTab('view');
        } : undefined}
        hasHistory={history.length > 0}
      />
      
      {!originalImage ? (
        <main className="flex-grow flex flex-col items-center justify-center p-6 relative overflow-y-auto no-scrollbar">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none"></div>
           <div className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-700 relative z-10 py-12">
             <ImageUpload onUpload={handleUpload} />
           </div>
           
           <footer className="mt-8 mb-40 relative z-10 flex flex-wrap justify-center gap-x-8 gap-y-4 text-[10px] font-black uppercase tracking-widest text-slate-500 max-w-lg text-center px-4">
             <button onClick={() => setActiveLegalPage('privacy')} className="hover:text-indigo-400 transition-colors">Privacy Policy</button>
             <button onClick={() => setActiveLegalPage('terms')} className="hover:text-indigo-400 transition-colors">Terms of Service</button>
             <button onClick={() => setActiveLegalPage('contact')} className="hover:text-indigo-400 transition-colors">Contact Us</button>
             <button onClick={() => setActiveLegalPage('cookies')} className="hover:text-indigo-400 transition-colors">Cookie Settings</button>
             <button onClick={() => setActiveLegalPage('about')} className="hover:text-indigo-400 transition-colors">About {APP_NAME}</button>
           </footer>
        </main>
      ) : (
        <main className="flex-grow flex flex-col lg:flex-row lg:h-[calc(100vh-80px)] relative overflow-y-auto lg:overflow-hidden no-scrollbar">
          <div className={`
            lg:w-[380px] lg:min-w-[380px] lg:h-full lg:overflow-y-auto lg:border-r lg:border-white/5 bg-[#020617] z-30 transition-all duration-300
            ${activeTab === 'edit' ? 'block fixed inset-0 z-[60] pt-20 pb-32' : 'hidden lg:block'}
          `}>
             <ActionPanel 
                onEdit={handleEdit} 
                isProcessing={isProcessing} 
                onReset={handleReset}
                onChangeImage={handleChangeImage}
                onToggleSelect={() => setIsSelectMode(!isSelectMode)}
                isSelectMode={isSelectMode}
                hasSelection={!!pendingSelection}
              />
          </div>

          <div ref={previewAreaRef} className={`
            flex-grow relative lg:h-full bg-[#05080f] flex flex-col min-h-[70vw] sm:min-h-0
            ${activeTab === 'view' ? 'flex' : 'hidden lg:flex'}
          `}>
            <div className="flex-grow flex flex-col p-4 lg:p-12 items-center justify-center w-full h-full lg:overflow-hidden">
              <div className="w-full h-full flex flex-col xl:flex-row gap-6 lg:gap-12 items-center justify-center">
                <div className={`${editedImage ? 'hidden xl:flex' : 'flex'} w-full h-full items-stretch justify-center flex-1 min-w-0`}>
                  <ImageDisplay 
                    label={editedImage && applyToResult ? "Working Buffer" : "Raw Input"} 
                    src={editedImage && applyToResult ? editedImage : originalImage} 
                    interactive={isSelectMode}
                    onImageClick={(sel) => setPendingSelection(sel)}
                    currentSelection={pendingSelection}
                  />
                </div>
                <div className="flex w-full h-full items-stretch justify-center flex-1 min-w-0">
                  <ImageDisplay 
                    label="Neural Result" 
                    src={editedImage} 
                    beforeSrc={originalImage} 
                    isLoading={isProcessing}
                    showCheckerboard={true}
                  />
                </div>
              </div>

              {editedImage && !isProcessing && (
                <div className="fixed bottom-28 lg:bottom-12 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 lg:gap-4 bg-[#0f172a]/95 backdrop-blur-3xl px-4 py-3.5 lg:py-4 rounded-[2.5rem] border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.6)] animate-in slide-in-from-bottom-4">
                  <button 
                    onClick={() => setApplyToResult(!applyToResult)}
                    className={`px-5 lg:px-6 py-3.5 lg:py-4 rounded-3xl text-[9px] lg:text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-3 lg:gap-4 ${applyToResult ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30' : 'bg-slate-800 text-slate-400'}`}
                  >
                    <div className={`w-2 h-2 rounded-full ${applyToResult ? 'bg-white shadow-[0_0_8px_white]' : 'bg-slate-600'}`}></div>
                    Compound Mutations
                  </button>
                  <button 
                    onClick={handleUndo}
                    disabled={history.length === 0}
                    className="px-5 lg:px-6 py-3.5 lg:py-4 rounded-3xl text-[9px] lg:text-[11px] font-black uppercase tracking-widest bg-slate-800 text-slate-300 hover:text-red-400 border border-white/5 transition-all disabled:opacity-20"
                  >
                    Undo
                  </button>
                </div>
              )}

              {error && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[300] px-8 py-5 bg-red-950/90 backdrop-blur-3xl border border-red-500/30 text-red-100 rounded-[2rem] text-[11px] font-black uppercase tracking-widest flex flex-col items-center gap-4 shadow-2xl animate-in slide-in-from-top-6 max-w-[90vw]">
                  <div className="flex items-center gap-4 w-full">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_12px_red] shrink-0"></div>
                    <div className="flex-1">{error.message}</div>
                  </div>
                  {(error.isNotFound || error.isQuota) && (
                    <button 
                      onClick={handleOpenKeySelector}
                      className="mt-2 lg:mt-0 lg:ml-4 bg-white text-black px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all whitespace-nowrap"
                    >
                      {error.isQuota ? 'Switch to Paid Project' : 'Select New Project'}
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="h-32 lg:hidden shrink-0"></div>
          </div>

          <div 
            className={`
              fixed inset-y-0 right-0 z-[500] w-full lg:w-[420px] transform transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) bg-[#020617] border-l border-white/5 shadow-[0_0_100px_rgba(0,0,0,0.9)]
              ${isAnyHistoryOpen ? 'translate-x-0' : 'translate-x-full'}
            `}
          >
             <div className="h-full relative flex flex-col">
               <button 
                  onClick={() => {
                    setIsHistoryOpen(false);
                    setActiveTab('view');
                  }}
                  className="absolute top-6 right-6 lg:top-8 lg:right-8 z-[510] flex items-center justify-center p-3.5 bg-white/10 hover:bg-white/20 rounded-[1.2rem] text-white transition-all shadow-2xl border border-white/10 group backdrop-blur-3xl"
                  aria-label="Close Archive"
                >
                  <svg className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
               <HistorySidebar 
                  items={history} 
                  onSelect={handleSelectFromHistory} 
                  onDelete={handleDeleteHistory}
                />
             </div>
          </div>

          {isAnyHistoryOpen && (
            <div 
              className="fixed inset-0 z-[490] bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
              onClick={() => {
                setIsHistoryOpen(false);
                setActiveTab('view');
              }}
            ></div>
          )}

          <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] bg-[#020617]/95 backdrop-blur-3xl border-t border-white/5 px-10 py-6 flex justify-between items-center safe-area-bottom shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
            <button 
              onClick={() => {
                setActiveTab('view');
                setIsHistoryOpen(false);
              }}
              className={`flex flex-col items-center gap-2 transition-all ${activeTab === 'view' && !isHistoryOpen ? 'text-indigo-400 scale-110' : 'text-slate-600'}`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <span className="text-[9px] font-black uppercase tracking-widest">Canvas</span>
            </button>
            <button 
              onClick={() => {
                setActiveTab('edit');
                setIsHistoryOpen(false);
              }}
              className={`flex flex-col items-center gap-2 transition-all ${activeTab === 'edit' && !isHistoryOpen ? 'text-indigo-400' : 'text-slate-600'}`}
            >
              <div className={`w-14 h-14 -mt-16 rounded-full flex items-center justify-center shadow-2xl transition-all border-4 border-[#020617] ${activeTab === 'edit' ? 'bg-indigo-600 text-white scale-110' : 'bg-slate-900 text-slate-500'}`}>
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest">Studio</span>
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`flex flex-col items-center gap-2 transition-all ${isAnyHistoryOpen ? 'text-indigo-400 scale-110' : 'text-slate-600'}`}
            >
              <div className="relative">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {history.length > 0 && <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-indigo-500 rounded-full border-2 border-[#020617] shadow-[0_0_8px_#6366f1]"></div>}
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest">Archive</span>
            </button>
          </nav>
        </main>
      )}

      <LegalModal 
        isOpen={!!activeLegalPage} 
        type={activeLegalPage || 'privacy'} 
        onClose={() => setActiveLegalPage(null)} 
      />

      {confirm.isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/85 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[#0f172a] border border-white/10 rounded-[3.5rem] p-10 lg:p-12 max-w-sm w-full shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-indigo-500/10 rounded-3xl flex items-center justify-center text-indigo-500 mb-8 mx-auto">
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h3 className="text-xl lg:text-2xl font-black text-white mb-4 uppercase tracking-tighter text-center">{confirm.title}</h3>
            <p className="text-slate-400 text-xs lg:text-sm mb-12 leading-relaxed font-medium text-center">{confirm.message}</p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={confirm.onConfirm}
                className={`w-full py-4 lg:py-5 text-white rounded-[1.8rem] text-[10px] lg:text-[11px] font-black uppercase tracking-widest shadow-2xl transition-all ${confirm.confirmStyle === 'primary' ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-red-600 hover:bg-red-500'}`}
              >
                Proceed with Change
              </button>
              <button 
                onClick={() => setConfirm(prev => ({ ...prev, isOpen: false }))}
                className="w-full py-4 lg:py-5 bg-transparent text-slate-500 rounded-[1.8rem] text-[10px] lg:text-[11px] font-black uppercase tracking-widest hover:text-white transition-all"
              >
                Cancel Action
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;