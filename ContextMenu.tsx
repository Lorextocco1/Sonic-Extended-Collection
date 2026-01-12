import React, { useEffect, useRef } from 'react';
import { Settings, Trash2 } from 'lucide-react';
import { Position } from './types';

interface ContextMenuProps {
  position: Position;
  selectedIndex: number; 
  isClosing: boolean; 
  onClose: () => void;
  onSettings: () => void;
  onDelete: () => void;
  onHover: (index: number) => void; // NEW
}

const ContextMenu: React.FC<ContextMenuProps> = ({ position, selectedIndex, isClosing, onClose, onSettings, onDelete, onHover }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className={`
        fixed z-[60] bg-slate-900/95 backdrop-blur-xl border-2 border-sonicYellow shadow-[0_0_30px_rgba(0,0,0,0.8)] 
        rounded-xl w-72 overflow-hidden origin-center transform -translate-x-1/2 -translate-y-1/2
        ${isClosing ? 'opacity-0 scale-75 transition-all duration-300 ease-in' : 'animate-in'}
      `}
      style={{ top: position.y, left: position.x }}
    >
      <div className="flex flex-col p-2 space-y-1">
        <button
          onClick={onSettings}
          onMouseEnter={() => onHover(0)}
          className={`
            group flex items-center gap-4 px-4 py-4 rounded-lg transition-all text-left font-bold 
            ${selectedIndex === 0 ? 'bg-sonicYellow text-black scale-105 shadow-md' : 'text-slate-200 hover:bg-white/10'}
          `}
        >
          <Settings size={20} className={selectedIndex === 0 ? 'text-black' : 'text-sonicCyan'} />
          <span className="tracking-wide text-sm uppercase">IMPOSTAZIONI</span>
        </button>
        
        <div className="h-px bg-white/10 my-1 mx-2" />
        
        <button
          onClick={onDelete}
          onMouseEnter={() => onHover(1)}
          className={`
            group flex items-center gap-4 px-4 py-4 rounded-lg transition-all text-left font-bold
            ${selectedIndex === 1 ? 'bg-red-600 text-white scale-105 shadow-md' : 'text-red-400 hover:bg-white/10'}
          `}
        >
          <Trash2 size={20} className={selectedIndex === 1 ? 'text-white' : ''} />
          <span className="tracking-wide text-sm uppercase">RIMUOVI ROM</span>
        </button>
      </div>
    </div>
  );
};

export default ContextMenu;