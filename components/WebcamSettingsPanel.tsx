import React from 'react';
import { OverlayBorder } from '../types';
import { CloseIcon } from './icons';

interface OverlaySettingsPanelProps {
  border: OverlayBorder;
  onUpdate: (border: OverlayBorder) => void;
  onClose: () => void;
}

const OverlaySettingsPanel: React.FC<OverlaySettingsPanelProps> = ({ border, onUpdate, onClose }) => {
  const handleUpdate = (key: keyof OverlayBorder, value: any) => {
    onUpdate({ ...border, [key]: value });
  };

  return (
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-800 border border-gray-600 rounded-lg shadow-2xl z-50 w-80 text-white p-4 animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Overlay Border Settings</h3>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-700">
          <CloseIcon />
        </button>
      </div>
      
      <div className="space-y-4">
        {/* Border Color */}
        <div className="flex items-center justify-between">
          <label htmlFor="borderColor" className="text-sm font-medium text-gray-300">Color</label>
          <div className="relative">
            <input
              type="color"
              id="borderColor"
              value={border.color}
              onChange={(e) => handleUpdate('color', e.target.value)}
              className="w-10 h-10 p-0 border-none cursor-pointer bg-transparent appearance-none [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-none"
            />
          </div>
        </div>

        {/* Border Width */}
        <div className="flex flex-col space-y-2">
          <label htmlFor="borderWidth" className="text-sm font-medium text-gray-300">Width ({border.width}px)</label>
          <input
            type="range"
            id="borderWidth"
            min="0"
            max="30"
            step="1"
            value={border.width}
            onChange={(e) => handleUpdate('width', parseInt(e.target.value, 10))}
            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Border Style */}
        <div className="flex items-center justify-between">
          <label htmlFor="borderStyle" className="text-sm font-medium text-gray-300">Style</label>
          <select
            id="borderStyle"
            value={border.style}
            onChange={(e) => handleUpdate('style', e.target.value as 'solid' | 'dashed')}
            className="bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="solid">Solid</option>
            <option value="dashed">Dashed</option>
          </select>
        </div>

        {/* Border Radius */}
        <div className="flex flex-col space-y-2">
          <label htmlFor="borderRadius" className="text-sm font-medium text-gray-300">Corner Radius ({border.radius}px)</label>
          <input
            type="range"
            id="borderRadius"
            min="0"
            max="150"
            step="1"
            value={border.radius}
            onChange={(e) => handleUpdate('radius', parseInt(e.target.value, 10))}
            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};

export default OverlaySettingsPanel;
