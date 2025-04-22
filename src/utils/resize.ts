import { createCanvas, imageDataToCanvas } from './canvas';

interface ExtendedResizeOptions {
  width?: number;
  height?: number;
  maintainAspectRatio?: boolean;
  method?: 'default';
  premultiplyAlpha?: boolean;
  linearRGB?: boolean;
}

/**
 * Calculates final dimensions given original size, target size,
 * and whether to maintain aspect ratio.
 */
export function calculateDimensions(
  originalWidth: number,
  originalHeight: number,
  options: ExtendedResizeOptions
): { width: number; height: number } {
  const {
    width: targetW = 0,
    height: targetH = 0,
    maintainAspectRatio = true,
  } = options;

  // If no target dimensions are provided, return original
  if (targetW <= 0 && targetH <= 0) {
    return { width: originalWidth, height: originalHeight };
  }

  if (maintainAspectRatio) {
    const ratio = originalWidth / originalHeight;
    // If only width is set, compute height
    if (targetW > 0 && targetH <= 0) {
      const newHeight = Math.round(targetW / ratio);
      return {
        width: Math.max(1, targetW),
        height: Math.max(1, newHeight),
      };
    }
    // If only height is set, compute width
    if (targetH > 0 && targetW <= 0) {
      const newWidth = Math.round(targetH * ratio);
      return {
        width: Math.max(1, newWidth),
        height: Math.max(1, targetH),
      };
    }
    // Otherwise, both are set; just use them directly
    return {
      width: Math.max(1, targetW),
      height: Math.max(1, targetH),
    };
  }

  // If aspect ratio isn't maintained, just use whichever is provided
  return {
    width: Math.max(1, targetW || originalWidth),
    height: Math.max(1, targetH || originalHeight),
  };
}

/**
 * Resizes ImageData using Canvas 2D, respecting any aspect ratio settings.
 */
export function resizeImage(
  imageData: ImageData,
  options: ExtendedResizeOptions
): ImageData {
  const sourceCanvas = imageDataToCanvas(imageData);
  const { width, height } = calculateDimensions(
    imageData.width,
    imageData.height,
    options
  );

  // Create a destination canvas and use high-quality down/up sampling
  const destCanvas = createCanvas(width, height);
  const ctx = destCanvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(sourceCanvas, 0, 0, width, height);

  return ctx.getImageData(0, 0, width, height);
}
