import { IconType } from 'react-icons/lib';

export interface KeyauthToken {
    expiry: Number,
    signedToken: string,
    tagline: string,
    token: string,
    version: string
}

export interface KeyrouteInitRequest {
    intent: string,
    token: string,
    publicKey: string
}

export interface SigningKeyPair {
    publicKey: string,
    privateKey: string
}

export interface KeyroutePayload {
    keyringData: string,
    signedToken: string,
    dhPublicKey: string,
    email: string
}

export interface LoginPayload {
    email: string,
    signed_token: string,
}

export interface KeyRing {
    privateKey: Uint8Array,
    publicKey: Uint8Array,
    symmetricKey: Uint8Array
}

export interface UserSession {
    email: string,
    keyring: KeyRing
}

export interface View {
    name: string,
    label: string,
    icon: IconType,
}

export interface CustomField {
    name: string
    value: string,
    hidden: boolean
}



export interface ArchivedPassword {
    password: string,
    created: EpochTimeStamp
}

export interface TOTP {
    secret: string,
    backupCodes: Array<string>
}

export enum ItemType {
    Note = 'note',
    Login = 'login',
    PaymentCard = 'card',
    Tag = 'tag'
}

export interface VaultItem {
    id: string,
    name?: string,
    type: ItemType
    customFields?: Array<CustomField>,
    tagId: string | null,
    organizationId: string | null
    frequencyAccessed: number
    dateCreated: number
    dateModified: number
    favorite: boolean
    color?: string | null
}

export interface LoginItem extends VaultItem {
    loginData: {
        email: string,
        username: string,
        password: string,
        passwordHistory: Array<ArchivedPassword>
        totp: TOTP | null
        siteUrls: Array<string> | null
    }
    notes: string,
    iconFile: string | null
}

export interface PaymentCard extends VaultItem {
    pin: string,
    cardNumber: string,
    cardholderName: string,
    expiry: string,
    securityCode: string,
    notes: string,
    rfid: boolean
    iconFile: string | null
}

export interface SecureNote extends VaultItem {
    notes: string,

}

export interface Tag extends VaultItem {
    id: string
    name: string,

}

export interface ActiveTag {
    tagId: string
    itemsTagged: number
}
