import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Position, Size, ImageOverlay, WebcamOverlay, Overlay } from './types';
import Toolbar from './components/Toolbar';
import OverlayItem from './components/OverlayItem';
import { ScreenShareIcon, EyeOffIcon } from './components/icons';

const App: React.FC = () => {
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [overlays, setOverlays] = useState<Overlay[]>([]);
  const screenVideoRef = useRef<HTMLVideoElement>(null);
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const zIndexCounter = useRef(10);

  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const [isPreviewVisible, setIsPreviewVisible] = useState(true);

  useEffect(() => {
    if (screenVideoRef.current && screenStream && isPreviewVisible) {
      screenVideoRef.current.srcObject = screenStream;
    }
  }, [screenStream, isPreviewVisible]);
  
  useEffect(() => {
    if (!screenStream && isRecording) {
      mediaRecorderRef.current?.stop();
    }
  }, [screenStream, isRecording]);

  const getNextZIndex = () => {
    zIndexCounter.current += 1;
    return zIndexCounter.current;
  };

  const handleToggleScreenShare = async () => {
    if (screenStream) {
      screenStream.getTracks().forEach((track) => track.stop());
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });

        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) {
            videoTrack.onended = () => {
                stream.getTracks().forEach(t => t.stop());
                setScreenStream(null);
                setIsPreviewVisible(true); // Reset preview visibility on stop
            };
        }
        setScreenStream(stream);
      } catch (error) {
        console.error('Error sharing screen:', error);
      }
    }
  };
  
  const handleToggleRecording = useCallback(() => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
    } else {
      if (!screenStream) {
        alert("Please start screen sharing before recording.");
        return;
      }
      recordedChunksRef.current = [];
      try {
        const recorder = new MediaRecorder(screenStream, { mimeType: 'video/webm' });
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            recordedChunksRef.current.push(event.data);
          }
        };

        recorder.onstop = () => {
          const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          document.body.appendChild(a);
          a.style.display = 'none';
          a.href = url;
          a.download = `stream-studio-recording-${Date.now()}.webm`;
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          recordedChunksRef.current = [];
          setIsRecording(false);
          mediaRecorderRef.current = null;
        };

        recorder.start();
        setIsRecording(true);
      } catch (error) {
        console.error("Error starting recording:", error);
        alert("Could not start recording. Your browser may not support this feature.");
      }
    }
  }, [isRecording, screenStream]);

  const handleTogglePreview = () => {
    setIsPreviewVisible(prev => !prev);
  };

  const handleSelectWebcam = async (deviceId: string) => {
    const existingWebcam = overlays.find(o => o.type === 'webcam') as WebcamOverlay | undefined;
    existingWebcam?.stream?.getTracks().forEach(track => track.stop());

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { deviceId: { exact: deviceId } } 
      });

      if (existingWebcam) {
        setOverlays(prev => prev.map(o => 
          o.id === 'webcam' ? { ...o, stream, deviceId } : o
        ));
      } else {
        const newWebcam: WebcamOverlay = {
          id: 'webcam',
          type: 'webcam',
          stream,
          deviceId,
          position: { x: 50, y: 50 },
          size: { width: 320, height: 240 },
          zIndex: getNextZIndex(),
          isFullScreen: false,
        };
        setOverlays(prev => [...prev, newWebcam]);
      }
    } catch (error) {
      console.error('Error accessing webcam:', error);
    }
  };

  const handleStopWebcam = () => {
    const webcamOverlay = overlays.find(o => o.type === 'webcam') as WebcamOverlay | undefined;
    if (webcamOverlay) {
      webcamOverlay.stream?.getTracks().forEach(track => track.stop());
      setOverlays(prev => prev.filter(o => o.type !== 'webcam'));
    }
  };


  const handleAddImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const newImage: ImageOverlay = {
        id: `img_${Date.now()}`,
        type: 'image',
        src: e.target?.result as string,
        position: { x: 100, y: 100 },
        size: { width: 400, height: 300 },
        zIndex: getNextZIndex(),
      };
      setOverlays(prev => [...prev, newImage]);
    };
    reader.readAsDataURL(file);
  };
  
  const handleUpdateOverlay = useCallback((id: string, position: Position, size: Size) => {
    setOverlays(prev => prev.map(o => o.id === id ? { ...o, position, size } : o));
  }, []);

  const handleDeleteOverlay = useCallback((id: string) => {
    setOverlays(prev => {
      const overlayToDelete = prev.find(o => o.id === id);
      if (overlayToDelete?.type === 'webcam') {
        (overlayToDelete as WebcamOverlay).stream?.getTracks().forEach(track => track.stop());
      }
      return prev.filter(o => o.id !== id);
    });
  }, []);

  const handleFocusOverlay = useCallback((id: string) => {
    setOverlays(prev => {
        const focusedOverlay = prev.find(o => o.id === id);
        if(!focusedOverlay || focusedOverlay.zIndex === zIndexCounter.current) return prev;
        
        return prev.map(o => o.id === id ? { ...o, zIndex: getNextZIndex() } : o);
    });
  }, []);
  
  const handleToggleFullScreen = useCallback((id: string) => {
    setOverlays(prev => 
      prev.map(o => {
        if(o.id === id && o.type === 'webcam') {
          return {...o, isFullScreen: !(o as WebcamOverlay).isFullScreen, zIndex: getNextZIndex() };
        }
        return o;
      })
    );
  }, []);

  const activeWebcam = overlays.find(o => o.type === 'webcam') as WebcamOverlay | undefined;

  return (
    <div ref={mainContainerRef} className="h-screen w-screen overflow-hidden flex flex-col bg-gray-900">
      <main className="flex-1 relative bg-black">
        {screenStream ? (
          !isPreviewVisible ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-800 p-8 text-center">
                <EyeOffIcon className="w-24 h-24 mb-4" />
                <h2 className="text-2xl font-bold text-white">Preview Hidden</h2>
                <p className="mt-2 text-lg max-w-2xl">
                    Your stream is active. The preview is hidden to prevent the "hall of mirrors" effect.
                </p>
                <p className="mt-1 text-base text-gray-500">
                    Click the Preview button in the toolbar to show it if you are capturing a different screen.
                </p>
            </div>
          ) : (
            <video
              ref={screenVideoRef}
              autoPlay
              className="w-full h-full object-contain"
            />
          )
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
             <ScreenShareIcon className="w-24 h-24 mb-4" />
             <h1 className="text-3xl font-bold">Stream Studio</h1>
             <p className="mt-2 text-lg">Click "Screen" on the toolbar below to start sharing.</p>
          </div>
        )}
        
        {overlays.map(overlay => (
            <OverlayItem 
                key={overlay.id}
                overlay={overlay}
                onUpdate={handleUpdateOverlay}
                onDelete={handleDeleteOverlay}
                onFocus={handleFocusOverlay}
                onToggleFullScreen={handleToggleFullScreen}
                containerRef={mainContainerRef}
            />
        ))}

      </main>
      <Toolbar 
        isScreenSharing={!!screenStream}
        isWebcamOn={!!activeWebcam}
        activeWebcamDeviceId={activeWebcam?.deviceId}
        isRecording={isRecording}
        isPreviewVisible={isPreviewVisible}
        onToggleScreenShare={handleToggleScreenShare}
        onSelectWebcam={handleSelectWebcam}
        onStopWebcam={handleStopWebcam}
        onAddImage={handleAddImage}
        onToggleRecording={handleToggleRecording}
        onTogglePreview={handleTogglePreview}
      />
    </div>
  );
};

export default App;