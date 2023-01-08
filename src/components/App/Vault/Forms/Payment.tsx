import {
    DrawerContent,
    useColorModeValue,
    DrawerCloseButton,
    DrawerHeader,
    DrawerBody,
    Stack,
    FormControl,
    Box,
    Editable,
    EditableInput,
    EditablePreview,
    FormLabel,
    Input,
    PinInput,
    PinInputField,
    Flex,
    EditableTextarea,
    Checkbox,
    Icon,
    SimpleGrid,
    useToast,
    Button,
    DrawerFooter,
    Divider,
    IconButton,
} from '@chakra-ui/react'
import { useContext, useEffect, useState } from 'react'
import { FiCheck, FiPlus, FiTrash } from 'react-icons/fi'
import {
    Tag,
    ActiveTag,
    PaymentCard,
    ItemType,
    CustomField,
} from '../../../../types'
import { colors, getReadableTextColor } from '../../../../utils/colors'
import {
    encryptPaymentCard,
    formattedCardNumber,
    getCurrentTimestamp,
    iconGrabber,
} from '../../../../utils/vault'
import { VaultItemTag } from '../Tag'
import { TagForm } from './Tag'
import { v4 as uuidv4 } from 'uuid'
import {
    MutationResponse,
    useAddItemMutation,
    useEditItemMutation,
} from '../../../../services/api'
import { useAppSelector } from '../../../../store/hooks'
import { Loader } from '../../Loader'
import { ViewContext } from '../../../../contexts/view'
import { DeleteButton } from '../../Views/Common/DeleteButton'

interface PaymentFormProps {
    onClose: Function
    tags: Array<Tag>
    activeTags: Array<ActiveTag>
}

