use wasm_bindgen::prelude::*;

pub mod compression;
pub mod hash;
pub mod image;
pub mod mandelbrot;
pub mod qr;

#[wasm_bindgen]
pub fn wasm_grayscale(data: &[u8], width: u32, height: u32) -> Result<Vec<u8>, JsValue> {
    image::grayscale(data, width, height).map_err(|err| JsValue::from_str(&err))
}

#[wasm_bindgen]
pub fn wasm_blur(data: &[u8], width: u32, height: u32, radius: u32) -> Result<Vec<u8>, JsValue> {
    image::box_blur(data, width, height, radius).map_err(|err| JsValue::from_str(&err))
}

#[wasm_bindgen]
pub fn wasm_edge_detect(data: &[u8], width: u32, height: u32) -> Result<Vec<u8>, JsValue> {
    image::edge_detect(data, width, height).map_err(|err| JsValue::from_str(&err))
}

#[wasm_bindgen]
pub fn wasm_mandelbrot(
    width: u32,
    height: u32,
    max_iter: u32,
    zoom: f64,
    offset_x: f64,
    offset_y: f64,
) -> Result<Vec<u8>, JsValue> {
    mandelbrot::render(width, height, max_iter, zoom, offset_x, offset_y)
        .map_err(|err| JsValue::from_str(&err))
}

#[wasm_bindgen]
pub fn wasm_hash_password(password: String, salt: String) -> Result<String, JsValue> {
    hash::hash_password(&password, &salt).map_err(|err| JsValue::from_str(&err))
}

#[wasm_bindgen]
pub fn wasm_generate_qr(text: String) -> Result<Vec<u8>, JsValue> {
    qr::generate_qr_matrix(&text).map_err(|err| JsValue::from_str(&err))
}

#[wasm_bindgen]
pub fn wasm_compress(data: &[u8]) -> Result<Vec<u8>, JsValue> {
    compression::compress(data).map_err(|err| JsValue::from_str(&err))
}

#[wasm_bindgen]
pub fn wasm_decompress(data: &[u8]) -> Result<Vec<u8>, JsValue> {
    compression::decompress(data).map_err(|err| JsValue::from_str(&err))
}

#[wasm_bindgen]
pub fn wasm_numeric_loop(iterations: u32) -> f64 {
    let mut acc = 0.0_f64;
    for i in 1..=iterations {
        let x = i as f64;
        acc += (x.sin() * x.cos()).abs().sqrt();
    }
    acc
}

#[wasm_bindgen]
pub fn wasm_version() -> String {
    format!("wasm-core {}", env!("CARGO_PKG_VERSION"))
}
