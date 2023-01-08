import React from 'react'
import { PaymentCard, LoginItem, SecureNote } from '../types'

interface VaultData {
    logins: Array<LoginItem>,
    cards: Array<PaymentCard>,
    notes: Array<SecureNote>
}

export const VaultContext = React.createContext({
    data: {} as VaultData | null,        
    addItem: (item: LoginItem | PaymentCard | SecureNote) => {},
    deleteItem: () => {},
    editItem: () => {}
});
