import {
    InputGroup,
    InputLeftElement,
    Icon,
    Input,
    IconButton,
    InputRightElement,
    Spinner,
} from '@chakra-ui/react'
import { useContext, useEffect, useState } from 'react'
import { FaMagic } from 'react-icons/fa'
import { FiSearch, FiX } from 'react-icons/fi'
import { ViewContext } from '../../../contexts/view'

export const SearchBar = (props: { initialQuery: string }) => {
    const viewContext = useContext(ViewContext)

    const [query, setQuery] = useState<string>('')
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const handleChange = (query: string) => {
        setQuery(query)
    }

    /**
     * Effect hook to debounce search input. Delays updating the context search value by 300ms
     */
    useEffect(() => {
        if (query) setIsLoading(true)
        const setGlobalSearchQuery = setTimeout(() => {
            viewContext.setSearchQuery(query) 
            setIsLoading(false)
        }, 300)

        return () => clearTimeout(setGlobalSearchQuery)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query])

    useEffect(() => {
        if (props.initialQuery) setQuery(props.initialQuery)
    }, [props.initialQuery])

    const clearSearch = () => {
        setQuery('')
        viewContext.setSearchQuery('')
    }

    const applySearchSuggestion = () => {
        viewContext.setSearchQuery(viewContext.searchSuggestion)
    }

    return (
        <InputGroup size={'sm'}>
            <InputLeftElement pointerEvents="none">
                <Icon as={FiSearch} color="muted" boxSize="4" />
            </InputLeftElement>
            <Input
                variant={'filled'}
                rounded={'md'}
                value={query}
                placeholder="Search"
                onChange={(event) => handleChange(event.target.value)}
            />
            {viewContext.searchQuery && !isLoading && (
                <InputRightElement width="2.75rem">
                    <IconButton
                        h="1.25rem"
                        size="xs"
                        variant="ghost"
                        icon={<Icon as={FiX} />}
                        onClick={clearSearch}
                        aria-label={'Clear search'}
                    />
                </InputRightElement>
            )}
            {(!viewContext.searchQuery && viewContext.searchSuggestion) && !isLoading && (
                <InputRightElement width="2.75rem">
                    <IconButton
                        h="1.25rem"
                        size="xs"
                        variant="ghost"
                        icon={<Icon as={FaMagic} />}
                        onClick={applySearchSuggestion}
                        aria-label={'Use suggested search'}
                        title={'Use suggested search'}
                    />
                </InputRightElement>
            )}
            {isLoading && (
                <InputRightElement width="2.75rem" p={0.5}>
                    <Spinner size="xs" opacity={0.6} />
                </InputRightElement>
            )}
        </InputGroup>
    )
}
