import { Moon, Sun } from "lucide-react";
import { useI18n } from "../i18n/LanguageContext";
import { useTheme } from "../theme/ThemeContext";

export function ThemeSwitcher() {
  const { t } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const label = isDark ? t("theme.switchToLight") : t("theme.switchToDark");

  return (
    <button aria-label={label} className="theme-toggle" onClick={toggleTheme} title={label} type="button">
      {isDark ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}
      <span>{isDark ? t("theme.light") : t("theme.dark")}</span>
    </button>
  );
}

