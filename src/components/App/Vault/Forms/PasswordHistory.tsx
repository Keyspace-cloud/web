import {
    Popover,
    PopoverTrigger,
    IconButton,
    Icon,
    PopoverContent,
    PopoverHeader,
    PopoverArrow,
    PopoverCloseButton,
    PopoverBody,
    Stack,
    StackDivider,
    Flex,
    Text,
} from '@chakra-ui/react'
import { BiHistory } from 'react-icons/bi'
import { ArchivedPassword } from '../../../../types'
import { getFormattedDate } from '../../../../utils/vault'
import { CopyButton } from '../CopyButton'

interface PasswordHistoryProps {
    history: ArchivedPassword[]
}

export const PasswordHistory = (props: PasswordHistoryProps) => {
    const { history } = props

    return (
        <>
            <Popover isLazy placement="left" closeOnBlur={true}>
                <PopoverTrigger>
                    <IconButton
                        variant={'flushed'}
                        icon={<Icon as={BiHistory} />}
                        aria-label={'Password history'}
                        title={'Password history'}
                        h="2.5rem"
                        size="sm"
                    />
                </PopoverTrigger>
                <PopoverContent color="white">
                    <PopoverHeader
                        pt={4}
                        fontWeight="bold"
                        fontSize={'lg'}
                        border="0"
                    >
                        Password history
                    </PopoverHeader>
                    <PopoverArrow />
                    <PopoverCloseButton />
                    <PopoverBody>
                        <Stack
                            divider={<StackDivider borderColor="GrayText" />}
                        >
                            {history.map(
                                (archivedPassword: ArchivedPassword) => (
                                    <Flex
                                        align={'center'}
                                        justify="space-between"
                                        w="full"
                                        key={archivedPassword.created}
                                    >
                                        <Flex direction={'column'}>
                                            <CopyButton
                                                label="Archived password"
                                                value={
                                                    archivedPassword.password
                                                }
                                                maxW={'64'}
                                            />
                                            <Text
                                                opacity={'0.6'}
                                                fontSize={'xs'}
                                                ml={1.5}
                                            >
                                                {getFormattedDate(
                                                    archivedPassword.created
                                                )}
                                            </Text>
                                        </Flex>
                                    </Flex>
                                )
                            )}
                        </Stack>
                    </PopoverBody>
                </PopoverContent>
            </Popover>
        </>
    )
}
