
export interface ImageData {
  base64: string;
  mimeType: string;
}

export enum EditMode {
  REMOVE_BACKGROUND = 'REMOVE_BACKGROUND',
  REMOVE_OBJECT = 'REMOVE_OBJECT',
  CUSTOM_PROMPT = 'CUSTOM_PROMPT',
  ENHANCE = 'ENHANCE',
  BLUR_BACKGROUND = 'BLUR_BACKGROUND'
}

export interface Selection {
  x: number;
  y: number;
}

export interface HistoryItem {
  id: string;
  original: string;
  edited: string;
  prompt: string;
  timestamp: number;
}
