
export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface ImageOverlay {
  id: string;
  type: 'image';
  src: string;
  position: Position;
  size: Size;
  zIndex: number;
}

export interface WebcamOverlay {
  id: 'webcam';
  type: 'webcam';
  stream: MediaStream | null;
  deviceId?: string;
  position: Position;
  size: Size;
  zIndex: number;
  isFullScreen: boolean;
}

export type Overlay = ImageOverlay | WebcamOverlay;
