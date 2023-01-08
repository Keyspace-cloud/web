import {
    Stack,
    Flex,
    Avatar,
    Heading,
    Table,
    TableContainer,
    Tbody,
    Td,
    Tr,
    useColorModeValue,
} from '@chakra-ui/react'
import { useAppSelector } from '../../../../store/hooks'
import { buf2hex } from '../../../../utils/crypto'

export const Profile = () => {
    const authStore = useAppSelector((state) => state.session.session)

    const { email, keyring } = authStore

    const username = email.split('@')[0]

    return (
        <>
            <Stack
                bgColor={useColorModeValue(
                    'background.light',
                    'background.dark'
                )}
                rounded={'md'}
                p={3}
            >
                <Flex align={'center'} gap={4}>
                    <Avatar name={username} size={'sm'} />
                    <Heading size={'md'}>{username}</Heading>
                </Flex>
                <TableContainer>
                    <Table variant="simple">
                        <Tbody>
                            <Tr>
                                <Td fontWeight={'medium'} textColor="GrayText">
                                    Email
                                </Td>
                                <Td>{email}</Td>
                            </Tr>
                            <Tr>
                                <Td fontWeight={'medium'} textColor="GrayText">
                                    Public key
                                </Td>
                                <Td>{buf2hex(keyring.publicKey)}</Td>
                            </Tr>
                        </Tbody>
                    </Table>
                </TableContainer>
            </Stack>
        </>
    )
}
