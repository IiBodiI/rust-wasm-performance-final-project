use wasm_bindgen_test::*;

#[wasm_bindgen_test]
fn wasm_version_is_available() {
    assert!(wasm_core::wasm_version().contains("wasm-core"));
}

#[wasm_bindgen_test]
fn wasm_mandelbrot_returns_rgba_buffer() {
    let out = wasm_core::wasm_mandelbrot(8, 8, 16, 1.0, -0.5, 0.0).unwrap();
    assert_eq!(out.len(), 8 * 8 * 4);
}
