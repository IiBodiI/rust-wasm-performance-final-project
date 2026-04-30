import { Link } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { useI18n } from "../i18n/LanguageContext";

export default function NotFound() {
  const { locale } = useI18n();
  return (
    <>
      <PageHeader
        eyebrow="404"
        title={locale === "tr" ? "Sayfa bulunamadı" : "Page not found"}
        description={locale === "tr" ? "Aradığınız rota bu uygulamada yok." : "The route you requested does not exist in this app."}
      />
      <Link className="button button-primary" to="/dashboard">
        {locale === "tr" ? "Panele dön" : "Back to dashboard"}
      </Link>
    </>
  );
}

