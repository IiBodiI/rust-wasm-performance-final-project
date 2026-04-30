fn validate_rgba(data: &[u8], width: u32, height: u32) -> Result<usize, String> {
    let pixels = width
        .checked_mul(height)
        .ok_or_else(|| "Image dimensions are too large".to_string())?;
    let len = pixels
        .checked_mul(4)
        .ok_or_else(|| "Image buffer is too large".to_string())? as usize;
    if data.len() != len {
        return Err(format!("Expected {len} RGBA bytes, received {}", data.len()));
    }
    Ok(len)
}

pub fn grayscale(data: &[u8], width: u32, height: u32) -> Result<Vec<u8>, String> {
    let len = validate_rgba(data, width, height)?;
    let mut out = Vec::with_capacity(len);
    for pixel in data.chunks_exact(4) {
        let gray = (0.299 * pixel[0] as f32 + 0.587 * pixel[1] as f32 + 0.114 * pixel[2] as f32)
            .round() as u8;
        out.extend_from_slice(&[gray, gray, gray, pixel[3]]);
    }
    Ok(out)
}

pub fn box_blur(data: &[u8], width: u32, height: u32, radius: u32) -> Result<Vec<u8>, String> {
    let len = validate_rgba(data, width, height)?;
    if radius == 0 {
        return Ok(data.to_vec());
    }

    let width_i = width as i32;
    let height_i = height as i32;
    let radius_i = radius.min(12) as i32;
    let mut out = vec![0_u8; len];

    for y in 0..height_i {
        for x in 0..width_i {
            let mut r = 0_u32;
            let mut g = 0_u32;
            let mut b = 0_u32;
            let mut a = 0_u32;
            let mut count = 0_u32;

            for ky in -radius_i..=radius_i {
                let sy = (y + ky).clamp(0, height_i - 1);
                for kx in -radius_i..=radius_i {
                    let sx = (x + kx).clamp(0, width_i - 1);
                    let idx = ((sy as u32 * width + sx as u32) * 4) as usize;
                    r += data[idx] as u32;
                    g += data[idx + 1] as u32;
                    b += data[idx + 2] as u32;
                    a += data[idx + 3] as u32;
                    count += 1;
                }
            }

            let out_idx = ((y as u32 * width + x as u32) * 4) as usize;
            out[out_idx] = (r / count) as u8;
            out[out_idx + 1] = (g / count) as u8;
            out[out_idx + 2] = (b / count) as u8;
            out[out_idx + 3] = (a / count) as u8;
        }
    }

    Ok(out)
}

pub fn edge_detect(data: &[u8], width: u32, height: u32) -> Result<Vec<u8>, String> {
    let len = validate_rgba(data, width, height)?;
    let gray = grayscale(data, width, height)?;
    let mut out = vec![0_u8; len];
    if width < 3 || height < 3 {
        return Ok(gray);
    }

    let gx: [[i32; 3]; 3] = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]];
    let gy: [[i32; 3]; 3] = [[-1, -2, -1], [0, 0, 0], [1, 2, 1]];

    for y in 1..height - 1 {
        for x in 1..width - 1 {
            let mut sum_x = 0_i32;
            let mut sum_y = 0_i32;
            for ky in 0..3 {
                for kx in 0..3 {
                    let px = x + kx - 1;
                    let py = y + ky - 1;
                    let idx = ((py * width + px) * 4) as usize;
                    let value = gray[idx] as i32;
                    sum_x += value * gx[ky as usize][kx as usize];
                    sum_y += value * gy[ky as usize][kx as usize];
                }
            }
            let magnitude = (((sum_x * sum_x + sum_y * sum_y) as f64).sqrt()).min(255.0) as u8;
            let idx = ((y * width + x) * 4) as usize;
            out[idx] = magnitude;
            out[idx + 1] = magnitude;
            out[idx + 2] = magnitude;
            out[idx + 3] = data[idx + 3];
        }
    }

    Ok(out)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn grayscale_preserves_alpha_and_length() {
        let rgba = vec![255, 0, 0, 200, 0, 255, 0, 128];
        let out = grayscale(&rgba, 2, 1).unwrap();
        assert_eq!(out.len(), rgba.len());
        assert_eq!(out[3], 200);
        assert_eq!(out[7], 128);
        assert_eq!(out[0], out[1]);
        assert_eq!(out[1], out[2]);
    }

    #[test]
    fn blur_radius_zero_returns_input() {
        let rgba = vec![10, 20, 30, 255];
        assert_eq!(box_blur(&rgba, 1, 1, 0).unwrap(), rgba);
    }

    #[test]
    fn invalid_buffer_is_rejected() {
        let err = grayscale(&[0, 1, 2], 1, 1).unwrap_err();
        assert!(err.contains("Expected 4"));
    }
}

