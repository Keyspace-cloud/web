import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { VaultItem, ItemType } from '../../types'
import type { RootState } from '..'

interface vaultStoreState {
    items: Array<VaultItem>,
}

const initialState: vaultStoreState = {
    items: [],
}

export const vaultSlice = createSlice({
    name: 'vault',
    initialState,
    reducers: {
      populateVault: (state, action: PayloadAction<Array<VaultItem>>) => {
        console.log(action.payload)
        state.items = action.payload
      },
      addItem: (state, action: PayloadAction<VaultItem>) => {
        state.items = state.items.concat(action.payload)
      },
      editItem: (state, action: PayloadAction<VaultItem>) => {
        const noteIndex = state.items.findIndex(item => item.id === action.payload.id)
        state.items[noteIndex] = action.payload
      },
      removeItem: (state, action: PayloadAction<VaultItem>) => {
        state.items = state.items.filter(item => item.id !== action.payload.id)
      },
      
    },
  })


export const { addItem, editItem, removeItem, populateVault } = vaultSlice.actions

export const notes = (state: RootState) => state.vault.items.filter(item => item.type === ItemType.Note)
export const logins = (state: RootState) => state.vault.items.filter(item => item.type === ItemType.Login)
export const cards = (state: RootState) => state.vault.items.filter(item => item.type === ItemType.PaymentCard)

export default vaultSlice.reducer