import React from 'react';
import Cropper, { Area, Point } from 'react-easy-crop';
import { Button } from '../../components/base/Button';

interface Props {
  imageSrc: string;
  crop: Point;
  zoom: number;
  setCrop: (crop: Point) => void;
  setZoom: (zoom: number) => void;
  onCropComplete: (croppedArea: Area, croppedAreaPixels: Area) => void;
  onCancel: () => void;
  onSave: () => void;
}

export const CropImageModal: React.FC<Props> = ({
  imageSrc, crop, zoom, setCrop, setZoom, onCropComplete, onCancel, onSave
}) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4" style={{ zIndex: 9999 }}>
      <div className="bg-white w-full max-w-md rounded-xl overflow-hidden shadow-2xl animate-fade-in-up">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-bold text-lg text-gray-800">Căn chỉnh ảnh</h3>
          <button onClick={onCancel} className="text-gray-500 hover:text-red-500"><i className="ri-close-line text-2xl"></i></button>
        </div>
        <div className="relative h-80 w-full bg-black">
          <Cropper
            image={imageSrc} crop={crop} zoom={zoom} aspect={1} cropShape="round"
            onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropComplete}
          />
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Thu phóng</label>
            <input type="range" value={zoom} min={1} max={3} step={0.1} onChange={(e) => setZoom(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1 justify-center" onClick={onCancel}>Hủy</Button>
            <Button className="flex-1 justify-center" onClick={onSave}>Lưu ảnh</Button>
          </div>
        </div>
      </div>
    </div>
  );
};