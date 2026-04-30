import { Download, FileArchive, RotateCcw } from "lucide-react";
import { useState } from "react";
import { Alert } from "../components/Alert";
import { Button } from "../components/Button";
import { FileUpload } from "../components/FileUpload";
import { PageHeader } from "../components/PageHeader";
import { StatCard } from "../components/StatCard";
import { Tabs } from "../components/Tabs";
import { useI18n } from "../i18n/LanguageContext";
import type { EngineKind } from "../types";
import { downloadBytes } from "../utils/download";
import { formatBytes, formatMs, formatPercent } from "../utils/formatters";
import { compressJs, decompressJs } from "../utils/jsImplementations";
import { loadWasm } from "../wasm/wasmLoader";

export default function CompressionDemo() {
  const { t, locale } = useI18n();
  const [mode, setMode] = useState<EngineKind>("wasm");
  const [fileName, setFileName] = useState("No file loaded");
  const [input, setInput] = useState<Uint8Array | null>(null);
  const [compressed, setCompressed] = useState<Uint8Array | null>(null);
  const [restored, setRestored] = useState<Uint8Array | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [decompressMs, setDecompressMs] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(file: File) {
    setError(null);
    if (file.size > 10 * 1024 * 1024) {
      setError("File is too large for the browser demo limit. Use a file under 10 MB.");
      return;
    }
    setFileName(`${file.name} · ${formatBytes(file.size)}`);
    setInput(new Uint8Array(await file.arrayBuffer()));
    setCompressed(null);
    setRestored(null);
  }

  async function compress() {
    if (!input) {
      setError("Choose a file before compressing.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const start = performance.now();
      const value = mode === "js" ? await compressJs(input) : (await loadWasm()).wasm_compress(input);
      setElapsed(performance.now() - start);
      setCompressed(value);
      setRestored(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  async function decompress() {
    if (!compressed) return;
    setBusy(true);
    setError(null);
    try {
      const start = performance.now();
      const value = mode === "js" ? await decompressJs(compressed) : (await loadWasm()).wasm_decompress(compressed);
      setDecompressMs(performance.now() - start);
      setRestored(value);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  const ratio = input && compressed ? (compressed.length / input.length) * 100 : 0;
  const roundtripOk = input && restored ? input.length === restored.length && input.every((value, index) => value === restored[index]) : false;

  return (
    <>
      <PageHeader eyebrow="Demo H" title={t("demo.compression.title")} description={t("demo.compression.description")} />
      <Alert>{t("privacy.local")}</Alert>

      <section className="section grid grid-2">
        <div className="panel">
          <FileUpload label={locale === "tr" ? "Dosya yükle" : "Upload file"} help="Text or binary · max 10 MB" onFile={handleFile} />
          <div className="section">
            <Tabs
              label="Mode"
              value={mode}
              onChange={setMode}
              options={[
                { value: "wasm", label: "WASM zlib" },
                { value: "js", label: "JS gzip/RLE" }
              ]}
            />
          </div>
          <div className="button-row section">
            <Button icon={<FileArchive size={18} />} isLoading={busy} onClick={compress}>
              Compress
            </Button>
            <Button disabled={!compressed} icon={<RotateCcw size={18} />} variant="secondary" isLoading={busy} onClick={decompress}>
              Decompress
            </Button>
            <Button
              disabled={!compressed}
              icon={<Download size={18} />}
              variant="ghost"
              onClick={() => compressed && downloadBytes(compressed, `${mode}-${fileName.split(" · ")[0]}.compressed`)}
            >
              {t("actions.download")}
            </Button>
          </div>
          {error ? <Alert variant="danger">{error}</Alert> : null}
        </div>

        <div className="grid grid-2">
          <StatCard label="File" value={fileName} />
          <StatCard label="Original" value={input ? formatBytes(input.length) : "n/a"} />
          <StatCard label="Compressed" value={compressed ? formatBytes(compressed.length) : "n/a"} />
          <StatCard label="Ratio" value={ratio ? formatPercent(ratio) : "n/a"} />
          <StatCard label="Compress time" value={elapsed ? formatMs(elapsed) : "n/a"} />
          <StatCard label="Roundtrip" value={roundtripOk ? "ok" : restored ? "mismatch" : "n/a"} tone={roundtripOk ? "success" : restored ? "danger" : "neutral"} detail={decompressMs ? `Decompress ${formatMs(decompressMs)}` : undefined} />
        </div>
      </section>
    </>
  );
}

