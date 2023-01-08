import { useEffect, useState } from 'react'
import { QRCode } from 'react-qrcode-logo'
import { getKeyauthToken } from '../../utils/api'
import {
    Box,
    Button,
    Flex,
    Heading,
    Text,
    HStack,
    Icon,
    ListItem,
    OrderedList,
    Progress,
    ScaleFade,
    useColorModeValue,
    useToast,
    VStack,
    CircularProgress,
} from '@chakra-ui/react'
import { KeyrouteInitRequest, KeyauthToken, KeyroutePayload } from '../../types'
import { hex2buf, randomKeyPair } from '../../utils/crypto'
import { bufToHex } from '../../utils/encoding'
import useWebSocket, { ReadyState } from 'react-use-websocket'
import { getRouteId, keyreouteLogin } from '../../utils/keyroute'
import { KeyPair } from 'libsodium-wrappers'
import { ColorModeSwitcher } from '../Common/ColorModeSwitcher'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { addSession } from '../../store/reducers/auth'
import { FiAlertTriangle, FiRefreshCcw } from 'react-icons/fi'
import { PopoutButton } from '../Common/PopoutButton'
import { Logo } from '../../Logo'

export const Keyroute = () => {
    const QR_REFRESH_INTERVAL = 60 //seconds
    const toast = useToast()
    const authStore = useAppSelector((state) => state.session.session)
    const dispatch = useAppDispatch()

    const [payload, setPayload] = useState<KeyrouteInitRequest | null>(null)
    const [token, setToken] = useState<KeyauthToken | null>(null)
    const [error, setError] = useState<string>('')
    const [keypair, setKeypair] = useState<KeyPair | null>(null)
    const [timer, setTimer] = useState<number>(0)
    const [socketUrl, setSocketUrl] = useState<string>('')
    const [messageHistory, setMessageHistory] = useState<Array<MessageEvent>>(
        []
    )
    const [loading, setLoading] = useState<boolean>(false)

    const {
        sendMessage,
        sendJsonMessage,
        lastMessage,
        lastJsonMessage,
        readyState,
        getWebSocket,
    } = useWebSocket(socketUrl, {
        onOpen: () => console.log('websocket open'),
        //Will attempt to reconnect on all close events, such as server shutting down
        shouldReconnect: (closeEvent) => true,
    })

    const Timer = () => {
        const progressColor = () => {
            if (!payload) return 'orange'
            else if (timer <= 10) return 'red'
            else return 'green'
        }

        return (
            <Progress
                isIndeterminate={payload === null}
                max={60}
                size={'xs'}
                value={timer}
                colorScheme={progressColor()}
            />
        )
    }

    /**
     * Sends a 'getSession' message to the background script, and restores the user session if possible
     */
    useEffect(() => {
        try {
            chrome.runtime.sendMessage(
                { cmd: 'getSession' },
                function (response) {
                    if (response.result === 'success') {
                        const decodedSessionData = {
                            email: response.message.email,
                            token: response.message.token,
                            keyring: {
                                publicKey: hex2buf(
                                    response.message.keyring.publicKey
                                ),
                                privateKey: hex2buf(
                                    response.message.keyring.privateKey
                                ),
                                symmetricKey: hex2buf(
                                    response.message.keyring.symmetricKey
                                ),
                            },
                        }
                        dispatch(addSession(decodedSessionData))
                    }
                }
            )
        } catch (error) {
            console.log('Error syncing with background script:', error)
        }
    }, [dispatch])

    // updates the timer every second
    // every 60 seconds a new keyauth token is fetched, new keypair generated, fresh QR drawn and websocket endpoint is updated
    useEffect(() => {
        const updateKeyroute = async () => {
            setError('')
            const keys = await randomKeyPair(true)
            const token = await getKeyauthToken()
            if (!token) setError('Keyspace servers are down')
            else {
                setKeypair(keys)
                setToken(token)
                setPayload({
                    token: JSON.stringify(token),
                    publicKey: bufToHex(keys.publicKey),
                    intent: 'login',
                })
                await getRouteId(token).then((routeId) => {
                    setSocketUrl(
                        `wss://${process.env.REACT_APP_API_HOST}/ws/keyroute/${routeId}`
                    )
                })
            }
        }

        const interval = setInterval(() => {
            if (timer === 0) {
                updateKeyroute()
                setTimer(QR_REFRESH_INTERVAL)
                setMessageHistory([])
                return true
            } else {
                setTimer((timer) => timer - 1)
            }
        }, 1000)

        return () => clearInterval(interval)
    }, [timer])

    useEffect(() => {
        const initSession = async (payload: KeyroutePayload) => {
            if (keypair) {
                keyreouteLogin(payload, keypair).then((session) => {
                    if (session.email !== undefined) {
                        toast({
                            title: 'Logged in!',
                            status: 'success',
                            duration: 3000,
                            isClosable: true,
                            variant: 'subtle',
                            containerStyle: {
                                backdropFilter: 'blur(10px)',
                            },
                        })

                        /**
                         * Tries to send the user session to the background script
                         */

                        const encodedSessionData = {
                            email: session.email,
                            keyring: {
                                publicKey: bufToHex(session.keyring.publicKey),
                                privateKey: bufToHex(
                                    session.keyring.privateKey
                                ),
                                symmetricKey: bufToHex(
                                    session.keyring.symmetricKey
                                ),
                            },
                        }
                        try {
                            chrome.runtime.sendMessage(
                                {
                                    message: encodedSessionData,
                                    cmd: 'saveSession',
                                },
                                function (response) {
                                    console.log(
                                        `message from background: ${JSON.stringify(
                                            response
                                        )}`
                                    )
                                }
                            )
                        } catch (error) {
                            console.log(
                                'Error syncing with background script:',
                                error
                            )
                        }

                        dispatch(addSession(session))
                    } else {
                        toast({
                            title: 'Something went wrong!',
                            description:
                                'Please try scanning the QR code again',
                            status: 'error',
                            duration: 5000,
                            isClosable: true,
                        })
                        setLoading(false)
                    }
                })
            }
        }

        if (lastMessage !== null) {
            try {
                const routeData = JSON.parse(lastMessage.data)?.message

                if (routeData?.type === 'data') {
                    setMessageHistory((prev) => prev.concat(lastMessage))
                    const payload: KeyroutePayload = routeData?.message
                    setLoading(true)
                    initSession(payload)
                }
            } catch (e) {
                console.log('error parsing payload: ', e)
            }
        }
    }, [lastMessage, setMessageHistory])

    const resetTimer = () => {
        setTimer(0)
    }

    const connectionStatus = {
        [ReadyState.CONNECTING]: 'Connecting',
        [ReadyState.OPEN]: 'Open',
        [ReadyState.CLOSING]: 'Closing',
        [ReadyState.CLOSED]: 'Closed',
        [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
    }[readyState]

    const keyrouteInitQR = () => {
        return (
            <HStack p={8} gap={10} maxW={'4xl'}>
                <Box minH={'295px'} minW={'295px'}>
                    {error && (
                        <Flex
                            gap="4"
                            direction="column"
                            h="275px"
                            w="275px"
                            align={'center'}
                            justify={'center'}
                        >
                            <Icon
                                as={FiAlertTriangle}
                                w={20}
                                h={20}
                                color="orange"
                            />
                            <Text textColor={'orange'}>{error}</Text>
                            <Button
                                leftIcon={<Icon as={FiRefreshCcw} />}
                                onClick={resetTimer}
                            >
                                Retry
                            </Button>
                        </Flex>
                    )}
                    {payload && (
                        <ScaleFade
                            initialScale={0.5}
                            in={payload ? true : false}
                        >
                            <Box boxShadow={'2xl'}>
                                <QRCode
                                    qrStyle={'dots'}
                                    size={275}
                                    value={JSON.stringify(payload)}
                                />
                            </Box>
                        </ScaleFade>
                    )}
                </Box>
                <VStack justify={'left'} align={'left'} gap={'6'}>
                    <Heading as="h3" size="md">
                        Scan the QR code with the Keyspace mobile app to login
                    </Heading>
                    <OrderedList spacing={'2'} stylePosition={'inside'}>
                        <ListItem>Open Keyspace on your phone</ListItem>
                        <ListItem>
                            Swipe up on the scanner at the bottom of the screen
                        </ListItem>
                        <ListItem>Scan the code to login</ListItem>
                    </OrderedList>
                    <Timer />
                </VStack>
            </HStack>
        )
    }

    return (
        <Flex
            direction={'column'}
            justifyContent={'center'}
            h={'100vh'}
            p={3}
            bgColor={useColorModeValue('gray.100', '#181818')}
        >
            <Flex
                w={'full'}
                justify={'space-between'}
                position={'absolute'}
                top={'4'}
            >
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
                <Flex gap={2} align={'center'} px={4}>
                    <PopoutButton />
                    <ColorModeSwitcher />
                </Flex>
            </Flex>
            <VStack>
                {!authStore.email && (
                    <Box>
                        {!loading ? (
                            keyrouteInitQR()
                        ) : (
                            <ScaleFade initialScale={0.5} in={true}>
                                <CircularProgress
                                    size="200px"
                                    color="primary.500"
                                    isIndeterminate
                                ></CircularProgress>
                            </ScaleFade>
                        )}
                    </Box>
                )}
            </VStack>
        </Flex>
    )
}
