import React, { useRef, useState, useEffect } from 'react';
import { CameraIcon, MediaIcon, ScreenShareIcon, RecordIcon, EyeIcon, EyeOffIcon } from './icons';

interface ToolbarProps {
  isScreenSharing: boolean;
  isWebcamOn: boolean;
  activeWebcamDeviceId?: string;
  isRecording: boolean;
  isPreviewVisible: boolean;
  videoDevices: MediaDeviceInfo[];
  onToggleScreenShare: () => void;
  onSelectWebcam: (deviceId: string) => void;
  onStopWebcam: () => void;
  onAddMedia: (files: FileList) => void;
  onToggleRecording: () => void;
  onTogglePreview: () => void;
  onEnumerateWebcams: () => void;
}

const ToolbarButton: React.FC<{ onClick?: () => void; children: React.ReactNode; isActive?: boolean; title: string; disabled?: boolean; ref?: React.Ref<HTMLButtonElement> }> = React.forwardRef(({ onClick, children, isActive, title, disabled }, ref) => (
  <button
    ref={ref}
    onClick={onClick}
    title={title}
    disabled={disabled}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
      isActive
        ? 'bg-blue-600 text-white hover:bg-blue-500'
        : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
    }`}
  >
    {children}
  </button>
));


const Toolbar: React.FC<ToolbarProps> = ({ 
    isScreenSharing, 
    isWebcamOn, 
    activeWebcamDeviceId,
    isRecording,
    isPreviewVisible,
    videoDevices,
    onToggleScreenShare, 
    onSelectWebcam,
    onStopWebcam,
    onAddMedia,
    onToggleRecording,
    onTogglePreview,
    onEnumerateWebcams
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isWebcamMenuOpen, setIsWebcamMenuOpen] = useState(false);
  const webcamMenuRef = useRef<HTMLDivElement>(null);

  const handleAddMediaClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      onAddMedia(files);
    }
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleWebcamButtonClick = async () => {
    if (!isWebcamMenuOpen) {
      onEnumerateWebcams();
      setIsWebcamMenuOpen(true);
    } else {
        setIsWebcamMenuOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isWebcamMenuOpen && webcamMenuRef.current && !webcamMenuRef.current.contains(event.target as Node)) {
        setIsWebcamMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isWebcamMenuOpen]);


  const handleDeviceSelect = (deviceId: string) => {
    onSelectWebcam(deviceId);
    setIsWebcamMenuOpen(false);
  };

  const handleWebcamStop = () => {
    onStopWebcam();
    setIsWebcamMenuOpen(false);
  };


  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gray-800 bg-opacity-80 backdrop-blur-sm p-3 rounded-xl shadow-2xl border border-gray-700">
      <div className="flex items-center gap-3">
        <ToolbarButton onClick={onToggleScreenShare} isActive={isScreenSharing} title={isScreenSharing ? "Stop Sharing" : "Share Screen"}>
          <ScreenShareIcon />
          <span>{isScreenSharing ? 'Stop' : 'Screen'}</span>
        </ToolbarButton>

        <button
            onClick={onToggleRecording}
            disabled={!isScreenSharing}
            title={isRecording ? "Stop Recording" : "Start Recording"}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
            isRecording
                ? 'bg-red-600 text-white hover:bg-red-500 animate-pulse'
                : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
            }`}
        >
            <RecordIcon className="w-5 h-5" />
            <span>{isRecording ? 'Stop' : 'Record'}</span>
        </button>
        
        <ToolbarButton onClick={onTogglePreview} disabled={!isScreenSharing} isActive={isPreviewVisible} title={isPreviewVisible ? "Hide Preview" : "Show Preview"}>
          {isPreviewVisible ? <EyeIcon className="w-5 h-5" /> : <EyeOffIcon className="w-5 h-5" />}
        </ToolbarButton>

        <div className="relative" ref={webcamMenuRef}>
          <ToolbarButton onClick={handleWebcamButtonClick} isActive={isWebcamOn} title="Webcam Settings">
            <CameraIcon />
            <span>Webcam</span>
          </ToolbarButton>

          {isWebcamMenuOpen && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 bg-gray-800 border border-gray-600 rounded-lg shadow-xl p-2 z-50 text-sm">
              <p className="font-bold text-gray-300 px-2 pb-2">Select Camera Source</p>
              {videoDevices.length > 0 ? (
                <ul>
                  {videoDevices.map((device, index) => (
                    <li key={device.deviceId}>
                      <button 
                        onClick={() => handleDeviceSelect(device.deviceId)} 
                        className={`w-full text-left px-2 py-1.5 rounded-md hover:bg-gray-700 transition-colors ${activeWebcamDeviceId === device.deviceId ? 'bg-blue-600 text-white' : 'text-gray-200'}`}
                      >
                        {device.label || `Camera ${index + 1}`}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400 px-2 py-1">No cameras found.</p>
              )}
              
              {isWebcamOn && (
                <>
                  <div className="border-t border-gray-600 my-2"></div>
                  <button onClick={handleWebcamStop} className="w-full text-left px-2 py-1.5 rounded-md text-red-400 hover:bg-red-500 hover:text-white transition-colors">
                    Turn Off Webcam
                  </button>
                </>
              )}
            </div>
          )}
        </div>
        
        <ToolbarButton onClick={handleAddMediaClick} title="Add Media">
          <MediaIcon />
          <span>Media</span>
        </ToolbarButton>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*,video/*"
          onChange={handleFileChange}
          multiple
        />
      </div>
    </div>
  );
};

export default Toolbar;