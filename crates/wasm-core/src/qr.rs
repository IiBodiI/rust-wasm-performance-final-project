use qrcodegen::{QrCode, QrCodeEcc};

const MAX_QR_TEXT_BYTES: usize = 1_024;

pub fn generate_qr_matrix(text: &str) -> Result<Vec<u8>, String> {
    if text.trim().is_empty() {
        return Err("QR text cannot be empty".to_string());
    }
    if text.as_bytes().len() > MAX_QR_TEXT_BYTES {
        return Err(format!(
            "QR text is too long. Maximum is {MAX_QR_TEXT_BYTES} bytes"
        ));
    }

    let qr = QrCode::encode_text(text, QrCodeEcc::Medium)
        .map_err(|_| "Unable to encode QR text".to_string())?;
    let size = qr.size();
    let mut out = Vec::with_capacity(4 + (size * size) as usize);
    out.extend_from_slice(&(size as u32).to_le_bytes());
    for y in 0..size {
        for x in 0..size {
            out.push(u8::from(qr.get_module(x, y)));
        }
    }
    Ok(out)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn qr_matrix_contains_size_header() {
        let out = generate_qr_matrix("BMU1208").unwrap();
        let size = u32::from_le_bytes([out[0], out[1], out[2], out[3]]) as usize;
        assert_eq!(out.len(), 4 + size * size);
        assert!(size >= 21);
    }

    #[test]
    fn empty_text_is_rejected() {
        assert!(generate_qr_matrix(" ").is_err());
    }
}

