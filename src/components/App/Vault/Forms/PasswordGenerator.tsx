import {
    Flex,
    FormLabel,
    Switch,
    Popover,
    PopoverTrigger,
    Text,
    IconButton,
    Icon,
    PopoverContent,
    PopoverHeader,
    PopoverArrow,
    PopoverCloseButton,
    PopoverBody,
    SimpleGrid,
    Box,
    Slider,
    SliderTrack,
    SliderFilledTrack,
    Tooltip,
    SliderThumb,
    Button,
    ButtonGroup,
    PopoverFooter,
    useColorModeValue,
    useClipboard,
    useToast,
} from '@chakra-ui/react'
import { useState, ChangeEvent, useEffect } from 'react'
import { FiSettings, FiRefreshCcw } from 'react-icons/fi'
import { passwordOptions, randomPassword } from '../../../../utils/passwords'

interface PasswordGeneratorProps {
    initialValue: string
    onSave: Function
}

const defaultPwOptions: passwordOptions = {
    length: 32,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: false,
}

export const PasswordGenerator = (props: PasswordGeneratorProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const open = () => setIsOpen(!isOpen)
    const close = () => setIsOpen(false)
    const [candidatePw, setCandidatePw] = useState<string>('')
    const { hasCopied, onCopy } = useClipboard(candidatePw)
    const [pwOptions, setPwOptions] =
        useState<passwordOptions>(defaultPwOptions)

    const handleSave = () => {
        props.onSave(candidatePw)
        close()
    }

    const toast = useToast()

    /**
     * Generates a set of toggle switches to control password generator options
     *
     * @returns {JSX.Element}
     */
    const pwOptionToggles = () => {
        const options = [
            {
                name: 'uppercase',
                label: 'Uppercase characters',
            },
            {
                name: 'lowercase',
                label: 'Lowercase characters',
            },
            {
                name: 'numbers',
                label: 'Numbers',
            },
            {
                name: 'symbols',
                label: 'Symbols',
            },
        ]

        return (
            <>
                {options.map((option) => {
                    return (
                        <Flex
                            key={option.label}
                            w="full"
                            justifyContent={'space-between'}
                        >
                            <FormLabel
                                htmlFor={option.name}
                                mb="0"
                                fontSize="sm"
                            >
                                {option.label}
                            </FormLabel>
                            <Switch
                                colorScheme={'primary'}
                                id={option.name}
                                isChecked={Boolean(
                                    pwOptions[
                                        option.name as keyof passwordOptions
                                    ]
                                )}
                                onChange={handleOptionsChange}
                            />
                        </Flex>
                    )
                })}
            </>
        )
    }

    /**
     * Handles the toggle switch event for the password option toggles.
     * If the number of enabled toggles is 1, the change is blocked to ensure all options cannot be disabled
     *
     * @param event the ChangeEvent fired by the Switch component
     * @returns {boolean | void}
     */
    const handleOptionsChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (
            Object.values(pwOptions).filter((value) => Boolean(value) === true)
                .length < 3
        ) {
            if (event.target.checked === false) return false
        }
        updatePasswordOptions(
            event.target.id as keyof passwordOptions,
            event.target.checked
        )
    }

    /**
     * Handles the change event for the password length slider
     *
     * @param value the value to update the slider state
     */
    const handlePwLengthChange = (value: number) => {
        updatePasswordOptions('length', value)
    }

    /**
     * Re-generates the password when the password options are updated
     *
     * @returns {void}
     */
    useEffect(() => {
        setCandidatePw(randomPassword(pwOptions))
    }, [pwOptions])

    /**
     * Generates a random password based on the current `pwOptions`
     *
     * @returns {void}
     */
    const setRandomPassword = () => {
        setCandidatePw(randomPassword(pwOptions))
    }

    /**
     * Updates the given option / value pair in the `pwOptions` state
     *
     * @param o the option key
     * @param value the option value
     * @returns {void}
     */
    const updatePasswordOptions = <K extends keyof passwordOptions>(
        o: K,
        value: passwordOptions[K]
    ) => {
        let options = Object.assign({}, pwOptions)
        options[o] = value
        setPwOptions(options)
    }

    useEffect(() => {
        setCandidatePw(
            props.initialValue ? props.initialValue : randomPassword(pwOptions)
        )
    }, [props.initialValue])

    useEffect(() => {
        if (hasCopied)
            toast({
                title: `Copied to clipboard`,
                position: 'bottom',
                isClosable: true,
                duration: 3000,
                variant: 'subtle',
                containerStyle: {
                    backdropFilter: 'blur(10px)',
                },
            })
    }, [hasCopied])

    return (
        <Popover
            placement="bottom"
            closeOnBlur={false}
            isOpen={isOpen}
            onClose={close}
            isLazy
        >
            <PopoverTrigger>
                <IconButton
                    onClick={open}
                    icon={<Icon as={FiSettings} />}
                    aria-label={'Open password generator'}
                    title={'Open password generator'}
                    h={10}
                    size="sm"
                />
            </PopoverTrigger>
            <PopoverContent
                bgColor={useColorModeValue(
                    'gray.50',
                    'gray.800'
                )}
                boxShadow={'2xl'}
            >
                <PopoverHeader
                    pt={4}
                    fontWeight="bold"
                    fontSize={'lg'}
                    border="0"
                >
                    Password generator
                </PopoverHeader>
                <PopoverArrow />
                <PopoverCloseButton />
                <PopoverBody>
                    <SimpleGrid columns={1} spacing={2}>
                        <Box
                            p={3}
                            rounded={'md'}
                            border={'1px dashed'}
                            fontFamily={'monospace'}
                            color={'primary.500'}
                            borderColor={'primary.500'}
                            cursor={'pointer'}
                            onClick={onCopy}
                            title={'Click to copy'}
                        >
                            {candidatePw}
                        </Box>
                        {pwOptionToggles()}
                        <Flex w="full" justifyContent={'space-between'} gap={4}>
                            <Text fontSize="sm" >
                                Length
                            </Text>
                            <Slider
                                aria-label="password length"
                                max={128}
                                min={5}
                                value={pwOptions.length}
                                onChange={handlePwLengthChange}
                                colorScheme="primary"
                            >
                                <SliderTrack>
                                    <SliderFilledTrack />
                                </SliderTrack>
                                <Tooltip
                                    hasArrow
                                    bg="primary.500"
                                    color="white"
                                    placement="top"
                                    label={`${pwOptions.length}`}
                                >
                                    <SliderThumb />
                                </Tooltip>
                            </Slider>
                        </Flex>
                        <Button
                            variant={'outline'}
                            colorScheme={'primary'}
                            leftIcon={<Icon as={FiRefreshCcw} />}
                            onClick={setRandomPassword}
                        >
                            Generate
                        </Button>
                    </SimpleGrid>
                </PopoverBody>
                <PopoverFooter
                    border="0"
                    alignItems="center"
                    justifyContent="end"
                    pb={4}
                >
                    <ButtonGroup size="sm">
                        <Button
                            colorScheme="primary"
                            type="button"
                            onClick={handleSave}
                        >
                            Set password
                        </Button>
                    </ButtonGroup>
                </PopoverFooter>
            </PopoverContent>
        </Popover>
    )
}
