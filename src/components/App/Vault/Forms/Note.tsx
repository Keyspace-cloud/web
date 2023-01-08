import {
    Box,
    Button,
    Divider,
    DrawerBody,
    DrawerCloseButton,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    Flex,
    Icon,
    SimpleGrid,
    Stack,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Textarea,
    useColorModeValue,
    useToast,
} from '@chakra-ui/react'
import { useAppSelector } from '../../../../store/hooks'
import { useContext, useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { ActiveTag, ItemType, SecureNote, Tag } from '../../../../types'
import {
    MutationResponse,
    useAddItemMutation,
    useEditItemMutation,
} from '../../../../services/api'
import { encryptNote, getCurrentTimestamp } from '../../../../utils/vault'
import { FiCheck } from 'react-icons/fi'
import { colors, getReadableTextColor } from '../../../../utils/colors'
import { Loader } from '../../Loader'
import { VaultItemTag } from '../../Vault/Tag'
import { TagForm } from './Tag'
import { ViewContext } from '../../../../contexts/view'
import ReactMarkdown from 'react-markdown'
import { DeleteButton } from '../../Views/Common/DeleteButton'
interface NoteFormProps {
    onClose: Function
    tags: Array<Tag>
    activeTags: Array<ActiveTag>
}

export const NoteForm = (props: NoteFormProps) => {
    const authStore = useAppSelector((state) => state.session.session)
    const [addItem, { isLoading: postIsLoading }] = useAddItemMutation()
    const [editItem, { isLoading: putIsLoading }] = useEditItemMutation()
    const [value, setValue] = useState<string>('')
    const [tagId, setTagId] = useState<string | null>(null)
    const [bgColor, setBgColor] = useState<string | null>(null)
    const [textColor, setTextColor] = useState<string>('')
    const toast = useToast()
    const viewContext = useContext(ViewContext)
    const [itemInEdit, setItemInEdit] = useState<SecureNote | undefined>(
        undefined
    )

    useEffect(() => {
        if (bgColor) setTextColor(getReadableTextColor(bgColor))
    }, [bgColor])

    useEffect(() => {
        if (viewContext.itemToEdit)
            setItemInEdit(viewContext.itemToEdit as SecureNote)
    }, [viewContext.itemToEdit])

    useEffect(() => {
        if (itemInEdit) {
            const note = itemInEdit as SecureNote
            setValue(note.notes)
            setTagId(note.tagId)
            if (note.color) setBgColor(note.color)
        }
    }, [itemInEdit])

    const handleTagClick = (id: string) => {
        if (tagId === id) setTagId(null)
        else setTagId(id)
    }

    const handleSubmit = async () => {
        let response = {} as MutationResponse
        const note: SecureNote = {
            id: viewContext.itemToEdit?.id || uuidv4(),
            type: ItemType.Note,
            name: undefined,
            notes: value,
            tagId: tagId,
            //customFields: [],
            organizationId: null,
            frequencyAccessed: 0,
            dateCreated:
                viewContext.itemToEdit?.dateCreated || getCurrentTimestamp(),
            dateModified: getCurrentTimestamp(),
            favorite: viewContext.itemToEdit?.favorite || false,
            color: bgColor,
        }

        const encryptedNote = await encryptNote(
            note as SecureNote,
            authStore.keyring.symmetricKey
        )

        if (viewContext.itemToEdit)
            response = await editItem(encryptedNote).unwrap()
        else response = await addItem(encryptedNote).unwrap()

        if (response.status === 'success') {
            toast({
                title: `Note Saved`,
                position: 'bottom',
                isClosable: true,
                status: 'success',
                variant: 'subtle',
                containerStyle: {
                    backdropFilter: 'blur(10px)',
                },
            })
            props.onClose()
        } else {
            toast({
                title: response.message,
                position: 'bottom',
                isClosable: true,
                status: 'error',
            })
        }
    }

    const isLoading = postIsLoading || putIsLoading

    return (
        <>
            {isLoading && <Loader />}
            <DrawerContent
                bgColor={useColorModeValue(
                    'background.light',
                    'background.dark'
                )}
            >
                <DrawerCloseButton />
                <DrawerHeader borderBottomWidth="1px">
                    {viewContext.itemToEdit ? 'Edit note' : 'Create a new note'}
                </DrawerHeader>

                <DrawerBody>
                    <Stack spacing="24px" divider={<Divider />}>
                        <Box>
                            <Tabs colorScheme={'primary'} isLazy size={'sm'}>
                                <TabList>
                                    <Tab>Write</Tab>
                                    <Tab>Preview</Tab>
                                </TabList>

                                <TabPanels>
                                    <TabPanel p={0}>
                                        <Textarea
                                            id="value"
                                            value={value}
                                            onChange={(event) =>
                                                setValue(event.target.value)
                                            }
                                            bgColor={bgColor ? bgColor : ''}
                                            textColor={textColor}
                                            h={80}
                                            rounded={'none'}
                                            resize={'vertical'}
                                        />
                                    </TabPanel>
                                    <TabPanel
                                        bgColor={bgColor ? bgColor : ''}
                                        textColor={textColor}
                                    >
                                        <ReactMarkdown
                                            children={value}
                                            className="markdown"
                                        />
                                    </TabPanel>
                                </TabPanels>
                            </Tabs>
                        </Box>

                        <Flex
                            w="full"
                            justify="center"
                            direction="column"
                            gap={2}
                        >
                            <Box w="full">Color:</Box>
                            <SimpleGrid columns={9} gap={4}>
                                {colors.map((colorOption) => (
                                    <Flex
                                        key={colorOption}
                                        alignItems="center"
                                        justify="center"
                                        rounded={'md'}
                                        bgColor={colorOption}
                                        h={8}
                                        w={8}
                                        cursor="pointer"
                                        onClick={() => setBgColor(colorOption)}
                                    >
                                        {colorOption === bgColor && (
                                            <Icon
                                                as={FiCheck}
                                                color={getReadableTextColor(
                                                    bgColor
                                                )}
                                            />
                                        )}
                                    </Flex>
                                ))}
                            </SimpleGrid>
                        </Flex>

                        <Flex
                            w="full"
                            justify="center"
                            direction="column"
                            gap={2}
                        >
                            <Box>Tag:</Box>
                            <Flex wrap="wrap" gap={3}>
                                {props.tags.map((tag) => (
                                    <Box
                                        key={tag.id}
                                        cursor="pointer"
                                        onClick={() => handleTagClick(tag.id)}
                                    >
                                        <VaultItemTag
                                            tag={tag}
                                            isSelected={tag.id === tagId}
                                            allowDelete={true}
                                            itemsTagged={
                                                props.activeTags.find(
                                                    (activeTag) =>
                                                        activeTag.tagId ===
                                                        tag.id
                                                )?.itemsTagged
                                            }
                                        />
                                    </Box>
                                ))}
                                <Flex>
                                    <TagForm />
                                </Flex>
                            </Flex>
                        </Flex>
                    </Stack>
                </DrawerBody>

                <DrawerFooter borderTopWidth="1px">
                    <Flex
                        w="full"
                        justifyContent={itemInEdit ? 'space-between' : 'end'}
                    >
                        {itemInEdit && (
                            <DeleteButton
                                id={itemInEdit.id}
                                itemType={ItemType.Note}
                                callback={props.onClose}
                            />
                        )}
                        <Flex>
                            <Button
                                variant="outline"
                                mr={3}
                                onClick={() => props.onClose()}
                                size="sm"
                            >
                                Cancel
                            </Button>
                            <Button
                                colorScheme="primary"
                                onClick={handleSubmit}
                                size="sm"
                                isLoading={postIsLoading || putIsLoading}
                            >
                                Save
                            </Button>
                        </Flex>
                    </Flex>
                </DrawerFooter>
            </DrawerContent>
        </>
    )
}
