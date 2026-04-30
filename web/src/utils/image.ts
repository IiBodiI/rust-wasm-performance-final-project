import type { FilterKind } from "../types";

const MAX_IMAGE_PIXELS = 5_000_000;

export async function fileToImageBitmap(file: File): Promise<ImageBitmap> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file.");
  }
  const bitmap = await createImageBitmap(file);
  if (bitmap.width * bitmap.height > MAX_IMAGE_PIXELS) {
    throw new Error("Image is too large for this browser demo. Please use an image under 5 megapixels.");
  }
  return bitmap;
}

export function drawBitmapToCanvas(bitmap: ImageBitmap, canvas: HTMLCanvasElement): ImageData {
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("Canvas 2D context is not available.");
  context.drawImage(bitmap, 0, 0);
  return context.getImageData(0, 0, bitmap.width, bitmap.height);
}

export function putPixels(canvas: HTMLCanvasElement, pixels: Uint8Array, width: number, height: number): void {
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas 2D context is not available.");
  context.putImageData(new ImageData(new Uint8ClampedArray(pixels), width, height), 0, 0);
}

export function cloneImageData(imageData: ImageData): Uint8Array {
  return new Uint8Array(imageData.data.buffer.slice(0));
}

export function applyFilterJs(
  data: Uint8Array,
  width: number,
  height: number,
  filter: FilterKind,
  radius = 2
): Uint8Array {
  if (filter === "grayscale") return grayscaleJs(data);
  if (filter === "blur") return blurJs(data, width, height, radius);
  return edgeDetectJs(data, width, height);
}

export function grayscaleJs(data: Uint8Array): Uint8Array {
  const out = new Uint8Array(data.length);
  for (let i = 0; i < data.length; i += 4) {
    const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
    out[i] = gray;
    out[i + 1] = gray;
    out[i + 2] = gray;
    out[i + 3] = data[i + 3];
  }
  return out;
}

export function blurJs(data: Uint8Array, width: number, height: number, radius: number): Uint8Array {
  if (radius <= 0) return new Uint8Array(data);
  const safeRadius = Math.min(radius, 12);
  const out = new Uint8Array(data.length);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      let count = 0;

      for (let ky = -safeRadius; ky <= safeRadius; ky += 1) {
        const sy = Math.min(height - 1, Math.max(0, y + ky));
        for (let kx = -safeRadius; kx <= safeRadius; kx += 1) {
          const sx = Math.min(width - 1, Math.max(0, x + kx));
          const idx = (sy * width + sx) * 4;
          r += data[idx];
          g += data[idx + 1];
          b += data[idx + 2];
          a += data[idx + 3];
          count += 1;
        }
      }

      const outIdx = (y * width + x) * 4;
      out[outIdx] = Math.floor(r / count);
      out[outIdx + 1] = Math.floor(g / count);
      out[outIdx + 2] = Math.floor(b / count);
      out[outIdx + 3] = Math.floor(a / count);
    }
  }

  return out;
}

export function edgeDetectJs(data: Uint8Array, width: number, height: number): Uint8Array {
  const gray = grayscaleJs(data);
  const out = new Uint8Array(data.length);
  if (width < 3 || height < 3) return gray;

  const gx = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  const gy = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      let sumX = 0;
      let sumY = 0;
      let kernelIndex = 0;
      for (let ky = -1; ky <= 1; ky += 1) {
        for (let kx = -1; kx <= 1; kx += 1) {
          const idx = ((y + ky) * width + (x + kx)) * 4;
          const value = gray[idx];
          sumX += value * gx[kernelIndex];
          sumY += value * gy[kernelIndex];
          kernelIndex += 1;
        }
      }
      const magnitude = Math.min(255, Math.sqrt(sumX * sumX + sumY * sumY));
      const idx = (y * width + x) * 4;
      out[idx] = magnitude;
      out[idx + 1] = magnitude;
      out[idx + 2] = magnitude;
      out[idx + 3] = data[idx + 3];
    }
  }

  return out;
}

