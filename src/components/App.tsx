import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import customTheme from './../theme'
import { Keyroute } from './Authentication/Keyroute'
import { MainApp } from './App/index'
import { useAppSelector } from '../store/hooks'

export const App = () => {
    const authStore = useAppSelector((state) => state.session.session)
    const theme = extendTheme(customTheme)
    return (
        <ChakraProvider theme={theme}>
            {!authStore.email && <Keyroute />}
            {authStore.email && <MainApp />}
        </ChakraProvider>
    )
}
