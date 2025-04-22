import type { OutputType } from '../types';

// Keep track of WASM load status
const wasmInitialized = new Map<OutputType, boolean>();
// Also track any in-flight initialization promises
const wasmInitPromises = new Map<OutputType, Promise<void>>();

/**
 * Lazily loads the required WASM module for the given format, preventing
 * re-import if already loaded or currently loading.
 */
export async function ensureWasmLoaded(format: OutputType): Promise<void> {
  // If we've already loaded this format, just return
  if (wasmInitialized.get(format)) return;

  // If a load is in progress, await it
  if (wasmInitPromises.has(format)) {
    await wasmInitPromises.get(format);
    return;
  }

  // Otherwise, create an init promise and store it
  const initPromise = (async () => {
    try {
      switch (format) {
        case 'avif':
          await import('@jsquash/avif');
          break;
        case 'jpeg':
          await import('@jsquash/jpeg');
          break;
        case 'jxl':
          await import('@jsquash/jxl');
          break;
        case 'png':
          await import('@jsquash/png');
          break;
        case 'webp':
          await import('@jsquash/webp');
          break;
      }
      wasmInitialized.set(format, true);
    } catch (error) {
      console.error(`Failed to initialize WASM for ${format}:`, error);
      throw new Error(`Failed to initialize ${format} support`);
    } finally {
      // Remove the promise from the map whether successful or failed
      wasmInitPromises.delete(format);
    }
  })();

  wasmInitPromises.set(format, initPromise);
  await initPromise;
}
