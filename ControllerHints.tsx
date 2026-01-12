import React from 'react';
import { ControllerType } from './types';

interface ControllerHintsProps {
  type: ControllerType;
}

const ControllerHints: React.FC<ControllerHintsProps> = ({ type }) => {
  
  // Helper to render button icons based on type
  const renderBtn = (action: string) => {
    let colorClass = "bg-slate-700 text-white";
    let label = "?";

    if (type === ControllerType.KEYBOARD) {
        if (action === 'CONFIRM') { label = "↵"; colorClass = "bg-slate-200 text-black"; }
        if (action === 'BACK') { label = "ESC"; colorClass = "bg-slate-600 text-white text-[10px]"; }
        if (action === 'OPTIONS') { label = "O"; colorClass = "bg-slate-700 text-white"; } // Or whatever
        if (action === 'ADD') { label = "SPC"; colorClass = "bg-slate-700 text-white text-[10px]"; }
    } else if (type === ControllerType.PLAYSTATION) {
      if (action === 'CONFIRM') { label = "✕"; colorClass = "bg-[#6d88d6] text-white"; } // Cross (Blueish)
      if (action === 'BACK') { label = "○"; colorClass = "bg-[#ff4d4d] text-white"; } // Circle (Red)
      if (action === 'OPTIONS') { label = "△"; colorClass = "bg-[#2ebf5b] text-white"; } // Triangle (Green)
      if (action === 'ADD') { label = "OPTIONS"; colorClass = "bg-slate-600 text-[10px] px-1"; }
    } else if (type === ControllerType.NINTENDO) {
      if (action === 'CONFIRM') { label = "A"; colorClass = "bg-red-600 text-white"; } // Nintendo A is Right
      if (action === 'BACK') { label = "B"; colorClass = "bg-yellow-500 text-black"; } // Nintendo B is Bottom
      if (action === 'OPTIONS') { label = "X"; colorClass = "bg-slate-700 text-white"; } // Nintendo X is Top
      if (action === 'ADD') { label = "+"; colorClass = "bg-slate-700 text-white"; }
    } else {
      // XBOX / GENERIC
      if (action === 'CONFIRM') { label = "A"; colorClass = "bg-[#107c10] text-white"; } // Xbox A (Green)
      if (action === 'BACK') { label = "B"; colorClass = "bg-[#d9222a] text-white"; } // Xbox B (Red)
      if (action === 'OPTIONS') { label = "Y"; colorClass = "bg-[#eebc1d] text-black"; } // Xbox Y (Yellow)
      if (action === 'ADD') { label = "START"; colorClass = "bg-slate-700 text-[10px] px-1"; }
    }

    return (
      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-md border border-white/20 ${colorClass}`}>
        {label}
      </div>
    );
  };

  return (
    <div className="fixed bottom-8 left-8 flex items-center gap-6 z-50 animate-in">
       {/* SELEZIONA */}
       <div className="flex items-center gap-3">
         {renderBtn('CONFIRM')}
         <span className="font-bold text-white tracking-widest text-sm drop-shadow-md uppercase">AVVIA</span>
       </div>

       {/* INDIETRO (NEW) */}
       <div className="flex items-center gap-3">
         {renderBtn('BACK')}
         <span className="font-bold text-white tracking-widest text-sm drop-shadow-md uppercase">INDIETRO</span>
       </div>

       {/* OPZIONI */}
       <div className="flex items-center gap-3">
         {renderBtn('OPTIONS')}
         <span className="font-bold text-white tracking-widest text-sm drop-shadow-md uppercase">OPZIONI</span>
       </div>

       {/* AGGIUNGI */}
       <div className="flex items-center gap-3 opacity-80">
         {renderBtn('ADD')}
         <span className="font-bold text-white tracking-widest text-sm drop-shadow-md uppercase">AGGIUNGI</span>
       </div>
    </div>
  );
};

export default ControllerHints;