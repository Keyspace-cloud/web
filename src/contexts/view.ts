import React from 'react'
import { View, VaultItem } from '../types'

export const ViewContext = React.createContext({
    view: {} as View,
    views: [] as Array<View>, 
    searchQuery: '',
    searchSuggestion: '',
    itemToEdit: {} as VaultItem | null, 
    formOpen: false,  
    switchView: (view: View) => {},
    setItemToEdit: (item: VaultItem | null) => {},
    setSearchQuery: (searchQuery: string) => {},
    setSearchSuggestion: (searchSuggestion: string) => {},
    setFormOpen: (open: boolean) => {}
});
