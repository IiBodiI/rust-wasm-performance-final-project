import initWasm, * as wasmModule from "./wasm_core/wasm_core.js";

export type WasmCore = typeof wasmModule;

let initPromise: Promise<WasmCore> | null = null;
let initError: Error | null = null;

export async function loadWasm(): Promise<WasmCore> {
  if (initPromise) {
    return initPromise;
  }

  initPromise = initWasm()
    .then(() => wasmModule)
    .catch((error: unknown) => {
      initPromise = null;
      initError = error instanceof Error ? error : new Error(String(error));
      throw initError;
    });

  return initPromise;
}

export function getWasmLoadError(): Error | null {
  return initError;
}

