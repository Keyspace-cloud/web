import { Stack, chakra, Heading, Text } from '@chakra-ui/react'
import noData from '../../../assets/images/no-data.svg'

interface EmptyStateProps {
    title?: string
    subtitle?: string
    image?: string
    children?: React.ReactNode
}

const defaults: EmptyStateProps = {
    title: 'No data',
    subtitle: "You haven't created any items here yet",
    image: noData,
}

export const EmptyState = (props: EmptyStateProps) => {
    const {
        title = defaults.title,
        subtitle = defaults.subtitle,
        image = defaults.image,
        children,
    } = props

    return (
        <Stack
            w="full"
            p={20}
            spacing={3}
            textAlign={'center'}
            justify={'center'}
        >
            <chakra.img height={40} src={image} />
            <Stack spacing={0}>
                <Heading fontSize={'xl'}>{title}</Heading>
                <Text textColor={'GrayText'}>{subtitle}</Text>
            </Stack>
            {children}
        </Stack>
    )
}
