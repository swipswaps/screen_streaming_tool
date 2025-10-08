export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface OverlayBorder {
  color: string;
  width: number;
  style: 'solid' | 'dashed';
  radius: number;
}

export interface ImageOverlay {
  id: string;
  type: 'image';
  src: string;
  position: Position;
  size: Size;
  zIndex: number;
  border: OverlayBorder;
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
  border: OverlayBorder;
}

export type Overlay = ImageOverlay | WebcamOverlay;
