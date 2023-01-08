import {
    ButtonGroup,
    Divider,
    Flex,
    Heading,
    Icon,
    IconButton,
    useColorModeValue,
} from '@chakra-ui/react'
import { useContext, useEffect, useState } from 'react'
import { FiClock, FiEdit, FiKey, FiMail, FiUser } from 'react-icons/fi'
import { ViewContext } from '../../../../contexts/view'
import { LoginItem, Tag, VaultItem } from '../../../../types'
import { KSIcon } from '../../../Common/KSIcon'
import { CopyButton } from '../../Vault/CopyButton'
import { VaultItemTag } from '../../Vault/Tag'
import { FavoriteButton } from '../Common/FavoriteButton'
const totp = require('totp-generator')

interface LoginCardProps {
    login: LoginItem
    tags: Array<Tag>
}

export const LoginCard = (props: LoginCardProps) => {
    const { tagId, loginData, name, iconFile } = props.login
    const tag = props.tags.find((tag) => tag.id === tagId)
    const [totpToken, setTotpToken] = useState('')
    const [totpTimer, setTotpTimer] = useState<number>(0)

    const viewContext = useContext(ViewContext)

    useEffect(() => {
        const interval = setInterval(() => {
            const timer = 30 - (Math.round(Number(new Date()) / 1000) % 30)
            setTotpTimer(timer)
            if (loginData.totp?.secret) {
                try {
                    setTotpToken(totp(loginData.totp.secret))
                } catch (error) {
                    console.log(error)
                }
                return true
            }
        }, 1000)

        return () => clearInterval(interval)
    }, [loginData.totp?.secret, totpTimer])

    const handleEditClick = () => {
        const loginItemClone = structuredClone(props.login)
        viewContext.setItemToEdit(loginItemClone)
    }

    const totpDisplay = totpToken
        ? `${totpToken.slice(0, 3)} ${totpToken.slice(3)}`
        : ''

    const actionButtons = () => (
        <ButtonGroup size="sm" isAttached variant="ghost">
            <IconButton
                icon={<Icon as={FiEdit} />}
                aria-label="Edit login"
                title="Edit login"
                onClick={handleEditClick}
                opacity={0}
                _groupHover={{ opacity: 1 }}
            />
            <FavoriteButton item={props.login as VaultItem} />
        </ButtonGroup>
    )

    return (
        <>
            <Flex
                gap={4}
                bgColor={useColorModeValue(
                    'background.light',
                    'background.dark'
                )}
                rounded={'md'}
                p={3}
                className="group"
            >
                <Flex direction="column" gap={2} w="full">
                    <Flex justify="space-between">
                        <Flex gap={3} align={'center'}>
                            <Flex h={6} w={6}>
                                {name && (
                                    <KSIcon
                                        name={iconFile || name}
                                        height="24px"
                                    />
                                )}
                            </Flex>
                            <Heading size="sm">{name}</Heading>
                            <Flex align={'center'}>
                                {tag && (
                                    <VaultItemTag tag={tag} isSelected={true} />
                                )}
                            </Flex>
                        </Flex>
                        {actionButtons()}
                    </Flex>
                    <Divider />
                    <Flex gap="1">
                        {loginData.email && (
                            <CopyButton
                                value={loginData.email}
                                label="Email"
                                icon={FiMail}
                                maxW={'full'}
                                toastIconName={iconFile || name}
                            />
                        )}
                        {loginData.username &&
                            loginData.username !== loginData.email && (
                                <CopyButton
                                    value={loginData.username}
                                    label="Username"
                                    icon={FiUser}
                                    toastIconName={iconFile || name}
                                />
                            )}
                    </Flex>
                    <Flex gap="1">
                        {loginData.password && (
                            <CopyButton
                                value={loginData.password}
                                label="Password"
                                icon={FiKey}
                                hidden={true}
                                toastIconName={iconFile || name}
                            />
                        )}
                        {totpToken && (
                            <CopyButton
                                value={totpToken}
                                displayValue={totpDisplay}
                                label="TOTP"
                                icon={FiClock}
                                timer={totpTimer}
                                toastIconName={iconFile || name}
                            />
                        )}
                    </Flex>
                </Flex>
            </Flex>
        </>
    )
}
