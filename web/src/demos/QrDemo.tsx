import { Download, QrCode, Scale } from "lucide-react";
import { useRef, useState } from "react";
import { Alert } from "../components/Alert";
import { Button } from "../components/Button";
import { PageHeader } from "../components/PageHeader";
import { StatCard } from "../components/StatCard";
import { Tabs } from "../components/Tabs";
import { useI18n } from "../i18n/LanguageContext";
import type { EngineKind } from "../types";
import { averageBenchmark, speedup } from "../utils/benchmark";
import { downloadCanvas } from "../utils/download";
import { formatMs, formatRatio } from "../utils/formatters";
import { drawQrMatrix, generateQrMatrixJs } from "../utils/jsImplementations";
import { loadWasm } from "../wasm/wasmLoader";

export default function QrDemo() {
  const { t, locale } = useI18n();
  const canvas = useRef<HTMLCanvasElement>(null);
  const [text, setText] = useState("https://example.edu/bmu1208-rust-wasm");
  const [mode, setMode] = useState<EngineKind>("wasm");
  const [stats, setStats] = useState({ selectedMs: 0, jsMs: 0, wasmMs: 0, speedup: 0 });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function generateWasm(): Promise<Uint8Array> {
    return (await loadWasm()).wasm_generate_qr(text);
  }

  async function generateSelected() {
    if (!canvas.current) return;
    setBusy(true);
    setError(null);
    try {
      const start = performance.now();
      const matrix = mode === "js" ? generateQrMatrixJs(text) : await generateWasm();
      const elapsed = performance.now() - start;
      drawQrMatrix(canvas.current, matrix);
      setStats((current) => ({ ...current, selectedMs: elapsed }));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  async function compare() {
    if (!canvas.current) return;
    setBusy(true);
    setError(null);
    try {
      const js = await averageBenchmark(() => generateQrMatrixJs(text), 5);
      const wasm = await averageBenchmark(generateWasm, 5);
      drawQrMatrix(canvas.current, wasm.value);
      setStats({
        selectedMs: wasm.averageMs,
        jsMs: js.averageMs,
        wasmMs: wasm.averageMs,
        speedup: speedup(js.averageMs, wasm.averageMs)
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader eyebrow="Demo G" title={t("demo.qr.title")} description={t("demo.qr.description")} />
      <Alert>{t("privacy.local")}</Alert>

      <section className="section grid grid-2">
        <div className="panel">
          <Tabs
            label="Mode"
            value={mode}
            onChange={setMode}
            options={[
              { value: "wasm", label: "WASM" },
              { value: "js", label: "JS" }
            ]}
          />
          <label className="field section">
            <span>{locale === "tr" ? "QR metni" : "QR text"}</span>
            <textarea maxLength={1024} value={text} onChange={(event) => setText(event.target.value)} />
          </label>
          <div className="button-row section">
            <Button icon={<QrCode size={18} />} isLoading={busy} onClick={generateSelected}>
              Generate
            </Button>
            <Button icon={<Scale size={18} />} variant="secondary" isLoading={busy} onClick={compare}>
              {t("actions.compare")}
            </Button>
            <Button icon={<Download size={18} />} variant="ghost" onClick={() => canvas.current && downloadCanvas(canvas.current, "qr-code.png")}>
              {t("actions.download")}
            </Button>
          </div>
          {error ? <Alert variant="danger">{error}</Alert> : null}
        </div>

        <div className="grid grid-2">
          <StatCard label="Selected run" value={stats.selectedMs ? formatMs(stats.selectedMs) : "n/a"} />
          <StatCard label="JS average" value={stats.jsMs ? formatMs(stats.jsMs) : "n/a"} />
          <StatCard label="WASM average" value={stats.wasmMs ? formatMs(stats.wasmMs) : "n/a"} />
          <StatCard label="Speedup" value={stats.speedup ? formatRatio(stats.speedup) : "n/a"} />
        </div>
      </section>

      <section className="section">
        <figure className="canvas-frame">
          <figcaption>QR output</figcaption>
          <canvas ref={canvas} />
        </figure>
      </section>
    </>
  );
}

