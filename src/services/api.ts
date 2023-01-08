import { createApi, fetchBaseQuery, retry } from '@reduxjs/toolkit/query/react'
import { RootState } from '../store'
import { VaultItem } from '../types'
import { getAuthHeaders } from '../utils/api'
import { decryptItem } from '../utils/vault'

export interface ServerVaultItem {
    id: string
    vault: number
    data: VaultItem
}

export interface MutationResponse {
    status: string
    message: string
}

type VaultItemsResponse = {
    data: Array<ServerVaultItem>
}

// Create our baseQuery instance
const baseQuery = fetchBaseQuery({
    baseUrl: `https://${process.env.REACT_APP_API_HOST}/`,
    prepareHeaders: async (headers, { getState }) => {
        const authHeaders = await getAuthHeaders((getState() as RootState).session.session.keyring)
        for (const [k, v] of Object.entries(authHeaders)) {
            headers.set(k, v)
        }
        return headers
    },
})

const baseQueryWithRetry = retry(baseQuery, { maxRetries: 6 })

/**
 * Create a base API to inject endpoints into elsewhere.
 * Components using this API should import from the injected site,
 * in order to get the appropriate types,
 * and to ensure that the file injecting the endpoints is loaded
 */
export const api = createApi({
    /**
     * `reducerPath` is optional and will not be required by most users.
     * This is useful if you have multiple API definitions,
     * e.g. where each has a different domain, with no interaction between endpoints.
     * Otherwise, a single API definition should be used in order to support tag invalidation,
     * among other features
     */
    // reducerPath: 'splitApi',
    /**
     * A bare bones base query would just be `baseQuery: fetchBaseQuery({ baseUrl: '/' })`
     */
    baseQuery: baseQueryWithRetry,
    /**
     * Tag types must be defined in the original API definition
     * for any tags that would be provided by injected endpoints
     */
    tagTypes: ['Vault'],
    endpoints: (build) => ({
        getVault: build.query<VaultItemsResponse, Uint8Array>({
            query: () => 'vaults/items?combined=true',
            transformResponse: async (
                response: VaultItemsResponse,
                meta: {},
                arg: Uint8Array
            ) => {
                const decryptionKey = arg

                let decryptedItems = [] as Array<ServerVaultItem>
                decryptedItems = await Promise.all(
                    response.data.map(
                        async (item) => await decryptItem(item, decryptionKey)
                    )
                )
                return {
                    data: decryptedItems,
                }
            },
            providesTags: ['Vault'],
        }),
        addItem: build.mutation<MutationResponse, VaultItem>({
            query: (body) => ({
                url: `vaults/items`,
                method: 'POST',
                body: {
                    data: body,
                },
            }),
            invalidatesTags: ['Vault'],
        }),
        editItem: build.mutation<MutationResponse, VaultItem>({
            query: (body) => ({
                url: `vaults/items`,
                method: 'PUT',
                body: {
                    data: body,
                },
            }),
            invalidatesTags: ['Vault'],
        }),
        deleteItem: build.mutation<Record<string, string>, string>({
            query: (id) => ({
                url: `vaults/items`,
                method: 'DELETE',
                body: { id }
            }),
            invalidatesTags: ['Vault'],
        })
    }),
})

export const { useGetVaultQuery, useAddItemMutation, useEditItemMutation, useDeleteItemMutation } = api
