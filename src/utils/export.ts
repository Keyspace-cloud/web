import { ServerVaultItem } from "../services/api";
import { LoginItem, SecureNote, PaymentCard } from "../types";

type BitwardenCipherType = 1 | 2 | 3 | 4; // 1: Login, 2: Secure Note, 3: Card, 4: Identity

interface BitwardenItem {
    id?: string; // Optional, generated by Bitwarden if missing
    type: BitwardenCipherType;
    name: string;
    notes?: string;
    login?: {
        username?: string;
        password?: string;
        uris?: Array<{ uri: string; match?: number }>;
        totp?: string;
    };
    card?: {
        brand?: string; // Optional, e.g., "Visa" or "MasterCard"
        cardholderName?: string;
        number?: string;
        expMonth?: string;
        expYear?: string;
        code?: string;
    };
    favorite: boolean;
}

export function convertToBitwarden(serverItems: ServerVaultItem[]): { items: any[] } {
    
    const STRING_SIZE_LIMIT = 7000 // Size Limit for strings since the bitwarden encrypted value is limited to 10,000 characters
    
    const items = serverItems.map(({ data }) => {
        const baseItem: any = {
            type: 0, // Default to 0, which is invalid, in case of unknown type
            name: data.name || 'Keyspace Item',
        };

        switch (data.type) {
            case 'login':
                const loginData = (data as LoginItem).loginData;
                baseItem.type = 1; // Cipher type for Login
                baseItem.login = {
                    username: loginData.username || undefined,
                    password: loginData.password,
                    uris: loginData.siteUrls?.map(url => ({ uri: url })) || undefined,
                };
                break;

            case 'note':
                baseItem.name = 'Keyspace note'
                baseItem.type = 2; // Cipher type for Secure Note
                baseItem.secureNote = {};
                baseItem.notes = (data as SecureNote).notes.slice(0, STRING_SIZE_LIMIT); 
                break;

            case 'card':
                const cardData = data as PaymentCard;
                const [expMonth, expYear] = cardData.expiry.split('/');
                baseItem.type = 3; // Cipher type for Card
                baseItem.card = {
                    cardholderName: cardData.cardholderName,
                    number: cardData.cardNumber,
                    expMonth: expMonth,
                    expYear: `20${expYear}`, // Assuming YY format, prepend '20'
                    code: cardData.securityCode,
                };
                baseItem.notes = cardData.notes.slice(0, STRING_SIZE_LIMIT);
                break;

            default:
                console.warn(`Unsupported item type: ${data.type}`);
        }

        return baseItem;
    });

    // Filter out unsupported types (type: 0)
    const filteredItems = items.filter(item => item.type !== 0);

    return { items: filteredItems };
}


export function downloadFile(data: any, filename: string, type: string) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url); // Clean up the URL object
    }