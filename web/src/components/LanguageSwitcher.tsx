import { Languages } from "lucide-react";
import { useI18n } from "../i18n/LanguageContext";

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();
  return (
    <label className="language-switcher">
      <Languages size={16} aria-hidden="true" />
      <span className="sr-only">Language</span>
      <select value={locale} onChange={(event) => setLocale(event.target.value as "en" | "tr")}>
        <option value="en">EN</option>
        <option value="tr">TR</option>
      </select>
    </label>
  );
}

