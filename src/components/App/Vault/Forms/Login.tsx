import {
    Box,
    Button,
    Checkbox,
    Divider,
    DrawerBody,
    DrawerCloseButton,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    Editable,
    EditablePreview,
    EditableTextarea,
    Flex,
    FormControl,
    FormLabel,
    Icon,
    IconButton,
    Input,
    InputGroup,
    InputLeftElement,
    InputRightElement,
    Progress,
    Stack,
    Tooltip,
    useColorModeValue,
    useToast,
} from '@chakra-ui/react'
import { useAppSelector } from '../../../../store/hooks'
import { useContext, useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import {
    ActiveTag,
    ArchivedPassword,
    CustomField,
    ItemType,
    LoginItem,
    Tag,
    TOTP,
} from '../../../../types'
import { passwordStrength } from '../../../../utils/passwords'
import { ZXCVBNResult } from 'zxcvbn'
import {
    FiClock,
    FiEye,
    FiEyeOff,
    FiGlobe,
    FiPlus,
    FiTrash,
    FiTrash2,
} from 'react-icons/fi'
import {
    MutationResponse,
    useAddItemMutation,
    useEditItemMutation,
} from '../../../../services/api'
import {
    encryptLogin,
    getCurrentTimestamp,
    iconGrabber,
} from '../../../../utils/vault'
import { VaultItemTag } from '../Tag'
import { TagForm } from './Tag'
import { ViewContext } from '../../../../contexts/view'
import { Loader } from '../../Loader'
import { CopyButton } from '../CopyButton'
import { PasswordGenerator } from './PasswordGenerator'
import { DeleteButton } from '../../Views/Common/DeleteButton'
import '../../../../assets/css/passwordInput.css'
import { PasswordHistory } from './PasswordHistory'

interface LoginFormProps {
    onClose: Function
    tags: Array<Tag>
    activeTags: Array<ActiveTag>
}

export const LoginForm = (props: LoginFormProps) => {
    const [addItem, { isLoading: postIsLoading }] = useAddItemMutation()
    const [editItem, { isLoading: putIsLoading }] = useEditItemMutation()
    const [itemInEdit, setItemInEdit] = useState<LoginItem | undefined>(
        undefined
    )
    const authStore = useAppSelector((state) => state.session.session)
    const toast = useToast()
    const [title, setTitle] = useState<string>('')
    const [email, setEmail] = useState<string>('')
    const [username, setUsername] = useState<string>('')
    const [emailAsUsername, setEmailAsUsername] = useState<boolean>(true)
    const [password, setPassword] = useState<string>('')
    const [pwHistory, setPwHistory] = useState<Array<ArchivedPassword>>([])
    const [showPassword, setShowPassword] = useState<boolean>(false)
    const [showTotpSecret, setShowTotpSecret] = useState<boolean>(false)
    const [totpTimer, setTotpTimer] = useState<number>(0)
    const [totpToken, setTotpToken] = useState('')
    const [iconFile, setIconFile] = useState<string>('')
    const [siteUrls, setSiteUrls] = useState<Array<string> | null>(null)
    const [notes, setNotes] = useState<string>('')
    const [totp, setTotp] = useState<TOTP | null>(null)
    const totpGen = require('totp-generator')
    const [tagId, setTagId] = useState<string | null>(null)
    const [customFields, setCustomFields] = useState<
        Array<CustomField> | undefined
    >([])
    const [pwStrength, setPwStrength] = useState<ZXCVBNResult>(
        {} as ZXCVBNResult
    )
    const [pwHint, setPwHint] = useState<string>('')

    const viewContext = useContext(ViewContext)

    useEffect(() => {
        if (viewContext.itemToEdit)
            setItemInEdit(viewContext.itemToEdit as LoginItem)
    }, [viewContext.itemToEdit])

    /**
     * Sets the form state to the saved items values when in edit mode
     */
    useEffect(() => {
        if (itemInEdit && !title) {
            if (itemInEdit.name) setTitle(itemInEdit.name)
            setUsername(itemInEdit.loginData.username)
            setEmail(itemInEdit.loginData.email)
            if (itemInEdit.loginData.email === itemInEdit.loginData.username)
                setEmailAsUsername(true)
            else setEmailAsUsername(false)
            setPassword(itemInEdit.loginData.password)
            setPwHistory(itemInEdit.loginData.passwordHistory)
            setNotes(itemInEdit.notes)
            setTagId(itemInEdit.tagId)
            setTotp(itemInEdit.loginData.totp)
            setCustomFields(itemInEdit.customFields)
            setSiteUrls(itemInEdit.loginData.siteUrls)
        }
    }, [itemInEdit])

    /**
     * Handles updates to the TOTP timer and token
     */
    useEffect(() => {
        const interval = setInterval(() => {
            const timer = 30 - (Math.round(Number(new Date()) / 1000) % 30)
            setTotpTimer(timer)
            if (totp?.secret) {
                try {
                    setTotpToken(totpGen(totp.secret))
                } catch (error) {
                    console.log(error)
                }
                return true
            } else setTotpToken('')
        }, 1000)

        return () => clearInterval(interval)
    }, [totp?.secret, totpTimer])

    useEffect(() => {
        if (title) {
            const icon = iconGrabber(title, 'website')
            setIconFile(icon.name)
        }
    }, [title])

    /**
     * Returns a color name based on the current password stength score
     *
     * @returns {string}
     */
    const pwStrengthColor = (): string => {
        let color = 'red'
        switch (pwStrength.score) {
            case 1:
                color = 'orange'
                break
            case 2:
                color = 'yellow'
                break
            case 3:
                color = 'blue'
                break
            case 4:
                color = 'green'
                break
            default:
                color = 'red'
                break
        }

        return color
    }

    /**
     * Updates the password strength when the password or other related login item fields are updated
     * 
     @returns {void}
     */
    useEffect(() => {
        if (password)
            setPwStrength(passwordStrength(password, [username, email]))
    }, [password, email, username])

    /**
     * Updates the password hint tooltip when the password strength is updated
     *
     * @returns {void}
     */
    useEffect(() => {
        let hint = ''
        if (pwStrength.feedback?.warning) {
            hint = `${pwStrength.feedback.warning}. `
            pwStrength.feedback.suggestions.forEach((suggestion) => {
                hint = hint.concat(`${suggestion}`)
            })
        }
        hint = hint.concat(
            `${
                !hint || hint.slice(-1) === '.' ? '' : '.'
            } This password is crackable in ${
                pwStrength.crack_times_display
                    ?.offline_slow_hashing_1e4_per_second
            }. `
        )
        setPwHint(hint)
    }, [pwStrength])

    /**
     * Toggles the state for revealing the password field
     * 
     @returns {void}
     */
    const toggleShowPassword = () => {
        setShowPassword(!showPassword)
    }

    /**
     * Toggles the state for revealing the totp secret field
     * 
     @returns {void}
     */
    const toggleShowTotpSecret = () => {
        setShowTotpSecret(!showTotpSecret)
    }

    /**
     * Handles the click event on a tag. Sets the tagId of the item accordingly.
     *
     * @param id - The id of the selected tag
     */
    const handleTagClick = (id: string) => {
        if (tagId === id) setTagId(null)
        else setTagId(id)
    }

    /**
     * Handles the onChange event for the backup codes input field.
     * Replaces newlines and commas in the inputted string with spaces.
     * Updates the local component state with the sanitized value
     *
     * @param value - The raw string input
     */
    const handleUpdateBackupCodes = (value: string) => {
        const codes = value.replace(/[\r\n,]+/g, ' ')
        setTotp({
            secret: totp?.secret || '',
            backupCodes: codes.split(' '),
        })
    }

    /**
     * Creates a password history list
     *
     * @returns {Array<ArchivedPassword}
     */
    const createPasswordHistory = () => {
        if (itemInEdit) {
            if (itemInEdit.loginData.password !== password) {
                return [
                    ...itemInEdit.loginData.passwordHistory,
                    ...[{ password, created: getCurrentTimestamp() }],
                ]
            }
            return itemInEdit.loginData.passwordHistory
        }
        return [{ password, created: getCurrentTimestamp() }]
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
     * Handles the update event for site url inputs
     *
     * @param {string} newValue - The update value of the target input
     * @param {string} indextoUpdate - Index of the target input
     * @returns {void}
     */
    const handleSiteUrlUpdate = (newValue: string, indextoUpdate: number) => {
        const newUrls = siteUrls!.map((url, index) => {
            return index === indextoUpdate ? newValue : url
        })
        setSiteUrls(newUrls)
    }

    /**
     * Adds a new empty site url
     *
     * @returns {void}
     */
    const addSiteUrl = () => {
        if (siteUrls === null) setSiteUrls([''])
        else setSiteUrls([...siteUrls, ...['']])
    }

    /**
     * Deletes a site url
     *
     * @param {number} indexToDelete - Index of the url to delete
     */
    const deleteSiteUrl = (indexToDelete: number) => {
        const newUrls = siteUrls!.filter(
            (url, index) => index !== indexToDelete
        )
        setSiteUrls(newUrls.length > 0 ? newUrls : null)
    }

    /**
     * Handles the form submit event. Will attempt to create a new item or edit the existing item if `itemToEdit` exists
     *
     * @param {React.FormEvent<HTMLFormElement>} event // The form submit event
     * @returns {void}
     */
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        let response = {} as MutationResponse
        const login: LoginItem = {
            id: itemInEdit?.id || uuidv4(),
            type: ItemType.Login,
            name: title,
            loginData: {
                username: emailAsUsername ? email : username,
                email,
                password,
                totp,
                passwordHistory: createPasswordHistory(),
                siteUrls,
            },
            notes,
            iconFile,
            tagId,
            customFields,
            organizationId: null,
            frequencyAccessed: 0,
            dateCreated: itemInEdit?.dateCreated || getCurrentTimestamp(),
            dateModified: getCurrentTimestamp(),
            favorite: itemInEdit?.favorite || false,
        }
        const encryptedItem = await encryptLogin(
            login as LoginItem,
            authStore.keyring.symmetricKey
        )

        if (itemInEdit) response = await editItem(encryptedItem).unwrap()
        else response = await addItem(encryptedItem).unwrap()

        if (response.status === 'success') {
            toast({
                title: `Login Saved`,
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
            <form onSubmit={handleSubmit} autoComplete="false">
                <DrawerContent
                    bgColor={useColorModeValue(
                        'background.light',
                        'background.dark'
                    )}
                >
                    <DrawerCloseButton />
                    <DrawerHeader borderBottomWidth="1px">
                        {itemInEdit ? 'Edit login' : 'Create a new login'}
                    </DrawerHeader>

                    <DrawerBody>
                        <Stack spacing="12px" divider={<Divider />}>
                            <Box>
                                <FormControl isRequired id="name">
                                    <FormLabel
                                        fontSize={'xs'}
                                        htmlFor="name"
                                        textColor={title && 'GrayText'}
                                    >
                                        Site Name
                                    </FormLabel>
                                    <Input
                                        id="name"
                                        variant="filled"
                                        value={title}
                                        onChange={(event) =>
                                            setTitle(event.target.value)
                                        }
                                    />
                                </FormControl>
                            </Box>

                            <Box>
                                <FormControl id="email">
                                    <FormLabel
                                        fontSize={'xs'}
                                        htmlFor="email"
                                        textColor={email && 'GrayText'}
                                    >
                                        Email
                                    </FormLabel>
                                    <Input
                                        id="email"
                                        variant="filled"
                                        value={email}
                                        onChange={(event) =>
                                            setEmail(event.target.value)
                                        }
                                    />
                                </FormControl>
                            </Box>

                            <Box>
                                {!emailAsUsername && (
                                    <Box>
                                        <FormControl id="username">
                                            <FormLabel
                                                fontSize={'xs'}
                                                htmlFor="username"
                                                textColor={
                                                    username && 'GrayText'
                                                }
                                            >
                                                Username
                                            </FormLabel>

                                            <Input
                                                id="username"
                                                variant="filled"
                                                value={username}
                                                onChange={(event) =>
                                                    setUsername(
                                                        event.target.value
                                                    )
                                                }
                                            />
                                        </FormControl>
                                    </Box>
                                )}
                                <FormControl id="emailAsUsername">
                                    <Checkbox
                                        size={'sm'}
                                        colorScheme={'primary'}
                                        isChecked={emailAsUsername}
                                        onChange={(e) =>
                                            setEmailAsUsername(e.target.checked)
                                        }
                                    >
                                        Use email as username
                                    </Checkbox>
                                </FormControl>
                            </Box>

                            <Flex direction="column" gap={2}>
                                <FormControl>
                                    <FormLabel
                                        fontSize={'xs'}
                                        htmlFor="password"
                                        textColor={password && 'GrayText'}
                                    >
                                        Password
                                    </FormLabel>
                                    <Flex gap={1} align={'center'}>
                                        <InputGroup size="md">
                                            <InputLeftElement width="2.5rem">
                                                <PasswordGenerator
                                                    initialValue={password}
                                                    onSave={setPassword}
                                                />
                                            </InputLeftElement>
                                            <Input
                                                id="password"
                                                value={password}
                                                variant={'filled'}
                                                onChange={(event) =>
                                                    setPassword(
                                                        event.target.value
                                                    )
                                                }
                                                pr="4.5rem"
                                                pl="3rem"
                                                className={
                                                    showPassword ? '' : 'hidden'
                                                }
                                            />
                                            <InputRightElement width="2.75rem">
                                                <Flex gap={1}>
                                                    <IconButton
                                                        aria-label={`${
                                                            showPassword
                                                                ? 'Hide'
                                                                : 'Reveal'
                                                        } password`}
                                                        h="1.75rem"
                                                        icon={
                                                            <Icon
                                                                as={
                                                                    showPassword
                                                                        ? FiEyeOff
                                                                        : FiEye
                                                                }
                                                            />
                                                        }
                                                        size="sm"
                                                        onClick={
                                                            toggleShowPassword
                                                        }
                                                    />
                                                </Flex>
                                            </InputRightElement>
                                        </InputGroup>
                                        {itemInEdit && (
                                            <PasswordHistory
                                                history={pwHistory}
                                            />
                                        )}
                                    </Flex>
                                </FormControl>
                                <Tooltip label={pwHint}>
                                    <Box>
                                        <Progress
                                            size="xs"
                                            marginTop={0}
                                            value={pwStrength.score + 1}
                                            max={5}
                                            isIndeterminate={!password}
                                            colorScheme={pwStrengthColor()}
                                        ></Progress>
                                    </Box>
                                </Tooltip>
                            </Flex>

                            <Flex direction={'column'} w={'full'} gap={2}>
                                <Box>
                                    <FormLabel
                                        fontSize={'xs'}
                                        htmlFor="totp"
                                        textColor={totp?.secret && 'GrayText'}
                                    >
                                        2FA TOTP Seed
                                    </FormLabel>
                                    <Flex
                                        gap={2}
                                        w={'full'}
                                        justifyContent={'space-between'}
                                        align={'center'}
                                    >
                                        <InputGroup size="md" w={'1/2'}>
                                            <Input
                                                id="totp"
                                                type={
                                                    showTotpSecret
                                                        ? 'text'
                                                        : 'password'
                                                }
                                                variant={'filled'}
                                                value={totp ? totp.secret : ''}
                                                onChange={(event) =>
                                                    setTotp({
                                                        secret: event.target
                                                            .value,
                                                        backupCodes:
                                                            totp?.backupCodes ||
                                                            [],
                                                    })
                                                }
                                            />
                                            <InputRightElement zIndex={0}>
                                                <Flex gap={1}>
                                                    <IconButton
                                                        aria-label={`${
                                                            showTotpSecret
                                                                ? 'Hide'
                                                                : 'Reveal'
                                                        } password`}
                                                        h="1.75rem"
                                                        icon={
                                                            <Icon
                                                                as={
                                                                    showTotpSecret
                                                                        ? FiEyeOff
                                                                        : FiEye
                                                                }
                                                            />
                                                        }
                                                        size="sm"
                                                        onClick={
                                                            toggleShowTotpSecret
                                                        }
                                                    />
                                                </Flex>
                                            </InputRightElement>
                                        </InputGroup>
                                        {totpToken && (
                                            <CopyButton
                                                value={totpToken}
                                                label="TOTP"
                                                icon={FiClock}
                                                timer={totpTimer}
                                            />
                                        )}
                                    </Flex>
                                </Box>

                                <Box>
                                    <FormLabel
                                        fontSize={'xs'}
                                        htmlFor="backupCodes"
                                        textColor={
                                            totp?.backupCodes && 'GrayText'
                                        }
                                    >
                                        Authenticator backup codes
                                    </FormLabel>
                                    <Editable
                                        id="backupCodes"
                                        value={totp?.backupCodes.join(' ')}
                                        onChange={(value) =>
                                            handleUpdateBackupCodes(value)
                                        }
                                        textColor={
                                            totp?.backupCodes.join(' ') === ''
                                                ? 'GrayText'
                                                : ''
                                        }
                                    >
                                        <EditableTextarea
                                            h={20}
                                            p={1}
                                            resize={'vertical'}
                                        />
                                        <EditablePreview w="full" />
                                    </Editable>
                                </Box>
                            </Flex>

                            <Flex direction={'column'} gap={2}>
                                <FormLabel
                                    fontSize={'xs'}
                                    htmlFor="service"
                                    textColor={
                                        siteUrls ? 'GrayText' : undefined
                                    }
                                >
                                    URLs
                                </FormLabel>
                                {siteUrls?.map((url, index) => {
                                    return (
                                        <InputGroup size="sm" key="index">
                                            <InputLeftElement h="2.75rem">
                                                <Icon as={FiGlobe} />
                                            </InputLeftElement>
                                            <Input
                                                size={'md'}
                                                pr="1.5rem"
                                                variant="filled"
                                                value={url}
                                                onChange={(event) =>
                                                    handleSiteUrlUpdate(
                                                        event.target.value,
                                                        index
                                                    )
                                                }
                                            />
                                            <InputRightElement
                                                w="2.75rem"
                                                pt="0.5rem"
                                                pr="0.5rem"
                                            >
                                                <IconButton
                                                    h={'1.75rem'}
                                                    aria-label="Delete url"
                                                    onClick={() =>
                                                        deleteSiteUrl(index)
                                                    }
                                                    icon={
                                                        <Icon as={FiTrash2} />
                                                    }
                                                />
                                            </InputRightElement>
                                        </InputGroup>
                                    )
                                })}
                                <Button
                                    leftIcon={<Icon as={FiPlus} />}
                                    size={'xs'}
                                    variant={'ghost'}
                                    onClick={addSiteUrl}
                                >
                                    Add URL
                                </Button>
                            </Flex>
                            <Box>
                                <FormLabel
                                    fontSize={'xs'}
                                    htmlFor="notes"
                                    textColor={notes && 'GrayText'}
                                >
                                    Notes
                                </FormLabel>
                                <Editable
                                    id="notes"
                                    value={notes}
                                    onChange={(value) => setNotes(value)}
                                    textColor={notes === '' ? 'GrayText' : ''}
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
                                        <Flex w={'full'} gap={1} align="center">
                                            <Input
                                                placeholder="Field name"
                                                variant="flushed"
                                                value={customField.name}
                                                fontSize={'xs'}
                                                onChange={(event) =>
                                                    handleCustomFieldInput(
                                                        {
                                                            name: event.target
                                                                .value,
                                                            value: customField.value,
                                                            hidden: customField.hidden,
                                                        },
                                                        index
                                                    )
                                                }
                                            />

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
                                            mt={'2'}
                                            gap={'2'}
                                            justifyContent={'space-between'}
                                        >
                                            <Input
                                                placeholder="Value"
                                                variant="filled"
                                                value={customField.value}
                                                onChange={(event) =>
                                                    handleCustomFieldInput(
                                                        {
                                                            name: customField.name,
                                                            value: event.target
                                                                .value,
                                                            hidden: customField.hidden,
                                                        },
                                                        index
                                                    )
                                                }
                                                type={
                                                    customField.hidden
                                                        ? 'password'
                                                        : 'text'
                                                }
                                            />

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
                                <FormLabel fontSize={'xs'}>Tag</FormLabel>
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
                                    itemType={ItemType.Login}
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
                                    type="submit"
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
