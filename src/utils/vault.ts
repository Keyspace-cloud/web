import { ServerVaultItem } from '../services/api'
import {
    ActiveTag,
    ArchivedPassword,
    CustomField,
    ItemType,
    LoginItem,
    PaymentCard,
    SecureNote,
    Tag,
    TOTP,
    VaultItem,
} from '../types'
import { decryptString, encryptString } from './crypto'
import icons from '../icons/icons.json'

export const iconGrabber = (service: string, fallback: string = 'keyspace') => {
    const iconName = icons.find((icon) => {
        if (icon === service.toLowerCase()) return true
        else if (service.toLowerCase().split(' ').includes(icon)) return true
        else return false
    })

    return {
        name: iconName || fallback,
    }
}

/**
 * Decrypts a Tag
 *
 * @param {Tag} encryptedTag
 * @param {Uint8Array} decryptionKey
 * @returns {Tag}
 */
export const decryptTag = async (
    encryptedTag: Tag,
    decryptionKey: Uint8Array
) => {
    let decryptedTag = {} as SecureNote
    Object.assign(decryptedTag, encryptedTag)
    decryptedTag.name = await decryptString(encryptedTag.name, decryptionKey)

    if (encryptedTag.color)
        decryptedTag.color = await decryptString(
            encryptedTag.color,
            decryptionKey
        )

    return decryptedTag
}

/**
 * Decrypts a SecureNote
 *
 * @param {SecureNote} encryptedNote
 * @param {Uint8Array} decryptionKey
 * @returns {SecureNote}
 */
export const decryptNote = async (
    encryptedNote: SecureNote,
    decryptionKey: Uint8Array
) => {
    let decryptedNote = {} as SecureNote
    Object.assign(decryptedNote, encryptedNote)
    decryptedNote.notes = await decryptString(
        encryptedNote.notes,
        decryptionKey
    )

    if (encryptedNote.color)
        decryptedNote.color = await decryptString(
            encryptedNote.color,
            decryptionKey
        )

    return decryptedNote
}

/**
 * Decrypts a LoginItem
 *
 * @param {LoginItem} encryptedLogin
 * @param {Uint8Array} decryptionKey
 * @returns {LoginItem}
 */
export const decryptLogin = async (
    encryptedLogin: LoginItem,
    decryptionKey: Uint8Array
) => {
    let decryptedLogin = {} as LoginItem
    Object.assign(decryptedLogin, encryptedLogin)
    if (encryptedLogin.name)
        decryptedLogin.name = await decryptString(
            encryptedLogin.name,
            decryptionKey
        )
    if (encryptedLogin.loginData.username)
        decryptedLogin.loginData.username = await decryptString(
            encryptedLogin.loginData.username,
            decryptionKey
        )

    decryptedLogin.loginData.email = await decryptString(
        encryptedLogin.loginData.email,
        decryptionKey
    )

    decryptedLogin.loginData.password = await decryptString(
        encryptedLogin.loginData.password,
        decryptionKey
    )

    decryptedLogin.loginData.passwordHistory = await Promise.all(
        encryptedLogin.loginData.passwordHistory.map(async (archivedItem) => {
            return {
                password: await decryptString(
                    archivedItem.password,
                    decryptionKey
                ),

                created: archivedItem.created,
            } as ArchivedPassword
        })
    )

    decryptedLogin.loginData.totp = encryptedLogin.loginData.totp
        ? ({
              secret: await decryptString(
                  encryptedLogin.loginData.totp.secret,
                  decryptionKey
              ),

              backupCodes: await Promise.all(
                  encryptedLogin.loginData.totp.backupCodes.map(
                      async (code) => await decryptString(code, decryptionKey)
                  )
              ),
          } as TOTP)
        : null

    decryptedLogin.loginData.siteUrls = encryptedLogin.loginData.siteUrls
        ? await Promise.all(
              encryptedLogin.loginData.siteUrls.map(
                  async (url) => await decryptString(url, decryptionKey)
              )
          )
        : null

    if (encryptedLogin.notes)
        decryptedLogin.notes = await await decryptString(
            encryptedLogin.notes,
            decryptionKey
        )
    if (encryptedLogin.iconFile)
        decryptedLogin.iconFile = await await decryptString(
            encryptedLogin.iconFile,
            decryptionKey
        )

    decryptedLogin.customFields = await Promise.all(
        encryptedLogin.customFields!.map(async (customField) => {
            return {
                name: await decryptString(customField.name, decryptionKey),
                value: await decryptString(customField.value, decryptionKey),
                hidden: customField.hidden,
            } as CustomField
        })
    )

    return decryptedLogin
}

