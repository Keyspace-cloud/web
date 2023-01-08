import {
    Button,
    ButtonGroup,
    Flex,
    Icon,
    IconButton,
    Input,
    Popover,
    PopoverArrow,
    PopoverBody,
    PopoverCloseButton,
    PopoverContent,
    PopoverFooter,
    PopoverHeader,
    PopoverTrigger,
    SimpleGrid,
    useColorModeValue,
    useToast,
} from '@chakra-ui/react'
import { useState, useRef } from 'react'
import { FiCheck, FiPlus } from 'react-icons/fi'
import { useAddItemMutation } from '../../../../services/api'
import { useAppSelector } from '../../../../store/hooks'
import { colors, getReadableTextColor } from '../../../../utils/colors'
import { v4 as uuidv4 } from 'uuid'
import { Tag, ItemType } from '../../../../types'
import { encryptTag } from '../../../../utils/vault'
import { Loader } from '../../Loader'

export const TagForm = () => {
    const [isOpen, setIsOpen] = useState(false)
    const open = () => setIsOpen(!isOpen)
    const close = () => setIsOpen(false)
    const [name, setName] = useState<string>('')
    const [color, setColor] = useState<string>('')
    const authStore = useAppSelector((state) => state.session.session)
    const [addItem, { isLoading }] = useAddItemMutation()
    const initialFocusRef = useRef<HTMLInputElement>(null)
    const toast = useToast()

    const resetForm = () => {
        setName('')
        setColor('')
    }

    const handleSubmit = async () => {
        if (name) {
            const tag = {
                name,
                color,
                id: uuidv4(),
                type: ItemType.Tag,
            } as Tag
            const encryptedTag = await encryptTag(
                tag as Tag,
                authStore.keyring.symmetricKey
            )
            const response = await addItem(encryptedTag).unwrap()
            if (response.status === 'success') {
                toast({
                    title: `Added ${name} to tags`,
                    position: 'bottom',
                    isClosable: true,
                    status: 'success',
                    variant: 'subtle',
                    containerStyle: {
                        backdropFilter: 'blur(10px)',
                    },
                })
                close()
                resetForm()
            } else {
                toast({
                    title: response.message,
                    position: 'bottom',
                    isClosable: true,
                    status: 'error',
                })
            }
        }
    }

    return (
        <>
            {isLoading && <Loader />}
            <Popover
                initialFocusRef={initialFocusRef}
                placement="bottom"
                closeOnBlur={true}
                isOpen={isOpen}
                onClose={close}
            >
                <PopoverTrigger>
                    <IconButton
                        onClick={open}
                        icon={<Icon as={FiPlus} />}
                        aria-label={'Add a new tag'}
                        size="xs"
                    />
                </PopoverTrigger>
                <PopoverContent
                    color="white"
                    //bg="primary.900"
                    //borderColor="primary.900"
                >
                    <PopoverHeader
                        pt={4}
                        fontWeight="bold"
                        //border="0"
                        textColor={useColorModeValue('black', 'white')}
                    >
                        Add a new tag
                    </PopoverHeader>
                    <PopoverArrow />
                    <PopoverCloseButton />
                    <PopoverBody>
                        <Flex alignItems="center" direction="column" gap={4}>
                            <Input
                                ref={initialFocusRef}
                                placeholder="Tag label"
                                value={name}
                                size={'sm'}
                                onChange={(event) =>
                                    setName(event.target.value)
                                }
                            ></Input>
                            <SimpleGrid columns={9} gap={2}>
                                {colors.map((colorOption) => (
                                    <Flex
                                        as="button"
                                        type="button"
                                        key={colorOption}
                                        alignItems="center"
                                        justify="center"
                                        rounded={'md'}
                                        bgColor={colorOption}
                                        h={6}
                                        w={6}
                                        cursor="pointer"
                                        onClick={() => setColor(colorOption)}
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
                                onClick={handleSubmit}
                            >
                                Add
                            </Button>
                        </ButtonGroup>
                    </PopoverFooter>
                </PopoverContent>
            </Popover>
        </>
    )
}
