import {
    Button,
    Icon,
    Box,
    useClipboard,
    useToast,
    CircularProgress,
    useColorModeValue,
} from '@chakra-ui/react'
import { useEffect } from 'react'
import { IconType } from 'react-icons'
import { KSIcon } from '../../Common/KSIcon'

interface CopyButtonProps {
    value: string
    displayValue?: string
    label: string
    icon?: IconType
    toastIconName?: string
    hidden?: boolean
    timer?: number
    maxW?: string
}

export const CopyButton = (props: CopyButtonProps) => {
    const {
        value,
        label,
        icon,
        hidden,
        timer,
        maxW,
        displayValue,
        toastIconName,
    } = props
    const { hasCopied, onCopy, setValue } = useClipboard(value)
    const toast = useToast()

    const toastIconColorMode = useColorModeValue('DARK', 'LIGHT')

    useEffect(() => {
        if (hasCopied)
            toast({
                title: `Copied ${label} to clipboard`,
                position: 'bottom',
                isClosable: true,
                duration: 3000,
                variant: 'subtle',
                containerStyle: {
                    backdropFilter: 'blur(10px)',
                },
                icon: toastIconName ? (
                    <KSIcon
                        name={toastIconName}
                        height="24px"
                        colorMode={toastIconColorMode}
                    />
                ) : undefined,
            })
    }, [hasCopied])

    useEffect(() => {
        setValue(value)
    }, [setValue, value])

    return (
        <Button
            variant="ghost"
            colorScheme={useColorModeValue('blackAlpha', 'gray')}
            size="sm"
            px={'1.5'}
            leftIcon={icon && <Icon as={icon} color={'GrayText'} />}
            justifyContent="left"
            alignContent={'center'}
            onClick={onCopy}
            title={`Copy ${label} to clipboard`}
            fontSize={'inherit'}
            fontFamily={'inherit'}
            fontWeight={'inherit'}
            textColor={'inhert'}
            textTransform={'inherit'}
            key={value}
        >
            <Box
                maxW={maxW || '44'}
                overflow="hidden"
                textOverflow="ellipsis"
                pb={icon ? 1 : 0}
            >
                {hidden ? '********' : displayValue ? displayValue : value}
            </Box>
            {label === 'TOTP' && (
                <CircularProgress
                    value={timer}
                    max={30}
                    isIndeterminate={!timer}
                    size="15px"
                    thickness="15px"
                    color={timer === 0 ? 'orange.500' : 'primary.500'}
                    ml="1.5"
                />
            )}
        </Button>
    )
}
