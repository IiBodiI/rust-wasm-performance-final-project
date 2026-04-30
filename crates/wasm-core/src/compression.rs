use miniz_oxide::deflate::compress_to_vec_zlib;
use miniz_oxide::inflate::decompress_to_vec_zlib;

const MAX_BYTES: usize = 10 * 1024 * 1024;

pub fn compress(data: &[u8]) -> Result<Vec<u8>, String> {
    if data.is_empty() {
        return Err("No data was provided".to_string());
    }
    if data.len() > MAX_BYTES {
        return Err("File is too large for the browser demo limit".to_string());
    }
    Ok(compress_to_vec_zlib(data, 7))
}

pub fn decompress(data: &[u8]) -> Result<Vec<u8>, String> {
    if data.is_empty() {
        return Err("No compressed data was provided".to_string());
    }
    decompress_to_vec_zlib(data).map_err(|_| "Unable to decompress zlib data".to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn compression_roundtrip_restores_data() {
        let input = b"Rust and WebAssembly ".repeat(256);
        let compressed = compress(&input).unwrap();
        let restored = decompress(&compressed).unwrap();
        assert_eq!(restored, input);
    }
}

