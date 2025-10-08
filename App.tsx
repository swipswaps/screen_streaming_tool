import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Position, Size, ImageOverlay, WebcamOverlay, Overlay, OverlayBorder, VideoOverlay, GraphicOverlay } from './types';
import Toolbar from './components/Toolbar';
import OverlayItem from './components/OverlayItem';
import { ScreenShareIcon, EyeOffIcon } from './components/icons';
import OverlaySettingsPanel from './components/WebcamSettingsPanel';

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
  const [editingOverlayId, setEditingOverlayId] = useState<string | null>(null);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [mediaLibrary, setMediaLibrary] = useState<{ images: string[], videos: string[] }>({ images: [], videos: [] });


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
      setScreenStream(null);
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false,
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
  
  const handleEnumerateWebcams = useCallback(async () => {
    try {
      // Ensure permissions are requested before enumerating
      if (videoDevices.length === 0) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop());
      }
    } catch (err) {
      console.error("Error getting camera permissions:", err);
    }
    const devices = await navigator.mediaDevices.enumerateDevices();
    setVideoDevices(devices.filter(d => d.kind === 'videoinput'));
  }, [videoDevices.length]);

  const handleSelectWebcam = useCallback(async (deviceId: string) => {
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
          border: {
            color: '#ffffff',
            width: 4,
            style: 'solid',
            radius: 0,
          },
        };
        setOverlays(prev => [...prev, newWebcam]);
      }
    } catch (error) {
      console.error('Error accessing webcam:', error);
    }
  }, [overlays]);

  const handleStopWebcam = () => {
    const webcamOverlay = overlays.find(o => o.type === 'webcam') as WebcamOverlay | undefined;
    if (webcamOverlay) {
      webcamOverlay.stream?.getTracks().forEach(track => track.stop());
      setOverlays(prev => prev.filter(o => o.type !== 'webcam'));
      if (editingOverlayId === 'webcam') {
        setEditingOverlayId(null);
      }
    }
  };


  const handleAddMedia = (files: FileList) => {
    const fileList = Array.from(files);
    const newImageSrcs: string[] = [];
    const newVideoSrcs: string[] = [];
    
    let firstNewImageSrc: string | null = null;
    let firstNewVideoSrc: string | null = null;

    const filePromises = fileList.map(file => {
      return new Promise<void>(resolve => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const src = e.target?.result as string;
          if (file.type.startsWith('image/')) {
            newImageSrcs.push(src);
            if (!firstNewImageSrc) firstNewImageSrc = src;
          } else if (file.type.startsWith('video/')) {
            newVideoSrcs.push(src);
            if (!firstNewVideoSrc) firstNewVideoSrc = src;
          }
          resolve();
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(filePromises).then(() => {
      setMediaLibrary(prev => ({
        images: [...prev.images, ...newImageSrcs],
        videos: [...prev.videos, ...newVideoSrcs],
      }));
      
      const newOverlays: Overlay[] = [];
      const commonProps = {
        position: { x: 100, y: 100 },
        size: { width: 400, height: 300 },
        zIndex: getNextZIndex(),
        border: {
            color: '#ffffff',
            width: 0,
            style: 'solid' as 'solid' | 'dashed',
            radius: 0,
        },
      };

      if (firstNewImageSrc) {
        newOverlays.push({
          ...commonProps,
          id: `img_${Date.now()}`,
          type: 'image',
          src: firstNewImageSrc,
        });
      }

      if (firstNewVideoSrc) {
        newOverlays.push({
          ...commonProps,
          id: `vid_${Date.now()}`,
          type: 'video',
          src: firstNewVideoSrc,
        });
      }

      if (newOverlays.length > 0) {
        setOverlays(prev => [...prev, ...newOverlays]);
      }
    });
  };

  const handleAddGraphic = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
        const src = e.target?.result as string;
        if (!src) return;

        const newGraphic: GraphicOverlay = {
            id: `graphic_${Date.now()}`,
            type: 'graphic',
            src,
            position: { x: 150, y: 150 },
            size: { width: 300, height: 200 },
            zIndex: getNextZIndex(),
            border: {
                color: '#ffffff',
                width: 0,
                style: 'solid',
                radius: 0,
            },
        };
        setOverlays(prev => [...prev, newGraphic]);
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
    if (editingOverlayId === id) {
        setEditingOverlayId(null);
    }
  }, [editingOverlayId]);

  const handleFocusOverlay = useCallback((id: string) => {
    setOverlays(prev => {
        const focusedOverlay = prev.find(o => o.id === id);
        if(!focusedOverlay || focusedOverlay.zIndex === zIndexCounter.current) return prev;
        
        const maxZ = Math.max(...prev.map(o => o.zIndex), zIndexCounter.current);
        zIndexCounter.current = maxZ + 1;
        return prev.map(o => o.id === id ? { ...o, zIndex: zIndexCounter.current } : o);
    });
  }, []);
  
  const handleToggleFullScreen = useCallback((id: string) => {
    setOverlays(prev => 
      prev.map(o => {
        if(o.id === id && o.type === 'webcam') {
          const maxZ = Math.max(...prev.map(p => p.zIndex), zIndexCounter.current);
          zIndexCounter.current = maxZ + 1;
          return {...o, isFullScreen: !(o as WebcamOverlay).isFullScreen, zIndex: zIndexCounter.current };
        }
        return o;
      })
    );
  }, []);
  
  const handleOpenOverlaySettings = useCallback((id: string) => {
    setEditingOverlayId(id);
  }, []);

  const handleUpdateOverlayBorder = useCallback((id: string, border: OverlayBorder) => {
    setOverlays(prev => 
        prev.map(o => 
            o.id === id ? { ...o, border } : o
        )
    );
  }, []);

  const handleCycleSource = useCallback((id: string, direction: 'next' | 'previous') => {
    const targetOverlay = overlays.find(o => o.id === id);
    if (!targetOverlay) return;
    
    const step = direction === 'next' ? 1 : -1;

    if (targetOverlay.type === 'webcam') {
        if (videoDevices.length < 2) return;
        const currentIndex = videoDevices.findIndex(d => d.deviceId === targetOverlay.deviceId);
        const nextIndex = (currentIndex + step + videoDevices.length) % videoDevices.length;
        handleSelectWebcam(videoDevices[nextIndex].deviceId);
    }

    if (targetOverlay.type === 'image') {
        if (mediaLibrary.images.length < 2) return;
        const currentSrc = (targetOverlay as ImageOverlay).src;
        const currentIndex = mediaLibrary.images.indexOf(currentSrc);
        if (currentIndex === -1) return;
        const nextIndex = (currentIndex + step + mediaLibrary.images.length) % mediaLibrary.images.length;
        const nextSrc = mediaLibrary.images[nextIndex];
        setOverlays(prev => prev.map(o => (o.id === id ? { ...o, src: nextSrc } : o)));
    }
    
    if (targetOverlay.type === 'video') {
        if (mediaLibrary.videos.length < 2) return;
        const currentSrc = (targetOverlay as VideoOverlay).src;
        const currentIndex = mediaLibrary.videos.indexOf(currentSrc);
        if (currentIndex === -1) return;
        const nextIndex = (currentIndex + step + mediaLibrary.videos.length) % mediaLibrary.videos.length;
        const nextSrc = mediaLibrary.videos[nextIndex];
        setOverlays(prev => prev.map(o => (o.id === id ? { ...o, src: nextSrc } : o)));
    }
  }, [overlays, videoDevices, mediaLibrary, handleSelectWebcam]);

  const activeWebcam = useMemo(() => overlays.find(o => o.type === 'webcam') as WebcamOverlay | undefined, [overlays]);
  const editingOverlay = useMemo(() => overlays.find(o => o.id === editingOverlayId), [overlays, editingOverlayId]);

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
                onOpenSettings={handleOpenOverlaySettings}
                onCycleSource={handleCycleSource}
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
        videoDevices={videoDevices}
        onToggleScreenShare={handleToggleScreenShare}
        onSelectWebcam={handleSelectWebcam}
        onStopWebcam={handleStopWebcam}
        onAddMedia={handleAddMedia}
        onAddGraphic={handleAddGraphic}
        onToggleRecording={handleToggleRecording}
        onTogglePreview={handleTogglePreview}
        onEnumerateWebcams={handleEnumerateWebcams}
      />
      {editingOverlay && (
        <OverlaySettingsPanel
            border={editingOverlay.border}
            onUpdate={(border) => handleUpdateOverlayBorder(editingOverlay.id, border)}
            onClose={() => setEditingOverlayId(null)}
        />
      )}
    </div>
  );
};

export default App;