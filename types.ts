export interface Game {
  id: string;
  name: string;
  romPath: string;
  retroarchPath: string;
  corePath: string;
  shPath?: string; // Percorso opzionale per script .sh o launcher alternativi
  configPath?: string; // Percorso opzionale per file .cfg custom
  thumbnailUrl: string;
}

export interface Position {
  x: number;
  y: number;
}

export enum ControllerType {
  XBOX = 'XBOX',
  PLAYSTATION = 'PLAYSTATION',
  NINTENDO = 'NINTENDO',
  GENERIC = 'GENERIC',
  KEYBOARD = 'KEYBOARD'
}