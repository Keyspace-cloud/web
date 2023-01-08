import { As, Button, ButtonProps, HStack, Icon, Text } from '@chakra-ui/react'
import * as React from 'react'

interface NavButtonProps extends ButtonProps {
  icon: As
  label: string,
}

export const NavButton = (props: NavButtonProps) => {
  const { icon, label, ...buttonProps } = props
  return (
    <Button variant="ghost" justifyContent="start" {...buttonProps}>
      <HStack spacing="3">
        <Icon as={icon} boxSize="4" color="subtle" />
        <Text pt={'1'} fontWeight={"light"} fontSize={"sm"}>{label}</Text>
      </HStack>
    </Button>
  )
}
