import { Download, Play, Workflow } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Alert } from "../components/Alert";
import { BenchmarkChart } from "../components/BenchmarkChart";
import { BenchmarkResultCards } from "../components/BenchmarkResultCards";
import { BenchmarkTable } from "../components/BenchmarkTable";
import { Button } from "../components/Button";
import { PageHeader } from "../components/PageHeader";
import { StatCard } from "../components/StatCard";
import { useI18n } from "../i18n/LanguageContext";
import type { BenchmarkResult } from "../types";
import { averageBenchmark, compareBuffers, speedup } from "../utils/benchmark";
import { getBrowserStatus } from "../utils/browserSupport";
import { downloadJson } from "../utils/download";
import { formatMs } from "../utils/formatters";
import { applyFilterJs } from "../utils/image";
import {
  compressJs,
  decompressJs,
  generateQrMatrixJs,
  hashPasswordJs,
  numericLoopJs,
  renderMandelbrotJs
} from "../utils/jsImplementations";
import { loadBenchmarkResults, saveBenchmarkResults } from "../utils/storage";
import { loadWasm } from "../wasm/wasmLoader";

function syntheticImage(width: number, height: number): Uint8Array {
  const data = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const idx = (y * width + x) * 4;
      data[idx] = (x * 3 + y) % 256;
      data[idx + 1] = (x + y * 5) % 256;
      data[idx + 2] = (x * y) % 256;
      data[idx + 3] = 255;
    }
  }
  return data;
}

