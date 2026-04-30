import {
  BarChart3,
  Camera,
  FileArchive,
  ImageIcon,
  KeyRound,
  QrCode,
  Rocket,
  SquareDashedMousePointer
} from "lucide-react";
import { Link } from "react-router-dom";
import { DemoCard } from "../components/DemoCard";
import { StatCard } from "../components/StatCard";
import { useI18n } from "../i18n/LanguageContext";

export default function Home() {
  const { t, locale } = useI18n();
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
    }
  ];

  return (
    <>
      <section className="hero">
        <div>
          <p className="eyebrow">BMU1208 Web Tabanlı Programlama</p>
          <h1>{t("app.title")}</h1>
          <p>
            {locale === "tr"
              ? "Rust kodu WebAssembly olarak derlenir ve tarayıcıda JavaScript ile yan yana çalışır. Bu proje görüntü işleme, fraktal çizimi, hashleme, QR üretimi ve sıkıştırma gibi CPU yoğun işlerde ölçülebilir farkları gösterir."
              : "Rust code is compiled to WebAssembly and runs beside JavaScript in the browser. This project measures real differences across CPU-heavy image processing, fractal rendering, hashing, QR generation, and compression tasks."}
          </p>
          <div className="button-row">
            <Link className="button button-primary" to="/dashboard">
              <Rocket size={18} aria-hidden="true" />
              <span>{locale === "tr" ? "Panele git" : "Open dashboard"}</span>
            </Link>
            <Link className="button button-secondary" to="/benchmarks">
              <BarChart3 size={18} aria-hidden="true" />
              <span>{t("nav.benchmarks")}</span>
            </Link>
          </div>
        </div>

        <div className="hero-visual" aria-label="Performance comparison visual">
          <div className="visual-grid" aria-hidden="true">
            {Array.from({ length: 126 }).map((_, index) => (
              <span className="visual-cell" key={index} />
            ))}
          </div>
          <div className="visual-bars">
            <div>
              <strong>JS</strong>
              <span />
              <em>baseline</em>
            </div>
            <div>
              <strong>WASM</strong>
              <span />
              <em>faster*</em>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-3" aria-label="Project summary">
        <StatCard label="Architecture" value="Client-side" detail="No REST backend or file uploads." />
        <StatCard label="Core" value="Rust 2024" detail="wasm-bindgen exports typed functions." />
        <StatCard label="Benchmarking" value="Real timings" detail="Small inputs can still favor JavaScript." />
      </section>

      <section className="section">
        <h2>{locale === "tr" ? "Çalışan demolar" : "Interactive demos"}</h2>
        <div className="grid grid-3">
          {demos.map((demo) => (
            <DemoCard badge="JS + WASM" key={demo.href} {...demo} />
          ))}
        </div>
      </section>
    </>
  );
}

