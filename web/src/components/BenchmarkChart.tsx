import type { BenchmarkResult } from "../types";
import { formatMs } from "../utils/formatters";

export function BenchmarkChart({ results }: { results: BenchmarkResult[] }) {
  if (results.length === 0) return null;
  const max = Math.max(...results.flatMap((result) => [result.jsTime, result.wasmTime]), 1);

  return (
    <div className="chart" aria-label="Benchmark bar chart">
      {results.map((result) => (
        <div className="chart-row" key={result.id}>
          <span>{result.name}</span>
          <div className="bars">
            <div className="bar-line">
              <b>JS</b>
              <span className="bar js-bar" style={{ width: `${Math.max(4, (result.jsTime / max) * 100)}%` }} />
              <em>{formatMs(result.jsTime)}</em>
            </div>
            <div className="bar-line">
              <b>WASM</b>
              <span className="bar wasm-bar" style={{ width: `${Math.max(4, (result.wasmTime / max) * 100)}%` }} />
              <em>{formatMs(result.wasmTime)}</em>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

