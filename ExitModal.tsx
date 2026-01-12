import React from 'react';
import { ChevronRight, ChevronLeft, Power } from 'lucide-react';

interface ExitModalProps {
  selectedIndex: number; // 0: Cancel, 1: Exit
  isClosing: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  onHover: (index: number) => void; // NEW
}

const ExitModal: React.FC<ExitModalProps> = ({ selectedIndex, isClosing, onCancel, onConfirm, onHover }) => {
  return (
    <div 
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ease-in-out ${isClosing ? 'opacity-0' : 'animate-in'}`}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onCancel} />
      
      <div 
        className={`glass-panel w-full max-w-lg rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden relative border border-white/10 z-10 transition-all duration-300 ease-in-out transform ${isClosing ? 'scale-95 translate-y-4 opacity-0' : 'scale-100 translate-y-0 opacity-100'}`}
      >
        <div className="flex items-center justify-center px-8 py-6 border-b border-white/10 bg-gradient-to-r from-red-900/40 to-transparent">
          <h2 className="text-2xl font-black italic text-white tracking-tighter drop-shadow-md uppercase flex items-center gap-3">
            <Power className="text-sonicRed" /> Conferma Uscita
          </h2>
        </div>

        <div className="p-8 text-center space-y-2">
            <p className="text-xl font-bold text-white/90">Vuoi davvero chiudere il launcher?</p>
            <p className="text-sm text-blue-200/60 font-mono">Tutti i progressi non salvati nei giochi andranno persi.</p>
        </div>

        <div className="p-6 border-t border-white/10 bg-slate-900/80 flex justify-center gap-6 items-center">
            
            <button 
                onClick={onCancel}
                onMouseEnter={() => onHover(0)}
                className={`
                    px-6 py-3 rounded-xl font-bold uppercase text-sm tracking-wider transition-all border-2
                    ${selectedIndex === 0 
                        ? 'bg-white text-black scale-110 shadow-lg border-white' 
                        : 'border-transparent text-slate-400 hover:text-white bg-slate-800/50'}
                `}
            >
                Annulla
            </button>
            
            <button 
                onClick={onConfirm}
                onMouseEnter={() => onHover(1)}
                className={`
                    btn-sonic-red h-14 px-8 min-w-[160px] rounded-lg text-lg transition-all 
                    ${selectedIndex === 1 ? 'ring-4 ring-white scale-110 shadow-[0_0_20px_rgba(255,0,0,0.8)]' : 'opacity-80'}
                `}
            >
                <span className="arrow-deco"><ChevronRight size={20} strokeWidth={4} /></span>
                <span className="flex items-center gap-2">ESCI</span>
                <span className="arrow-deco"><ChevronLeft size={20} strokeWidth={4} /></span>
            </button>
        </div>
      </div>
    </div>
  );
};

export default ExitModal;