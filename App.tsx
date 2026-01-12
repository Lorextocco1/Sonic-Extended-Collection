import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Plus, AlertTriangle } from 'lucide-react';
import { Game, Position, ControllerType } from './types';
import SettingsModal from './SettingsModal';
import ContextMenu from './ContextMenu';
import ExitModal from './ExitModal'; 
import { useGamepad } from './GamepadHook';
import ControllerHints from './ControllerHints';

// Electron/Node imports simulation for TypeScript
declare global {
  interface Window {
    require: (module: string) => any;
  }
}

// === BACKGROUND COMPONENTS (Memoized to prevent re-renders) ===
const BackgroundElements = React.memo(() => {
  const rings = useMemo(() => [...Array(8)].map((_, i) => ({
    id: i,
    left: Math.random() * 95,
    delay: Math.random() * 5,
    duration: 10 + Math.random() * 8
  })), []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#001838] to-[#004696]" />
      <div className="sonic-panel-gold anim-panel-tl" />
      <div className="sonic-panel-gold anim-panel-br" />
      {rings.map((ring) => (
        <div 
          key={ring.id} 
          className="ring-anim"
          style={{
            left: `${ring.left}%`,
            animationDelay: `${ring.delay}s`,
            animationDuration: `${ring.duration}s`,
            opacity: 0.7
          }} 
        />
      ))}
    </div>
  );
});

type ViewState = 'WELCOME' | 'MAIN' | 'CONTEXT_MENU' | 'SETTINGS' | 'EXIT_CONFIRM';

