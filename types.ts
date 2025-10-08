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

interface BaseOverlay {
  id: string;
  position: Position;
  size: Size;
  zIndex: number;
  border: OverlayBorder;
}

export interface ImageOverlay extends BaseOverlay {
  type: 'image';
  src: string;
}

export interface VideoOverlay extends BaseOverlay {
  type: 'video';
  src: string;
}

export interface WebcamOverlay extends BaseOverlay {
  id: 'webcam';
  type: 'webcam';
  stream: MediaStream | null;
  deviceId?: string;
  isFullScreen: boolean;
}

export type Overlay = ImageOverlay | WebcamOverlay | VideoOverlay;