/**
 * Decrypts a PaymentCard
 *
 * @param {PaymentCard} encryptedCard
 * @param {Uint8Array} decryptionKey
 * @returns {PaymentCard}
 */
export const decryptPaymentCard = async (
    encryptedCard: PaymentCard,
    decryptionKey: Uint8Array
) => {
    const encryptedFields = [
        'pin',
        'name',
        'color',
        'iconFile',
        'notes',
        'expiry',
        'cardNumber',
        'securityCode',
        'cardholderName',
    ]
    let decryptedCard = {} as PaymentCard
    Object.assign(decryptedCard, encryptedCard)
    for (const [k, v] of Object.entries(encryptedCard)) {
        if (v && encryptedFields.includes(k)) {
            decryptedCard = {
                ...decryptedCard,
                ...{
                    [k]: await decryptString(v, decryptionKey),
                },
            }
        }
    }

    decryptedCard.customFields = await Promise.all(
        decryptedCard.customFields!.map(async (customField) => {
            return {
                name: await decryptString(customField.name, decryptionKey),
                value: await decryptString(customField.value, decryptionKey),
                hidden: customField.hidden,
            } as CustomField
        })
    )

    return decryptedCard
}

/**
 * Encrypts a Tag
 *
 * @param {Tag} tag
 * @param {Uint8Array} encryptionKey
 * @returns {Tag}
 */
export const encryptTag = async (tag: Tag, encryptionKey: Uint8Array) => {
    let encryptedTag = {} as SecureNote
    Object.assign(encryptedTag, tag)
    encryptedTag.name = await encryptString(tag.name, encryptionKey)
    if (tag.color)
        encryptedTag.color = await encryptString(tag.color, encryptionKey)

    return encryptedTag
}

/**
 * Encrypts a SecureNote
 *
 * @param {SecureNote} note
 * @param {Uint8Array} encryptionKey
 * @returns {SecureNote}
 */
export const encryptNote = async (
    note: SecureNote,
    encryptionKey: Uint8Array
) => {
    let encryptedNote = {} as SecureNote
    Object.assign(encryptedNote, note)
    encryptedNote.notes = await encryptString(note.notes, encryptionKey)

    if (note.color)
        encryptedNote.color = await encryptString(note.color, encryptionKey)

    return encryptedNote
}

/**
 * Encrypts a LoginItem
 *
 * @param {LoginItem} loginItem
 * @param {Uint8Array} encryptionKey
 * @returns {LoginItem}
 */
export const encryptLogin = async (
    loginItem: LoginItem,
    encryptionKey: Uint8Array
) => {
    let encryptedLogin = {} as LoginItem
    Object.assign(encryptedLogin, loginItem)
    if (loginItem.name)
        encryptedLogin.name = await encryptString(loginItem.name, encryptionKey)

    if (loginItem.loginData.username)
        encryptedLogin.loginData.username = await encryptString(
            loginItem.loginData.username,
            encryptionKey
        )

    encryptedLogin.loginData.email = await encryptString(
        loginItem.loginData.email,
        encryptionKey
    )

    encryptedLogin.loginData.password = await encryptString(
        loginItem.loginData.password,
        encryptionKey
    )

    encryptedLogin.loginData.passwordHistory = await Promise.all(
        loginItem.loginData.passwordHistory.map(async (archivedItem) => {
            return {
                password: await encryptString(
                    archivedItem.password,
                    encryptionKey
                ),
                created: archivedItem.created,
            } as ArchivedPassword
        })
    )

    if (loginItem.loginData.siteUrls) {
        encryptedLogin.loginData.siteUrls = await Promise.all(
            loginItem.loginData.siteUrls.map(
                async (url) => await encryptString(url, encryptionKey)
            )
        )
    }

    encryptedLogin.loginData.totp = loginItem.loginData.totp
        ? ({
              secret: await encryptString(
                  loginItem.loginData.totp.secret,
                  encryptionKey
              ),
              backupCodes: await Promise.all(
                  loginItem.loginData.totp.backupCodes.map(
                      async (code) => await encryptString(code, encryptionKey)
                  )
              ),
          } as TOTP)
        : null

    if (loginItem.notes !== null)
        encryptedLogin.notes = await encryptString(
            loginItem.notes,
            encryptionKey
        )

    if (loginItem.iconFile && loginItem.iconFile !== null)
        encryptedLogin.iconFile = await encryptString(
            loginItem.iconFile,
            encryptionKey
        )

    if (loginItem.customFields)
        encryptedLogin.customFields = await Promise.all(
            loginItem.customFields.map(async (customField) => {
                return {
                    name: await encryptString(customField.name, encryptionKey),
                    value: await encryptString(
                        customField.value,
                        encryptionKey
                    ),
                    hidden: customField.hidden,
                } as CustomField
            })
        )

    return encryptedLogin
}

