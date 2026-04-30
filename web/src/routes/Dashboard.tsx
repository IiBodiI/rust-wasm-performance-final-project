import {
  BarChart3,
  Camera,
  Cpu,
  FileArchive,
  ImageIcon,
  KeyRound,
  QrCode,
  SquareDashedMousePointer
} from "lucide-react";
import { useEffect, useState } from "react";
import { Alert } from "../components/Alert";
import { DemoCard } from "../components/DemoCard";
import { PageHeader } from "../components/PageHeader";
import { StatCard } from "../components/StatCard";
import { useI18n } from "../i18n/LanguageContext";
import { loadWasm } from "../wasm/wasmLoader";
import { getBrowserStatus, supportLabel } from "../utils/browserSupport";
import { formatRatio } from "../utils/formatters";
import { loadBenchmarkResults } from "../utils/storage";

export default function Dashboard() {
  const { t, locale } = useI18n();
  const [wasmStatus, setWasmStatus] = useState<"loading" | "loaded" | "error">("loading");
  const support = getBrowserStatus();
  const latest = loadBenchmarkResults();
  const bestSpeedup = latest.length ? Math.max(...latest.map((result) => result.speedup)) : 0;

  useEffect(() => {
    loadWasm()
      .then(() => setWasmStatus("loaded"))
      .catch(() => setWasmStatus("error"));
  }, []);

  const demos = [
    { icon: ImageIcon, title: t("demo.image.title"), description: t("demo.image.description"), href: "/demos/image" },
    { icon: Camera, title: t("demo.camera.title"), description: t("demo.camera.description"), href: "/demos/camera" },
    {
      icon: SquareDashedMousePointer,
      title: t("demo.mandelbrot.title"),
      description: t("demo.mandelbrot.description"),
      href: "/demos/mandelbrot"
    },
    { icon: KeyRound, title: t("demo.hash.title"), description: t("demo.hash.description"), href: "/demos/hash" },
    { icon: QrCode, title: t("demo.qr.title"), description: t("demo.qr.description"), href: "/demos/qr" },
    {
      icon: FileArchive,
      title: t("demo.compression.title"),
      description: t("demo.compression.description"),
      href: "/demos/compression"
    },
    { icon: BarChart3, title: t("demo.benchmark.title"), description: t("demo.benchmark.description"), href: "/benchmarks" }
  ];

  return (
    <>
      <PageHeader
        eyebrow="Dashboard"
        title={locale === "tr" ? "Canlı proje paneli" : "Live project dashboard"}
        description={
          locale === "tr"
            ? "Demo durumlarını, son benchmark sonuçlarını ve tarayıcı uyumluluğunu tek ekranda izleyin."
            : "Track demo status, latest benchmark numbers, and browser compatibility from one screen."
        }
      />

      {wasmStatus === "error" ? <Alert variant="danger">{t("errors.wasm")}</Alert> : null}

      <section className="grid grid-4">
        <StatCard
          label="WASM"
          value={wasmStatus === "loaded" ? t("status.loaded") : wasmStatus}
          tone={wasmStatus === "loaded" ? "success" : wasmStatus === "error" ? "danger" : "warning"}
        />
        <StatCard label="Worker" value={support.workers ? t("status.available") : t("status.fallback")} tone={support.workers ? "success" : "warning"} />
        <StatCard
          label="SharedArrayBuffer"
          value={support.sharedArrayBuffer ? t("status.available") : t("status.fallback")}
          detail="COOP/COEP required for true WASM threading."
          tone={support.sharedArrayBuffer ? "success" : "warning"}
        />
        <StatCard label="Best speedup" value={bestSpeedup ? formatRatio(bestSpeedup) : "n/a"} detail="From local saved benchmark results." />
      </section>

      <section className="section grid grid-3">
        <div className="panel">
          <h2>{locale === "tr" ? "Tarayıcı uyumluluğu" : "Browser compatibility"}</h2>
          <ul className="doc-list">
            <li>WebAssembly: {supportLabel(support.webAssembly)}</li>
            <li>Workers: {supportLabel(support.workers)}</li>
            <li>Camera API: {supportLabel(support.camera)}</li>
            <li>CompressionStream: {supportLabel(support.compressionStream)}</li>
          </ul>
        </div>
        <div className="panel">
          <h2>{locale === "tr" ? "Son ölçümler" : "Latest results"}</h2>
          {latest.slice(0, 5).length ? (
            <ul className="doc-list">
              {latest.slice(0, 5).map((result) => (
                <li key={result.id}>
                  {result.name}: {formatRatio(result.speedup)}
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-state">Run the benchmark page to populate this panel.</p>
          )}
        </div>
        <div className="panel">
          <h2>{locale === "tr" ? "İş parçacığı notu" : "Threading note"}</h2>
          <p>
            {locale === "tr"
              ? "Ağır Mandelbrot işi Web Worker içinde çalıştırılabilir. Gerçek WASM thread desteği için Cloudflare Pages üzerinde COOP/COEP başlıkları eklenmiştir."
              : "Heavy Mandelbrot work can run inside a Web Worker. True WASM threads require SharedArrayBuffer, so Cloudflare Pages headers are included."}
          </p>
        </div>
      </section>

      <section className="section">
        <h2>{locale === "tr" ? "Demo gezgini" : "Demo explorer"}</h2>
        <div className="grid grid-3">
          {demos.map((demo) => (
            <DemoCard badge="ready" key={demo.href} {...demo} />
          ))}
        </div>
      </section>
    </>
  );
}

