import {
  BarChart3,
  BookOpen,
  Camera,
  Gauge,
  Home,
  ImageIcon,
  Info,
  KeyRound,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  QrCode,
  SquareDashedMousePointer,
  X,
  FileArchive
} from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useI18n } from "../i18n/LanguageContext";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeSwitcher } from "./ThemeSwitcher";

const mainLinks = [
  { to: "/", labelKey: "nav.home", icon: Home },
  { to: "/dashboard", labelKey: "nav.dashboard", icon: Gauge },
  { to: "/benchmarks", labelKey: "nav.benchmarks", icon: BarChart3 },
  { to: "/docs", labelKey: "nav.docs", icon: BookOpen },
  { to: "/about", labelKey: "nav.about", icon: Info }
];

const demoLinks = [
  { to: "/demos/image", labelKey: "nav.image", icon: ImageIcon },
  { to: "/demos/camera", labelKey: "nav.camera", icon: Camera },
  { to: "/demos/mandelbrot", labelKey: "nav.mandelbrot", icon: SquareDashedMousePointer },
  { to: "/demos/hash", labelKey: "nav.hash", icon: KeyRound },
  { to: "/demos/qr", labelKey: "nav.qr", icon: QrCode },
  { to: "/demos/compression", labelKey: "nav.compression", icon: FileArchive }
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { t } = useI18n();
  const sidebarClass = `site-nav ${collapsed ? "site-nav-collapsed" : ""} ${open ? "nav-open" : ""}`;

  return (
    <>
      <button
        aria-expanded={open}
        aria-label={open ? "Close navigation" : "Open navigation"}
        className="menu-toggle mobile-sidebar-toggle"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      {open ? <button aria-label="Close navigation" className="sidebar-backdrop" onClick={() => setOpen(false)} type="button" /> : null}

      <header className={sidebarClass}>
        <div className="sidebar-header">
          <NavLink className="brand" to="/" onClick={() => setOpen(false)}>
            <span className="brand-mark">W</span>
            <span className="brand-label">WASM Lab</span>
          </NavLink>

          <button
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-pressed={collapsed}
            className="collapse-toggle"
            onClick={() => setCollapsed((value) => !value)}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            type="button"
          >
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>

        <nav className="nav-links" aria-label="Primary navigation">
          <div className="nav-group">
            <span className="nav-section-label">Main</span>
            {mainLinks.map(({ to, labelKey, icon: Icon }) => (
              <NavLink aria-label={t(labelKey)} className="nav-link" key={to} title={t(labelKey)} to={to} onClick={() => setOpen(false)}>
                <Icon size={18} aria-hidden="true" />
                <span>{t(labelKey)}</span>
              </NavLink>
            ))}
          </div>

          <div className="nav-group">
            <span className="nav-section-label">Demos</span>
            {demoLinks.map(({ to, labelKey, icon: Icon }) => (
              <NavLink aria-label={t(labelKey)} className="nav-link" key={to} title={t(labelKey)} to={to} onClick={() => setOpen(false)}>
                <Icon size={18} aria-hidden="true" />
                <span>{t(labelKey)}</span>
              </NavLink>
            ))}
          </div>

          <div className="sidebar-actions">
            <ThemeSwitcher />
            <LanguageSwitcher />
          </div>
        </nav>
      </header>
    </>
  );
}
