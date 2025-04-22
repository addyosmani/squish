/// <reference lib="webworker" />

import { decode, encode } from '../utils/imageProcessing';
import { resizeImage } from '../utils/resize';

interface WorkerMessageData {
  id: string;
  fileBuffer: ArrayBuffer;
  sourceType?: string;
  outputType: string;
  compressionOptions: { quality: number };
  resizeOptions?: {
    enabled: boolean;
    width: number;
    height: number;
    maintainAspectRatio: boolean;
    method: 'default';
    premultiplyAlpha: boolean;
    linearRGB: boolean;
  };
}

interface WorkerResponse {
  id: string;
  success: boolean;
  compressedBuffer?: ArrayBuffer;
  error?: string;
  outputType?: string;
  progress?: number;
}

self.onmessage = async (event: MessageEvent<WorkerMessageData>) => {
  const { id, fileBuffer, sourceType, outputType, compressionOptions, resizeOptions } = event.data;
  try {
    // 1) Decode
    const decoded = await decode(sourceType || 'image/jpeg', fileBuffer);
    self.postMessage({ id, progress: 50 } as WorkerResponse);

    // 2) Resize if needed
    let finalData = decoded;
    if (resizeOptions?.enabled) {
      finalData = resizeImage(decoded, resizeOptions);
    }

    // 3) Encode
    const compressedBuffer = await encode(outputType as any, finalData, compressionOptions);
    self.postMessage({ id, progress: 100 } as WorkerResponse);

    // 4) Return the result
    self.postMessage(
      {
        id,
        success: true,
        compressedBuffer,
        outputType,
      } as WorkerResponse,
      [compressedBuffer]
    );
  } catch (error) {
    self.postMessage({
      id,
      success: false,
      error: error instanceof Error ? error.message : String(error),
    } as WorkerResponse);
  }
};
