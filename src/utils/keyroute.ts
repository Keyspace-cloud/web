import { getKeyauthToken } from './api';
import { KeyRing, KeyroutePayload, LoginPayload, UserSession, KeyauthToken } from '../types'
import { decrypt, sessionKeys, hex2buf, signMessage } from './crypto'
import { KeyPair } from 'libsodium-wrappers';
import { postData } from './fetch'

//fetches a keyauth token and transforms it into a valid keyroute id
export const getRouteId = async (token: KeyauthToken) => {
  //encode utf8, base64, url, urlencode
  const url = btoa(unescape(encodeURIComponent(JSON.stringify(token))))
  return url
}

//parses and verifies the keyroute authentication payload
export const keyreouteLogin = async (payload: KeyroutePayload, keypair: KeyPair): Promise<UserSession> => {

  const decryptionKeys = await sessionKeys(keypair as KeyPair, hex2buf(payload.dhPublicKey))
  const decryptedKeyringData = await decrypt(hex2buf(payload.keyringData), decryptionKeys.sharedRx, true)
  const userKeyring: KeyRing = {
    privateKey: hex2buf(JSON.parse(atob(decryptedKeyringData)).privateKey),
    publicKey: hex2buf(JSON.parse(atob(decryptedKeyringData)).publicKey),
    symmetricKey: hex2buf(JSON.parse(atob(decryptedKeyringData)).symmetricKey)
  }

  let session = {} as UserSession

  return new Promise((resolve, reject) => {
    session = {
      email: payload.email,
      keyring: {
        privateKey: userKeyring.privateKey,
        publicKey: userKeyring.publicKey,
        symmetricKey: userKeyring.symmetricKey
      }
    }
    resolve(session)
  })

}
