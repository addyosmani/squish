import React, { useCallback } from 'react';
import { Upload } from 'lucide-react';
import type { ImageFile } from '../types';

interface DropZoneProps {
  onFilesDrop: (files: ImageFile[]) => void;
}

export function DropZone({ onFilesDrop }: DropZoneProps) {
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files)
      .filter(file => file.type.startsWith('image/') || file.name.toLowerCase().endsWith('jxl'))
      .map(file => ({
        id: crypto.randomUUID(),
        file,
        status: 'pending' as const,
        originalSize: file.size,
      }));
    onFilesDrop(files);
  }, [onFilesDrop]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
      .filter(file => file.type.startsWith('image/') || file.name.toLowerCase().endsWith('jxl'))
      .map(file => ({
        id: crypto.randomUUID(),
        file,
        status: 'pending' as const,
        originalSize: file.size,
      }));
    onFilesDrop(files);
    e.target.value = '';
  }, [onFilesDrop]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const fileInput = document.getElementById('fileInput') as HTMLInputElement | null;
      fileInput?.click();
    }
  }, []);

  // New handler to trigger file input click when entire zone is clicked.
  const handleClick = useCallback(() => {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement | null;
    fileInput?.click();
  }, []);

  return (
    <div
      className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-500 transition-colors cursor-pointer" // Added cursor-pointer
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={handleClick} // Added onClick handler
      tabIndex={0}
      onKeyDown={handleKeyDown} 
      role="button"
      aria-label="Upload images by dropping or selecting files"
    >
      <input
        type="file"
        id="fileInput"
        className="hidden"
        multiple
        accept="image/*,.jxl"
        onChange={handleFileInput}
      />
      <div className="flex flex-col items-center gap-4">
        <Upload className="w-12 h-12 text-gray-400" />
        <div>
          <p className="text-lg font-medium text-gray-700">
            Drop images here or click to upload
          </p>
          <p className="text-sm text-gray-500">
            Supports JPEG, PNG, WebP, AVIF, and JXL
          </p>
        </div>
      </div>
    </div>
  );
}
