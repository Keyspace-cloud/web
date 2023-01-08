import {
    Box,
    Drawer,
    DrawerContent,
    DrawerOverlay,
    Flex,
    useColorModeValue,
    useDisclosure,
  } from '@chakra-ui/react'
  import { Sidebar } from './Sidebar'
  import { ToggleButton } from './ToggleButton'
  
  export const Navbar = () => {
    const { isOpen, onToggle, onClose } = useDisclosure()
    return (
      <Box
        width="full"
        bg="bg-surface"
        boxShadow={useColorModeValue('sm', 'sm-dark')}
      >
        <Flex justify="space-between">
          {/* <Logo /> */}
          <ToggleButton isOpen={isOpen} aria-label="Open Menu" onClick={onToggle} />
          <Drawer
            isOpen={isOpen}
            placement="left"
            onClose={onClose}
            isFullHeight
            preserveScrollBarGap
            // Only disabled for showcase
            trapFocus={false}
          >
            <DrawerOverlay backdropFilter='blur(10px)'/>
            <DrawerContent>
              <Sidebar toggleSidebar={onToggle}/>
            </DrawerContent>
          </Drawer>
        </Flex>
      </Box>
    )
  }
  