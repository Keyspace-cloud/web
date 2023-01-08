import { KeyRing } from '../types'
import { signMessage } from './crypto'
import { getData } from './fetch'
const _sodium = require('libsodium-wrappers');

interface AuthHeaders {
    'public-key': string
    'signed-token': string
}

export const getKeyauthToken = async () => {
    const response = await getData(`https://${process.env.REACT_APP_KEYAUTH_HOST}`, {})
    return response
}

/**
 * Fetches a keyauth token, signs it with the user public key and returns 
 * `publicKey` and `signedToken` for use as API authentication headers
 * 
 * @param {KeyRing} keyring - User keyring
 * @returns {AuthHeaders} 
 */
export const getAuthHeaders = async (keyring: KeyRing): Promise<AuthHeaders> => {
    await _sodium.ready;
    const sodium = _sodium;

    return new Promise((resolve, reject) => {
        getKeyauthToken()
            .then(keyAuthToken => {
                signMessage(JSON.stringify(keyAuthToken), keyring.privateKey).then(signedToken => resolve({
                    'public-key': sodium.to_hex(keyring.publicKey),
                    'signed-token': sodium.to_hex(signedToken)
                }))
            })
    })
}
