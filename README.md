# Rust WebAssembly Performance Lab

**Student:** Abdulrahman Jalal Muhammed Abdulhamid Ali  
**Student Number:** 23080410313

BMU1208 Web Tabanlı Programlama final project: a browser-only React + TypeScript application that compares JavaScript and Rust compiled to WebAssembly on CPU-intensive tasks.

The project does not fake benchmark results. Each demo runs real JavaScript and WASM code in the current browser, measures with `performance.now()`, and explains that results vary by device, browser, input size, and thermal state.

## Features

- Polished landing page, dashboard, documentation, and responsive navigation.
- Six working demos: image processing, camera filtering, Mandelbrot rendering, password hashing, QR generation, and file compression.
- Dedicated benchmark page with table, bar chart, browser metadata, repeated runs, speedup ratios, and JSON export.
- Rust 2024 WASM crate using `wasm-bindgen`, `js-sys`, `web-sys`, `pbkdf2`, `qrcodegen`, and `miniz_oxide`.
- Web Worker Mandelbrot task to keep the UI responsive during heavy work.
- Turkish and English localization for navigation, headings, descriptions, and key messages.
- Cloudflare Pages headers for COOP/COEP so `SharedArrayBuffer` and future WASM threading work in production.
- Rust unit tests, wasm-bindgen tests, TypeScript checks, Vitest utility tests, and manual QA documentation.

## Tech Stack

- Rust edition 2024
- wasm-bindgen, wasm-pack, js-sys, web-sys
- React 18, TypeScript, Vite
- pnpm workspace
- Vitest
- Cloudflare Pages static deployment

## Prerequisites

- Node.js 22+
- pnpm 10+ (`corepack pnpm` works even when global pnpm is not installed)
- Rust 1.85+ with the `wasm32-unknown-unknown` target
- wasm-pack 0.13+

```powershell
rustup target add wasm32-unknown-unknown
cargo install wasm-pack
corepack prepare pnpm@10.10.0 --activate
```

On a correctly configured Windows Rust/MSVC setup, the standard commands below work. If `link.exe` reports `cannot open file 'msvcrt.lib'`, the included `scripts/wasm-*.mjs` wrappers try to discover the Visual Studio runtime library automatically.

## Install

```powershell
pnpm install
```

If pnpm is not globally available:

```powershell
corepack pnpm install
```

## Development

```powershell
pnpm dev
```

This builds the WASM package and starts Vite. Open the URL printed by Vite, usually `http://localhost:5173`.

## WASM Commands

```powershell
pnpm wasm:build
pnpm wasm:test
```

Generated bindings are written to `web/src/wasm/wasm_core`.

## Test Commands

```powershell
pnpm lint
pnpm test
```

The full `pnpm test` command runs Rust tests, wasm-bindgen tests in Node, and frontend Vitest checks.

## Production Build

```powershell
pnpm build
```

The static build is generated in `web/dist`.

## Cloudflare Pages Deployment

- Build command: `pnpm install --frozen-lockfile && pnpm build`
- Output directory: `web/dist`
- Node version: 22
- Rust and wasm-pack must be available in the build environment. If the default Cloudflare image does not include wasm-pack, add an install step such as `cargo install wasm-pack`.

The `_headers` file is copied into `web/dist` from `web/public/_headers` and includes:

```text
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

These headers are required for `SharedArrayBuffer` and true WASM threading support.

## Browser Compatibility

- WebAssembly: Chrome, Edge, Firefox, Safari
- Web Workers: modern desktop and mobile browsers
- Camera demo: requires `getUserMedia` and user permission
- JS compression fallback: uses `CompressionStream` when available, otherwise a simple RLE fallback
- SharedArrayBuffer: requires cross-origin isolation via COOP/COEP headers

## Screenshots

Place final report screenshots in `docs/screenshots/`. See `docs/SCREENSHOT_AND_VIDEO_CHECKLIST.md`.

## Demo Video

Record the landing page, dashboard, each demo, benchmark export, and worker responsiveness test. A suggested shot list is in `docs/SCREENSHOT_AND_VIDEO_CHECKLIST.md`.

## Known Limitations

- The hash demo uses PBKDF2/SHA-256 instead of Argon2 to keep the WASM build stable and dependency-light.
- The JS compression path uses browser `CompressionStream` gzip or RLE fallback, while WASM uses zlib via Rust. Compare ratio and timing with that distinction in mind.
- Small inputs may be faster in JavaScript because the WASM boundary and memory copies have overhead.
- True multi-threaded WASM is documented and deployment-ready via headers, but this implementation uses a Web Worker fallback instead of `wasm-bindgen-rayon`.

## Future Work

- Add `wasm-bindgen-rayon` parallel kernels when the deployment environment is cross-origin isolated.
- Add larger benchmark presets and CSV export.
- Add Playwright end-to-end smoke tests.
- Add image histogram and SIMD-focused kernels.
