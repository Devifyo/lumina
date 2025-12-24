
import React from 'react';

export type LegalPageType = 'privacy' | 'terms' | 'contact' | 'cookies' | 'about';

interface LegalModalProps {
  type: LegalPageType;
  isOpen: boolean;
  onClose: () => void;
}

const LegalModal: React.FC<LegalModalProps> = ({ type, isOpen, onClose }) => {
  const APP_NAME = process.env.APP_NAME || 'Lumina Studio';
  const CONTACT_EMAIL = process.env.CONTACT_EMAIL || 'support@luminastudio.pro';
  
  if (!isOpen) return null;

  const content = {
    privacy: {
      title: 'Privacy Policy',
      body: `At ${APP_NAME}, we prioritize your privacy. We do not store your uploaded images on our servers; all processing is handled via temporary secure streams. No personal identifiable information is collected unless voluntarily provided for support. We use industry-standard encryption to protect data during transmission.`
    },
    terms: {
      title: 'Terms of Service',
      body: `By using ${APP_NAME}, you agree to use our vision synthesis tools for lawful purposes only. You retain ownership of your original assets. We are not responsible for any misuse of the generated content. Our service is provided "as is" without warranties of any kind.`
    },
    contact: {
      title: 'Contact Support',
      body: `Need assistance or have questions about our professional tools? Reach out to our technical team at ${CONTACT_EMAIL}. We aim to respond to all inquiries within 24 business hours.`
    },
    cookies: {
      title: 'Cookie Policy',
      body: `${APP_NAME} uses essential cookies to manage session state and preferences. We do not use tracking cookies for third-party advertising profile building. You can manage your browser settings to disable cookies, though some features may be limited.`
    },
    about: {
      title: `About ${APP_NAME}`,
      body: `${APP_NAME} is a next-generation neural image processing platform. We specialize in high-fidelity subject isolation, professional object erasure, and advanced scene reconstruction. Our engine uses state-of-the-art vision models to deliver studio-quality results in seconds.`
    }
  }[type];

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-[#0f172a] border border-white/10 rounded-[3rem] p-10 max-w-2xl w-full shadow-2xl relative animate-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <h2 className="text-2xl font-black text-white mb-6 uppercase tracking-tighter border-l-4 border-indigo-600 pl-4">
          {content.title}
        </h2>
        
        <div className="text-slate-400 text-sm leading-relaxed space-y-4 max-h-[60vh] overflow-y-auto pr-4 no-scrollbar">
          <p>{content.body}</p>
          <p className="pt-4 text-[10px] text-slate-600 font-bold uppercase tracking-widest">Effective Date: October 2023 | Engine v3.1</p>
        </div>
        
        <div className="mt-10">
          <button 
            onClick={onClose}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};

export default LegalModal;