export default function Benchmarks() {
  const { t, locale } = useI18n();
  const [results, setResults] = useState<BenchmarkResult[]>(() => loadBenchmarkResults());
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState("Idle");
  const [workerStatus, setWorkerStatus] = useState("Idle");
  const [workerMs, setWorkerMs] = useState(0);
  const [ticks, setTicks] = useState(0);
  const support = getBrowserStatus();
  const workerRunning = useRef(false);

  useEffect(() => {
    if (!workerRunning.current) return;
    const id = window.setInterval(() => setTicks((value) => value + 1), 150);
    return () => window.clearInterval(id);
  }, [workerStatus]);

  async function runCase<T>(
    id: string,
    name: string,
    inputSize: string,
    runs: number,
    jsFn: () => T | Promise<T>,
    wasmFn: () => T | Promise<T>,
    notes?: (jsValue: T, wasmValue: T) => string | Promise<string>
  ): Promise<BenchmarkResult> {
    setProgress(name);
    const js = await averageBenchmark(jsFn, runs);
    const wasm = await averageBenchmark(wasmFn, runs);
    const validation = notes ? await notes(js.value, wasm.value) : undefined;
    return {
      id,
      name,
      jsTime: js.averageMs,
      wasmTime: wasm.averageMs,
      speedup: speedup(js.averageMs, wasm.averageMs),
      inputSize,
      iterations: runs,
      browser: navigator.userAgent,
      date: new Date().toISOString(),
      notes: validation
    };
  }

  async function runAll() {
    setRunning(true);
    setProgress("Loading WASM");
    const next: BenchmarkResult[] = [];
    try {
      const wasm = await loadWasm();
      const imageWidth = 720;
      const imageHeight = 480;
      const image = syntheticImage(imageWidth, imageHeight);

      next.push(
        await runCase(
          "image-grayscale",
          "Image grayscale",
          `${imageWidth}×${imageHeight} RGBA`,
          3,
          () => applyFilterJs(image, imageWidth, imageHeight, "grayscale"),
          () => wasm.wasm_grayscale(image, imageWidth, imageHeight),
          (jsValue, wasmValue) => (compareBuffers(jsValue, wasmValue, 1) ? "outputs match" : "outputs differ")
        )
      );
      setResults([...next]);

      const mandelbrotConfig = { width: 480, height: 320, iter: 160, zoom: 1, offsetX: -0.5, offsetY: 0 };
      next.push(
        await runCase(
          "mandelbrot",
          "Mandelbrot",
          `${mandelbrotConfig.width}×${mandelbrotConfig.height}, ${mandelbrotConfig.iter} iterations`,
          3,
          () =>
            renderMandelbrotJs(
              mandelbrotConfig.width,
              mandelbrotConfig.height,
              mandelbrotConfig.iter,
              mandelbrotConfig.zoom,
              mandelbrotConfig.offsetX,
              mandelbrotConfig.offsetY
            ),
          () =>
            wasm.wasm_mandelbrot(
              mandelbrotConfig.width,
              mandelbrotConfig.height,
              mandelbrotConfig.iter,
              mandelbrotConfig.zoom,
              mandelbrotConfig.offsetX,
              mandelbrotConfig.offsetY
            ),
          (_jsValue, wasmValue) => (wasmValue.length === mandelbrotConfig.width * mandelbrotConfig.height * 4 ? "RGBA length ok" : "invalid length")
        )
      );
      setResults([...next]);

      const salt = "benchmark-salt-2026";
      next.push(
        await runCase(
          "hash",
          "PBKDF2 hash",
          "32-byte output, 120k rounds",
          3,
          () => hashPasswordJs("BMU1208 benchmark password", salt),
          () => wasm.wasm_hash_password("BMU1208 benchmark password", salt),
          (jsValue, wasmValue) => (jsValue === wasmValue ? "hashes match" : "hash mismatch")
        )
      );
      setResults([...next]);

      const qrText = "BMU1208 Rust WebAssembly benchmark QR payload";
      next.push(
        await runCase(
          "qr",
          "QR generation",
          `${qrText.length} chars`,
          5,
          () => generateQrMatrixJs(qrText),
          () => wasm.wasm_generate_qr(qrText),
          (_jsValue, wasmValue) => (wasmValue.length > 4 ? "WASM QR matrix generated" : "invalid QR output")
        )
      );
      setResults([...next]);

      const compressionInput = new TextEncoder().encode("Rust WebAssembly compression benchmark.\n".repeat(20_000));
      next.push(
        await runCase(
          "compression",
          "Compression",
          `${compressionInput.length} bytes text`,
          3,
          () => compressJs(compressionInput),
          () => wasm.wasm_compress(compressionInput),
          async (jsValue, wasmValue) => {
            const jsRoundtrip = await decompressJs(jsValue);
            const wasmRoundtrip = wasm.wasm_decompress(wasmValue);
            return jsRoundtrip.length === compressionInput.length && wasmRoundtrip.length === compressionInput.length
              ? "roundtrip ok"
              : "roundtrip failed";
          }
        )
      );
      setResults([...next]);

      const loopIterations = 2_000_000;
      next.push(
        await runCase(
          "numeric-loop",
          "Numeric loop",
          `${loopIterations.toLocaleString()} iterations`,
          3,
          () => numericLoopJs(loopIterations),
          () => wasm.wasm_numeric_loop(loopIterations),
          (jsValue, wasmValue) => (Math.abs(jsValue - wasmValue) < 0.001 ? "numeric result matches" : "numeric result differs")
        )
      );

      setResults(next);
      saveBenchmarkResults(next);
      setProgress("Complete");
    } catch (error) {
      setProgress(error instanceof Error ? error.message : String(error));
    } finally {
      setRunning(false);
    }
  }

  function runWorkerDemo() {
    setWorkerStatus("Running in worker");
    workerRunning.current = true;
    setTicks(0);
    setWorkerMs(0);
    const worker = new Worker(new URL("../workers/benchWorker.ts", import.meta.url), { type: "module" });
    worker.onmessage = (event: MessageEvent<{ type: string; ms?: number; message?: string }>) => {
      workerRunning.current = false;
      if (event.data.type === "done") {
        setWorkerMs(event.data.ms ?? 0);
        setWorkerStatus("Complete");
      } else {
        setWorkerStatus(event.data.message ?? "Worker error");
      }
      worker.terminate();
    };
    worker.postMessage({
      type: "mandelbrot-wasm",
      id: crypto.randomUUID(),
      width: 900,
      height: 620,
      maxIter: 260,
      zoom: 8,
      offsetX: -0.75,
      offsetY: 0.1
    });
  }

  return (
    <>
      <PageHeader
        eyebrow="Demo I + J"
        title={t("demo.benchmark.title")}
        description={t("demo.benchmark.description")}
        actions={
          <div className="button-row">
            <Button icon={<Play size={18} />} isLoading={running} onClick={runAll}>
              {locale === "tr" ? "Tümünü çalıştır" : "Run all"}
            </Button>
            <Button disabled={results.length === 0} icon={<Download size={18} />} variant="secondary" onClick={() => downloadJson(results, "benchmark-results.json")}>
              Export JSON
            </Button>
          </div>
        }
      />
      <Alert variant="warning">{t("bench.warning")}</Alert>

      <section className="section grid grid-4">
        <StatCard label="Progress" value={progress} />
        <StatCard label="Browser" value={support.webAssembly ? "WASM ready" : "No WASM"} tone={support.webAssembly ? "success" : "danger"} />
        <StatCard label="SharedArrayBuffer" value={support.sharedArrayBuffer ? "available" : "fallback"} detail="Cloudflare _headers enables isolation in production." />
        <StatCard label="Result count" value={results.length} />
      </section>

      <section className="section grid grid-2">
        <div className="panel">
          <h2>{locale === "tr" ? "Worker duyarlılık testi" : "Worker responsiveness test"}</h2>
          <p>
            {locale === "tr"
              ? "Ağır Mandelbrot hesaplaması modül Worker içinde çalışır. Sayaç artmaya devam ediyorsa ana arayüz cevap verebilir durumdadır."
              : "A heavy Mandelbrot job runs inside a module Worker. If the tick counter keeps moving, the main interface remains responsive."}
          </p>
          <div className="button-row">
            <Button icon={<Workflow size={18} />} variant="secondary" onClick={runWorkerDemo}>
              Run worker task
            </Button>
          </div>
        </div>
        <div className="grid grid-3">
          <StatCard label="Worker status" value={workerStatus} />
          <StatCard label="UI ticks" value={ticks} detail="Updated on the main thread while worker runs." />
          <StatCard label="Worker time" value={workerMs ? formatMs(workerMs) : "n/a"} />
        </div>
      </section>

      <section className="section">
        <BenchmarkChart results={results} />
      </section>
      <section className="section">
        <h2>{locale === "tr" ? "Her benchmark için grafik çıktı" : "Graphical output for every benchmark"}</h2>
        <BenchmarkResultCards results={results} />
      </section>
      <section className="section">
        <BenchmarkTable results={results} />
      </section>
    </>
  );
}
