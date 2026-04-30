import type { BenchmarkResult } from "../types";
import { formatMs, formatRatio } from "../utils/formatters";

export function BenchmarkTable({ results }: { results: BenchmarkResult[] }) {
  if (results.length === 0) {
    return <div className="empty-state">No benchmark results yet.</div>;
  }

  return (
    <div className="table-wrap">
      <table className="benchmark-table">
        <thead>
          <tr>
            <th>Benchmark</th>
            <th>JS</th>
            <th>WASM</th>
            <th>Speedup</th>
            <th>Input</th>
            <th>Runs</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result) => (
            <tr key={result.id}>
              <td>
                <strong>{result.name}</strong>
                {result.notes ? <small>{result.notes}</small> : null}
              </td>
              <td>{formatMs(result.jsTime)}</td>
              <td>{formatMs(result.wasmTime)}</td>
              <td>
                <span className={result.speedup >= 1 ? "badge badge-success" : "badge badge-warning"}>
                  {formatRatio(result.speedup)}
                </span>
              </td>
              <td>{result.inputSize}</td>
              <td>{result.iterations}</td>
              <td>{new Date(result.date).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

