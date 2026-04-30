# Screenshot and Demo Video Checklist

## Screenshots

Save final images in `docs/screenshots/`.

- Landing page first viewport
- Dashboard with WASM loaded
- Image processing demo after JS vs WASM comparison
- Camera demo running, or permission fallback if no camera is available
- Mandelbrot demo after worker render
- Hash demo showing runtime and warning
- QR demo with generated QR
- Compression demo with ratio and roundtrip status
- Benchmark page chart and table
- Exported benchmark JSON opened in an editor
- Mobile navigation open
- Cloudflare Pages response headers showing COOP/COEP

## Demo Video

Recommended flow:

1. Open landing page and explain project goal.
2. Switch language from English to Turkish.
3. Open dashboard and point out WASM, Worker, and SharedArrayBuffer status.
4. Run image processing comparison.
5. Run Mandelbrot WASM and worker modes.
6. Hash a demo password and explain local-only privacy.
7. Generate QR and download PNG.
8. Compress and decompress a file.
9. Run full benchmark page and export JSON.
10. End with docs folder and Cloudflare deployment headers.

