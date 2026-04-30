export type Locale = "en" | "tr";

export type ThemeMode = "light" | "dark";

export type FilterKind = "grayscale" | "blur" | "edge";

export type EngineKind = "js" | "wasm";

export interface BenchmarkResult {
  id: string;
  name: string;
  jsTime: number;
  wasmTime: number;
  speedup: number;
  inputSize: string;
  iterations: number;
  browser: string;
  date: string;
  notes?: string;
}

export interface BrowserStatus {
  webAssembly: boolean;
  workers: boolean;
  sharedArrayBuffer: boolean;
  camera: boolean;
  compressionStream: boolean;
}
