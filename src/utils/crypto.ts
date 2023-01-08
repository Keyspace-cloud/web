import { KeyPair } from 'libsodium-wrappers'
import { encode, decode } from 'js-base64'
const _sodium = require('libsodium-wrappers')

export const buf2hex = (buffer: Uint8Array) => {
    // buffer is an ArrayBuffer
    return Array.prototype.map
        .call(new Uint8Array(buffer), (n) => n.toString(16).padStart(2, '0'))
        .join('')
}

export const hex2buf = (hex: string) => {
    return Uint8Array.from(Buffer.from(hex, 'hex'))
}

// returns an random key exchange keypair
export const randomKeyPair = async (as_hex: boolean = false) => {
    await _sodium.ready
    const sodium = _sodium
    const keypair = await sodium.crypto_kx_keypair()

    return keypair
}

//carries out diffie-hellman key exchange and returns a pair of symmetric encryption keys
export const sessionKeys = async (
    pluginKeyPair: KeyPair,
    clientPubKey: Uint8Array
) => {
    await _sodium.ready
    const sodium = _sodium

    const keys = await sodium.crypto_kx_server_session_keys(
        pluginKeyPair.publicKey,
        pluginKeyPair.privateKey,
        clientPubKey
    )
    return keys
}

//carries out diffie-hellman key exchange and returns a pair of symmetric encryption keys
export const clientSessionKeys = async (
    keypair: KeyPair,
    serverPubKey: Uint8Array
) => {
    await _sodium.ready
    const sodium = _sodium
    const keys = await sodium.crypto_kx_client_session_keys(
        keypair.publicKey,
        keypair.privateKey,
        serverPubKey
    )

    return keys
}

//XChaCha20-Poly1305 encrypt
//returns the ciphertext + nonce
export const encrypt = async (plaintext: String, key: Uint8Array) => {
    await _sodium.ready
    const sodium = _sodium

    let nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES)
    let ciphertext3 = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
        plaintext,
        null,
        null,
        nonce,
        key
    )
    return new Uint8Array([...ciphertext3, ...nonce])
}

//XChaCha20-Poly1305 decrypt
//returns the plaintext as bytes or string
export const decrypt = async (
    encryptedMessage: Uint8Array,
    key: Uint8Array,
    as_string: boolean = false
) => {
    await _sodium.ready
    const sodium = _sodium

    const messageLen = encryptedMessage.length - 24
    const nonce = encryptedMessage.slice(messageLen)
    const ciphertext = encryptedMessage.slice(0, messageLen)

    const plaintext = sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
        null,
        ciphertext,
        null,
        nonce,
        key
    )

    return as_string ? sodium.to_string(plaintext) : plaintext
}

/**
 * Encrypts a single string with the given key. Returns the ciphertext as a hex string
 *
 * @param {string} plaintext - Plaintext string to encrypt
 * @param {Uint8Array} key - Symmetric encryption key
 * @returns {string}
 */
export const encryptString = async (plaintext: string, key: Uint8Array) => {
    await _sodium.ready
    const sodium = _sodium

    return sodium.to_hex(
        await encrypt(sodium.from_string(encode(plaintext)), key)
    )
}

/**
 * Decrypts a single hex ciphertext string with the given key. Returns the plaintext as a string
 *
 * @param cipherText - Hex string ciphertext with appended nonce
 * @param key - Symmetric encryption key
 * @returns {string}
 */
export const decryptString = async (cipherText: string, key: Uint8Array) => {
    await _sodium.ready
    const sodium = _sodium

    return decode(
        sodium.to_string(await decrypt(sodium.from_hex(cipherText), key))
    )
}

//compute edDSA message signature (combined mode)
export const signMessage = async (message: string, key: Uint8Array) => {
    await _sodium.ready
    const sodium = _sodium

    const signedMessage = await sodium.crypto_sign(message, key)
    return signedMessage
}

//verify edDSA message signature
export const verifySignature = async (
    signature: Uint8Array,
    key: Uint8Array
) => {
    await _sodium.ready
    const sodium = _sodium

    const verified = await sodium.crypto_sign_open(signature, key)
    return verified
}
