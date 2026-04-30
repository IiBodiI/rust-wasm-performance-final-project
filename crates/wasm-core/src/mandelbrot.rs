pub fn escape_time(cx: f64, cy: f64, max_iter: u32) -> u32 {
    let mut x = 0.0_f64;
    let mut y = 0.0_f64;
    let mut iteration = 0;

    while x * x + y * y <= 4.0 && iteration < max_iter {
        let x_next = x * x - y * y + cx;
        y = 2.0 * x * y + cy;
        x = x_next;
        iteration += 1;
    }

    iteration
}

pub fn render(
    width: u32,
    height: u32,
    max_iter: u32,
    zoom: f64,
    offset_x: f64,
    offset_y: f64,
) -> Result<Vec<u8>, String> {
    if width == 0 || height == 0 {
        return Err("Canvas dimensions must be greater than zero".to_string());
    }
    let pixel_count = width
        .checked_mul(height)
        .ok_or_else(|| "Mandelbrot dimensions are too large".to_string())?;
    let mut out = vec![0_u8; (pixel_count * 4) as usize];
    let scale = 3.2 / zoom.max(0.0001);
    let aspect = width as f64 / height as f64;

    for py in 0..height {
        for px in 0..width {
            let cx = (px as f64 / width as f64 - 0.5) * scale * aspect + offset_x;
            let cy = (py as f64 / height as f64 - 0.5) * scale + offset_y;
            let iter = escape_time(cx, cy, max_iter.max(1));
            let idx = ((py * width + px) * 4) as usize;

            if iter >= max_iter {
                out[idx] = 14;
                out[idx + 1] = 22;
                out[idx + 2] = 38;
            } else {
                let t = iter as f64 / max_iter as f64;
                out[idx] = (9.0 + 180.0 * t) as u8;
                out[idx + 1] = (80.0 + 145.0 * t.sqrt()) as u8;
                out[idx + 2] = (180.0 + 70.0 * (1.0 - t)) as u8;
            }
            out[idx + 3] = 255;
        }
    }

    Ok(out)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn origin_does_not_escape_quickly() {
        assert_eq!(escape_time(0.0, 0.0, 64), 64);
    }

    #[test]
    fn outside_point_escapes() {
        assert!(escape_time(2.0, 2.0, 64) < 4);
    }

    #[test]
    fn render_buffer_has_rgba_size() {
        let out = render(20, 10, 32, 1.0, -0.5, 0.0).unwrap();
        assert_eq!(out.len(), 20 * 10 * 4);
    }
}

