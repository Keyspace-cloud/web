import { Avatar, Box, Flex, HStack, Icon, Text } from '@chakra-ui/react'
import * as React from 'react'
import { FiChevronDown } from 'react-icons/fi'

interface UserProfileProps {
    name: string
    image: string
    email: string
}

export const UserProfile = (props: UserProfileProps) => {
    const { name, image, email } = props
    return (
        <Flex gap="2" alignItems={'center'} title={name} px={'3'}>
            <Avatar name={name} size={'xs'} />
            <Text
                fontWeight="semibold"
                fontSize="xs"
                textAlign={'left'}
                whiteSpace={'nowrap'}
                overflow={'hidden'}
                textOverflow={'ellipsis'}
                maxW={{base: '48', lg: '28'}}
            >
                {name}
            </Text>
        </Flex>
    )
}
