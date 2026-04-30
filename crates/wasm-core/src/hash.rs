use base64::{Engine as _, engine::general_purpose};
use pbkdf2::pbkdf2_hmac;
use sha2::Sha256;

const ITERATIONS: u32 = 120_000;

pub fn hash_password(password: &str, salt: &str) -> Result<String, String> {
    if password.is_empty() {
        return Err("Password cannot be empty".to_string());
    }
    if salt.len() < 8 {
        return Err("Salt must contain at least 8 characters".to_string());
    }

    let mut output = [0_u8; 32];
    pbkdf2_hmac::<Sha256>(password.as_bytes(), salt.as_bytes(), ITERATIONS, &mut output);
    let encoded = general_purpose::STANDARD_NO_PAD.encode(output);
    Ok(format!("pbkdf2-sha256${ITERATIONS}${salt}${encoded}"))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn hash_is_deterministic_for_same_input() {
        let first = hash_password("correct horse battery staple", "demo-salt-123").unwrap();
        let second = hash_password("correct horse battery staple", "demo-salt-123").unwrap();
        assert_eq!(first, second);
        assert!(first.starts_with("pbkdf2-sha256$"));
    }

    #[test]
    fn empty_password_is_rejected() {
        assert!(hash_password("", "demo-salt-123").is_err());
    }
}

