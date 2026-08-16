use anyhow::{anyhow, Result};
use chacha20poly1305::{
    aead::{Aead, KeyInit},
    ChaCha20Poly1305, Key, Nonce,
};
use hkdf::Hkdf;
use sha2::Sha256;

const INITIALIZATION_CONTEXT: &[u8] = b"whispernet-ratchet-init-v1";
const MESSAGE_CONTEXT: &[u8] = b"whispernet-message-key-v1";
const ROOT_KEY_BYTES: usize = 32;
const CHAIN_KEY_BYTES: usize = 32;
const MESSAGE_KEY_BYTES: usize = 32;
const NONCE_BYTES: usize = 12;
const INITIALIZATION_BYTES: usize = ROOT_KEY_BYTES + (CHAIN_KEY_BYTES * 2);
const MESSAGE_MATERIAL_BYTES: usize = CHAIN_KEY_BYTES + MESSAGE_KEY_BYTES + NONCE_BYTES;

/// Symmetric send/receive state derived from a shared secret.
///
/// Each call consumes a chain key, yielding a fresh message key and nonce. The
/// corresponding peer must be initialized with the opposite role for its
/// receive chain to match this state’s send chain.
pub struct RatchetState {
    pub root_key: [u8; ROOT_KEY_BYTES],
    pub send_chain_key: [u8; CHAIN_KEY_BYTES],
    pub recv_chain_key: [u8; CHAIN_KEY_BYTES],
}

impl RatchetState {
    /// Creates the initiator side of a paired ratchet. This remains the default
    /// constructor for compatibility; peers must use [`Self::new_responder`].
    pub fn new(shared_secret: &[u8; ROOT_KEY_BYTES]) -> Self {
        Self::new_initiator(shared_secret)
    }

    pub fn new_initiator(shared_secret: &[u8; ROOT_KEY_BYTES]) -> Self {
        let (root_key, initiator_chain, responder_chain) =
            Self::derive_initial_state(shared_secret);
        Self {
            root_key,
            send_chain_key: initiator_chain,
            recv_chain_key: responder_chain,
        }
    }

    pub fn new_responder(shared_secret: &[u8; ROOT_KEY_BYTES]) -> Self {
        let (root_key, initiator_chain, responder_chain) =
            Self::derive_initial_state(shared_secret);
        Self {
            root_key,
            send_chain_key: responder_chain,
            recv_chain_key: initiator_chain,
        }
    }

    fn derive_initial_state(
        shared_secret: &[u8; ROOT_KEY_BYTES],
    ) -> (
        [u8; ROOT_KEY_BYTES],
        [u8; CHAIN_KEY_BYTES],
        [u8; CHAIN_KEY_BYTES],
    ) {
        let hk = Hkdf::<Sha256>::new(None, shared_secret);
        let mut material = [0u8; INITIALIZATION_BYTES];
        hk.expand(INITIALIZATION_CONTEXT, &mut material)
            .expect("fixed-size HKDF expansion cannot fail");

        let mut root_key = [0u8; ROOT_KEY_BYTES];
        let mut initiator_chain = [0u8; CHAIN_KEY_BYTES];
        let mut responder_chain = [0u8; CHAIN_KEY_BYTES];
        root_key.copy_from_slice(&material[..ROOT_KEY_BYTES]);
        initiator_chain
            .copy_from_slice(&material[ROOT_KEY_BYTES..ROOT_KEY_BYTES + CHAIN_KEY_BYTES]);
        responder_chain.copy_from_slice(&material[ROOT_KEY_BYTES + CHAIN_KEY_BYTES..]);
        (root_key, initiator_chain, responder_chain)
    }

    fn advance_chain(
        chain_key: &mut [u8; CHAIN_KEY_BYTES],
    ) -> ([u8; MESSAGE_KEY_BYTES], [u8; NONCE_BYTES]) {
        let hk = Hkdf::<Sha256>::new(None, chain_key);
        let mut material = [0u8; MESSAGE_MATERIAL_BYTES];
        hk.expand(MESSAGE_CONTEXT, &mut material)
            .expect("fixed-size HKDF expansion cannot fail");

        let mut next_chain_key = [0u8; CHAIN_KEY_BYTES];
        let mut message_key = [0u8; MESSAGE_KEY_BYTES];
        let mut nonce = [0u8; NONCE_BYTES];
        next_chain_key.copy_from_slice(&material[..CHAIN_KEY_BYTES]);
        message_key
            .copy_from_slice(&material[CHAIN_KEY_BYTES..CHAIN_KEY_BYTES + MESSAGE_KEY_BYTES]);
        nonce.copy_from_slice(&material[CHAIN_KEY_BYTES + MESSAGE_KEY_BYTES..]);
        *chain_key = next_chain_key;
        (message_key, nonce)
    }

    /// Encrypts one message with a fresh message key and nonce derived from the send chain.
    pub fn encrypt_message(&mut self, plaintext: &[u8]) -> Result<Vec<u8>> {
        let (message_key, nonce) = Self::advance_chain(&mut self.send_chain_key);
        let key = Key::from(message_key);
        let nonce = Nonce::from(nonce);
        let cipher = ChaCha20Poly1305::new(&key);
        cipher
            .encrypt(&nonce, plaintext)
            .map_err(|error| anyhow!("message encryption failed: {error}"))
    }

    /// Authenticates and decrypts one message using the receive chain.
    pub fn decrypt_message(&mut self, ciphertext: &[u8]) -> Result<Vec<u8>> {
        let (message_key, nonce) = Self::advance_chain(&mut self.recv_chain_key);
        let key = Key::from(message_key);
        let nonce = Nonce::from(nonce);
        let cipher = ChaCha20Poly1305::new(&key);
        cipher
            .decrypt(&nonce, ciphertext)
            .map_err(|error| anyhow!("message authentication or decryption failed: {error}"))
    }
}

#[cfg(test)]
mod tests {
    use super::RatchetState;

    #[test]
    fn paired_peers_exchange_multiple_authenticated_messages() {
        let shared_secret = [7u8; 32];
        let mut initiator = RatchetState::new_initiator(&shared_secret);
        let mut responder = RatchetState::new_responder(&shared_secret);

        let first = initiator
            .encrypt_message(b"first message")
            .expect("encryption should succeed");
        let second = initiator
            .encrypt_message(b"second message")
            .expect("encryption should succeed");

        assert_ne!(first, second);
        assert_eq!(
            responder
                .decrypt_message(&first)
                .expect("first message should decrypt"),
            b"first message"
        );
        assert_eq!(
            responder
                .decrypt_message(&second)
                .expect("second message should decrypt"),
            b"second message"
        );
    }

    #[test]
    fn altered_ciphertext_is_rejected() {
        let shared_secret = [9u8; 32];
        let mut initiator = RatchetState::new_initiator(&shared_secret);
        let mut responder = RatchetState::new_responder(&shared_secret);
        let mut ciphertext = initiator
            .encrypt_message(b"authenticated")
            .expect("encryption should succeed");
        ciphertext[0] ^= 0x01;

        assert!(responder.decrypt_message(&ciphertext).is_err());
    }
}
