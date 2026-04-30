# Architecture

This application is a static, browser-only system. There is no backend server and no REST API. Rust code is compiled into a WebAssembly package and imported by the React frontend.

## C4 Context

```mermaid
C4Context
  title Rust WebAssembly Performance Lab - Context
  Person(student, "Student / Developer", "Runs demos and exports benchmark evidence")
  System(app, "Browser Performance Lab", "React + TypeScript UI with Rust/WASM compute kernels")
  System_Ext(browserApis, "Browser APIs", "Canvas, getUserMedia, Web Workers, Web Crypto, CompressionStream")
  System_Ext(cloudflare, "Cloudflare Pages", "Static hosting with COOP/COEP headers")

  Rel(student, app, "Uses in browser")
  Rel(app, browserApis, "Calls local APIs")
  Rel(cloudflare, app, "Serves static files")
```

## Container Diagram

```mermaid
C4Container
  title Rust WebAssembly Performance Lab - Containers
  Person(user, "User", "Student, developer, Rust learner")
  Container(web, "React SPA", "React, TypeScript, Vite", "Routing, UI, i18n, demos, benchmark orchestration")
  Container(wasm, "wasm-core", "Rust 2024 + wasm-bindgen", "Image, Mandelbrot, hash, QR, compression, numeric kernels")
  Container(worker, "Benchmark Worker", "Module Web Worker", "Runs heavy Mandelbrot task away from the main UI thread")
  ContainerDb(storage, "localStorage", "Browser storage", "Stores latest benchmark results and language preference")
  System_Ext(browser, "Browser APIs", "Canvas, Camera, Web Crypto, CompressionStream")

  Rel(user, web, "Interacts")
  Rel(web, wasm, "Imports generated bindings")
  Rel(web, worker, "Posts heavy tasks")
  Rel(worker, wasm, "Loads WASM for worker compute")
  Rel(web, storage, "Reads/writes local settings and results")
  Rel(web, browser, "Uses local browser capabilities")
```

## Benchmark Sequence

```mermaid
sequenceDiagram
  actor User
  participant UI as React Benchmark Page
  participant JS as JavaScript Kernel
  participant WASM as Rust/WASM Kernel
  participant Store as localStorage

  User->>UI: Click "Run all"
  UI->>WASM: loadWasm()
  UI->>JS: Run benchmark N times
  JS-->>UI: JS timing and output
  UI->>WASM: Run equivalent benchmark N times
  WASM-->>UI: WASM timing and output
  UI->>UI: Validate output where practical
  UI->>UI: Compute speedup = JS / WASM
  UI->>Store: Save latest results
  UI-->>User: Show table, chart, export JSON
```

## Deployment Diagram

```mermaid
flowchart LR
  Repo["Git repository"] --> Build["Cloudflare Pages build\npnpm install && pnpm build"]
  Build --> Wasm["wasm-pack output\nweb/src/wasm/wasm_core"]
  Build --> Dist["web/dist"]
  Headers["web/public/_headers"] --> Dist
  Dist --> CDN["Cloudflare edge"]
  CDN --> Browser["User browser\nCOOP/COEP enabled"]
```

## Frontend

The frontend is a Vite React SPA. Routes are lazy-loaded for code splitting:

- `/`
- `/dashboard`
- `/demos/image`
- `/demos/camera`
- `/demos/mandelbrot`
- `/demos/hash`
- `/demos/qr`
- `/demos/compression`
- `/benchmarks`
- `/about`
- `/docs`
- `/not-found`

Reusable components include layout, navbar, cards, alerts, buttons, tabs, tables, charts, file upload, canvas wrappers, stat cards, and language switching.

## WASM Module

`crates/wasm-core` exposes stable `wasm-bindgen` functions. The React app imports generated bindings through `web/src/wasm/wasmLoader.ts`, which centralizes initialization and error handling.

## Workers

`web/src/workers/benchWorker.ts` runs Mandelbrot rendering in a module Web Worker. This satisfies the non-blocking heavy computation requirement and demonstrates the path toward true threaded WASM.

## Browser APIs

- Canvas: image previews, filtered output, fractal, QR drawing
- getUserMedia: real-time camera demo
- Web Crypto: JS PBKDF2 comparison and salt generation
- CompressionStream: JS compression comparison where supported
- localStorage: language and latest benchmark results

## Security Notes

The app has no backend and does not upload user content. Camera frames, passwords, and files stay in browser memory. Input sizes are limited to reduce browser freeze risk. The app avoids `dangerouslySetInnerHTML`.

