import { Outlet } from "react-router-dom";
import { CursorEffects } from "./CursorEffects";
import { Navbar } from "./Navbar";

export function Layout() {
  return (
    <div className="app-shell">
      <CursorEffects />
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
      <footer className="site-footer">
        <span>BMU1208 Web Tabanlı Programlama</span>
        <span>Rust → WebAssembly, client-side only</span>
      </footer>
    </div>
  );
}
