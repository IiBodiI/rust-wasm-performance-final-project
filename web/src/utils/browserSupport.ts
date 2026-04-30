import type { BrowserStatus } from "../types";

export function getBrowserStatus(): BrowserStatus {
  return {
    webAssembly: typeof WebAssembly !== "undefined",
    workers: typeof Worker !== "undefined",
    sharedArrayBuffer: typeof SharedArrayBuffer !== "undefined" && crossOriginIsolated,
    camera: Boolean(navigator.mediaDevices?.getUserMedia),
    compressionStream: "CompressionStream" in window
  };
}

export function supportLabel(value: boolean): "available" | "fallback" {
  return value ? "available" : "fallback";
}

