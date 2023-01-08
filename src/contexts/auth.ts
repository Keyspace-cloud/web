import React from 'react'
import { UserSession } from '../types'

export const AuthContext = React.createContext({
    session: {} as UserSession | null,        
    createSession: (sessionData: UserSession) => {},
    refreshSession: () => {},
    endSession: () => {},
});
