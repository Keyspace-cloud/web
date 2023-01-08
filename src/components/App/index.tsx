import {
    Flex,
    Box,
    useBreakpointValue,
    useColorModeValue,
    useToast,
    Stack,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { Navbar } from './Layout/Navbar'
import { Sidebar } from './Layout/Sidebar'
import { SearchBar } from './Vault/SearchBar'
import { ViewContext } from './../../contexts/view'
import { FiClipboard, FiCreditCard, FiSettings, FiUser } from 'react-icons/fi'
import { LoginsView } from './Views/Logins'
import { NotesView } from './Views/Notes'
import { CardsView } from './Views/Payments'
import { NewItem } from './Vault/NewItem'
import { Settings } from './Views/Settings'
import { VaultItem, View } from '../../types'
import { store } from '../../store/'
import { Provider } from 'react-redux'
import { useGetVaultQuery } from '../../services/api'
import { useAppSelector } from '../../store/hooks'
import { Loader } from './Loader'
import { PopoutButton } from '../Common/PopoutButton'
import { tabsQuery } from '../../utils/browser'
import { getSiteNameFromUrl } from '../../utils/vault'

export const MainApp = () => {
    const authStore = useAppSelector((state) => state.session.session)
    const { isLoading, error } = useGetVaultQuery(
        authStore.keyring.symmetricKey
    )
    const toast = useToast()

    useEffect(() => {
        if (error) {
            toast({
                title: 'Error syncing',
                position: 'bottom',
                isClosable: true,
                status: 'error',
            })
        }
    }, [error])

    const views: Array<View> = [
        {
            name: 'logins',
            label: 'Logins',
            icon: FiUser,
        },
        {
            name: 'notes',
            label: 'Notes',
            icon: FiClipboard,
        },
        {
            name: 'cards',
            label: 'Payments',
            icon: FiCreditCard,
        },
        // {
        //     name: 'settings',
        //     label: 'Settings',
        //     icon: FiSettings
        // },
    ]
    const [view, setView] = useState<View>(views[0])
    const [itemToEdit, setItemToEdit] = useState<VaultItem | null>(null)
    const [searchQuery, setSearchQuery] = useState<string>('')
    const [searchSuggestion, setSearchSuggestion] = useState<string>('')
    const [formOpen, setFormOpen] = useState<boolean>(false)

    const switchView = (view: View) => {
        setView(view)
    }

    useEffect(() => {
        const getCurrentTabInfo = async () => {
            const tabs = await tabsQuery({
                active: true,
                currentWindow: true,
            })

            if (tabs.length > 0) {
                const tab = tabs[0]
                const searchCandidate = getSiteNameFromUrl(tab.url!)
                if (searchCandidate) setSearchSuggestion(searchCandidate)
            }
        }
        getCurrentTabInfo()
    }, [])

    const isDesktop = useBreakpointValue({ base: false, lg: true })

    const showSearch = ['logins', 'notes', 'cards'].includes(view.name)

    return (
        <Provider store={store}>
            <ViewContext.Provider
                value={{
                    view,
                    views,
                    searchQuery,
                    searchSuggestion,
                    itemToEdit,
                    formOpen,
                    switchView,
                    setItemToEdit,
                    setSearchQuery,
                    setSearchSuggestion,
                    setFormOpen,
                }}
            >
                {isLoading && <Loader />}
                <Flex
                    bgColor={useColorModeValue('#ddd', '#181818')}
                    as="section"
                    direction={{ base: 'column', lg: 'row' }}
                    height="100vh"
                    width="full"
                    overflowY="hidden"
                >
                    {isDesktop && <Sidebar />}

                    <Stack w={'full'}>
                        <Flex
                            direction={'row'}
                            justify="space-between"
                            align={'center'}
                            w={'full'}
                            h={'16'}
                            px={{ base: '4', lg: '8' }}
                            gap={'4'}
                            position={'relative'}
                            zIndex={900}
                        >
                            {!isDesktop && <Navbar />}
                            <PopoutButton />
                            {showSearch && (
                                <SearchBar initialQuery={searchQuery} />
                            )}
                            {showSearch && <NewItem view={view} />}
                        </Flex>
                        <Box h={'calc(100vh - 64px)'} overflow={'auto'}>
                            {view.name === 'logins' && <LoginsView />}
                            {view.name === 'notes' && <NotesView />}
                            {view.name === 'cards' && <CardsView />}
                            {view.name === 'settings' && <Settings />}
                        </Box>
                    </Stack>
                </Flex>
            </ViewContext.Provider>
        </Provider>
    )
}
