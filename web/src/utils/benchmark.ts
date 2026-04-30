export interface AverageResult<T> {
  averageMs: number;
  runs: number[];
  value: T;
}

export async function averageBenchmark<T>(
  callback: () => T | Promise<T>,
  runs = 3
): Promise<AverageResult<T>> {
  const timings: number[] = [];
  let latest: T | undefined;

  for (let i = 0; i < runs; i += 1) {
    const start = performance.now();
    latest = await callback();
    timings.push(performance.now() - start);
    await new Promise((resolve) => window.setTimeout(resolve, 0));
  }

  return {
    averageMs: timings.reduce((sum, value) => sum + value, 0) / timings.length,
    runs: timings,
    value: latest as T
  };
}

export function speedup(jsTime: number, wasmTime: number): number {
  if (wasmTime <= 0 || !Number.isFinite(jsTime) || !Number.isFinite(wasmTime)) return 0;
  return jsTime / wasmTime;
}

export function compareBuffers(a: Uint8Array, b: Uint8Array, tolerance = 0): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (Math.abs(a[i] - b[i]) > tolerance) return false;
  }
  return true;
}

