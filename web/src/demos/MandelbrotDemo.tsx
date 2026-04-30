import { Cpu, Move, Play, RotateCcw, Scale, ZoomIn, ZoomOut } from "lucide-react";
import { useRef, useState } from "react";
import type { PointerEvent, WheelEvent } from "react";
import { Alert } from "../components/Alert";
import { Button } from "../components/Button";
import { PageHeader } from "../components/PageHeader";
import { StatCard } from "../components/StatCard";
import { Tabs } from "../components/Tabs";
import { useI18n } from "../i18n/LanguageContext";
import type { EngineKind } from "../types";
import { averageBenchmark, speedup } from "../utils/benchmark";
import { formatMs, formatRatio } from "../utils/formatters";
import { renderMandelbrotJs } from "../utils/jsImplementations";
import { putPixels } from "../utils/image";
import { loadWasm } from "../wasm/wasmLoader";

const presets = {
  classic: { zoom: 1, offsetX: -0.5, offsetY: 0 },
  valley: { zoom: 8, offsetX: -0.75, offsetY: 0.1 },
  spiral: { zoom: 22, offsetX: -0.7435, offsetY: 0.1314 }
};

type MandelbrotView = (typeof presets)[keyof typeof presets];

const MIN_ZOOM = 0.35;
const MAX_ZOOM = 8_000;

