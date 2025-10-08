
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Position, Size } from '../types';

type Interaction = 'drag' | 'resize-br' | 'resize-bl' | 'resize-tr' | 'resize-tl' | null;

interface DraggableResizableFrameProps {
  position: Position;
  size: Size;
  zIndex: number;
  onUpdate: (pos: Position, size: Size) => void;
  onFocus: () => void;
  children: React.ReactNode;
  containerRef: React.RefObject<HTMLElement>;
  isFullScreen: boolean;
}

const DraggableResizableFrame: React.FC<DraggableResizableFrameProps> = ({
  position,
  size,
  zIndex,
  onUpdate,
  onFocus,
  children,
  containerRef,
  isFullScreen,
}) => {
  const [interaction, setInteraction] = useState<Interaction>(null);
  const initialRef = useRef<{ pos: Position; size: Size; mouse: Position } | null>(null);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>, type: Interaction) => {
    e.preventDefault();
    e.stopPropagation();
    onFocus();
    setInteraction(type);
    initialRef.current = {
      pos: { ...position },
      size: { ...size },
      mouse: { x: e.clientX, y: e.clientY },
    };
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!interaction || !initialRef.current || !containerRef.current) return;

    const dx = e.clientX - initialRef.current.mouse.x;
    const dy = e.clientY - initialRef.current.mouse.y;
    const containerRect = containerRef.current.getBoundingClientRect();

    let newPos = { ...initialRef.current.pos };
    let newSize = { ...initialRef.current.size };

    if (interaction === 'drag') {
      newPos.x = initialRef.current.pos.x + dx;
      newPos.y = initialRef.current.pos.y + dy;
    } else if (interaction === 'resize-br') {
      newSize.width = initialRef.current.size.width + dx;
      newSize.height = initialRef.current.size.height + dy;
    } else if (interaction === 'resize-bl') {
        newPos.x = initialRef.current.pos.x + dx;
        newSize.width = initialRef.current.size.width - dx;
        newSize.height = initialRef.current.size.height + dy;
    } else if (interaction === 'resize-tr') {
        newPos.y = initialRef.current.pos.y + dy;
        newSize.width = initialRef.current.size.width + dx;
        newSize.height = initialRef.current.size.height - dy;
    } else if (interaction === 'resize-tl') {
        newPos.x = initialRef.current.pos.x + dx;
        newPos.y = initialRef.current.pos.y + dy;
        newSize.width = initialRef.current.size.width - dx;
        newSize.height = initialRef.current.size.height - dy;
    }

    // Clamp size
    newSize.width = Math.max(100, newSize.width);
    newSize.height = Math.max(75, newSize.height);

    // Clamp position within container
    newPos.x = Math.max(0, Math.min(newPos.x, containerRect.width - newSize.width));
    newPos.y = Math.max(0, Math.min(newPos.y, containerRect.height - newSize.height));

    onUpdate(newPos, newSize);
  }, [interaction, onUpdate, containerRef]);

  const handleMouseUp = useCallback(() => {
    setInteraction(null);
    initialRef.current = null;
  }, []);
  
  useEffect(() => {
    if (interaction) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [interaction, handleMouseMove, handleMouseUp]);
  
  const frameStyle: React.CSSProperties = isFullScreen ? {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: 100
  } : {
      position: 'absolute',
      left: `${position.x}px`,
      top: `${position.y}px`,
      width: `${size.width}px`,
      height: `${size.height}px`,
      zIndex,
  };

  return (
    <div
      style={frameStyle}
      className={`border-2 border-blue-500 shadow-lg bg-black group transition-all duration-200 ${isFullScreen ? '' : 'hover:border-blue-400'}`}
      onMouseDown={(e) => !isFullScreen && handleMouseDown(e, 'drag')}
    >
        <div className="w-full h-full relative">
            {children}
            {!isFullScreen && (
                <>
                    <div className="absolute -bottom-1.5 -right-1.5 w-4 h-4 bg-blue-500 border-2 border-gray-900 rounded-full cursor-se-resize" onMouseDown={(e) => handleMouseDown(e, 'resize-br')} />
                    <div className="absolute -bottom-1.5 -left-1.5 w-4 h-4 bg-blue-500 border-2 border-gray-900 rounded-full cursor-sw-resize" onMouseDown={(e) => handleMouseDown(e, 'resize-bl')} />
                    <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-blue-500 border-2 border-gray-900 rounded-full cursor-ne-resize" onMouseDown={(e) => handleMouseDown(e, 'resize-tr')} />
                    <div className="absolute -top-1.5 -left-1.5 w-4 h-4 bg-blue-500 border-2 border-gray-900 rounded-full cursor-nw-resize" onMouseDown={(e) => handleMouseDown(e, 'resize-tl')} />
                </>
            )}
        </div>
    </div>
  );
};

export default DraggableResizableFrame;
