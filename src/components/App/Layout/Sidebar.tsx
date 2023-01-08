import {
    Box,
    Flex,
    Stack,
    useColorModeValue,
    Text,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Icon,
} from '@chakra-ui/react'
import * as React from 'react'
import { FiLogOut, FiSettings } from 'react-icons/fi'
import { NavButton } from './NavButton'
import { UserProfile } from './../UserProfile'
import { ViewContext } from '../../../contexts/view'
import { useAppSelector, useAppDispatch } from '../../../store/hooks'
import { removeSession } from '../../../store/reducers/auth'
import { View } from '../../../types'
import { Logo } from '../../../Logo'

interface SidebarProps {
    toggleSidebar?: Function
}

export const Sidebar = (props: SidebarProps) => {
    const viewContext = React.useContext(ViewContext)
    const authStore = useAppSelector((state) => state.session.session)
    const dispatch = useAppDispatch()

    const endSession = () => {
        try {
            chrome.runtime.sendMessage(
                { cmd: 'removeSession' },
                function (response) {
                    console.log(
                        `message from background: ${JSON.stringify(response)}`
                    )
                }
            )
        } catch (error) {
            console.log('Error syncing with background script:', error)
        }
        dispatch(removeSession())
    }

    const handleNavButtonClick = (navTarget: View) => {
        viewContext.switchView(navTarget)
        props.toggleSidebar && props.toggleSidebar()
    }

    return (
        <Flex
            as="section"
            minH="100vh"
            bgColor={useColorModeValue('background.light', 'background.dark')}
        >
            <Flex
                flex="1"
                bg="bg-surface"
                overflowY="auto"
                boxShadow={useColorModeValue('lg', 'lg-dark')}
                maxW={{ base: 'full', sm: 'xs' }}
                py={{ base: '4', sm: '6' }}
                px={{ base: '2', sm: '4' }}
            >
                <Stack justify="space-between" spacing="1">
                    <Stack
                        spacing={{ base: '5', sm: '6' }}
                        pt={{ base: '10', lg: '0' }}
                        shouldWrapChildren
                    >
                        <Stack spacing="1">
                            <Flex align={'center'} gap={'1'}>
                                <Logo h={10} />
                                <Text
                                    py={'4'}
                                    color={'gray.500'}
                                    fontSize={'sm'}
                                    fontWeight={'hairline'}
                                    casing={'uppercase'}
                                    letterSpacing={'widest'}
                                >
                                    Keyspace
                                </Text>
                            </Flex>

                            {viewContext.views.map((view) => (
                                <NavButton
                                    key={view.label}
                                    label={view.label}
                                    icon={view.icon}
                                    textColor={
                                        viewContext.view.name === view.name
                                            ? 'primary.500'
                                            : ''
                                    }
                                    onClick={() => handleNavButtonClick(view)}
                                />
                            ))}
                        </Stack>
                    </Stack>
                    <Stack spacing={{ base: '5', sm: '6' }}>
                        <Stack spacing="1">
                            <NavButton
                                label="Settings"
                                icon={FiSettings}
                                textColor={
                                    viewContext.view.name === 'settings'
                                        ? 'primary.500'
                                        : ''
                                }
                                onClick={() =>
                                    handleNavButtonClick({
                                        name: 'settings',
                                        label: 'Settings',
                                        icon: FiSettings,
                                    })
                                }
                            />
                            <Menu>
                                <MenuButton>
                                    <Box as="button" paddingTop={'2'}>
                                        <UserProfile
                                            name={authStore.email || ''}
                                            image=""
                                            email={authStore.email || ''}
                                        />
                                    </Box>
                                </MenuButton>
                                <MenuList
                                    bgColor={useColorModeValue(
                                        'background.light',
                                        'background.dark'
                                    )}
                                >
                                    <MenuItem
                                        icon={<Icon as={FiLogOut} />}
                                        onClick={endSession}
                                        bgColor={useColorModeValue(
                                            'background.light',
                                            'background.dark'
                                        )}
                                        _hover={{textColor: 'primary.500'}}
                                    >
                                        Logout
                                    </MenuItem>
                                </MenuList>
                            </Menu>
                            
                        </Stack>
                    </Stack>
                </Stack>
            </Flex>
        </Flex>
    )
}