/**
 * Encrypts a PaymentCard
 *
 * @param {PaymentCard} cardItem
 * @param {Uint8Array} encryptionKey
 * @returns {PaymentCard}
 */
export const encryptPaymentCard = async (
    cardItem: PaymentCard,
    encryptionKey: Uint8Array
) => {
    const fieldsToEncrypt = [
        'name',
        'color',
        'notes',
        'iconFile',
        'expiry',
        'cardNumber',
        'securityCode',
        'cardholderName',
    ]

    let encryptedCard = {} as PaymentCard

    Object.assign(encryptedCard, cardItem)

    for (const [k, v] of Object.entries(cardItem)) {
        if (v && fieldsToEncrypt.includes(k)) {
            encryptedCard = {
                ...encryptedCard,
                ...{
                    [k]: await encryptString(v, encryptionKey),
                },
            }
        }
    }

    if (encryptedCard.customFields)
        encryptedCard.customFields = await Promise.all(
            encryptedCard.customFields.map(async (customField) => {
                return {
                    name: await encryptString(customField.name, encryptionKey),
                    value: await encryptString(
                        customField.value,
                        encryptionKey
                    ),
                    hidden: customField.hidden,
                } as CustomField
            })
        )

    encryptedCard.pin = await encryptString(cardItem.pin, encryptionKey)

    return encryptedCard
}

/**
 * Decrypts a `ServerVaultItem`
 *
 * @param {VaultItem} encryptedItem
 * @param {Uint8Array} decryptionKey
 * @returns {VaultItem}
 */
export const decryptItem = async (
    encryptedItem: ServerVaultItem,
    decryptionKey: Uint8Array
) => {
    let decryptedItem = {} as VaultItem

    if (encryptedItem.data.type === ItemType.Note)
        Object.assign(
            decryptedItem,
            await decryptNote(encryptedItem.data as SecureNote, decryptionKey)
        )
    else if (encryptedItem.data.type === ItemType.Login)
        Object.assign(
            decryptedItem,
            await decryptLogin(encryptedItem.data as LoginItem, decryptionKey)
        )
    else if (encryptedItem.data.type === ItemType.PaymentCard)
        Object.assign(
            decryptedItem,
            await decryptPaymentCard(
                encryptedItem.data as PaymentCard,
                decryptionKey
            )
        )
    else if (encryptedItem.data.type === ItemType.Tag)
        Object.assign(
            decryptedItem,
            await decryptTag(encryptedItem.data as Tag, decryptionKey)
        )

    return {
        id: encryptedItem.id,
        vault: encryptedItem.vault,
        data: decryptedItem,
    }
}

/**
 * Encrypts a `VaultItem`
 *
 * @param {VaultItem} vaultItem
 * @param {Uint8Array} encryptionKey
 * @returns {VaultItem}
 */
export const encryptItem = async (
    vaultItem: ServerVaultItem,
    encryptionKey: Uint8Array
) => {
    let encryptedItem = {} as VaultItem

    if (vaultItem.data.type === ItemType.Note)
        Object.assign(
            encryptedItem,
            await encryptNote(vaultItem.data as SecureNote, encryptionKey)
        )
    else if (vaultItem.data.type === ItemType.Login)
        Object.assign(
            encryptedItem,
            await encryptLogin(vaultItem.data as LoginItem, encryptionKey)
        )
    else if (vaultItem.data.type === ItemType.PaymentCard)
        Object.assign(
            encryptedItem,
            await encryptPaymentCard(
                vaultItem.data as PaymentCard,
                encryptionKey
            )
        )
    else if (vaultItem.data.type === ItemType.Tag)
        Object.assign(
            encryptedItem,
            await encryptTag(vaultItem.data as Tag, encryptionKey)
        )

    return {
        id: vaultItem.id,
        vault: vaultItem.vault,
        data: encryptedItem,
    }
}

