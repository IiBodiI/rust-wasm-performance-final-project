import { PageHeader } from "../components/PageHeader";
import { useI18n } from "../i18n/LanguageContext";

export default function About() {
  const { locale } = useI18n();
  return (
    <>
      <PageHeader
        eyebrow="About"
        title={locale === "tr" ? "Proje hakkında" : "About the project"}
        description={
          locale === "tr"
            ? "Bu uygulama, CPU yoğun tarayıcı işlerinde Rust + WebAssembly yaklaşımını ölçülebilir ve etkileşimli şekilde gösteren bir final projesidir."
            : "This final project demonstrates Rust + WebAssembly for CPU-heavy browser workloads with measurable, interactive demos."
        }
      />
      <section className="grid grid-2">
        <div className="panel">
          <h2>{locale === "tr" ? "Amaç" : "Goal"}</h2>
          <p>
            {locale === "tr"
              ? "JavaScript ile yazılan yoğun hesaplamaların kullanıcı arayüzünü yavaşlatabileceğini göstermek ve performans kritik bölümleri Rust ile WebAssembly modülüne taşımanın etkisini ölçmek."
              : "Show how CPU-intensive JavaScript can slow browser experiences, then measure the effect of moving performance-critical kernels into Rust/WebAssembly."}
          </p>
        </div>
        <div className="panel">
          <h2>{locale === "tr" ? "Güvenlik ve gizlilik" : "Security and privacy"}</h2>
          <p>
            {locale === "tr"
              ? "Kamera kareleri, parolalar ve dosyalar tarayıcıdan çıkmaz. Uygulama REST API gerektirmez ve Cloudflare Pages üzerinde statik olarak yayınlanabilir."
              : "Camera frames, passwords, and files never leave the browser. The app requires no REST API and can be deployed as a static Cloudflare Pages site."}
          </p>
        </div>
      </section>
    </>
  );
}

