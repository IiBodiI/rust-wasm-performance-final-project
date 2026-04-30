import type { BenchmarkResult } from "../types";
import { formatMs, formatRatio } from "../utils/formatters";

export function BenchmarkResultCards({ results }: { results: BenchmarkResult[] }) {
  if (results.length === 0) {
    return <div className="empty-state">Run benchmarks to generate graphical outputs.</div>;
  }

  return (
    <div className="benchmark-card-grid" aria-label="Per benchmark graphical outputs">
      {results.map((result) => {
        const max = Math.max(result.jsTime, result.wasmTime, 1);
        const jsWidth = Math.max(6, (result.jsTime / max) * 100);
        const wasmWidth = Math.max(6, (result.wasmTime / max) * 100);

        return (
          <article className="benchmark-result-card" key={result.id}>
            <header>
              <div>
                <p className="eyebrow">Grafik çıktı</p>
                <h3>{result.name}</h3>
              </div>
              <span className={result.speedup >= 1 ? "badge badge-success" : "badge badge-warning"}>
                {formatRatio(result.speedup)}
              </span>
            </header>

            <div className="mini-chart" aria-label={`${result.name} JS and WASM chart`}>
              <div className="mini-chart-row">
                <span>JS</span>
                <div className="mini-track">
                  <b className="mini-bar js-bar" style={{ width: `${jsWidth}%` }} />
                </div>
                <em>{formatMs(result.jsTime)}</em>
              </div>
              <div className="mini-chart-row">
                <span>WASM</span>
                <div className="mini-track">
                  <b className="mini-bar wasm-bar" style={{ width: `${wasmWidth}%` }} />
                </div>
                <em>{formatMs(result.wasmTime)}</em>
              </div>
            </div>

            <dl className="benchmark-meta">
              <div>
                <dt>Input</dt>
                <dd>{result.inputSize}</dd>
              </div>
              <div>
                <dt>Runs</dt>
                <dd>{result.iterations}</dd>
              </div>
              <div>
                <dt>Validation</dt>
                <dd>{result.notes ?? "n/a"}</dd>
              </div>
            </dl>
          </article>
        );
      })}
    </div>
  );
}