/**
 * Returns VaultItems of a specific type given the ServerVaultItem list
 *
 * @param {Array<ServerVaultItem>} data //the decrypted vault data
 * @param {ItemType | undefined} itemType //the type of vault item to filter
 * @returns
 */
export const resolveItems = (
    data: Array<ServerVaultItem>,
    itemType: ItemType | undefined
) => {
    return data
        .map((item) => {
            return item.data
        })
        .filter((vaultItem) => (itemType ? vaultItem.type === itemType : true))
}

/**
 * Determines which tags are in use and how many items they are tagged against
 *
 * @param data //decrypted vault data
 * @returns {Array<ActiveTag>}
 */
export const getActiveTags = (data: Array<ServerVaultItem>) => {
    let activeTags = [] as Array<ActiveTag>

    data.forEach((item) => {
        const index = activeTags.findIndex(
            (activeTag) => activeTag.tagId === item.data.tagId
        )
        if (index === -1 && item.data.tagId)
            activeTags.push({
                tagId: item.data.tagId,
                itemsTagged: 1,
            })
        else if (index >= 0) {
            activeTags[index].itemsTagged += 1
        }
    })

    return activeTags
}

/**
 * Returns the current unix time in ms
 *
 * @returns {number}
 */
export const getCurrentTimestamp = () => {
    return Math.floor(Date.now() / 1000)
}

/**
 * Returns the given unix time as a human readable string
 *
 * @param {string} timestamp
 * @returns {string}
 */
export const getFormattedDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000)
    return `${date.toDateString()} ${date.toTimeString()}`
}

/**
 * Set of regexes to detect the type of payment card
 * Returns Mastercard if no pattern matches are found
 *
 * @param {string} cardNumber
 * @returns {Object}
 */
export const detectCardType = (cardNumber: string) => {
    const cardTypes = [
        {
            name: 'visa electron',
            regex: /^(4026|417500|4405|4508|4844|4913|4917)\d+$/,
            icon: iconGrabber('Visa'),
        },
        {
            name: 'visa',
            regex: /^4[0-9]{12}(?:[0-9]{3})?$/,
            icon: iconGrabber('Visa'),
        },
        {
            name: 'mastercard',
            regex: /^5[1-5][0-9]{14}$/,
            icon: iconGrabber('Mastercard'),
        },
        {
            name: 'american express',
            regex: /^3[47]\d{13,14}$/,
            icon: iconGrabber('AmericanExpress'),
        },
        {
            name: 'discover',
            regex: /^6(?:011|5[0-9]{2})[0-9]{12}$/,
            icon: iconGrabber('Discover'),
        },
        {
            name: 'jcb',
            regex: /^(?:2131|1800|35\d{3})\d{11}$/,
            icon: iconGrabber('JCB'),
        },
    ]

    for (let key in cardTypes) {
        if (cardTypes[key].regex.test(cardNumber)) {
            return cardTypes[key]
        }
    }
    return cardTypes.find((cardType) => cardType.name === 'mastercard')
}

/**
 * Formats the card number into 4 number blocks
 *
 * @param {string} value
 * @returns {string}
 */
export const formattedCardNumber = (value: string) => {
    let v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    let matches = v.match(/\d{4,19}/g)
    let match = (matches && matches[0]) || ''
    let parts = []

    for (let i = 0, len = match.length; i < len; i += 4) {
        parts.push(match.substring(i, i + 4))
    }

    if (parts.length) {
        return parts.join(' ')
    } else {
        return value
    }
}

/**
 * Transforms the given word to title case. Examples:
 * test => Test
 * teSt => Test
 * TEST => Test
 *
 * @param word
 * @returns
 */
export const toTitleCase = (word: string) =>
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()

/**
 * Returns the name of a site as its 'Second level domain' give a complete url
 *
 * @param url - Complete url string
 * @returns
 */
export const getSiteNameFromUrl = (rawUrl: string) => {
    const psl = require('psl')

    const url = new URL(rawUrl)
    const parsed = psl.parse(url.hostname)
    return parsed.sld
}

/**
 * Does a "fuzzy" search for a search query within a string. Converts the query into a regex to conduct the search
 *
 * @param {string} pattern - The search query pattern to search the target string for
 * @param {string} target - The target text within which to search
 * @returns
 */
export const fuzzyMatch = (pattern: string, target: string) => {
    pattern = '.*' + pattern.split('').join('.*') + '.*'
    const re = new RegExp(pattern.replace(/[\])}[{(]/g, ''))
    return re.test(target)
}
