import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { UserSession } from '../../types'
import type { RootState } from '../index'

interface AuthStoreState {
    session: UserSession
}

const initialState: AuthStoreState = {
    session: {} as UserSession
}

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
      addSession: (state, action: PayloadAction<UserSession>) => {
        state.session = action.payload
      },
      removeSession: (state) => {
        state.session = {} as UserSession
      },
      
    },
  })


export const { addSession, removeSession } = authSlice.actions

export const session = (state: RootState) => state.session

export default authSlice.reducer