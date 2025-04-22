export interface ImageFile {
  id: string;
  file: File;
  preview?: string;
  status: 'pending' | 'queued' | 'processing' | 'complete' | 'error';
  error?: string;
  originalSize: number;
  compressedSize?: number;
  outputType?: OutputType;
  blob?: Blob;
  progress?: number;
  elapsed?: string;
  startTime?: number;
}

export type OutputType = 'avif' | 'jpeg' | 'jxl' | 'png' | 'webp';

export interface FormatQualitySettings {
  avif: number;
  jpeg: number;
  jxl: number;
  webp: number;
  png: number;
}

export interface CompressionOptions {
  quality: number;
}


export interface ResizeOptions {
  enabled: boolean;
  preset: '100' | '50' | '33' | '20' | '10' | 'custom';
  width: number;
  height: number;
  maintainAspectRatio: boolean;
  method: 'default';
  premultiplyAlpha: boolean;
  linearRGB: boolean;
}

export const DEFAULT_RESIZE_OPTIONS: ResizeOptions = {
  enabled: false,
  preset: '100',
  width: 6960, // for 100%
  height: 4640,
  maintainAspectRatio: true,
  method: 'default',
  premultiplyAlpha: true,
  linearRGB: true,
};
