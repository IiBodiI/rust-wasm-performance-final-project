# Testing

## Automated Commands

```powershell
pnpm install
pnpm wasm:build
pnpm wasm:test
pnpm lint
pnpm test
pnpm build
```

`pnpm wasm:test` runs:

- `cargo test --workspace`
- `wasm-pack test crates/wasm-core --node`

`pnpm test` runs the WASM tests plus frontend Vitest checks.

## Rust Tests

Covered areas:

- Image buffer validation
- Grayscale alpha preservation
- Blur radius zero behavior
- Mandelbrot escape-time logic
- Mandelbrot RGBA buffer length
- PBKDF2 deterministic output
- QR matrix shape
- Compression/decompression roundtrip

## WASM Tests

`crates/wasm-core/tests/wasm_exports.rs` validates exported WASM functions through `wasm-bindgen-test`.

## Frontend Checks

- TypeScript strict mode via `tsc --noEmit`
- Vitest utility tests for formatters, buffer comparison, speedup calculation, and image helper behavior

## Benchmark Validation

- Image grayscale checks JS and WASM buffers with a small tolerance.
- Mandelbrot validates output buffer length.
- Hashing checks exact PBKDF2 string equality.
- QR generation verifies that a WASM matrix was generated.
- Compression verifies JS and WASM roundtrip length.
- Numeric loop checks close floating-point equality.

## Manual QA Checklist

- Landing page loads on desktop and mobile.
- Mobile hamburger menu opens and routes correctly.
- Language switcher changes headings and navigation labels.
- Dashboard shows WASM, Worker, SharedArrayBuffer, and compatibility status.
- Image demo uploads an image, runs JS and WASM filters, benchmarks, and downloads PNG.
- Camera demo handles permission denied with a friendly message.
- Camera demo starts/stops and shows FPS/frame time.
- Mandelbrot demo renders JS, WASM, compare, and worker modes.
- Hash demo generates salt, hashes demo password, copies output, and warns not to use real passwords.
- QR demo generates a scannable QR and downloads PNG.
- Compression demo uploads a file, compresses, decompresses, validates roundtrip, and downloads output.
- Benchmark page runs all benchmarks, renders chart/table, stores dashboard results, and exports JSON.
- Worker responsiveness test increments UI ticks while worker runs.
- Browser console has no uncaught errors during normal use.

## Browser Compatibility Checklist

- Chrome or Edge desktop
- Firefox desktop
- Safari if available
- Mobile viewport in browser dev tools
- Camera demo over `https://` or localhost
- Cloudflare Pages deployment confirms `crossOriginIsolated === true`

