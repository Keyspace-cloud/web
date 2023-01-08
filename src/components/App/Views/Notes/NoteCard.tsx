import {
    Box,
    Flex,
    Icon,
    IconButton,
    Modal,
    ModalBody,
    ModalContent,
    ModalOverlay,
    Text,
    useColorModeValue,
    useDisclosure,
} from '@chakra-ui/react'
import { SecureNote, Tag, VaultItem } from '../../../../types'
import ReactMarkdown from 'react-markdown'
import { getReadableTextColor } from '../../../../utils/colors'
import { VaultItemTag } from '../../Vault/Tag'
import { FiClock, FiEdit, FiMaximize } from 'react-icons/fi'
import { useContext } from 'react'
import '../../../../assets/css/markdown.css'
import '../../../../assets/css/hide-scrollbar.css'
import { ViewContext } from '../../../../contexts/view'
import { relativeTimeFromDates } from '../../../../utils/time'
import { FavoriteButton } from '../Common/FavoriteButton'

interface NoteCardProps {
    note: SecureNote
    tags: Array<Tag>
}

export const NoteCard = (props: NoteCardProps) => {
    const { notes, tagId, color, dateCreated } = props.note

    const { isOpen: modalIsOpen, onOpen: modalOnOpen, onClose: modalOnClose } = useDisclosure()

    const viewContext = useContext(ViewContext)

    const textColor = useColorModeValue(
        color ? getReadableTextColor(color) : 'black',
        color ? getReadableTextColor(color) : 'white'
    )

    const handleEdit = () => {
        const noteClone = structuredClone(props.note)
        viewContext.setItemToEdit(noteClone)
    }

    const createdDate = () => {
        return relativeTimeFromDates(new Date(dateCreated * 1000))
    }

    const bgColor = useColorModeValue(
        color || 'background.light',
        color || 'background.dark'
    )

    const tag = props.tags.find((tag) => tag.id === tagId)

    return (
        <>
            <Flex
                direction={'column'}
                bgColor={bgColor}
                textColor={textColor}
                p={3}
                rounded={'md'}
                overflow="hidden"
                position="relative"
                className='group'
                zIndex={0}
            >
                <Flex align={'center'} justify={'end'} gap={2}>
                    <IconButton
                        icon={
                            <Icon
                                as={FiMaximize}
                            />
                        }
                        aria-label={'Expand'}
                        title={'Expand'}
                        onClick={modalOnOpen}
                        variant="ghost"
                        size="sm"
                        opacity={0}
                        _groupHover={{opacity: 1}}
                    />
                    <IconButton
                        icon={<Icon as={FiEdit} />}
                        aria-label="Edit note"
                        title="Edit note"
                        onClick={handleEdit}
                        variant="ghost"
                        size="sm"
                        opacity={0}
                        _groupHover={{opacity: 1}}
                    />
                    <FavoriteButton item={props.note as VaultItem} />
                </Flex>
                <Box h={40} overflow={'hidden'} mt={0}>
                    <ReactMarkdown children={notes} className="markdown" />
                </Box>

                <Flex
                    gap="2"
                    alignItems={'center'}
                    justify="space-between"
                    pt={3}
                >
                    <Flex alignItems={'center'} gap={1}>
                        <Icon boxSize={3} as={FiClock} />
                        <Text opacity={'0.6'} fontSize={'xs'}>
                            {createdDate()}
                        </Text>
                    </Flex>
                    {tag && <VaultItemTag tag={tag} isSelected={true} />}
                </Flex>

            </Flex>


            <Modal
                isCentered
                isOpen={modalIsOpen}
                onClose={modalOnClose}
                scrollBehavior={'inside'}
            >
                <ModalOverlay backdropFilter='blur(10px)' />
                <ModalContent maxW={{base: "40rem", lg: "56rem"}} >
                    <ModalBody bgColor={bgColor} textColor={textColor} rounded={'md'} className={'hide-scrollbar'}>
                        <ReactMarkdown children={notes} className="markdown" />
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    )
}
