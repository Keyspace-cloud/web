import { Flex, Icon, IconButton, useColorModeValue } from '@chakra-ui/react'
import { useContext } from 'react'
import { FiEdit } from 'react-icons/fi'
import { ViewContext } from '../../../../contexts/view'
import { PaymentCard, Tag, VaultItem } from '../../../../types'
import { getReadableTextColor } from '../../../../utils/colors'
import { detectCardType, formattedCardNumber } from '../../../../utils/vault'
import { KSIcon } from '../../../Common/KSIcon'
import { CopyButton } from '../../Vault/CopyButton'
import { VaultItemTag } from '../../Vault/Tag'
import { FavoriteButton } from '../Common/FavoriteButton'

interface PaymentCardProps {
    paymentCard: PaymentCard
    tags: Array<Tag>
}

export const PaymentCardTile = (props: PaymentCardProps) => {
    const viewContext = useContext(ViewContext)
    const {
        name,
        cardNumber,
        cardholderName,
        expiry,
        securityCode,
        color,
        tagId,
        rfid,
        iconFile,
    } = props.paymentCard

    const tag = props.tags.find((tag) => tag.id === tagId)

    const bgColor = useColorModeValue(
        color || 'background.light',
        color || 'background.dark'
    )

    const iconColor = useColorModeValue(
        color
            ? getReadableTextColor(color) === '#000'
                ? 'DARK'
                : 'LIGHT'
            : 'DARK',
        color
            ? getReadableTextColor(color) === '#000'
                ? 'DARK'
                : 'LIGHT'
            : 'LIGHT'
    )

    const cardType = detectCardType(String(cardNumber))

    const handleEdit = () => {
        const paymentCardClone = structuredClone(props.paymentCard)
        viewContext.setItemToEdit(paymentCardClone)
    }

    return (
        <Flex
            direction={'column'}
            bgColor={bgColor}
            textColor={getReadableTextColor(bgColor)}
            rounded={'md'}
            p={3}
            fontFamily="mono"
            gap={'2'}
            className="group"
        >
            <Flex
                alignItems={'center'}
                w={'full'}
                justify={'space-between'}
                fontSize={'xl'}
                fontWeight={'bold'}
                mb={'5'}
            >
                <Flex align={'center'} gap={3}>
                    {name && (
                        <KSIcon
                            name={iconFile || name}
                            height="24px"
                            colorMode={iconColor}
                        />
                    )}
                    {name}
                </Flex>
                {tag && <VaultItemTag tag={tag} isSelected={true} />}
                <Flex gap="2" alignItems={'center'}>
                    <IconButton
                        icon={<Icon as={FiEdit} />}
                        aria-label="Edit payment"
                        title="Edit payment"
                        onClick={handleEdit}
                        variant="ghost"
                        size="sm"
                        opacity={0}
                        _groupHover={{ opacity: 1 }}
                    />
                    <FavoriteButton item={props.paymentCard as VaultItem} />
                </Flex>
            </Flex>

            <Flex w={'full'} align={'center'} justifyContent={'space-between'}>
                <Flex fontSize={'2xl'}>
                    <CopyButton
                        value={String(cardNumber)}
                        label={'Card number'}
                        displayValue={formattedCardNumber(String(cardNumber))}
                        maxW={'full'}
                        toastIconName={iconFile || name}
                    />
                </Flex>
                {rfid && (
                    <KSIcon
                        name={'ic_contactless'}
                        height="24px"
                        colorMode={
                            getReadableTextColor(bgColor) === '#000'
                                ? 'DARK'
                                : 'LIGHT'
                        }
                    />
                )}
            </Flex>

            <Flex align={'center'} justifyContent={'space-between'} w={'full'}>
                <Flex align={'center'} gap={'2'}>
                    <Flex
                        textColor={'GrayText'}
                        fontSize={'xs'}
                        textTransform={'uppercase'}
                    >
                        Valid thru
                    </Flex>
                    <CopyButton
                        value={expiry}
                        label="Expiry"
                        toastIconName={iconFile || name}
                    />
                </Flex>

                <Flex align={'center'} gap={'2'}>
                    <Flex
                        textColor={'GrayText'}
                        fontSize={'xs'}
                        textTransform={'uppercase'}
                    >
                        CVV
                    </Flex>
                    <CopyButton
                        value={securityCode}
                        label="Security code"
                        displayValue="***"
                        toastIconName={iconFile || name}
                    />
                </Flex>
            </Flex>

            <Flex
                fontSize={'2xl'}
                textTransform={'uppercase'}
                align={'center'}
                justify={'space-between'}
                w={'full'}
            >
                <CopyButton
                    value={cardholderName}
                    label={'Cardholder name'}
                    maxW={'full'}
                    toastIconName={iconFile || name}
                />
                {cardType && (
                    <KSIcon
                        name={cardType.name}
                        height="24px"
                        colorMode={
                            getReadableTextColor(bgColor) === '#000'
                                ? 'DARK'
                                : 'LIGHT'
                        }
                    />
                )}
            </Flex>
        </Flex>
    )
}
