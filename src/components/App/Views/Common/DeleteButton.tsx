import {
    useDisclosure,
    Button,
    AlertDialog,
    AlertDialogOverlay,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogBody,
    AlertDialogFooter,
    useToast,
} from '@chakra-ui/react'
import { useRef } from 'react'
import { useDeleteItemMutation } from '../../../../services/api'
import { ItemType } from '../../../../types'
import { toTitleCase } from '../../../../utils/vault'

interface DeleteButtonProps {
    id: string
    itemType?: ItemType
    callback: Function
}

export const DeleteButton = (props: DeleteButtonProps) => {
    const { id, callback } = props

    const [deleteItem, { isLoading: deleteIsLoading }] = useDeleteItemMutation()
    const { isOpen, onOpen, onClose } = useDisclosure()
    const cancelRef = useRef<HTMLButtonElement>(null)
    const toast = useToast()

    /**
     * Handles the delete action for the item
     */
    const handleDelete = async () => {
        const response = await deleteItem(id).unwrap()
        if (response.status === 'success') {
            toast({
                title: 'Success',
                description: `${
                    props.itemType ? toTitleCase(props.itemType) : 'Item'
                } was deleted`,
                position: 'bottom',
                isClosable: true,
                status: 'success',
                variant: 'subtle',
                containerStyle: {
                    backdropFilter: 'blur(10px)',
                },
            })
            callback()
        } else {
            toast({
                title: 'Error',
                description: response.message,
                position: 'bottom',
                isClosable: true,
                status: 'error',
            })
        }
    }

    return (
        <>
            <Button onClick={onOpen} colorScheme="red" size="sm">
                Delete
            </Button>
            <AlertDialog
                isOpen={isOpen}
                leastDestructiveRef={cancelRef}
                onClose={onClose}
                isCentered={true}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Delete {props.itemType ? props.itemType : 'item'}
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            Are you sure? This is will permanently delete this
                            {props.itemType ? ` ${props.itemType}` : ' item'}.
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onClose}>
                                Cancel
                            </Button>
                            <Button
                                colorScheme="red"
                                onClick={handleDelete}
                                ml={3}
                                isLoading={deleteIsLoading}
                            >
                                Delete
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </>
    )
}
