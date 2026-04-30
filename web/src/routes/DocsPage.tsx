import { PageHeader } from "../components/PageHeader";
import { useI18n } from "../i18n/LanguageContext";

export default function DocsPage() {
  const { locale } = useI18n();
  return (
    <>
      <PageHeader
        eyebrow="Docs"
        title={locale === "tr" ? "Dokümantasyon rehberi" : "Documentation guide"}
        description={
          locale === "tr"
            ? "Repo kökünde ve docs klasöründe kurulum, mimari, WASM arayüzü, test ve rapor notları bulunur."
            : "The repository includes setup, architecture, WASM interface, testing, and report notes in the root and docs directory."
        }
      />
      <section className="grid grid-2">
        <div className="panel">
          <h2>Files</h2>
          <ul className="doc-list">
            <li>README.md: setup, commands, deployment, limitations.</li>
            <li>docs/ARCHITECTURE.md: Mermaid C4, container, sequence, deployment diagrams.</li>
            <li>docs/API_OR_WASM_INTERFACE.md: exported WASM functions and usage.</li>
            <li>docs/TESTING.md: automated and manual test checklist.</li>
            <li>docs/REPORT_NOTES.md: Turkish report-ready content.</li>
          </ul>
        </div>
        <div className="panel">
          <h2>{locale === "tr" ? "Rapor kanıtları" : "Report evidence"}</h2>
          <ul className="doc-list">
            <li>{locale === "tr" ? "Her demo sayfasının ekran görüntüsü." : "Screenshot of every demo page."}</li>
            <li>{locale === "tr" ? "Benchmark JSON çıktısı." : "Exported benchmark JSON."}</li>
            <li>{locale === "tr" ? "Cloudflare Pages header yapılandırması." : "Cloudflare Pages header configuration."}</li>
            <li>{locale === "tr" ? "cargo test, wasm-pack test ve pnpm build çıktıları." : "cargo test, wasm-pack test, and pnpm build outputs."}</li>
          </ul>
        </div>
      </section>
    </>
  );
}

