#!/bin/bash

# ==========================================
# SONIC LAUNCHER BUILDER SCRIPT (FINAL)
# ==========================================
# Questo script converte il codice sorgente React corrente
# in una applicazione AppImage standalone.
#
# PREREQUISITI:
# - Node.js installato
# - npm installato
# - Un file 'icon.png' nella cartella corrente (Opzionale, per l'icona)
# ==========================================

echo ">>> Inizializzazione Ambiente di Build..."

# 1. Pulizia preventiva
rm -rf build_dist
mkdir -p build_dist/src

# Creazione cartelle di output (Uso virgolette per gestire gli spazi nel nome)
mkdir -p "Sonic Extended Collection/retroarch"
mkdir -p "Sonic Extended Collection/roms"
mkdir -p "Sonic Extended Collection/configurations"
mkdir -p "Sonic Extended Collection/host"  # Nuova cartella per la musica di sottofondo

# 2. Copia dei file sorgente nella cartella di build
echo ">>> Copia dei sorgenti..."
cp index.html build_dist/
cp *.tsx build_dist/src/ 2>/dev/null || :
cp *.ts build_dist/src/ 2>/dev/null || :

# Copia Icona se presente
if [ -f "icon.png" ]; then
    echo ">>> Icona trovata! Copia in corso..."
    cp icon.png build_dist/
else
    echo ">>> ATTENZIONE: 'icon.png' non trovato. L'AppImage userà l'icona di default."
fi

# Rinomina index.tsx in main.tsx per standard Vite
mv build_dist/src/index.tsx build_dist/src/main.tsx 2>/dev/null

# === FIX CRITICO PER SCHERMATA BIANCA ===
# 1. Rimuove lo script di Tailwind CDN (useremo quello locale)
sed -i '/cdn.tailwindcss.com/d' build_dist/index.html

# 2. Rimuove l'importmap (conflitto con Vite bundle)
sed -i '/<script type="importmap">/,/<\/script>/d' build_dist/index.html

# 3. Inserisce il collegamento al punto di ingresso React (main.tsx) prima della chiusura del body
sed -i 's|</body>|<script type="module" src="/src/main.tsx"></script></body>|' build_dist/index.html
# ========================================

# Creazione file di configurazione per Vite
cat <<EOF > build_dist/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './', // Fondamentale per Electron (percorsi relativi)
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  }
})
EOF

# Creazione package.json per il frontend
cat <<EOF > build_dist/package.json
{
  "name": "sonic-launcher-ui",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "lucide-react": "^0.263.1"
  },
  "devDependencies": {
    "@types/react": "^18.2.15",
    "@types/react-dom": "^18.2.7",
    "@vitejs/plugin-react": "^4.0.3",
    "autoprefixer": "^10.4.14",
    "postcss": "^8.4.27",
    "tailwindcss": "^3.3.3",
    "typescript": "^5.0.2",
    "vite": "^4.4.5"
  }
}
EOF

