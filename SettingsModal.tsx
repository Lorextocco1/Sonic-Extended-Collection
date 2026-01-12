import React, { useState, useEffect } from 'react';
import { Game } from './types';
import { AlertCircle, ChevronRight, ChevronLeft, Gamepad, FileCode, Image as ImageIcon, Terminal } from 'lucide-react';

interface SettingsModalProps {
  game: Game;
  baseDir: string; 
  selectedIndex: number; 
  controllerPressed: string[]; 
  isClosing: boolean; 
  onSave: (updatedGame: Game) => void;
  onClose: () => void;
  onHover: (index: number) => void; 
}

const SettingsModal: React.FC<SettingsModalProps> = ({ game, baseDir, selectedIndex, controllerPressed, isClosing, onSave, onClose, onHover }) => {
  const [formData, setFormData] = useState<Game>(game);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const actionTriggeredRef = React.useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 400);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isReady) return;

    // Check both gamepad buttons and virtual keys
    const confirmButtons = ['BTN_BOTTOM', 'BTN_RIGHT', 'CONFIRM', 'CONFIRM_KEY']; 
    const isConfirm = controllerPressed.some(b => confirmButtons.includes(b));

    if (isConfirm && !actionTriggeredRef.current && selectedIndex !== -1) {
      actionTriggeredRef.current = true;
      executeAction(selectedIndex);
    }
    if (!isConfirm) {
      actionTriggeredRef.current = false;
    }
  }, [controllerPressed, selectedIndex, isReady]);

  const executeAction = (index: number) => {
    switch(index) {
      case 0: handleSelectFile('retroarchPath', 'retroarch', []); break;
      case 1: handleSelectFile('corePath', 'retroarch', []); break;
      case 2: // NEW: Script SH
        if (!formData.shPath) handleSelectFile('shPath', null, []); 
        else setFormData(prev => ({ ...prev, shPath: undefined })); 
        break;
      case 3: // Config Path moved to 3
        if (!formData.configPath) handleSelectFile('configPath', 'configurations', []); 
        else setFormData(prev => ({ ...prev, configPath: undefined })); 
        break;
      case 4: handleImageUpload(); break; // Image moved to 4
      case 5: onClose(); break; // Cancel moved to 5
      case 6: onSave(formData); break; // Save moved to 6
    }
  };

  const handleSelectFile = async (field: keyof Game, subFolder: string | null, _ignoredExtensions: string[]) => {
    setLocalError(null);
    try {
      const { ipcRenderer } = window.require('electron');
      const path = window.require('path');
      const defaultPath = subFolder ? path.join(baseDir, subFolder) : baseDir;

      const filePath = await ipcRenderer.invoke('dialog:openFile', {
        defaultPath: defaultPath,
        filters: [{ name: 'Tutti i file', extensions: ['*'] }]
      });

      if (filePath) {
        const relative = path.relative(baseDir, filePath);
        const isInside = !relative.startsWith('..') && !path.isAbsolute(relative);

        if (!isInside) {
          setLocalError("ACCESSO NEGATO: Il file deve trovarsi all'interno della cartella dell'applicazione.");
          return;
        }
        setFormData(prev => ({ ...prev, [field]: relative }));
      }
    } catch (e) { console.error("Errore dialog", e); }
  };

  const handleImageUpload = async () => {
    setLocalError(null);
    try {
      const { ipcRenderer } = window.require('electron');
      const path = window.require('path');
      const filePath = await ipcRenderer.invoke('dialog:openFile', {
        defaultPath: baseDir, filters: [{ name: 'Tutti i file', extensions: ['*'] }]
      });

      if (filePath) {
        const relative = path.relative(baseDir, filePath);
        const isInside = !relative.startsWith('..') && !path.isAbsolute(relative);
        if (!isInside) { setLocalError("ACCESSO NEGATO"); return; }

        const fs = window.require('fs');
        const { Buffer } = window.require('buffer');
        const bitmap = fs.readFileSync(filePath);
        const base64 = Buffer.from(bitmap).toString('base64');
        const ext = path.extname(filePath).toLowerCase();
        let mime = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
        setFormData(prev => ({ ...prev, thumbnailUrl: `data:${mime};base64,${base64}` }));
      }
    } catch (e) { setLocalError("Errore immagine"); }
  };

  const getFocusStyle = (index: number) => {
    if (selectedIndex === index) {
      return "ring-4 ring-sonicYellow ring-offset-2 ring-offset-slate-900 bg-white/10 transform scale-[1.02] transition-all z-10";
    }
    return "border-transparent opacity-80";
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ease-in-out ${isClosing ? 'opacity-0' : 'animate-in'}`}
    >
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />
      
      <div 
        className={`glass-panel w-full max-w-5xl h-[85vh] rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden relative border border-white/10 z-10 transition-all duration-300 ease-in-out transform ${isClosing ? 'scale-95 translate-y-4 opacity-0' : 'scale-100 translate-y-0 opacity-100'}`}
      >
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/10 bg-gradient-to-r from-blue-900/40 to-transparent">
          <div>
            <h2 className="text-3xl font-black italic text-white tracking-tighter drop-shadow-md">
              IMPOSTAZIONI <span className="text-sonicCyan">ZONA</span>
            </h2>
            <p className="text-blue-300 font-mono text-xs mt-1 opacity-70 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sonicYellow animate-pulse" />
              {game.name}
            </p>
          </div>
        </div>

        {localError && (
          <div className="bg-red-900/90 text-white px-6 py-4 flex items-center gap-3 animate-pulse border-b border-red-500">
            <AlertCircle size={24} className="shrink-0 text-red-300" />
            <p className="text-sm font-bold tracking-wide">{localError}</p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-8 flex gap-10">
          <div className="flex-1 space-y-3 min-w-0"> {/* COMPACTED: space-y-6 -> space-y-3 */}
            
            {/* 0: RetroArch */}
            <div 
                className={`space-y-1 group rounded-xl p-1.5 transition-all ${getFocusStyle(0)}`} 
                onMouseEnter={() => onHover(0)}
            >
                <label className="flex items-center gap-2 text-xs font-bold text-sonicCyan uppercase tracking-widest pl-1">
                  Eseguibile RetroArch <Gamepad size={14} />
                </label>
                <div className="bg-slate-950/60 border border-blue-500/20 rounded-xl p-2 pl-4 flex items-center gap-4">
                  <div className="flex-1 w-0 font-mono text-xs text-blue-200/80 truncate">
                    {formData.retroarchPath || "Non selezionato"}
                  </div>
                  <button onClick={() => executeAction(0)} className="btn-sonic-red h-7 px-3 rounded-md text-[10px] shrink-0">
                    <span className="arrow-deco"><ChevronRight size={12} strokeWidth={4} /></span> SFOGLIA <span className="arrow-deco"><ChevronLeft size={12} strokeWidth={4} /></span>
                  </button>
                </div>
            </div>

            {/* 1: Core */}
            <div 
                className={`space-y-1 group rounded-xl p-1.5 transition-all ${getFocusStyle(1)}`}
                onMouseEnter={() => onHover(1)}
            >
                <label className="flex items-center gap-2 text-xs font-bold text-sonicCyan uppercase tracking-widest pl-1">
                  Core (.so/.dll) <FileCode size={14} />
                </label>
                <div className="bg-slate-950/60 border border-blue-500/20 rounded-xl p-2 pl-4 flex items-center gap-4">
                  <div className="flex-1 w-0 font-mono text-xs text-blue-200/80 truncate">
                    {formData.corePath || "Non selezionato"}
                  </div>
                  <button onClick={() => executeAction(1)} className="btn-sonic-red h-7 px-3 rounded-md text-[10px] shrink-0">
                     <span className="arrow-deco"><ChevronRight size={12} strokeWidth={4} /></span> SFOGLIA <span className="arrow-deco"><ChevronLeft size={12} strokeWidth={4} /></span>
                  </button>
                </div>
            </div>

            {/* 2: Script SH (NEW) */}
            <div 
                className={`space-y-1 group rounded-xl p-1.5 transition-all ${getFocusStyle(2)}`}
                onMouseEnter={() => onHover(2)}
            >
                <label className="flex items-center gap-2 text-xs font-bold text-sonicCyan uppercase tracking-widest pl-1">
                  Script / Launcher (.sh) <Terminal size={14} /> <span className="text-[9px] bg-slate-700 text-slate-300 px-2 rounded-sm ml-auto">ALTERNATIVO</span>
                </label>
                <div className="bg-slate-950/60 border border-blue-500/20 rounded-xl p-2 pl-4 flex items-center gap-4">
                  <div className="flex-1 w-0 font-mono text-xs text-blue-200/80 truncate">
                    {formData.shPath || "Nessuno script"}
                  </div>
                  <button onClick={() => executeAction(2)} className={`btn-sonic-red h-7 px-3 rounded-md text-[10px] shrink-0 ${formData.shPath ? 'bg-red-800' : ''}`}>
                     {formData.shPath ? 'RIMUOVI' : 'SFOGLIA'}
                  </button>
                </div>
            </div>

            {/* 3: Config */}
            <div 
                className={`space-y-1 group rounded-xl p-1.5 transition-all ${getFocusStyle(3)}`}
                onMouseEnter={() => onHover(3)}
            >
                <label className="flex items-center gap-2 text-xs font-bold text-sonicCyan uppercase tracking-widest pl-1">
                  Config (.cfg) <span className="text-[9px] bg-slate-700 text-slate-300 px-2 rounded-sm ml-auto">OPZIONALE</span>
                </label>
                <div className="bg-slate-950/60 border border-blue-500/20 rounded-xl p-2 pl-4 flex items-center gap-4">
                  <div className="flex-1 w-0 font-mono text-xs text-blue-200/80 truncate">
                    {formData.configPath || "Default"}
                  </div>
                  <button onClick={() => executeAction(3)} className={`btn-sonic-red h-7 px-3 rounded-md text-[10px] shrink-0 ${formData.configPath ? 'bg-red-800' : ''}`}>
                     {formData.configPath ? 'RIMUOVI' : 'SFOGLIA'}
                  </button>
                </div>
            </div>
          </div>

          <div className="w-80 shrink-0 space-y-3">
            <label className="block text-sm font-bold text-sonicCyan uppercase tracking-widest pl-1">Copertina</label>
            <div 
              onClick={() => executeAction(4)}
              onMouseEnter={() => onHover(4)}
              className={`
                group relative bg-slate-950/60 border-2 border-dashed border-blue-500/30 rounded-2xl h-full max-h-[400px] 
                flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all
                ${getFocusStyle(4)}
              `}
            >
              {formData.thumbnailUrl ? (
                <img src={formData.thumbnailUrl} alt="Cover" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
              ) : (
                <ImageIcon size={48} className="text-blue-400/50" />
              )}
              {selectedIndex === 4 && (
                 <div className="absolute inset-0 border-4 border-sonicYellow flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
                     <span className="bg-sonicYellow text-black font-black px-4 py-1 text-lg uppercase skew-x-[-10deg]">CAMBIA</span>
                 </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-white/10 bg-slate-900/80 flex justify-end gap-4 items-center">
          <button 
            onClick={onClose}
            onMouseEnter={() => onHover(5)}
            className={`px-6 py-3 rounded-xl font-bold uppercase text-sm tracking-wider transition-all ${selectedIndex === 5 ? 'bg-white text-black scale-110 shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            Annulla
          </button>
          
          <button 
            onClick={() => onSave(formData)}
            onMouseEnter={() => onHover(6)}
            className={`btn-sonic-red h-14 px-8 min-w-[220px] rounded-lg text-lg transition-all ${selectedIndex === 6 ? 'ring-4 ring-white scale-110 shadow-[0_0_20px_rgba(255,0,0,0.8)]' : ''}`}
          >
            <span className="arrow-deco"><ChevronRight size={24} strokeWidth={4} /></span>
            <span className="flex items-center gap-2">SALVA</span>
            <span className="arrow-deco"><ChevronLeft size={24} strokeWidth={4} /></span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;