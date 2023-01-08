import {
    TableContainer,
    Table,
    Tbody,
    Tr,
    Td,
    useColorModeValue,
} from '@chakra-ui/react'
import { ColorModeSwitcher } from '../../../Common/ColorModeSwitcher'
import packageJson from '../../../../../package.json'

export const AppSettings = () => {
    return (
        <TableContainer
            bgColor={useColorModeValue('background.light', 'background.dark')}
            rounded={'md'}
            p={3}
        >
            <Table variant="simple">
                <Tbody>
                    <Tr>
                        <Td fontWeight={'medium'} textColor="GrayText">Theme</Td>
                        <Td>
                            <ColorModeSwitcher />
                        </Td>
                    </Tr>
                    <Tr>
                        <Td fontWeight={'medium'} textColor="GrayText">App version</Td>
                        <Td>
                            {packageJson.version}
                        </Td>
                    </Tr>
                </Tbody>
            </Table>
        </TableContainer>
    )
}
