import { IconButton, Icon } from "@chakra-ui/react"
import { useEffect, useState } from "react"
import { FaStar } from "react-icons/fa"
import { useEditItemMutation } from "../../../../services/api"
import { useAppSelector } from "../../../../store/hooks"
import { ItemType, LoginItem, PaymentCard, SecureNote, VaultItem } from "../../../../types"
import { getCurrentTimestamp, encryptLogin, encryptNote, encryptPaymentCard } from "../../../../utils/vault"

interface FavoriteButtonProps {
    item: VaultItem
}

export const FavoriteButton = (props: FavoriteButtonProps) => {
    const { item } = props
    const authStore = useAppSelector((state) => state.session.session)
    const [editItem, isLoading] = useEditItemMutation()
    const [isFavorite, setIsFavorite] = useState<boolean>(false)

    useEffect(() => {
        setIsFavorite(item.favorite)
    }, [item.favorite])

    const handleClick = async () => {
        const updatedItem = structuredClone(item)
        
        updatedItem.favorite = !updatedItem.favorite
        updatedItem.dateModified = getCurrentTimestamp()

        let encryptedItem = {} as VaultItem
        
        if (updatedItem.type === ItemType.Note)
            Object.assign(
                encryptedItem,
                await encryptNote(updatedItem as SecureNote, authStore.keyring.symmetricKey)
            )
        else if (updatedItem.type === ItemType.Login)
            Object.assign(
                encryptedItem,
                await encryptLogin(updatedItem as LoginItem, authStore.keyring.symmetricKey)
            )
        else if (updatedItem.type === ItemType.PaymentCard)
            Object.assign(
                encryptedItem,
                await encryptPaymentCard(
                    updatedItem as PaymentCard,
                    authStore.keyring.symmetricKey
                )
            )
        await editItem(encryptedItem).unwrap()
        setIsFavorite(!isFavorite)
    }

    return (
        <IconButton
            icon={<Icon as={FaStar} />}
            isLoading={isLoading.isLoading ? true : false}
            color={isFavorite ? 'gold' : undefined}
            onClick={handleClick}
            aria-label="Set as favorite"
            variant="ghost"
            size="sm"
            opacity={isFavorite ? 1 : 0}
            _groupHover={{ opacity: 1 }}
        />
    )
}