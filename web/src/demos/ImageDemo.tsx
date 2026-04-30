import { Download, Play, Scale } from "lucide-react";
import { useRef, useState } from "react";
import { Alert } from "../components/Alert";
import { Button } from "../components/Button";
import { FileUpload } from "../components/FileUpload";
import { ImageCanvas } from "../components/ImageCanvas";
import { PageHeader } from "../components/PageHeader";
import { StatCard } from "../components/StatCard";
import { Tabs } from "../components/Tabs";
import { useI18n } from "../i18n/LanguageContext";
import type { EngineKind, FilterKind } from "../types";
import { averageBenchmark, compareBuffers, speedup } from "../utils/benchmark";
import { downloadCanvas } from "../utils/download";
import { formatMs, formatRatio } from "../utils/formatters";
import { applyFilterJs, cloneImageData, drawBitmapToCanvas, fileToImageBitmap, putPixels } from "../utils/image";
import { loadWasm } from "../wasm/wasmLoader";

type ImageStats = {
  selectedMs?: number;
  jsMs?: number;
  wasmMs?: number;
  speedup?: number;
  equivalent?: boolean;
};

export default function ImageDemo() {
  const { t, locale } = useI18n();
  const originalCanvas = useRef<HTMLCanvasElement>(null);
  const processedCanvas = useRef<HTMLCanvasElement>(null);
  const imageData = useRef<ImageData | null>(null);
  const [filter, setFilter] = useState<FilterKind>("grayscale");
  const [engine, setEngine] = useState<EngineKind>("wasm");
  const [meta, setMeta] = useState<string>("No image loaded");
  const [stats, setStats] = useState<ImageStats>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(file: File) {
    setError(null);
    try {
      const bitmap = await fileToImageBitmap(file);
      if (!originalCanvas.current) return;
      imageData.current = drawBitmapToCanvas(bitmap, originalCanvas.current);
      setMeta(`${file.name} · ${bitmap.width}×${bitmap.height}`);
      setStats({});
      if (processedCanvas.current) {
        putPixels(processedCanvas.current, cloneImageData(imageData.current), bitmap.width, bitmap.height);
      }
      bitmap.close();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  async function runWasm(input: Uint8Array, width: number, height: number): Promise<Uint8Array> {
    const wasm = await loadWasm();
    if (filter === "grayscale") return wasm.wasm_grayscale(input, width, height);
    if (filter === "blur") return wasm.wasm_blur(input, width, height, 2);
    return wasm.wasm_edge_detect(input, width, height);
  }

  async function processSelected() {
    if (!imageData.current || !processedCanvas.current) {
      setError("Upload an image before running a filter.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const input = cloneImageData(imageData.current);
      const start = performance.now();
      const output =
        engine === "js"
          ? applyFilterJs(input, imageData.current.width, imageData.current.height, filter)
          : await runWasm(input, imageData.current.width, imageData.current.height);
      const elapsed = performance.now() - start;
      putPixels(processedCanvas.current, output, imageData.current.width, imageData.current.height);
      setStats((current) => ({ ...current, selectedMs: elapsed }));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  async function compare() {
    if (!imageData.current || !processedCanvas.current) {
      setError("Upload an image before benchmarking.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const width = imageData.current.width;
      const height = imageData.current.height;
      const source = cloneImageData(imageData.current);
      const js = await averageBenchmark(() => applyFilterJs(source, width, height, filter), 3);
      const wasm = await averageBenchmark(() => runWasm(source, width, height), 3);
      putPixels(processedCanvas.current, wasm.value, width, height);
      setStats({
        selectedMs: wasm.averageMs,
        jsMs: js.averageMs,
        wasmMs: wasm.averageMs,
        speedup: speedup(js.averageMs, wasm.averageMs),
        equivalent: compareBuffers(js.value, wasm.value, 2)
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Demo A + C"
        title={t("demo.image.title")}
        description={t("demo.image.description")}
      />
      <Alert>{t("privacy.local")}</Alert>

      <section className="section grid grid-2">
        <div className="panel">
          <FileUpload accept="image/*" label={locale === "tr" ? "Görüntü yükle" : "Upload image"} help="PNG, JPG, WebP · max 5 MP" onFile={handleFile} />
          <div className="section">
            <div className="control-row">
              <Tabs
                label="Filter"
                value={filter}
                onChange={setFilter}
                options={[
                  { value: "grayscale", label: "Grayscale" },
                  { value: "blur", label: "Blur" },
                  { value: "edge", label: "Edge" }
                ]}
              />
              <Tabs
                label="Engine"
                value={engine}
                onChange={setEngine}
                options={[
                  { value: "wasm", label: "WASM" },
                  { value: "js", label: "JS" }
                ]}
              />
            </div>
            <div className="button-row section">
              <Button icon={<Play size={18} />} isLoading={busy} onClick={processSelected}>
                {t("actions.run")}
              </Button>
              <Button icon={<Scale size={18} />} variant="secondary" isLoading={busy} onClick={compare}>
                {t("actions.compare")}
              </Button>
              <Button
                icon={<Download size={18} />}
                variant="ghost"
                onClick={() => processedCanvas.current && downloadCanvas(processedCanvas.current, "wasm-filter.png")}
              >
                {t("actions.download")}
              </Button>
            </div>
          </div>
          {error ? <Alert variant="danger">{error}</Alert> : null}
        </div>

        <div className="grid grid-2">
          <StatCard label="Image" value={meta} />
          <StatCard label="Selected run" value={stats.selectedMs ? formatMs(stats.selectedMs) : "n/a"} />
          <StatCard label="JS average" value={stats.jsMs ? formatMs(stats.jsMs) : "n/a"} />
          <StatCard label="Speedup" value={stats.speedup ? formatRatio(stats.speedup) : "n/a"} detail={stats.equivalent === false ? "Output differs beyond tolerance." : "Output validation uses a small tolerance."} />
        </div>
      </section>

      <section className="section grid grid-2">
        <ImageCanvas label="Original" ref={originalCanvas} />
        <ImageCanvas label="Processed" ref={processedCanvas} />
      </section>
    </>
  );
}

