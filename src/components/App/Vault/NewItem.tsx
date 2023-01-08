import { Drawer, DrawerOverlay, useDisclosure } from '@chakra-ui/react'
import { IconButton, Icon } from '@chakra-ui/react'
import { FiPlus } from 'react-icons/fi'
import { ItemType, Tag, View } from '../../../types'
import { NoteForm } from './Forms/Note'
import { LoginForm } from './Forms/Login'
import { PaymentForm } from './Forms/Payment'
import { useGetVaultQuery } from '../../../services/api'
import { useAppSelector } from '../../../store/hooks'
import { getActiveTags, resolveItems } from '../../../utils/vault'
import { useContext, useEffect } from 'react'
import { ViewContext } from '../../../contexts/view'

interface NewItemProps {
    view: View
}

export const NewItem = (props: NewItemProps) => {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const viewContext = useContext(ViewContext)
    const authStore = useAppSelector((state) => state.session.session)
    const { data } = useGetVaultQuery(
        authStore.keyring.symmetricKey
    )
    const tags = data ? resolveItems(data.data, ItemType.Tag) : []
    const activeTags = data ? getActiveTags(data.data) : []
    
    const handleOpen = () => {
        viewContext.setFormOpen(true)
    }

    const handleClose = () => {
        viewContext.setItemToEdit(null)
        viewContext.setFormOpen(false)
    }

    useEffect(() => {
        if (viewContext.itemToEdit) handleOpen()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [viewContext.itemToEdit])

    useEffect(() => {
        if (viewContext.formOpen) onOpen()
        else onClose()
    }, [onClose, onOpen, viewContext.formOpen])

    return (
        <>
            <IconButton
                onClick={handleOpen}
                colorScheme={'primary'}
                aria-label="Add an item"
                icon={<Icon as={FiPlus} />}
                size={'sm'}
            />
            <Drawer
                isOpen={isOpen}
                placement="right"
                size={'sm'}
                onClose={handleClose}
            >
                <DrawerOverlay backdropFilter='blur(10px)'/>
                {props.view.name === 'notes' && (
                    <NoteForm onClose={handleClose} tags={tags as Array<Tag>} activeTags={activeTags}/>
                )}
                {props.view.name === 'logins' && (
                    <LoginForm onClose={handleClose} tags={tags as Array<Tag>} activeTags={activeTags}/>
                )}
                {props.view.name === 'cards' && (
                    <PaymentForm onClose={handleClose} tags={tags as Array<Tag>} activeTags={activeTags}/>
                )}
            </Drawer>
        </>
    )
}