# Configurazione Tailwind
cat <<EOF > build_dist/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sonicBlue: '#0057b7',
        sonicDark: '#0e0e1a',
        sonicYellow: '#ffcd00',
        sonicGold: '#ffd700',
        sonicRed: '#e71313',
        sonicCyan: '#00e0ff',
      },
      fontFamily: {
        sans: ['Verdana', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 8s linear infinite',
        'float-ring': 'floatRing 10s linear infinite',
        'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
EOF

cat <<EOF > build_dist/postcss.config.js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

# Creazione CSS base con Animazioni Sonic Style (Gold Panels) e Tasti Red Ribbon
cat <<EOF > build_dist/src/index.css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Base Background */
body {
  background-color: #004696; /* Classic Sonic 2 Blue */
  overflow: hidden; /* Prevent scrolling caused by animated background elements */
}

/* SONIC TITLE TEXT STYLE */
.text-sonic-title {
  color: #ffcd00; /* Sonic Gold */
  -webkit-text-stroke: 2px #0057b7; /* Blue Outline fallback */
  text-shadow: 
      3px 3px 0 #0057b7,
     -1px -1px 0 #0057b7,  
      1px -1px 0 #0057b7,
     -1px 1px 0 #0057b7,
      1px 1px 0 #0057b7,
      5px 5px 10px rgba(0,0,0,0.5);
  font-style: italic;
  font-weight: 900;
  letter-spacing: -0.05em;
}

/* 
   SONIC GOLD PANELS 
   Grandi forme geometriche con bordo oro che si muovono
*/

.sonic-panel-gold {
  position: absolute;
  background: linear-gradient(135deg, #003080, #001f52);
  border: 8px solid #ffd700; /* Gold Thick Border */
  box-shadow: 
    0 0 20px rgba(255, 215, 0, 0.5), /* Outer Glow */
    inset 0 0 30px rgba(0, 0, 0, 0.5); /* Inner Depth */
  z-index: 0;
}

/* Animazione Pannello in Alto a Sinistra (Scende verso il centro) */
@keyframes movePanelTL {
  0% { transform: translate(-20px, -20px) skewX(-15deg); }
  50% { transform: translate(40px, 40px) skewX(-15deg); } /* Move In */
  100% { transform: translate(-20px, -20px) skewX(-15deg); } /* Move Out */
}

/* Animazione Pannello in Basso a Destra (Sale verso il centro) */
@keyframes movePanelBR {
  0% { transform: translate(20px, 20px) skewX(-15deg); }
  50% { transform: translate(-40px, -40px) skewX(-15deg); } /* Move In */
  100% { transform: translate(20px, 20px) skewX(-15deg); } /* Move Out */
}

.anim-panel-tl {
  width: 60vw;
  height: 40vh;
  top: -10vh;
  left: -10vw;
  border-radius: 0 0 40px 0;
  animation: movePanelTL 6s ease-in-out infinite;
}

.anim-panel-br {
  width: 70vw;
  height: 40vh;
  bottom: -10vh;
  right: -10vw;
  border-radius: 40px 0 0 0;
  animation: movePanelBR 6s ease-in-out infinite;
  animation-delay: 0.5s; /* Slight sync offset */
}


/* Floating Ring Animation */
@keyframes floatRing {
  0% { 
    transform: translateY(110vh) rotateX(60deg) rotateZ(0deg) scale(0.5); 
    opacity: 0;
  }
  20% { opacity: 0.9; }
  80% { opacity: 0.9; }
  100% { 
    transform: translateY(-20vh) rotateX(60deg) rotateZ(360deg) scale(1.2); 
    opacity: 0;
  }
}

.ring-anim {
  position: absolute;
  width: 70px;
  height: 70px;
  border: 8px solid #ffd700; /* Real Gold */
  border-radius: 50%;
  box-shadow: 
    0 0 10px #ffd700, 
    inset 0 0 10px #b8860b; 
  animation: floatRing 8s linear infinite;
  z-index: 0;
  pointer-events: none;
}

/* Origins Button Style */
.btn-origins {
  background: #0f172a;
  color: white;
  border: 2px solid rgba(255,255,255,0.1);
  border-radius: 9999px;
  transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  font-weight: 800;
  letter-spacing: 0.05em;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.3);
}

.btn-origins:hover {
  background: #ffcd00;
  color: #000;
  border-color: #ffcd00;
  transform: scale(1.05) rotate(-1deg);
  box-shadow: 0 0 25px rgba(255, 205, 0, 0.8);
}

.btn-origins:active {
  transform: scale(0.95);
}

/* 
   SONIC RED RIBBON BUTTON (Game Gear / Origins Pause Menu Style)
   Sfondo rosso, bordo bianco, frecce gialle laterali
*/
.btn-sonic-red {
  background: linear-gradient(180deg, #ff4d4d 0%, #cc0000 100%);
  border: 2px solid #ffffff;
  color: white;
  font-weight: 900;
  text-transform: uppercase;
  font-style: italic;
  letter-spacing: 0.05em;
  box-shadow: 0 4px 10px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.4);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  text-shadow: 2px 2px 0px rgba(0,0,0,0.5);
  clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%); /* Rettangolare ma predisposto per tagli futuri */
}

.btn-sonic-red:hover {
  background: linear-gradient(180deg, #ff6666 0%, #e60000 100%);
  transform: scale(1.02);
  box-shadow: 0 0 20px rgba(255, 50, 50, 0.8);
  border-color: #ffcd00; /* Bordo diventa oro */
}

.btn-sonic-red:active {
  transform: scale(0.98);
}

/* Decorazione Frecce Gialle */
.btn-sonic-red .arrow-deco {
  color: #ffd700;
  font-size: 1.2rem;
  font-weight: 900;
  text-shadow: 1px 1px 0 #000;
  display: flex;
  align-items: center;
}

.glass-card {
    background: rgba(0,0,0,0.4);
    backdrop-filter: blur(5px);
}

.animate-in {
  animation: fadeIn 0.4s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Hide Scrollbar for Switch-like clean look */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
EOF

# Fix import nel main.tsx per includere il CSS generato
sed -i '1s/^/import ".\/index.css";\n/' build_dist/src/main.tsx

# 3. Installazione Dipendenze Frontend e Build
cd build_dist
echo ">>> Installazione dipendenze React..."
npm install
echo ">>> Compilazione React..."
npm run build

# ==========================================
# ELECTRON WRAPPER SETUP
# ==========================================
echo ">>> Preparazione Electron..."

# Creazione main process di Electron con IPC handler per Dialoghi
cat <<EOF > electron-main.js
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true, // Necessario per filesystem e child_process
      contextIsolation: false, // Permette require('electron') nel render
      webSecurity: false // Permette di caricare immagini locali
    },
    backgroundColor: '#004696', 
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'icon.png') // Imposta icona finestra (se presente)
  });

  win.loadFile(path.join(__dirname, 'dist/index.html'));
}

