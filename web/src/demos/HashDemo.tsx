import { Copy, KeyRound, RefreshCw } from "lucide-react";
import { useState } from "react";
import { Alert } from "../components/Alert";
import { Button } from "../components/Button";
import { PageHeader } from "../components/PageHeader";
import { StatCard } from "../components/StatCard";
import { Tabs } from "../components/Tabs";
import { useI18n } from "../i18n/LanguageContext";
import type { EngineKind } from "../types";
import { formatMs } from "../utils/formatters";
import { hashPasswordJs, randomSalt } from "../utils/jsImplementations";
import { loadWasm } from "../wasm/wasmLoader";

export default function HashDemo() {
  const { t, locale } = useI18n();
  const [mode, setMode] = useState<EngineKind>("wasm");
  const [password, setPassword] = useState("");
  const [salt, setSalt] = useState(() => randomSalt());
  const [hash, setHash] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function runHash() {
    setBusy(true);
    setError(null);
    try {
      const start = performance.now();
      const value = mode === "js" ? await hashPasswordJs(password, salt) : (await loadWasm()).wasm_hash_password(password, salt);
      setElapsed(performance.now() - start);
      setHash(value);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader eyebrow="Demo F" title={t("demo.hash.title")} description={t("demo.hash.description")} />
      <Alert variant="warning">{t("privacy.password")}</Alert>

      <section className="section grid grid-2">
        <div className="panel">
          <Tabs
            label="Mode"
            value={mode}
            onChange={setMode}
            options={[
              { value: "wasm", label: "WASM" },
              { value: "js", label: "JS" }
            ]}
          />
          <div className="form-grid section">
            <label className="field">
              <span>{locale === "tr" ? "Demo parolası" : "Demo password"}</span>
              <input
                autoComplete="off"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={locale === "tr" ? "Gerçek parola kullanmayın" : "Do not use a real password"}
              />
            </label>
            <label className="field">
              <span>Salt</span>
              <input value={salt} onChange={(event) => setSalt(event.target.value)} />
            </label>
          </div>
          <div className="button-row section">
            <Button icon={<KeyRound size={18} />} isLoading={busy} onClick={runHash}>
              Hash
            </Button>
            <Button icon={<RefreshCw size={18} />} variant="secondary" onClick={() => setSalt(randomSalt())}>
              {locale === "tr" ? "Salt üret" : "Generate salt"}
            </Button>
            <Button
              disabled={!hash}
              icon={<Copy size={18} />}
              variant="ghost"
              onClick={() => navigator.clipboard.writeText(hash)}
            >
              Copy
            </Button>
          </div>
          {error ? <Alert variant="danger">{error}</Alert> : null}
        </div>

        <div className="grid grid-2">
          <StatCard label="Runtime" value={elapsed ? formatMs(elapsed) : "n/a"} />
          <StatCard label="Algorithm" value="PBKDF2/SHA-256" detail="Argon2-compatible fallback for stable WASM build." />
        </div>
      </section>

      <section className="section">
        <pre className="code-output" aria-label="Hash output">
          {hash || "Hash output will appear here."}
        </pre>
      </section>
    </>
  );
}

