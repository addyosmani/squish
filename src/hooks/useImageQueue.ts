import { useState, useRef, useEffect, useCallback } from 'react';
import type { ImageFile, OutputType, CompressionOptions, ResizeOptions } from '../types';
import { getFileType } from '../utils/imageProcessing';

interface WorkerResponse {
  id: string;
  success: boolean;
  compressedBuffer?: ArrayBuffer;
  error?: string;
  outputType?: string;
  progress?: number;
}

export function useImageQueue(
  compressionOptions: CompressionOptions,
  outputType: OutputType,
  setImages: React.Dispatch<React.SetStateAction<ImageFile[]>>,
  resizeOptions: ResizeOptions,
  processLevel: number // 1–4
) {
  const workerPoolRef = useRef<Worker[]>([]);
  const roundRobinIndex = useRef(0);

  const [queue, setQueue] = useState<string[]>([]);

  // Handle all worker messages
  const messageHandler = useCallback((event: MessageEvent<WorkerResponse>) => {
    const { id, success, compressedBuffer, error, outputType, progress } = event.data;

    // If we have progress, update it
    if (progress !== undefined) {
      setImages((prev) =>
        prev.map((img) => (img.id === id ? { ...img, progress } : img))
      );
    }

    if (success && compressedBuffer && outputType) {
      try {
        const blob = new Blob([compressedBuffer], { type: `image/${outputType}` });
        const preview = URL.createObjectURL(blob);
        setImages((prev) =>
          prev.map((img) =>
            img.id === id
              ? {
                  ...img,
                  status: 'complete',
                  preview,
                  blob,
                  compressedSize: compressedBuffer.byteLength,
                  outputType: outputType as OutputType,
                  progress: 100
                }
              : img
          )
        );
      } catch (blobError) {
        alert(`Error creating blob: ${String(blobError)}`);
      }
    } else if (success === false && error) {
      alert(`Worker error for ${id}: ${error}`);
      setImages((prev) =>
        prev.map((img) =>
          img.id === id ? { ...img, status: 'error', error } : img
        )
      );
    }
  }, [setImages]);

  // Create or recreate the worker pool whenever processLevel changes
  useEffect(() => {
    // Terminate old workers
    workerPoolRef.current.forEach((w) => w.terminate());
    workerPoolRef.current = [];
    roundRobinIndex.current = 0;

    // Cap the processLevel at 1–4 just in case
    const numWorkers = Math.max(1, Math.min(12, processLevel));

    // Spawn exactly numWorkers
    for (let i = 0; i < numWorkers; i++) {
      try {
        const worker = new Worker(
          new URL('../workers/imageProcessor.worker.ts', import.meta.url),
          { type: 'module' }
        );
        worker.addEventListener('message', messageHandler);
        worker.addEventListener('error', (evt) => {
          alert(`Worker runtime error: ${evt.message || 'Unknown error'}`);
        });
        workerPoolRef.current.push(worker);
      } catch (createErr) {
        alert(`Failed to create worker: ${String(createErr)}`);
      }
    }

    return () => {
      workerPoolRef.current.forEach((w) => w.terminate());
      workerPoolRef.current = [];
    };
  }, [processLevel, messageHandler]);

  const processImage = useCallback(
    async (image: ImageFile) => {
      // Only process if still pending
      if (image.status !== 'pending') return;

      setImages((prev) =>
        prev.map((img) =>
          img.id === image.id
            ? { ...img, status: 'processing', progress: 0 }
            : img
        )
      );

      try {
        const fileBuffer = await image.file.arrayBuffer();
        const sourceType = getFileType(image.file);

        // Pick a worker in round-robin
        const pool = workerPoolRef.current;
        if (!pool.length) {
          alert('No worker available!');
          return;
        }
        const worker = pool[roundRobinIndex.current % pool.length];
        roundRobinIndex.current++;

        worker.postMessage(
          {
            id: image.id,
            fileBuffer,
            sourceType,
            outputType,
            compressionOptions,
            resizeOptions
          },
          [fileBuffer] // transfer
        );
      } catch (e) {
        alert(`Error reading file buffer: ${String(e)}`);
        setImages((prev) =>
          prev.map((img) =>
            img.id === image.id
              ? { ...img, status: 'error', error: String(e) }
              : img
          )
        );
      }
    },
    [compressionOptions, outputType, resizeOptions, setImages]
  );

  // Fire off processing whenever queue is non-empty
  useEffect(() => {
    if (queue.length === 0) return;
    queue.forEach((imageId) => {
      setImages((prev) => {
        const image = prev.find((x) => x.id === imageId && x.status === 'pending');
        if (image) processImage(image);
        return prev;
      });
    });
    setQueue([]);
  }, [queue, processImage, setImages]);

  // Called from the UI to add images to process
  const addToQueue = useCallback((imageId: string) => {
    setQueue((prev) => [...prev, imageId]);
  }, []);

  return { addToQueue };
}
