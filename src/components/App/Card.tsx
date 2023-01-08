import { Box, BoxProps, useColorModeValue } from '@chakra-ui/react'

export const Card = (props: BoxProps) => 
  (
  <Box
    minH="3xs"
    bg="bg-surface"
    borderRadius="lg"
    {...props}
  />
)
