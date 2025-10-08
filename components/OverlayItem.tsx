import React, { useRef, useEffect } from 'react';
import { ImageOverlay, WebcamOverlay, VideoOverlay, Position, Size, GraphicOverlay } from '../types';
import { CloseIcon, FullscreenEnterIcon, FullscreenExitIcon, SettingsIcon, ArrowLeftIcon, ArrowRightIcon } from './icons';
import DraggableResizableFrame from './DraggableResizableFrame';

interface OverlayItemProps {
  overlay: ImageOverlay | WebcamOverlay | VideoOverlay | GraphicOverlay;
  onUpdate: (id: string, pos: Position, size: Size) => void;
  onDelete: (id: string) => void;
  onFocus: (id: string) => void;
  onToggleFullScreen?: (id: string) => void;
  onOpenSettings?: (id: string) => void;
  onCycleSource?: (id: string, direction: 'next' | 'previous') => void;
  containerRef: React.RefObject<HTMLDivElement>;
}

const OverlayItem: React.FC<OverlayItemProps> = ({
  overlay,
  onUpdate,
  onDelete,
  onFocus,
  onToggleFullScreen,
  onOpenSettings,
  onCycleSource,
  containerRef,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isWebcam = overlay.type === 'webcam';
  const webcamOverlay = isWebcam ? (overlay as WebcamOverlay) : null;

  useEffect(() => {
    if (isWebcam && videoRef.current && webcamOverlay?.stream) {
      if (videoRef.current.srcObject !== webcamOverlay.stream) {
        videoRef.current.srcObject = webcamOverlay.stream;
      }
    }
  }, [isWebcam, webcamOverlay?.stream]);

  const handleUpdate = (pos: Position, size: Size) => {
    onUpdate(overlay.id, pos, size);
  };
  
  const handleFocus = () => onFocus(overlay.id);

  const overlayStyles: React.CSSProperties = {
    borderWidth: `${overlay.border.width}px`,
    borderColor: overlay.border.color,
    borderStyle: overlay.border.style,
    borderRadius: `${overlay.border.radius}px`,
  };

  return (
    <DraggableResizableFrame
      position={overlay.position}
      size={overlay.size}
      zIndex={overlay.zIndex}
      onUpdate={handleUpdate}
      onFocus={handleFocus}
      containerRef={containerRef}
      isFullScreen={isWebcam ? webcamOverlay?.isFullScreen ?? false : false}
    >
      <div className="absolute top-1 right-1 z-20 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {onCycleSource && overlay.type !== 'graphic' && (
          <>
            <button 
              onClick={() => onCycleSource(overlay.id, 'previous')}
              className="p-1 rounded-full bg-black bg-opacity-50 hover:bg-opacity-75 text-white"
              title="Previous Source"
            >
              <ArrowLeftIcon />
            </button>
            <button 
              onClick={() => onCycleSource(overlay.id, 'next')}
              className="p-1 rounded-full bg-black bg-opacity-75 hover:bg-opacity-75 text-white"
              title="Next Source"
            >
              <ArrowRightIcon />
            </button>
          </>
        )}
        {onOpenSettings && (
          <button 
            onClick={() => onOpenSettings(overlay.id)}
            className="p-1 rounded-full bg-black bg-opacity-50 hover:bg-opacity-75 text-white"
            title="Border Settings"
          >
            <SettingsIcon />
          </button>
        )}
        {isWebcam && onToggleFullScreen && (
          <button 
            onClick={() => onToggleFullScreen(overlay.id)}
            className="p-1 rounded-full bg-black bg-opacity-50 hover:bg-opacity-75 text-white"
            title={webcamOverlay?.isFullScreen ? "Exit Full Screen" : "Enter Full Screen"}
          >
            {webcamOverlay?.isFullScreen ? <FullscreenExitIcon /> : <FullscreenEnterIcon />}
          </button>
        )}
        <button 
            onClick={() => onDelete(overlay.id)}
            className="p-1 rounded-full bg-black bg-opacity-50 hover:bg-opacity-75 text-white"
            title="Remove Overlay"
        >
            <CloseIcon />
        </button>
      </div>
      {(overlay.type === 'image' || overlay.type === 'graphic') && (
        <img
          src={(overlay as ImageOverlay | GraphicOverlay).src}
          className="w-full h-full object-cover pointer-events-none"
          alt="Overlay"
          draggable={false}
          style={overlayStyles}
        />
      )}
       {overlay.type === 'video' && (
        <video
          src={(overlay as VideoOverlay).src}
          className="w-full h-full object-cover pointer-events-none"
          autoPlay
          loop
          muted
          playsInline
          style={overlayStyles}
        />
      )}
      {overlay.type === 'webcam' && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          style={overlayStyles}
        />
      )}
    </DraggableResizableFrame>
  );
};

export default OverlayItem;