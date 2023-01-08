import { AddIcon, ExternalLinkIcon } from '@chakra-ui/icons'
import {
    Menu,
    MenuButton,
    IconButton,
    MenuList,
    MenuItem,
    useColorModeValue,
} from '@chakra-ui/react'
import { FiExternalLink } from 'react-icons/fi'
import { inPopOut, popOut } from '../../utils/popup'

export const PopoutButton = () => {
    return (
        <Menu>
            {!inPopOut() && (
                <MenuButton
                    as={IconButton}
                    aria-label="Pop out to..."
                    title="Pop out to..."
                    icon={<FiExternalLink />}
                    variant="ghost"
                />
            )}
            <MenuList
                bgColor={useColorModeValue(
                    'background.light',
                    'background.dark'
                )}
            >
                <MenuItem
                    icon={<AddIcon />}
                    onClick={() => popOut('tab')}
                    bgColor={useColorModeValue(
                        'background.light',
                        'background.dark'
                    )}
                    _hover={{textColor: 'primary.500'}}
                >
                    Tab
                </MenuItem>
                <MenuItem
                    icon={<ExternalLinkIcon />}
                    onClick={() => popOut('window')}
                    bgColor={useColorModeValue(
                        'background.light',
                        'background.dark'
                    )}
                    _hover={{textColor: 'primary.500'}}
                >
                    Window
                </MenuItem>
            </MenuList>
        </Menu>
    )
}