export default function MandelbrotDemo() {
  const { t, locale } = useI18n();
  const canvas = useRef<HTMLCanvasElement>(null);
  const [engine, setEngine] = useState<EngineKind>("wasm");
  const [width, setWidth] = useState(640);
  const [height, setHeight] = useState(420);
  const [maxIter, setMaxIter] = useState(180);
  const [presetName, setPresetName] = useState<keyof typeof presets>("classic");
  const [view, setView] = useState<MandelbrotView>(presets.classic);
  const [stats, setStats] = useState({ jsMs: 0, wasmMs: 0, workerMs: 0, speedup: 0 });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    startView: MandelbrotView;
    currentView: MandelbrotView;
  } | null>(null);

  function clampZoom(value: number): number {
    return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));
  }

  function viewScale(targetView = view): { scale: number; aspect: number } {
    return {
      scale: 3.2 / clampZoom(targetView.zoom),
      aspect: width / height
    };
  }

  function clientToRenderPoint(clientX: number, clientY: number): { x: number; y: number } {
    const rect = canvas.current?.getBoundingClientRect();
    if (!rect) return { x: width / 2, y: height / 2 };
    return {
      x: ((clientX - rect.left) / rect.width) * width,
      y: ((clientY - rect.top) / rect.height) * height
    };
  }

  async function renderView(targetView: MandelbrotView, targetEngine = engine) {
    if (!canvas.current) return;
    setBusy(true);
    setError(null);
    try {
      const start = performance.now();
      let pixels: Uint8Array;
      if (targetEngine === "js") {
        pixels = renderMandelbrotJs(width, height, maxIter, targetView.zoom, targetView.offsetX, targetView.offsetY);
      } else {
        const wasm = await loadWasm();
        pixels = wasm.wasm_mandelbrot(width, height, maxIter, targetView.zoom, targetView.offsetX, targetView.offsetY);
      }
      const elapsed = performance.now() - start;
      putPixels(canvas.current, pixels, width, height);
      setStats((current) => ({ ...current, [targetEngine === "js" ? "jsMs" : "wasmMs"]: elapsed }));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  function nextZoomView(current: MandelbrotView, point: { x: number; y: number }, factor: number): MandelbrotView {
    const { scale, aspect } = viewScale(current);
    const worldX = (point.x / width - 0.5) * scale * aspect + current.offsetX;
    const worldY = (point.y / height - 0.5) * scale + current.offsetY;
    const nextZoom = clampZoom(current.zoom * factor);
    const nextScale = 3.2 / nextZoom;

    return {
      zoom: nextZoom,
      offsetX: worldX - (point.x / width - 0.5) * nextScale * aspect,
      offsetY: worldY - (point.y / height - 0.5) * nextScale
    };
  }

  function zoomAt(clientX: number, clientY: number, factor: number) {
    const point = clientToRenderPoint(clientX, clientY);
    const nextView = nextZoomView(view, point, factor);
    setView(nextView);
    void renderView(nextView);
  }

  function zoomCanvasCenter(factor: number) {
    const rect = canvas.current?.getBoundingClientRect();
    if (rect) {
      zoomAt(rect.left + rect.width / 2, rect.top + rect.height / 2, factor);
      return;
    }
    const nextView = { ...view, zoom: clampZoom(view.zoom * factor) };
    setView(nextView);
    void renderView(nextView);
  }

  function handlePresetChange(nextPreset: keyof typeof presets) {
    setPresetName(nextPreset);
    setView(presets[nextPreset]);
  }

  function resetView() {
    const nextView = presets[presetName];
    setView(nextView);
    void renderView(nextView);
  }

  function handlePointerDown(event: PointerEvent<HTMLCanvasElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startView: view,
      currentView: view
    };
  }

  function handlePointerMove(event: PointerEvent<HTMLCanvasElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    const { scale, aspect } = viewScale(drag.startView);
    const rect = event.currentTarget.getBoundingClientRect();

    const nextView = {
      zoom: drag.startView.zoom,
      offsetX: drag.startView.offsetX - (dx / rect.width) * scale * aspect,
      offsetY: drag.startView.offsetY - (dy / rect.height) * scale
    };
    dragRef.current = { ...drag, currentView: nextView };
    setView(nextView);
  }

  function handlePointerUp(event: PointerEvent<HTMLCanvasElement>) {
    const drag = dragRef.current;
    if (drag?.pointerId === event.pointerId) {
      dragRef.current = null;
      event.currentTarget.releasePointerCapture(event.pointerId);
      void renderView(drag.currentView);
    }
  }

  function handleWheel(event: WheelEvent<HTMLCanvasElement>) {
    event.preventDefault();
    zoomAt(event.clientX, event.clientY, event.deltaY < 0 ? 1.25 : 0.8);
  }

  async function renderWasm(): Promise<Uint8Array> {
    const wasm = await loadWasm();
    return wasm.wasm_mandelbrot(width, height, maxIter, view.zoom, view.offsetX, view.offsetY);
  }

  function renderJs(): Uint8Array {
    return renderMandelbrotJs(width, height, maxIter, view.zoom, view.offsetX, view.offsetY);
  }

  async function renderSelected() {
    await renderView(view);
  }

  async function compare() {
    if (!canvas.current) return;
    setBusy(true);
    setError(null);
    try {
      const js = await averageBenchmark(renderJs, 3);
      const wasm = await averageBenchmark(renderWasm, 3);
      putPixels(canvas.current, wasm.value, width, height);
      setStats((current) => ({
        ...current,
        jsMs: js.averageMs,
        wasmMs: wasm.averageMs,
        speedup: speedup(js.averageMs, wasm.averageMs)
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  async function renderInWorker() {
    if (!canvas.current) return;
    setBusy(true);
    setError(null);
    const worker = new Worker(new URL("../workers/benchWorker.ts", import.meta.url), { type: "module" });
    worker.onmessage = (event: MessageEvent<{ type: string; ms?: number; pixels?: ArrayBuffer; message?: string }>) => {
      if (event.data.type === "done" && event.data.pixels) {
        putPixels(canvas.current!, new Uint8Array(event.data.pixels), width, height);
        setStats((current) => ({ ...current, workerMs: event.data.ms ?? 0 }));
      } else if (event.data.type === "error") {
        setError(event.data.message ?? "Worker failed");
      }
      worker.terminate();
      setBusy(false);
    };
    worker.postMessage({
      type: "mandelbrot-wasm",
      id: crypto.randomUUID(),
      width,
      height,
      maxIter,
      zoom: view.zoom,
      offsetX: view.offsetX,
      offsetY: view.offsetY
    });
  }

  return (
    <>
      <PageHeader eyebrow="Demo E + J" title={t("demo.mandelbrot.title")} description={t("demo.mandelbrot.description")} />
      <Alert>{locale === "tr" ? "Worker butonu hesaplamayı arka plana alarak arayüzün donmasını önler." : "The worker button moves computation off the main thread so the UI remains responsive."}</Alert>

      <section className="section grid grid-2">
        <div className="panel">
          <div className="form-grid">
            <label className="field">
              <span>Width</span>
              <input min={160} max={1200} type="number" value={width} onChange={(event) => setWidth(Number(event.target.value))} />
            </label>
            <label className="field">
              <span>Height</span>
              <input min={120} max={900} type="number" value={height} onChange={(event) => setHeight(Number(event.target.value))} />
            </label>
            <label className="field">
              <span>Iterations</span>
              <input min={32} max={1000} step={16} type="number" value={maxIter} onChange={(event) => setMaxIter(Number(event.target.value))} />
            </label>
            <label className="field">
              <span>Preset</span>
              <select value={presetName} onChange={(event) => handlePresetChange(event.target.value as keyof typeof presets)}>
                <option value="classic">Classic</option>
                <option value="valley">Seahorse valley</option>
                <option value="spiral">Spiral zoom</option>
              </select>
            </label>
            <label className="field">
              <span>Zoom</span>
              <input
                min={MIN_ZOOM}
                max={MAX_ZOOM}
                step={0.1}
                type="number"
                value={Number(view.zoom.toFixed(4))}
                onChange={(event) => setView((current) => ({ ...current, zoom: clampZoom(Number(event.target.value) || current.zoom) }))}
              />
            </label>
            <label className="field">
              <span>Offset X</span>
              <input
                step={0.0001}
                type="number"
                value={Number(view.offsetX.toFixed(6))}
                onChange={(event) => setView((current) => ({ ...current, offsetX: Number(event.target.value) }))}
              />
            </label>
            <label className="field">
              <span>Offset Y</span>
              <input
                step={0.0001}
                type="number"
                value={Number(view.offsetY.toFixed(6))}
                onChange={(event) => setView((current) => ({ ...current, offsetY: Number(event.target.value) }))}
              />
            </label>
          </div>
          <div className="section">
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
            <Button icon={<Play size={18} />} isLoading={busy} onClick={renderSelected}>
              {t("actions.run")}
            </Button>
            <Button icon={<Scale size={18} />} variant="secondary" isLoading={busy} onClick={compare}>
              {t("actions.compare")}
            </Button>
            <Button icon={<Cpu size={18} />} variant="ghost" isLoading={busy} onClick={renderInWorker}>
              Worker WASM
            </Button>
            <Button icon={<ZoomIn size={18} />} variant="ghost" onClick={() => zoomCanvasCenter(1.4)}>
              Zoom in
            </Button>
            <Button icon={<ZoomOut size={18} />} variant="ghost" onClick={() => zoomCanvasCenter(0.72)}>
              Zoom out
            </Button>
            <Button icon={<RotateCcw size={18} />} variant="ghost" onClick={resetView}>
              Reset view
            </Button>
          </div>
          {error ? <Alert variant="danger">{error}</Alert> : null}
        </div>

        <div className="grid grid-2">
          <StatCard label="JS average" value={stats.jsMs ? formatMs(stats.jsMs) : "n/a"} />
          <StatCard label="WASM average" value={stats.wasmMs ? formatMs(stats.wasmMs) : "n/a"} />
          <StatCard label="Speedup" value={stats.speedup ? formatRatio(stats.speedup) : "n/a"} />
          <StatCard label="Worker time" value={stats.workerMs ? formatMs(stats.workerMs) : "n/a"} detail="Runs in a module Web Worker." />
          <StatCard label="View zoom" value={`${view.zoom.toFixed(view.zoom >= 10 ? 1 : 2)}x`} detail={`x ${view.offsetX.toFixed(4)}, y ${view.offsetY.toFixed(4)}`} />
          <StatCard label="Canvas controls" value="drag + wheel" detail="Drag to pan, scroll to zoom in or out." />
        </div>
      </section>

      <section className="section">
        <figure className="canvas-frame">
          <figcaption>
            <Move size={16} aria-hidden="true" />
            <span>Mandelbrot canvas - drag to move, wheel to zoom</span>
          </figcaption>
          <canvas
            className="mandelbrot-canvas"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onWheel={handleWheel}
            ref={canvas}
          />
        </figure>
      </section>
    </>
  );
}
