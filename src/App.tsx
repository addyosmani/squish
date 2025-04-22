import React, { useState, useCallback, useEffect } from 'react';
import { Image, Trash2 } from 'lucide-react';
import { CompressionOptions } from './components/CompressionOptions';
import { DropZone } from './components/DropZone';
import { ImageList } from './components/ImageList';
import { DownloadAll } from './components/DownloadAll';
import { ResizeOptions } from './components/ResizeOptions';
import { ProcessingOptions } from './components/ProcessingOptions';
import { useImageQueue } from './hooks/useImageQueue';
import { DEFAULT_QUALITY_SETTINGS } from './utils/formatDefaults';
import { DEFAULT_RESIZE_OPTIONS } from './types';
import type { ImageFile, OutputType, CompressionOptions as CompressionOptionsType } from './types';

export function App() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [outputType, setOutputType] = useState<OutputType>('avif');
  const [options, setOptions] = useState<CompressionOptionsType>({
    quality: DEFAULT_QUALITY_SETTINGS.webp, // or whichever default
  });
  const [resizeOptions, setResizeOptions] = useState(DEFAULT_RESIZE_OPTIONS);
  const [processLevel, setProcessLevel] = useState(2); // processing intensity

  // Update each "processing" image's elapsed time every 2 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setImages((prev) =>
        prev.map((img) => {
          if (img.status === 'processing' && img.startTime) {
            return {
              ...img,
              elapsed: ((Date.now() - img.startTime) / 1000 + 1).toFixed(0)
            };
          } else if (img.status === 'processing' && !img.startTime) {
            return { ...img, startTime: Date.now() };
          }
          return img;
        })
      );
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const { addToQueue } = useImageQueue(
    options,
    outputType,
    setImages,
    resizeOptions,
    processLevel
  );

  const handleOutputTypeChange = useCallback((type: OutputType) => {
    setOutputType(type);
  }, []);

  const handleFilesDrop = useCallback(
    (newImages: ImageFile[]) => {
      setImages((prev) => [...prev, ...newImages]);
      requestAnimationFrame(() => {
        newImages.forEach((image) => addToQueue(image.id));
      });
    },
    [addToQueue]
  );

  const handleRemoveImage = useCallback((id: string) => {
    setImages((prev) => {
      const image = prev.find((img) => img.id === id);
      if (image?.preview) {
        URL.revokeObjectURL(image.preview);
      }
      return prev.filter((img) => img.id !== id);
    });
  }, []);

  const handleClearAll = useCallback(() => {
    images.forEach((image) => {
      if (image.preview) {
        URL.revokeObjectURL(image.preview);
      }
    });
    setImages([]);
  }, [images]);

  const handleDownloadAll = useCallback(async () => {
    const completedImages = images.filter((img) => img.status === 'complete');
    for (const image of completedImages) {
      if (image.blob && image.outputType) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(image.blob);
        link.download = `${image.file.name.split('.')[0]}.${image.outputType}`;
        link.click();
        URL.revokeObjectURL(link.href);
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }, [images]);

  const completedImages = images.filter((img) => img.status === 'complete').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Image className="w-5 h-5" />
            Squoosh Playground
          </h1>
          <button
            onClick={handleClearAll}
            className="text-red-500 hover:underline flex items-center gap-1"
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </button>
        </div>

        <CompressionOptions
          options={options}
          outputType={outputType}
          onOptionsChange={setOptions}
          onOutputTypeChange={handleOutputTypeChange}
        />

        <ResizeOptions
          options={resizeOptions}
          onOptionsChange={setResizeOptions}
        />

        <ProcessingOptions
          processLevel={processLevel}
          onChange={setProcessLevel}
        />

        <DropZone onFilesDrop={handleFilesDrop} />

        {completedImages > 0 && (
          <DownloadAll
            onDownloadAll={handleDownloadAll}
            count={completedImages}
          />
        )}

        <ImageList images={images} onRemove={handleRemoveImage} />
      </div>
    </div>
  );
}
