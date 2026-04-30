import type { BenchmarkResult } from "../types";

const BENCHMARK_KEY = "rust-wasm-lab-benchmarks";

export function saveBenchmarkResults(results: BenchmarkResult[]): void {
  localStorage.setItem(BENCHMARK_KEY, JSON.stringify(results));
}

export function loadBenchmarkResults(): BenchmarkResult[] {
  try {
    const raw = localStorage.getItem(BENCHMARK_KEY);
    return raw ? (JSON.parse(raw) as BenchmarkResult[]) : [];
  } catch {
    return [];
  }
}

