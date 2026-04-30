import { Play, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Alert } from "../components/Alert";
import { Button } from "../components/Button";
import { PageHeader } from "../components/PageHeader";
import { StatCard } from "../components/StatCard";
import { Tabs } from "../components/Tabs";
import { useI18n } from "../i18n/LanguageContext";
import type { EngineKind, FilterKind } from "../types";
import { formatMs } from "../utils/formatters";
import { applyFilterJs } from "../utils/image";
import { loadWasm, type WasmCore } from "../wasm/wasmLoader";

export default function CameraDemo() {
  const { t, locale } = useI18n();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bufferRef = useRef<HTMLCanvasElement>(document.createElement("canvas"));
  const streamRef = useRef<MediaStream | null>(null);
  const wasmRef = useRef<WasmCore | null>(null);
  const runningRef = useRef(false);
  const modeRef = useRef<EngineKind>("wasm");
  const filterRef = useRef<FilterKind>("grayscale");
  const fpsFrameCount = useRef(0);
  const fpsLastTick = useRef(performance.now());

  const [mode, setMode] = useState<EngineKind>("wasm");
  const [filter, setFilter] = useState<FilterKind>("grayscale");
  const [running, setRunning] = useState(false);
  const [fps, setFps] = useState(0);
  const [frameMs, setFrameMs] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    modeRef.current = mode;
    if (mode === "wasm" && !wasmRef.current) {
      loadWasm()
        .then((wasm) => {
          wasmRef.current = wasm;
        })
        .catch(() => setError(t("errors.wasm")));
    }
  }, [mode, t]);

  useEffect(() => {
    filterRef.current = filter;
  }, [filter]);

  useEffect(() => stopCamera, []);

  async function startCamera() {
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setError(t("errors.camera"));
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 360 }, audio: false });
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      await video.play();
      runningRef.current = true;
      setRunning(true);
      requestAnimationFrame(processFrame);
    } catch {
      setError(t("errors.camera"));
    }
  }

  function stopCamera() {
    runningRef.current = false;
    setRunning(false);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }

  async function processFrame() {
    if (!runningRef.current || !videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      requestAnimationFrame(processFrame);
      return;
    }

    const width = Math.min(640, video.videoWidth);
    const height = Math.round((width / video.videoWidth) * video.videoHeight);
    const buffer = bufferRef.current;
    buffer.width = width;
    buffer.height = height;
    const bufferContext = buffer.getContext("2d", { willReadFrequently: true });
    const outputContext = canvasRef.current.getContext("2d");
    if (!bufferContext || !outputContext) return;
    bufferContext.drawImage(video, 0, 0, width, height);
    const frame = bufferContext.getImageData(0, 0, width, height);
    const input = new Uint8Array(frame.data.buffer.slice(0));

    const start = performance.now();
    let output: Uint8Array;
    if (modeRef.current === "wasm" && wasmRef.current) {
      output =
        filterRef.current === "edge"
          ? wasmRef.current.wasm_edge_detect(input, width, height)
          : wasmRef.current.wasm_grayscale(input, width, height);
    } else {
      output = applyFilterJs(input, width, height, filterRef.current === "edge" ? "edge" : "grayscale");
    }
    setFrameMs(performance.now() - start);

    canvasRef.current.width = width;
    canvasRef.current.height = height;
    outputContext.putImageData(new ImageData(new Uint8ClampedArray(output), width, height), 0, 0);

    fpsFrameCount.current += 1;
    const now = performance.now();
    if (now - fpsLastTick.current >= 1000) {
      setFps(Math.round((fpsFrameCount.current * 1000) / (now - fpsLastTick.current)));
      fpsFrameCount.current = 0;
      fpsLastTick.current = now;
    }
    requestAnimationFrame(processFrame);
  }

  return (
    <>
      <PageHeader eyebrow="Demo D" title={t("demo.camera.title")} description={t("demo.camera.description")} />
      <Alert>{locale === "tr" ? "Gizlilik: kamera kareleri yalnızca tarayıcı belleğinde işlenir." : "Privacy: camera frames are processed only in browser memory."}</Alert>

      <section className="section grid grid-2">
        <div className="panel">
          <div className="control-row">
            <Tabs
              label="Mode"
              value={mode}
              onChange={setMode}
              options={[
                { value: "wasm", label: "WASM" },
                { value: "js", label: "JS" }
              ]}
            />
            <Tabs
              label="Filter"
              value={filter}
              onChange={setFilter}
              options={[
                { value: "grayscale", label: "Grayscale" },
                { value: "edge", label: "Edge" }
              ]}
            />
          </div>
          <div className="button-row section">
            <Button disabled={running} icon={<Play size={18} />} onClick={startCamera}>
              {locale === "tr" ? "Kamerayı başlat" : "Start camera"}
            </Button>
            <Button disabled={!running} icon={<Square size={18} />} variant="danger" onClick={stopCamera}>
              {locale === "tr" ? "Durdur" : "Stop"}
            </Button>
          </div>
          {error ? <Alert variant="danger">{error}</Alert> : null}
          <video ref={videoRef} playsInline muted className="sr-only" />
        </div>

        <div className="grid grid-2">
          <StatCard label="FPS" value={running ? fps : "n/a"} />
          <StatCard label="Frame time" value={running ? formatMs(frameMs) : "n/a"} />
          <StatCard label="Engine" value={mode.toUpperCase()} />
          <StatCard label="Status" value={running ? "running" : "stopped"} />
        </div>
      </section>

      <section className="section">
        <canvas ref={canvasRef} className="camera-preview" aria-label="Filtered camera preview" />
      </section>
    </>
  );
}

