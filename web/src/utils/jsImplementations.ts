import QRCode from "qrcode";

export function mandelbrotEscapeTime(cx: number, cy: number, maxIter: number): number {
  let x = 0;
  let y = 0;
  let iteration = 0;
  while (x * x + y * y <= 4 && iteration < maxIter) {
    const nextX = x * x - y * y + cx;
    y = 2 * x * y + cy;
    x = nextX;
    iteration += 1;
  }
  return iteration;
}

export function renderMandelbrotJs(
  width: number,
  height: number,
  maxIter: number,
  zoom: number,
  offsetX: number,
  offsetY: number
): Uint8Array {
  const out = new Uint8Array(width * height * 4);
  const scale = 3.2 / Math.max(zoom, 0.0001);
  const aspect = width / height;

  for (let py = 0; py < height; py += 1) {
    for (let px = 0; px < width; px += 1) {
      const cx = (px / width - 0.5) * scale * aspect + offsetX;
      const cy = (py / height - 0.5) * scale + offsetY;
      const iter = mandelbrotEscapeTime(cx, cy, Math.max(maxIter, 1));
      const idx = (py * width + px) * 4;
      if (iter >= maxIter) {
        out[idx] = 14;
        out[idx + 1] = 22;
        out[idx + 2] = 38;
      } else {
        const t = iter / maxIter;
        out[idx] = 9 + 180 * t;
        out[idx + 1] = 80 + 145 * Math.sqrt(t);
        out[idx + 2] = 180 + 70 * (1 - t);
      }
      out[idx + 3] = 255;
    }
  }

  return out;
}

export async function hashPasswordJs(password: string, salt: string): Promise<string> {
  if (!password) throw new Error("Password cannot be empty.");
  if (salt.length < 8) throw new Error("Salt must contain at least 8 characters.");

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: encoder.encode(salt),
      iterations: 120_000
    },
    key,
    256
  );
  const hash = btoa(String.fromCharCode(...new Uint8Array(bits))).replace(/=+$/g, "");
  return `pbkdf2-sha256$120000$${salt}$${hash}`;
}

export function randomSalt(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes)).replace(/[+/=]/g, "").slice(0, 22);
}

export function generateQrMatrixJs(text: string): Uint8Array {
  if (!text.trim()) throw new Error("QR text cannot be empty.");
  const qr = QRCode.create(text, { errorCorrectionLevel: "M" });
  const size = qr.modules.size;
  const out = new Uint8Array(4 + size * size);
  new DataView(out.buffer).setUint32(0, size, true);
  for (let i = 0; i < qr.modules.data.length; i += 1) {
    out[4 + i] = qr.modules.data[i] ? 1 : 0;
  }
  return out;
}

export function parseQrMatrix(matrix: Uint8Array): { size: number; modules: Uint8Array } {
  if (matrix.length < 4) throw new Error("QR matrix is missing its size header.");
  const size = new DataView(matrix.buffer, matrix.byteOffset, matrix.byteLength).getUint32(0, true);
  const modules = matrix.slice(4);
  if (modules.length !== size * size) throw new Error("QR matrix has an invalid shape.");
  return { size, modules };
}

export function drawQrMatrix(canvas: HTMLCanvasElement, matrix: Uint8Array): void {
  const { size, modules } = parseQrMatrix(matrix);
  const scale = Math.max(4, Math.floor(384 / size));
  const quietZone = 4;
  const canvasSize = (size + quietZone * 2) * scale;
  canvas.width = canvasSize;
  canvas.height = canvasSize;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas 2D context is not available.");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvasSize, canvasSize);
  context.fillStyle = "#111827";
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      if (modules[y * size + x]) {
        context.fillRect((x + quietZone) * scale, (y + quietZone) * scale, scale, scale);
      }
    }
  }
}

export async function compressJs(data: Uint8Array): Promise<Uint8Array> {
  if (!("CompressionStream" in window)) {
    return runLengthEncode(data);
  }
  const stream = new Blob([new Uint8Array(data).buffer]).stream().pipeThrough(new CompressionStream("gzip"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

export async function decompressJs(data: Uint8Array): Promise<Uint8Array> {
  if (!("DecompressionStream" in window)) {
    return runLengthDecode(data);
  }
  const stream = new Blob([new Uint8Array(data).buffer]).stream().pipeThrough(new DecompressionStream("gzip"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

function runLengthEncode(data: Uint8Array): Uint8Array {
  const out: number[] = [82, 76, 69, 49];
  for (let i = 0; i < data.length; ) {
    const value = data[i];
    let count = 1;
    while (i + count < data.length && data[i + count] === value && count < 255) count += 1;
    out.push(count, value);
    i += count;
  }
  return new Uint8Array(out);
}

function runLengthDecode(data: Uint8Array): Uint8Array {
  if (data[0] !== 82 || data[1] !== 76 || data[2] !== 69 || data[3] !== 49) {
    throw new Error("Unsupported fallback compression format.");
  }
  const out: number[] = [];
  for (let i = 4; i < data.length; i += 2) {
    const count = data[i];
    const value = data[i + 1];
    for (let j = 0; j < count; j += 1) out.push(value);
  }
  return new Uint8Array(out);
}

export function numericLoopJs(iterations: number): number {
  let acc = 0;
  for (let i = 1; i <= iterations; i += 1) {
    acc += Math.sqrt(Math.abs(Math.sin(i) * Math.cos(i)));
  }
  return acc;
}