const App: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // === STATE MACHINE FOR VIEWS ===
  const [activeView, setActiveView] = useState<ViewState>('WELCOME');
  const [isGameRunning, setIsGameRunning] = useState<boolean>(false);
  
  const [inputCooldown, setInputCooldown] = useState<number>(0);

  // View Specific States
  const [mainIndex, setMainIndex] = useState<number>(0); 
  const [menuIndex, setMenuIndex] = useState<number>(0); 
  const [settingsIndex, setSettingsIndex] = useState<number>(-1); 
  const [exitModalIndex, setExitModalIndex] = useState<number>(0); 

  // Data for Modals
  const [contextMenuData, setContextMenuData] = useState<{ position: Position; gameId: string } | null>(null);
  const [editingGame, setEditingGame] = useState<Game | null>(null);

  // Closing Animations State
  const [isMenuClosing, setIsMenuClosing] = useState<boolean>(false); 
  const [isSettingsClosing, setIsSettingsClosing] = useState<boolean>(false); 
  const [isExitModalClosing, setIsExitModalClosing] = useState<boolean>(false); 

  // Controller
  const { pressed, type: controllerType } = useGamepad();
  const [lastInputTime, setLastInputTime] = useState(0);

  // Refs
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [bgmSource, setBgmSource] = useState<string | null>(null);

  // --- 1. INITIALIZATION & DATA LOADING ---
  const baseDir = useMemo(() => {
    try {
      if (typeof window.require !== 'function') return '';
      const path = window.require('path');
      const appImageEnv = process.env['APPIMAGE'];
      if (appImageEnv) return path.dirname(appImageEnv);
      return (process as any).cwd();
    } catch (e) { return ''; }
  }, []);

  const getSaveFilePath = () => {
    try {
      if (typeof window.require !== 'function') return null;
      const path = window.require('path');
      const fs = window.require('fs');
      const saveFile = path.join(baseDir, 'data.json');
      return { fs, saveFile };
    } catch (e) { return null; }
  };

  useEffect(() => {
    try {
      if (typeof window.require === 'function') {
        const fs = window.require('fs');
        const path = window.require('path');
        const hostPath = path.join(baseDir, 'host');
        if (fs.existsSync(hostPath)) {
          const files = fs.readdirSync(hostPath);
          const mp3File = files.find((f: string) => f.toLowerCase().endsWith('.mp3'));
          if (mp3File) setBgmSource(`file://${path.join(hostPath, mp3File)}`);
        }
      }
    } catch (e) { console.error("BGM Error", e); }

    const io = getSaveFilePath();
    if (io && io.fs.existsSync(io.saveFile)) {
      try { setGames(JSON.parse(io.fs.readFileSync(io.saveFile, 'utf-8'))); } catch(e){}
    } else {
      const saved = localStorage.getItem('sonic_launcher_games');
      if (saved) setGames(JSON.parse(saved));
    }
  }, [baseDir]);

  useEffect(() => {
    if (bgmSource && audioRef.current && !isGameRunning) {
      audioRef.current.volume = 0.5;
      audioRef.current.play().catch(e => console.log("Autoplay blocked", e));
    }
  }, [bgmSource, isGameRunning]);

  const saveToDisk = (newGames: Game[]) => {
    const io = getSaveFilePath();
    if (io) {
      try { io.fs.writeFileSync(io.saveFile, JSON.stringify(newGames, null, 2)); } 
      catch (e) { setErrorMsg("Errore Salvataggio"); }
    } else {
      localStorage.setItem('sonic_launcher_games', JSON.stringify(newGames));
    }
  };

  // --- 2. INPUT LOGIC (GAMEPAD + KEYBOARD) ---
  useEffect(() => {
    if (isGameRunning) return;
    if (Date.now() < inputCooldown) return;
    if (pressed.length === 0) return;
    
    const now = Date.now();
    if (now - lastInputTime < 180) return; // Debounce
    setLastInputTime(now);

    const isNintendo = controllerType === ControllerType.NINTENDO;
    const GP_CONFIRM = isNintendo ? 'BTN_RIGHT' : 'BTN_BOTTOM';
    const GP_BACK = isNintendo ? 'BTN_BOTTOM' : 'BTN_RIGHT';
    const GP_OPTION = 'BTN_TOP'; 

    const isConfirm = pressed.includes(GP_CONFIRM) || pressed.includes('CONFIRM_KEY');
    const isBack = pressed.includes(GP_BACK) || pressed.includes('BACK_KEY');
    const isOption = pressed.includes(GP_OPTION); 

    // === VIEW: WELCOME SCREEN ===
    if (activeView === 'WELCOME') {
      if (isConfirm || pressed.includes('START')) {
        setInputCooldown(Date.now() + 500); 
        setActiveView('MAIN');
      }
      if (isBack) {
        setExitModalIndex(0); 
        setInputCooldown(Date.now() + 300);
        setActiveView('EXIT_CONFIRM');
      }
    }

    // === VIEW: EXIT CONFIRMATION ===
    else if (activeView === 'EXIT_CONFIRM') {
      if (pressed.includes('LEFT') || pressed.includes('RIGHT')) {
        setExitModalIndex(prev => prev === 0 ? 1 : 0);
      }
      if (isConfirm) {
        if (exitModalIndex === 0) closeExitModal();
        else window.close(); 
      }
      if (isBack) {
        closeExitModal();
      }
    }

    // === VIEW: MAIN MENU ===
    else if (activeView === 'MAIN') {
      if (pressed.includes('LEFT')) setMainIndex(prev => Math.max(0, prev - 1));
      if (pressed.includes('RIGHT')) setMainIndex(prev => Math.min(games.length - 1, prev + 1));
      
      if (pressed.includes('START')) handleAddGame();
      
      if (isConfirm) {
        if (games[mainIndex]) handleLaunchGame(games[mainIndex]);
      }

      if (isBack) {
        setActiveView('WELCOME');
        setInputCooldown(Date.now() + 500);
      }

      if (isOption) {
        if (games[mainIndex]) {
          const rect = itemRefs.current[mainIndex]?.getBoundingClientRect();
          if (rect) {
            setContextMenuData({ 
              position: { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }, 
              gameId: games[mainIndex].id 
            });
            setMenuIndex(0);
            setInputCooldown(Date.now() + 400);
            setActiveView('CONTEXT_MENU');
          }
        }
      }
    }

    // === VIEW: CONTEXT MENU ===
    else if (activeView === 'CONTEXT_MENU') {
      if (pressed.includes('UP')) setMenuIndex(prev => Math.max(0, prev - 1));
      if (pressed.includes('DOWN')) setMenuIndex(prev => Math.min(1, prev + 1));
      
      if (isBack) closeContextMenu();

      if (isConfirm) {
        if (!contextMenuData) return;
        if (menuIndex === 0) { // SETTINGS
          const gameToEdit = games.find(g => g.id === contextMenuData.gameId);
          if (gameToEdit) {
            setIsMenuClosing(true);
            setTimeout(() => {
              setContextMenuData(null);
              setIsMenuClosing(false);
              setEditingGame(gameToEdit);
              setSettingsIndex(-1); 
              setInputCooldown(Date.now() + 500);
              setActiveView('SETTINGS');
            }, 300);
          }
        } else if (menuIndex === 1) { // DELETE
          handleDeleteGame(contextMenuData.gameId);
          setActiveView('MAIN');
        }
      }
    }

    // === VIEW: SETTINGS MODAL ===
    else if (activeView === 'SETTINGS') {
      if (settingsIndex === -1) {
        if (pressed.includes('DOWN') || pressed.includes('UP') || pressed.includes('LEFT') || pressed.includes('RIGHT')) {
          setSettingsIndex(0);
          return; 
        }
      } else {
        // Updated Navigation Logic for 7 items (0-6)
        // 0: RetroArch, 1: Core, 2: SH, 3: Config, 4: Image, 5: Cancel, 6: Save
        if (pressed.includes('DOWN')) {
          if (settingsIndex === 0) setSettingsIndex(1);
          else if (settingsIndex === 1) setSettingsIndex(2);
          else if (settingsIndex === 2) setSettingsIndex(3);
          else if (settingsIndex === 3) setSettingsIndex(5); // Config -> Cancel
          else if (settingsIndex === 4) setSettingsIndex(6); // Image -> Save
        }
        if (pressed.includes('UP')) {
          if (settingsIndex === 1) setSettingsIndex(0);
          else if (settingsIndex === 2) setSettingsIndex(1);
          else if (settingsIndex === 3) setSettingsIndex(2);
          else if (settingsIndex === 5) setSettingsIndex(3); // Cancel -> Config
          else if (settingsIndex === 6) setSettingsIndex(4); // Save -> Image
        }
        if (pressed.includes('RIGHT')) {
          if ([0, 1, 2, 3].includes(settingsIndex)) setSettingsIndex(4); // Any Left item -> Image
          if (settingsIndex === 5) setSettingsIndex(6); // Cancel -> Save
        }
        if (pressed.includes('LEFT')) {
          if (settingsIndex === 4) setSettingsIndex(0); // Image -> RetroArch
          if (settingsIndex === 6) setSettingsIndex(5); // Save -> Cancel
        }
      }

      if (isBack) closeSettings();
    }

  }, [pressed, activeView, games, mainIndex, menuIndex, settingsIndex, exitModalIndex, contextMenuData, editingGame, isGameRunning, inputCooldown, isMenuClosing, isSettingsClosing, isExitModalClosing]);

  // Sync horizontal scroll
  useEffect(() => {
    if (activeView === 'MAIN' && itemRefs.current[mainIndex]) {
      itemRefs.current[mainIndex]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [mainIndex, activeView]);


  // --- 3. HANDLERS ---
  const handleAddGame = async () => {
    try {
      if (typeof window.require !== 'function') return;
      const { ipcRenderer } = window.require('electron');
      const path = window.require('path');
      const filePath = await ipcRenderer.invoke('dialog:openFile', {
        defaultPath: path.join(baseDir, 'roms'), filters: [{ name: 'Tutti i file', extensions: ['*'] }]
      });

      if (filePath) {
        if (!filePath.includes(baseDir)) {
           setErrorMsg("File esterno al progetto!"); setTimeout(() => setErrorMsg(null), 3000); return;
        }
        const relative = path.relative(baseDir, filePath);
        const newGame: Game = {
          id: crypto.randomUUID(), name: path.basename(filePath).split('.')[0].replace(/[_-]/g, ' '),
          romPath: relative, retroarchPath: '', corePath: '', thumbnailUrl: 'https://picsum.photos/300/400'
        };
        const updated = [...games, newGame];
        setGames(updated);
        saveToDisk(updated);
      }
    } catch (e) { console.error(e); }
  };

  const handleLaunchGame = (game: Game) => {
    // UPDATED LAUNCH LOGIC
    // We try to launch if at least one executable path is present.
    // Priority: SH Path > RetroArch Path
    if (!game.shPath && !game.retroarchPath) {
      // Nothing to run? Open Settings.
      setEditingGame(game); 
      setInputCooldown(Date.now() + 500);
      setActiveView('SETTINGS'); 
      setSettingsIndex(-1); 
      return;
    }

    try {
      const { spawn } = window.require('child_process');
      const path = window.require('path');
      const envCopy = { ...process.env }; delete envCopy.APPIMAGE; delete envCopy.APPDIR; delete envCopy.OWD; delete envCopy.LD_LIBRARY_PATH;
      
      if (audioRef.current) audioRef.current.pause();
      setIsGameRunning(true);

      let command = "";
      let args: string[] = [];

      // Logic: If SH path exists, use it. Else use RetroArch.
      if (game.shPath) {
          command = path.resolve(baseDir, game.shPath);
          args = [path.resolve(baseDir, game.romPath)];
      } else if (game.retroarchPath) {
          command = path.resolve(baseDir, game.retroarchPath);
          // Only add core args if corePath exists
          const coreArg = game.corePath ? ['-L', path.resolve(baseDir, game.corePath)] : [];
          const configArg = game.configPath ? ['--config', path.resolve(baseDir, game.configPath)] : [];
          const romArg = game.romPath ? [path.resolve(baseDir, game.romPath)] : [];
          args = [...coreArg, ...configArg, ...romArg];
      }

      const child = spawn(command, args, {
         cwd: path.dirname(command), env: envCopy, detached: true, stdio: 'ignore'
      });

      child.on('error', (err: any) => {
         console.error("Spawn error", err);
         setIsGameRunning(false); 
         setErrorMsg("Errore Avvio"); 
         setTimeout(() => setErrorMsg(null), 3000); 
      });

      child.on('close', () => { 
        setIsGameRunning(false);
        setInputCooldown(Date.now() + 1500); 
      });
    } catch (e: any) { 
      setIsGameRunning(false); 
      setInputCooldown(Date.now() + 1000);
      setErrorMsg("Errore Avvio"); 
      setTimeout(() => setErrorMsg(null), 3000); 
    }
  };

  const handleDeleteGame = (id: string) => {
    const updated = games.filter(g => g.id !== id);
    setGames(updated);
    saveToDisk(updated);
    setContextMenuData(null);
  };

  const handleSaveSettings = (updatedGame: Game) => {
    const updated = games.map(g => g.id === updatedGame.id ? updatedGame : g);
    setGames(updated);
    saveToDisk(updated);
    closeSettings();
  };

  // --- CLOSE HANDLERS ---
  const closeContextMenu = () => {
    setIsMenuClosing(true);
    setTimeout(() => {
       setContextMenuData(null);
       setIsMenuClosing(false);
       setInputCooldown(Date.now() + 300);
       setActiveView('MAIN');
    }, 300);
  };

  const closeSettings = () => {
    setIsSettingsClosing(true);
    setTimeout(() => {
       setEditingGame(null);
       setIsSettingsClosing(false);
       setInputCooldown(Date.now() + 300);
       setActiveView('MAIN');
    }, 300); 
  };

  const closeExitModal = () => {
     setIsExitModalClosing(true);
     setTimeout(() => {
        setIsExitModalClosing(false);
        setActiveView('WELCOME');
     }, 300);
  };

  const renderWelcomeButton = () => {
     let label = "A";
     let colorClass = "bg-[#107c10]"; 

     if (controllerType === ControllerType.KEYBOARD) {
       label = "↵"; colorClass = "bg-slate-200 text-black";
     } else if (controllerType === ControllerType.PLAYSTATION) {
       label = "✕"; colorClass = "bg-[#6d88d6]";
     } else if (controllerType === ControllerType.NINTENDO) {
       label = "A"; colorClass = "bg-red-600";
     }

     return (
       <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-white text-xl font-bold shadow-lg border-2 border-white mx-2 ${colorClass}`}>
         {label}
       </div>
     );
  };

  return (
    <div className="relative h-screen font-sans select-none text-white overflow-hidden bg-[#004696] flex flex-col">
      
      {bgmSource && <audio ref={audioRef} src={bgmSource} loop hidden />}
      
      {/* BACKGROUND */}
      <BackgroundElements />

      {/* VIEWS */}
      <div className="relative z-10 flex-1 w-full h-full">
        
        {/* WELCOME */}
        <div 
          className={`
            absolute inset-0 flex flex-col items-center justify-center z-50
            transition-all duration-700 ease-in-out transform origin-center
            ${activeView === 'WELCOME' 
               ? 'opacity-100 scale-100 translate-z-0 pointer-events-auto' 
               : 'opacity-0 scale-150 pointer-events-none'
            }
          `}
        >
             <div className="absolute top-16 z-50 flex justify-center w-full">
                 <h2 className="text-4xl font-black italic tracking-widest text-sonic-title drop-shadow-[0_4px_10px_rgba(0,0,0,0.6)] uppercase">
                    Sonic Extended Collection
                 </h2>
             </div>
             <div className="text-center space-y-2">
                <h1 className="text-8xl md:text-9xl text-sonic-title transform -rotate-3 drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
                  BENVENUTO
                </h1>
                <p className="text-2xl font-black italic tracking-widest text-white/90 drop-shadow-md uppercase bg-black/30 px-6 py-2 rounded-full inline-block transform -skew-x-12">
                  Fatto dai fan per i fan
                </p>
             </div>
             <div className="mt-20 animate-pulse-fast flex items-center text-2xl font-bold tracking-widest uppercase drop-shadow-md">
                PREMI {renderWelcomeButton()} 
             </div>
        </div>


        {/* MAIN UI */}
        <div 
           className={`
             absolute inset-0 flex flex-col items-center justify-center
             transition-all duration-700 ease-in-out transform origin-center
             ${activeView !== 'WELCOME' && activeView !== 'EXIT_CONFIRM'
                ? 'opacity-100 scale-100 translate-z-0 pointer-events-auto' 
                : 'opacity-0 scale-75 pointer-events-none'
             }
           `}
        >
            {errorMsg && (
              <div className="fixed top-10 z-50 bg-red-600 px-8 py-4 rounded-full shadow-xl flex items-center gap-4 animate-in">
                <AlertTriangle /> <span>{errorMsg}</span>
              </div>
            )}

            <div ref={scrollContainerRef} className="w-full flex items-center gap-12 px-[10vw] overflow-x-auto no-scrollbar py-20">
              {games.map((game, i) => (
                <div 
                  key={game.id}
                  ref={el => { itemRefs.current[i] = el; }}
                  onClick={() => { setMainIndex(i); setActiveView('MAIN'); }}
                  // ADDED: Hover interaction for mouse users
                  onMouseEnter={() => setMainIndex(i)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                    setContextMenuData({ position: { x: rect.left + rect.width/2, y: rect.top + rect.height/2 }, gameId: game.id });
                    setMenuIndex(0);
                    setInputCooldown(Date.now() + 400);
                    setActiveView('CONTEXT_MENU');
                  }}
                  onDoubleClick={() => handleLaunchGame(game)}
                  className={`
                    shrink-0 h-[60vh] w-auto
                    bg-black/40 glass-card rounded-2xl overflow-hidden relative
                    transition-all duration-300 cursor-pointer flex flex-col
                    ${activeView === 'MAIN' && mainIndex === i 
                      ? 'border-4 border-sonicYellow scale-105 z-20 shadow-[0_0_50px_rgba(255,205,0,0.6)] -translate-y-4' 
                      : 'border-2 border-white/10 opacity-80 hover:opacity-100'}
                  `}
                >
                   <img src={game.thumbnailUrl} className="h-full w-auto object-cover md:object-contain min-w-[200px]" alt={game.name} />
                   
                   <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black to-transparent">
                      <h3 className={`font-black italic text-xl uppercase truncate ${mainIndex === i ? 'text-sonicYellow' : 'text-white'}`}>{game.name}</h3>
                   </div>
                </div>
              ))}
              {games.length === 0 && <div className="text-center w-full opacity-50 font-black italic text-4xl">NESSUN GIOCO</div>}
              <div className="shrink-0 w-20" />
            </div>
        </div>

      </div>

      {/* FLOATING UI */}
      <div className={`transition-opacity duration-700 ${activeView === 'WELCOME' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        {!isGameRunning && <ControllerHints type={controllerType} />}
        
        {!isGameRunning && (
          <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-20">
            <button onClick={handleAddGame} className="btn-origins flex items-center gap-4 px-10 py-5 shadow-xl">
              <Plus size={28} strokeWidth={3} /> <span className="uppercase font-black tracking-widest">AGGIUNGI</span>
            </button>
          </div>
        )}
      </div>

      {/* OVERLAYS */}
      
      {(activeView === 'EXIT_CONFIRM' || isExitModalClosing) && (
        <ExitModal 
           selectedIndex={activeView === 'EXIT_CONFIRM' ? exitModalIndex : -1}
           isClosing={isExitModalClosing}
           onCancel={closeExitModal}
           onConfirm={() => window.close()}
           onHover={(idx) => setExitModalIndex(idx)} // PASSING HOVER
        />
      )}

      {contextMenuData && !isGameRunning && (
        <ContextMenu 
          position={contextMenuData.position}
          selectedIndex={activeView === 'CONTEXT_MENU' ? menuIndex : -1} 
          isClosing={isMenuClosing}
          onClose={closeContextMenu}
          onDelete={() => handleDeleteGame(contextMenuData.gameId)}
          onHover={(idx) => setMenuIndex(idx)} // PASSING HOVER
          onSettings={() => {
             setIsMenuClosing(true);
             setTimeout(() => {
                const id = contextMenuData.gameId;
                setContextMenuData(null);
                setIsMenuClosing(false);
                setEditingGame(games.find(g => g.id === id) || null);
                setSettingsIndex(-1); 
                setInputCooldown(Date.now() + 500);
                setActiveView('SETTINGS');
             }, 300);
          }}
        />
      )}

      {editingGame && !isGameRunning && (
        <SettingsModal 
          game={editingGame}
          baseDir={baseDir}
          selectedIndex={activeView === 'SETTINGS' ? settingsIndex : -1} 
          controllerPressed={activeView === 'SETTINGS' ? pressed : []} 
          isClosing={isSettingsClosing}
          onClose={closeSettings}
          onSave={handleSaveSettings}
          onHover={(idx) => setSettingsIndex(idx)} // PASSING HOVER
        />
      )}

    </div>
  );
};

export default App;