import React from 'react';
import { X, CheckCircle, AlertCircle, Loader2, Download } from 'lucide-react';
import type { ImageFile } from '../types';
import { formatFileSize } from '../utils/imageProcessing';
import { downloadImage } from '../utils/download';

interface ImageListProps {
  images: ImageFile[];
  onRemove: (id: string) => void;
}

export function ImageList({ images, onRemove }: ImageListProps) {
  if (images.length === 0) return null;

  return (
    <div className="space-y-4">
      {images.map((image) => (
        <div
          key={image.id}
          className="bg-white rounded-lg shadow-sm p-4 flex items-center gap-4"
        >
          {image.preview && (
            <img
              src={image.preview}
              alt={image.file.name}
              className="w-16 h-16 object-cover rounded"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-900 truncate">
                {image.file.name}
              </p>
              <div className="flex items-center gap-2">
                {image.status === 'complete' && (
                  <button
                    onClick={() => downloadImage(image)}
                    className="text-gray-400 hover:text-gray-600"
                    title="Download"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={() => onRemove(image.id)}
                  className="text-gray-400 hover:text-gray-600"
                  title="Remove"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
              {image.status === 'pending' && (
                <span>Ready to process</span>
              )}
              
              {image.status === 'processing' && (
              <span className="flex flex-col items-start gap-1 text-sm text-gray-500">
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing ({image.progress ? `${image.progress}%` : '...'})
                </span>
                {image.elapsed && (
                  <span className="text-xs">
                    {image.elapsed} sec elapsed
                  </span>
                )}
              </span>
            )}
              {image.status === 'complete' && (
                <span className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  Completed {image.elapsed && (<span className="text-xs">
                    in {image.elapsed} seconds.
                  </span>
                )}

                </span>
              )}
              {image.status === 'error' && (
                <span className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  {image.error || 'Error processing image'}
                </span>
              )}
            </div>
            <div className="mt-1 text-sm text-gray-500">
              {formatFileSize(image.originalSize)}
              {image.compressedSize && (
                <>
                  {' → '}
                  {formatFileSize(image.compressedSize)}{' '}
                  <span className="text-green-600">
                    (
                    {Math.round(
                      ((image.originalSize - image.compressedSize) /
                        image.originalSize) *
                        100
                    )}
                    % smaller)
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}