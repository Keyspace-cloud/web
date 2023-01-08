import { configureStore } from '@reduxjs/toolkit'
import vaultReducer from './reducers/vault'
import authReducer from './reducers/auth'
import { setupListeners } from '@reduxjs/toolkit/query'
import { api } from './../services/api'
export const store = configureStore({
  reducer: {
    vault: vaultReducer,
    session: authReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        isSerializable: () => true
      },
    }).concat(api.middleware),
})

setupListeners(store.dispatch)

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch