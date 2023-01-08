import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Button,
    Flex,
    Icon,
    IconButton,
    useDisclosure,
    useToast,
} from '@chakra-ui/react'
import { useRef } from 'react'
import { FaTag } from 'react-icons/fa'
import { FiTrash2 } from 'react-icons/fi'
import { useDeleteItemMutation } from '../../../services/api'
import { Tag } from '../../../types'
import { getReadableTextColor } from '../../../utils/colors'

interface TagProps {
    tag: Tag
    isSelected: boolean
    allowDelete?: boolean
    itemsTagged?: number
}

export const VaultItemTag = (props: TagProps) => {
    const { tag, isSelected, allowDelete, itemsTagged } = props
    const [deleteItem, { isLoading }] = useDeleteItemMutation()
    const { isOpen, onOpen, onClose } = useDisclosure()
    const cancelRef = useRef<HTMLButtonElement>(null)
    const toast = useToast()

    const handleDelete = () => {
        if (itemsTagged && itemsTagged > 0) {
            onOpen()
        } else {
            deleteTag()
        }
    }

    const deleteTag = async () => {
        const response = await deleteItem(tag.id).unwrap()
        if (response.status === 'success') {
            toast({
                title: `Deleted tag`,
                position: 'bottom',
                isClosable: true,
                status: 'success',
                variant: 'subtle',
                containerStyle: {
                    backdropFilter: 'blur(10px)',
                },
            })
            onClose()
        } else {
            toast({
                title: response.message,
                position: 'bottom',
                isClosable: true,
                status: 'error',
            })
        }
    }

    return (
        <>
            <Flex
                alignItems={'center'}
                fontSize={'xs'}
                fontWeight="medium"
                textColor={tag.color ? getReadableTextColor(tag.color) : ''}
                bgColor={tag.color ? tag.color : ''}
                opacity={isSelected ? 1 : 0.5}
                _hover={{ opacity: 1 }}
                gap="1.5"
                rounded={'md'}
                px="2"
                py="0.5"
            >
                <Icon as={FaTag} boxSize="2.5" />
                {tag.name}
                {allowDelete && (
                    <IconButton
                        size={'xxs'}
                        icon={<Icon as={FiTrash2} />}
                        aria-label={'Delete tag'}
                        title="Delete tag"
                        isLoading={isLoading}
                        onClick={handleDelete}
                    />
                )}
            </Flex>
            <AlertDialog
                isOpen={isOpen}
                leastDestructiveRef={cancelRef}
                onClose={onClose}
                isCentered={true}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Delete Tag
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            Are you sure? You have {itemsTagged} item
                            {itemsTagged && itemsTagged > 1 && 's'} tagged with
                            "{tag.name}"
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onClose}>
                                Cancel
                            </Button>
                            <Button
                                colorScheme="red"
                                onClick={deleteTag}
                                ml={3}
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
