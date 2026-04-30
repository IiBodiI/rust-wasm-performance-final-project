import { renderMandelbrotJs, numericLoopJs } from "../utils/jsImplementations";
import { loadWasm } from "../wasm/wasmLoader";

type WorkerRequest =
  | {
      type: "mandelbrot-wasm";
      id: string;
      width: number;
      height: number;
      maxIter: number;
      zoom: number;
      offsetX: number;
      offsetY: number;
    }
  | {
      type: "mandelbrot-js";
      id: string;
      width: number;
      height: number;
      maxIter: number;
      zoom: number;
      offsetX: number;
      offsetY: number;
    }
  | { type: "numeric-js"; id: string; iterations: number };

type WorkerScope = {
  onmessage: ((event: MessageEvent<WorkerRequest>) => void | Promise<void>) | null;
  postMessage: (message: unknown, transfer?: Transferable[]) => void;
};

const workerScope = self as unknown as WorkerScope;

workerScope.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const request = event.data;
  try {
    const start = performance.now();
    if (request.type === "mandelbrot-wasm") {
      const wasm = await loadWasm();
      const pixels = wasm.wasm_mandelbrot(
        request.width,
        request.height,
        request.maxIter,
        request.zoom,
        request.offsetX,
        request.offsetY
      );
      const out = new Uint8Array(pixels);
      workerScope.postMessage(
        { type: "done", id: request.id, ms: performance.now() - start, pixels: out.buffer },
        [out.buffer as ArrayBuffer]
      );
      return;
    }

    if (request.type === "mandelbrot-js") {
      const pixels = renderMandelbrotJs(
        request.width,
        request.height,
        request.maxIter,
        request.zoom,
        request.offsetX,
        request.offsetY
      );
      workerScope.postMessage(
        { type: "done", id: request.id, ms: performance.now() - start, pixels: pixels.buffer },
        [pixels.buffer as ArrayBuffer]
      );
      return;
    }

    const value = numericLoopJs(request.iterations);
    workerScope.postMessage({ type: "done", id: request.id, ms: performance.now() - start, value });
  } catch (error) {
    workerScope.postMessage({
      type: "error",
      id: request.id,
      message: error instanceof Error ? error.message : String(error)
    });
  }
};

export {};