export const PaymentForm = (props: PaymentFormProps) => {
    const [addItem, { isLoading: postIsLoading }] = useAddItemMutation()
    const [editItem, { isLoading: putIsLoading }] = useEditItemMutation()
    const authStore = useAppSelector((state) => state.session.session)
    const [itemInEdit, setItemInEdit] = useState<PaymentCard | undefined>(
        undefined
    )
    const [name, setName] = useState<string>('')
    const [cardNumber, setCardNumber] = useState<string>('')
    const [expiry, setExpiry] = useState<string>('')
    const [expiryIsValid, setExpiryIsValid] = useState<boolean>(true)
    const [cvv, setCvv] = useState<string>('')
    const [cardholderName, setCardholderName] = useState<string>('')
    const [pin, setPin] = useState<string>('')
    const [notes, setNotes] = useState<string>('')
    const [rfid, setRfid] = useState<boolean>(false)
    const [color, setColor] = useState<string>('')
    const [tagId, setTagId] = useState<string | null>(null)
    const [iconFile, setIconFile] = useState<string>('')
    const [customFields, setCustomFields] = useState<
        Array<CustomField> | undefined
    >([])
    const toast = useToast()
    const viewContext = useContext(ViewContext)

    useEffect(() => {
        if (viewContext.itemToEdit)
            setItemInEdit(viewContext.itemToEdit as PaymentCard)
    }, [viewContext.itemToEdit])

    useEffect(() => {
        if (expiry && expiry.length === 4) {
            const month = Number(expiry.slice(0, 2))
            setExpiryIsValid(month > 0 && month < 13)
        } else setExpiryIsValid(true)
    }, [expiry])

    useEffect(() => {
        if (itemInEdit) {
            setName(itemInEdit.name!)
            setCardNumber(String(itemInEdit.cardNumber))
            setExpiry(
                `${itemInEdit.expiry.slice(0, 2)}${itemInEdit.expiry.slice(
                    3,
                    5
                )}`
            )
            setCvv(itemInEdit.securityCode)
            setCardholderName(itemInEdit.cardholderName)
            setPin(itemInEdit.pin)
            setRfid(itemInEdit.rfid)
            setTagId(itemInEdit.tagId)
            setColor(itemInEdit.color!)
            setNotes(itemInEdit.notes)
            setCustomFields(itemInEdit.customFields)
        }
    }, [itemInEdit])

    useEffect(() => {
        if (name) {
            const icon = iconGrabber(name, 'bank')
            setIconFile(icon.name)
        }
    }, [name])

    const handleTagClick = (id: string) => {
        if (tagId === id) setTagId(null)
        else setTagId(id)
    }

    /**
     * Updates an existing custom field
     *
     * @param data - The updated custom field
     * @param index - The index of the field to update
     */
    const handleCustomFieldInput = (data: CustomField, index: number) => {
        setCustomFields(
            customFields!.map((customField, i) => {
                if (index === i) return data
                return customField
            })
        )
    }

    /**
     * Adds a new blank custom field
     */
    const addNewCustomField = () => {
        setCustomFields(
            customFields?.concat({
                name: '',
                value: '',
                hidden: false,
            })
        )
    }

    /**
     * Deletes the custom field with the given index
     *
     * @param index - The index of the field to delete
     */
    const deleteCustomField = (index: number) => {
        setCustomFields(customFields?.filter((_, i) => i !== index))
    }

    /**
     * Handles the form submit event. Will attempt to create a new item or edit the existing item if `itemToEdit` exists
     *
     * @param {React.FormEvent<HTMLFormElement>} event // The form submit event
     * @returns {void}
     */
    const handleSubmit = async () => {
        let response = {} as MutationResponse

        if (!name || !cardNumber || !expiry || !cardholderName) return false

        const card: PaymentCard = {
            id: itemInEdit?.id || uuidv4(),
            type: ItemType.PaymentCard,
            name,
            cardholderName,
            cardNumber: cardNumber.replace(/\s/g, ''),
            expiry: `${expiry.slice(0, 2)}/${expiry.slice(2, 4)}`,
            securityCode: cvv,
            pin,
            rfid,
            notes,
            iconFile,
            tagId,
            customFields,
            organizationId: null,
            frequencyAccessed: 0,
            dateCreated: itemInEdit?.dateCreated || getCurrentTimestamp(),
            dateModified: getCurrentTimestamp(),
            favorite: itemInEdit?.favorite || false,
            color,
        }

        const encryptedItem = await encryptPaymentCard(
            card as PaymentCard,
            authStore.keyring.symmetricKey
        )

        if (itemInEdit) response = await editItem(encryptedItem).unwrap()
        else response = await addItem(encryptedItem).unwrap()

        if (response.status === 'success') {
            toast({
                title: `Card Saved`,
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

    const isLoading = () => {
        return postIsLoading || putIsLoading
    }

    return (
        <>
            {isLoading() && <Loader />}
            <form autoComplete="false">
                <DrawerContent
                    bgColor={useColorModeValue(
                        'background.light',
                        'background.dark'
                    )}
                >
                    <DrawerCloseButton />
                    <DrawerHeader borderBottomWidth="1px">
                        {itemInEdit
                            ? 'Edit Payment Card'
                            : 'Create a new Payment Card'}
                    </DrawerHeader>

                    <DrawerBody>
                        <Stack spacing="12px" divider={<Divider />}>
                            <Box>
                                <FormControl isRequired id="name">
                                    <FormLabel fontSize={'xs'} htmlFor="name">
                                        Name
                                    </FormLabel>
                                    <Input
                                        id="name"
                                        variant="filled"
                                        placeholder="Bank Name"
                                        value={name}
                                        onChange={(event) =>
                                            setName(event.target.value)
                                        }
                                        fontFamily={'mono'}
                                    />
                                </FormControl>
                            </Box>

                            <Box>
                                <FormControl isRequired id="number">
                                    <FormLabel fontSize={'xs'} htmlFor="number">
                                        Card number
                                    </FormLabel>
                                    <Input
                                        id="number"
                                        variant="filled"
                                        placeholder="XXXX XXXX XXXX XXXX"
                                        value={formattedCardNumber(cardNumber)}
                                        onChange={(event) =>
                                            setCardNumber(event.target.value)
                                        }
                                        fontFamily={'mono'}
                                    />
                                </FormControl>
                            </Box>

                            <Flex
                                align={'center'}
                                justify={'space-between'}
                                w={'full'}
                            >
                                <Box>
                                    <FormControl isRequired id="expiry">
                                        <FormLabel
                                            fontSize={'xs'}
                                            htmlFor="expiry"
                                        >
                                            Valid thru (MM/YY){' '}
                                        </FormLabel>

                                        <PinInput
                                            variant={'filled'}
                                            size={'sm'}
                                            value={expiry}
                                            onChange={(value) =>
                                                setExpiry(value)
                                            }
                                            id="expiry"
                                            placeholder="X"
                                            isInvalid={!expiryIsValid}
                                            errorBorderColor="red.500"
                                        >
                                            <PinInputField />
                                            <PinInputField mr={1} />
                                            <span>/</span>
                                            <PinInputField ml={1} />
                                            <PinInputField />
                                        </PinInput>
                                    </FormControl>
                                </Box>

                                <Box>
                                    <FormControl id="cvv" isRequired>
                                        <FormLabel
                                            fontSize={'xs'}
                                            htmlFor="cvv"
                                        >
                                            CVV
                                        </FormLabel>
                                        <Input
                                            id="cvv"
                                            variant="filled"
                                            placeholder="XXX"
                                            value={cvv}
                                            onChange={(event) =>
                                                setCvv(event.target.value)
                                            }
                                            fontFamily={'mono'}
                                            width={20}
                                        />
                                    </FormControl>
                                </Box>
                            </Flex>

                            <Box>
                                <FormControl isRequired id="cardholder">
                                    <FormLabel fontSize={'xs'} htmlFor="name">
                                        Cardholder Name
                                    </FormLabel>

                                    <Input
                                        id="name"
                                        variant="filled"
                                        placeholder="James Delos"
                                        value={cardholderName}
                                        onChange={(event) =>
                                            setCardholderName(
                                                event.target.value
                                            )
                                        }
                                        fontFamily={'mono'}
                                    />
                                </FormControl>
                            </Box>

                            <Flex
                                align={'center'}
                                justify={'space-between'}
                                w={'full'}
                            >
                                <Box>
                                    <FormControl id="pin">
                                        <FormLabel
                                            fontSize={'xs'}
                                            htmlFor="pin"
                                        >
                                            PIN
                                        </FormLabel>
                                        <Input
                                            id="pin"
                                            variant="filled"
                                            placeholder="XXX"
                                            value={pin}
                                            onChange={(event) =>
                                                setPin(event.target.value)
                                            }
                                            fontFamily={'mono'}
                                            width={20}
                                        />
                                    </FormControl>
                                </Box>

                                <Box>
                                    <FormControl id="contactless">
                                        <Checkbox
                                            size={'sm'}
                                            colorScheme={'primary'}
                                            isChecked={rfid}
                                            onChange={(e) =>
                                                setRfid(e.target.checked)
                                            }
                                        >
                                            Contactless
                                        </Checkbox>
                                    </FormControl>
                                </Box>
                            </Flex>

                            <Box>
                                <FormLabel fontSize={'xs'} htmlFor="notes">
                                    Notes
                                </FormLabel>
                                <Editable
                                    id="notes"
                                    value={notes}
                                    onChange={(value) => setNotes(value)}
                                    textColor={notes === '' ? 'GrayText' : ''}
                                    placeholder="Notes"
                                >
                                    <EditableTextarea
                                        h={20}
                                        p={1}
                                        resize={'vertical'}
                                    />
                                    <EditablePreview w="full" />
                                </Editable>
                            </Box>

                            {customFields?.map((customField, index) => (
                                <Box key={`customField${index}`}>
                                    <FormControl>
                                        <Flex w={'full'} gap={1}>
                                            <Editable
                                                placeholder="Name"
                                                value={customField.name}
                                                fontSize={'xs'}
                                                onChange={(name) =>
                                                    handleCustomFieldInput(
                                                        {
                                                            name,
                                                            value: customField.value,
                                                            hidden: customField.hidden,
                                                        },
                                                        index
                                                    )
                                                }
                                            >
                                                <EditablePreview
                                                    w="full"
                                                    textColor={'GrayText'}
                                                />
                                                <Input as={EditableInput} />
                                            </Editable>
                                            <IconButton
                                                size={'xs'}
                                                variant={'ghost'}
                                                icon={
                                                    <Icon
                                                        as={FiTrash}
                                                        color={'red.500'}
                                                    />
                                                }
                                                aria-label="Delete field"
                                                onClick={() =>
                                                    deleteCustomField(index)
                                                }
                                            />
                                        </Flex>
                                        <Flex
                                            w={'full'}
                                            justifyContent={'space-between'}
                                        >
                                            <Editable
                                                placeholder="Value"
                                                value={customField.value}
                                                onChange={(value) =>
                                                    handleCustomFieldInput(
                                                        {
                                                            name: customField.name,
                                                            value,
                                                            hidden: customField.hidden,
                                                        },
                                                        index
                                                    )
                                                }
                                            >
                                                <EditablePreview w="full" />
                                                <Input
                                                    as={EditableInput}
                                                    type={
                                                        customField.hidden
                                                            ? 'password'
                                                            : 'text'
                                                    }
                                                />
                                            </Editable>
                                            <Checkbox
                                                size={'sm'}
                                                colorScheme={'primary'}
                                                isChecked={customField.hidden}
                                                onChange={(e) =>
                                                    handleCustomFieldInput(
                                                        {
                                                            name: customField.name,
                                                            value: customField.value,
                                                            hidden: e.target
                                                                .checked,
                                                        },
                                                        index
                                                    )
                                                }
                                            >
                                                Hidden
                                            </Checkbox>
                                        </Flex>
                                    </FormControl>
                                </Box>
                            ))}

                            <Button
                                leftIcon={<Icon as={FiPlus} />}
                                size={'xs'}
                                variant={'ghost'}
                                onClick={addNewCustomField}
                            >
                                Add custom field
                            </Button>

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
                                            onClick={() =>
                                                setColor(colorOption)
                                            }
                                        >
                                            {colorOption === color && (
                                                <Icon
                                                    as={FiCheck}
                                                    color={getReadableTextColor(
                                                        color
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
                                            onClick={() =>
                                                handleTagClick(tag.id)
                                            }
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
                            justifyContent={
                                itemInEdit ? 'space-between' : 'end'
                            }
                        >
                            {itemInEdit && (
                                <DeleteButton
                                    id={itemInEdit.id}
                                    itemType={ItemType.PaymentCard}
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
            </form>
        </>
    )
}