// Handler per aprire il dialogo file
ipcMain.handle('dialog:openFile', async (event, { defaultPath, filters }) => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    defaultPath: defaultPath,
    // AGGIUNTO 'showHiddenFiles' PER VISUALIZZARE CARTELLE/FILE NASCOSTI (che iniziano con .)
    properties: ['openFile', 'showHiddenFiles'],
    filters: filters
  });
  if (canceled) {
    return null;
  } else {
    return filePaths[0];
  }
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
EOF

# Aggiornamento package.json per Electron e Build
cat <<EOF > package.json
{
  "name": "sonic-launcher",
  "version": "1.0.0",
  "main": "electron-main.js",
  "description": "Launcher per Sonic",
  "author": "User",
  "scripts": {
    "pack": "electron-builder --dir",
    "dist": "electron-builder"
  },
  "build": {
    "appId": "com.sonic.launcher",
    "linux": {
      "target": "AppImage",
      "category": "Game",
      "icon": "icon.png"
    },
    "files": [
      "dist/**/*",
      "electron-main.js",
      "icon.png"
    ]
  },
  "dependencies": {
    "electron-serve": "^1.1.0"
  },
  "devDependencies": {
    "electron": "^25.0.0",
    "electron-builder": "^24.0.0"
  }
}
EOF

echo ">>> Installazione Electron Builder..."
npm install

# 4. Creazione AppImage
echo ">>> Generazione AppImage..."
npm run dist

# 5. Spostamento output
cd ..
echo ">>> Organizzazione cartella finale..."

# Trova l'AppImage generata e spostala (uso virgolette per destinazione con spazi)
find build_dist/dist -name "*.AppImage" -exec mv {} "Sonic Extended Collection/" \;

# Creazione file dati vuoto (placeholder)
echo "[]" > "Sonic Extended Collection/data.json"

echo "=========================================="
echo "COMPLETATO!"
echo "Trovi il risultato nella cartella 'Sonic Extended Collection'"
echo "Struttura:"
echo "  /Sonic Extended Collection"
echo "    /retroarch  <- Inserisci qui RetroArch AppImage"
echo "    /roms       <- Inserisci qui le tue ROM"
echo "    /host       <- Inserisci qui il file .mp3 per la musica"
echo "    /configurations <- Inserisci qui i file .cfg (Opzionale)"
echo "    data.json   <- Qui verranno salvati i dati"
echo "    [Launcher].AppImage"
echo "=========================================="
