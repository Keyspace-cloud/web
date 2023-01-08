import { chakra, ImageProps, useColorModeValue } from '@chakra-ui/react'
import { iconGrabber } from '../../utils/vault'

interface KSIconProps extends ImageProps {
    name: string,
    colorMode?: 'DARK' | 'LIGHT'
}

export const KSIcon = (props: KSIconProps) => {
    const { name, colorMode } = props
    const icon =  iconGrabber(name)
    const iconPath = require(`../../icons/${icon.name}.svg`)

    const FILTER_DARK = 'invert(0%) sepia(93%) saturate(0%) hue-rotate(284deg) brightness(96%) contrast(107%)'
    const FILTER_LIGHT = 'invert(98%) sepia(98%) saturate(0%) hue-rotate(311deg) brightness(103%) contrast(102%)'

    const defaultFilter = useColorModeValue(
        FILTER_DARK,
        FILTER_LIGHT
    )

    const filter = () => {
        if (colorMode) return colorMode === 'DARK' ? FILTER_DARK : FILTER_LIGHT
        return defaultFilter
    }

    return (
        <chakra.img
            filter={filter()}
            opacity={'0.8'}
            src={iconPath}
            {...props}
        />
    )
}
