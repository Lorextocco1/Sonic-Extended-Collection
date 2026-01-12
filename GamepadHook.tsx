import { useState, useEffect, useRef } from 'react';
import { ControllerType } from './types';

interface GamepadState {
  pressed: string[]; // List of buttons currently pressed
  axes: { x: number; y: number }; 
  type: ControllerType;
}

export const useGamepad = () => {
  const [gamepadState, setGamepadState] = useState<GamepadState>({
    pressed: [],
    axes: { x: 0, y: 0 },
    type: ControllerType.KEYBOARD // Default to Keyboard initially
  });

  // To track mixed input source
  const lastInputType = useRef<ControllerType>(ControllerType.KEYBOARD);
  
  // Track keyboard keys strictly
  const keyboardKeys = useRef<Set<string>>(new Set());
  
  const requestRef = useRef<number>(0);
  const lastPressTime = useRef<number>(0);

  // --- KEYBOARD HANDLERS ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      let mappedKey = '';
      if (e.key === 'ArrowUp') mappedKey = 'UP';
      if (e.key === 'ArrowDown') mappedKey = 'DOWN';
      if (e.key === 'ArrowLeft') mappedKey = 'LEFT';
      if (e.key === 'ArrowRight') mappedKey = 'RIGHT';
      if (e.key === 'Enter') mappedKey = 'CONFIRM_KEY';
      if (e.key === 'Escape') mappedKey = 'BACK_KEY';
      if (e.key === ' ') mappedKey = 'START'; // Space as Start alternative

      if (mappedKey) {
        if (!keyboardKeys.current.has(mappedKey)) {
          keyboardKeys.current.add(mappedKey);
          lastInputType.current = ControllerType.KEYBOARD;
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      let mappedKey = '';
      if (e.key === 'ArrowUp') mappedKey = 'UP';
      if (e.key === 'ArrowDown') mappedKey = 'DOWN';
      if (e.key === 'ArrowLeft') mappedKey = 'LEFT';
      if (e.key === 'ArrowRight') mappedKey = 'RIGHT';
      if (e.key === 'Enter') mappedKey = 'CONFIRM_KEY';
      if (e.key === 'Escape') mappedKey = 'BACK_KEY';
      if (e.key === ' ') mappedKey = 'START';

      if (mappedKey) {
        keyboardKeys.current.delete(mappedKey);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // --- GAMEPAD LOOP ---
  const scanGamepads = () => {
    // 1. Get Keyboard Inputs
    const currentPressed = Array.from(keyboardKeys.current);
    let currentAxes = { x: 0, y: 0 };
    let currentType = lastInputType.current;

    // 2. Scan Gamepads (Override keyboard if active)
    const gamepads = navigator.getGamepads();
    let activePad: Gamepad | null = null;
    
    for (const gp of gamepads) {
      if (gp && gp.connected) {
        // Check if any button is pressed or axis moved significantly to switch context
        const hasInput = gp.buttons.some(b => b.pressed) || Math.abs(gp.axes[0]) > 0.5 || Math.abs(gp.axes[1]) > 0.5;
        if (hasInput) {
           activePad = gp;
           break;
        }
      }
    }

    if (activePad) {
        // Detect Type
        const id = activePad.id.toLowerCase();
        if (id.includes('playstation') || id.includes('dualsense') || id.includes('sony')) {
            currentType = ControllerType.PLAYSTATION;
        } else if (id.includes('nintendo') || id.includes('switch') || id.includes('pro controller') || id.includes('057e')) {
            currentType = ControllerType.NINTENDO;
        } else {
            currentType = ControllerType.XBOX;
        }
        lastInputType.current = currentType;

        const buttons = activePad.buttons;
        const threshold = 0.5;

        // Navigation (Stick & D-Pad) - Merge into list
        if (activePad.axes[0] < -threshold || buttons[14]?.pressed) currentPressed.push('LEFT');
        if (activePad.axes[0] > threshold || buttons[15]?.pressed) currentPressed.push('RIGHT');
        if (activePad.axes[1] < -threshold || buttons[12]?.pressed) currentPressed.push('UP');
        if (activePad.axes[1] > threshold || buttons[13]?.pressed) currentPressed.push('DOWN');

        // Actions
        if (buttons[0]?.pressed) currentPressed.push('BTN_BOTTOM'); 
        if (buttons[1]?.pressed) currentPressed.push('BTN_RIGHT');
        if (buttons[2]?.pressed) currentPressed.push('BTN_LEFT'); 
        if (buttons[3]?.pressed) currentPressed.push('BTN_TOP');
        
        if (buttons[9]?.pressed) currentPressed.push('START');
        if (buttons[8]?.pressed) currentPressed.push('SELECT');
        
        currentAxes = { x: activePad.axes[0], y: activePad.axes[1] };
    }

    // --- DEBOUNCE / STATE UPDATE ---
    const now = Date.now();
    
    // Only update state if something changed or debounce passed
    // We update every frame effectively but React handles diffing. 
    // To prevent rapid firing logic is handled in App.tsx mostly, 
    // but here we ensure the 'pressed' array is fresh.
    
    // Note: We deliberately mix keyboard and gamepad. 
    // If keyboard is pressed, it adds to array. If gamepad pressed, adds to array.
    
    setGamepadState({ pressed: currentPressed, axes: currentAxes, type: currentType });

    requestRef.current = requestAnimationFrame(scanGamepads);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(scanGamepads);
    return () => cancelAnimationFrame(requestRef.current!);
  }, []);

  return gamepadState;
};