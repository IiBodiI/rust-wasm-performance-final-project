import { spawn } from "node:child_process";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const chrome =
  process.env.CHROME_PATH ||
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const baseUrl = process.env.APP_URL || "http://127.0.0.1:5173";
const outDir = path.resolve("docs/screenshots");
const port = Number(process.env.CDP_PORT || 9333);
const userDataDir = path.join(tmpdir(), `wasm-report-chrome-${Date.now()}`);

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`);
  return response.json();
}

async function waitForChrome() {
  const deadline = Date.now() + 20_000;
  while (Date.now() < deadline) {
    try {
      return await fetchJson(`http://127.0.0.1:${port}/json/version`);
    } catch {
      await wait(250);
    }
  }
  throw new Error("Chrome DevTools Protocol did not start in time.");
}

class CdpClient {
  constructor(url) {
    this.ws = new WebSocket(url);
    this.id = 1;
    this.pending = new Map();
    this.ready = new Promise((resolve, reject) => {
      this.ws.addEventListener("open", resolve, { once: true });
      this.ws.addEventListener("error", reject, { once: true });
    });
    this.ws.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (!message.id) return;
      const callbacks = this.pending.get(message.id);
      if (!callbacks) return;
      this.pending.delete(message.id);
      if (message.error) callbacks.reject(new Error(message.error.message));
      else callbacks.resolve(message.result);
    });
  }

  async send(method, params = {}) {
    await this.ready;
    const id = this.id++;
    const promise = new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
    });
    this.ws.send(JSON.stringify({ id, method, params }));
    return promise;
  }

  close() {
    this.ws.close();
  }
}

async function main() {
  await mkdir(outDir, { recursive: true });
  await rm(userDataDir, { recursive: true, force: true });

  const chromeProcess = spawn(chrome, [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    "--hide-scrollbars",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    "about:blank"
  ], { stdio: "ignore" });

  let client;
  try {
    await waitForChrome();
    const target = await fetchJson(`http://127.0.0.1:${port}/json/new?about:blank`, { method: "PUT" });
    client = new CdpClient(target.webSocketDebuggerUrl);
    await client.send("Page.enable");
    await client.send("Runtime.enable");
    await client.send("Emulation.setDeviceMetricsOverride", {
      width: 1440,
      height: 1000,
      deviceScaleFactor: 1,
      mobile: false
    });

    async function navigate(route, waitMs = 1800) {
      await client.send("Page.navigate", { url: `${baseUrl}${route}` });
      await wait(waitMs);
    }

    async function evalJs(expression, awaitPromise = false) {
      return client.send("Runtime.evaluate", {
        expression,
        awaitPromise,
        userGesture: true
      });
    }

    async function screenshot(fileName, options = {}) {
      const result = await client.send("Page.captureScreenshot", {
        format: "png",
        fromSurface: true,
        captureBeyondViewport: false,
        ...options
      });
      const fullPath = path.join(outDir, fileName);
      await writeFile(fullPath, Buffer.from(result.data, "base64"));
      return fullPath;
    }

    const captures = [];
    const pages = [
      ["01-landing.png", "/"],
      ["02-dashboard.png", "/dashboard"],
      ["03-image-demo.png", "/demos/image"],
      ["04-camera-demo.png", "/demos/camera"],
      ["06-hash-demo.png", "/demos/hash"],
      ["08-compression-demo.png", "/demos/compression"],
      ["10-docs.png", "/docs"]
    ];

    for (const [file, route] of pages) {
      await navigate(route);
      captures.push(await screenshot(file));
    }

    await navigate("/demos/mandelbrot", 2200);
    await evalJs(`Array.from(document.querySelectorAll("button")).find((button) => /Run|Çalıştır/.test(button.textContent || ""))?.click()`);
    await wait(3200);
    captures.push(await screenshot("05-mandelbrot-demo.png"));

    await navigate("/demos/qr", 1800);
    await evalJs(`Array.from(document.querySelectorAll("button")).find((button) => /Generate/.test(button.textContent || ""))?.click()`);
    await wait(1800);
    captures.push(await screenshot("07-qr-demo.png"));

    await navigate("/benchmarks", 2500);
    await evalJs(`Array.from(document.querySelectorAll("button")).find((button) => /Run all|Tümünü çalıştır/.test(button.textContent || ""))?.click()`);
    await evalJs(`new Promise((resolve) => {
      const deadline = Date.now() + 90000;
      const timer = setInterval(() => {
        const text = document.body.innerText;
        const cards = document.querySelectorAll(".benchmark-result-card").length;
        if (cards >= 6 || text.includes("Complete") || Date.now() > deadline) {
          clearInterval(timer);
          resolve({ cards, text: text.slice(0, 200) });
        }
      }, 500);
    })`, true);
    await evalJs("window.scrollTo(0, Math.min(780, document.body.scrollHeight));");
    await wait(1000);
    captures.push(await screenshot("09-benchmarks-graphs.png"));

    await client.send("Emulation.setDeviceMetricsOverride", {
      width: 390,
      height: 844,
      deviceScaleFactor: 1,
      mobile: true
    });
    await navigate("/", 1800);
    await evalJs(`document.querySelector('button[aria-label="Open navigation"]')?.click()`);
    await wait(800);
    captures.push(await screenshot("11-mobile-sidebar.png"));

    console.log(captures.join("\n"));
  } finally {
    client?.close();
    chromeProcess.kill();
    await wait(500);
    await rm(userDataDir, { recursive: true, force: true }).catch(() => {});
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
