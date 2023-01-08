import { Flex, SimpleGrid, VStack, Button } from '@chakra-ui/react'
import { ItemType, SecureNote, Tag, VaultItem } from '../../../../types'
import { NoteCard } from './NoteCard'
import { useGetVaultQuery } from '../../../../services/api'
import { fuzzyMatch, resolveItems } from '../../../../utils/vault'
import { useAppSelector } from '../../../../store/hooks'
import { useContext } from 'react'
import { ViewContext } from '../../../../contexts/view'
import { EmptyState } from '../../Vault/EmptyState'
import { AddIcon } from '@chakra-ui/icons'
import emptySearch from '../../../../assets/images/empty-search.svg'

export const NotesView = () => {
    const authStore = useAppSelector((state) => state.session.session)
    const viewContext = useContext(ViewContext)
    
    const { data, isLoading } = useGetVaultQuery(
        authStore.keyring.symmetricKey,
        {
            pollingInterval: 5000,
        }
    )

    const tags = data ? resolveItems(data.data, ItemType.Tag) : []

    /**
     * Converts the given note into a string of searchable fields. Includes the item tag if present.
     * 
     * @param note - Secure note
     * @returns {string}
     */
    const noteSearchable = (note: SecureNote) => {
        const tag = tags.find((tag) => tag.id === note.tagId)
        return `
        ${tag?.name} 
        ${Object.values(note).join('').toLowerCase()}
        `
    }

    const matchSearchQuery = (note: VaultItem) => {
        return !viewContext.searchQuery
            ? true
            : fuzzyMatch(
                  viewContext.searchQuery.toLowerCase(),
                  noteSearchable(note as SecureNote)
              )
    }

    const sortByDate = (a: VaultItem, b: VaultItem) =>
        b.dateCreated - a.dateCreated

    const notes = data
        ? resolveItems(data.data, ItemType.Note)
              .sort(sortByDate)
              .filter(matchSearchQuery)
        : []
    
    const showEmptyState = notes.length === 0 && !isLoading
    return (
        <Flex w="full" p={{ base: '4', lg: '8' }}>
            <VStack w="full">
                <SimpleGrid
                    w="full"
                    columns={{ base: 1, md: 2, xl: 3 }}
                    spacing={{ base: '4', lg: '8' }}
                >
                    {notes?.map((note, n) => (
                        <NoteCard
                            note={note as SecureNote}
                            tags={tags as Array<Tag>}
                            key={n}
                        />
                    ))}
                </SimpleGrid>
                {showEmptyState && (
                    <EmptyState
                        title={
                            viewContext.searchQuery ? `No results` : undefined
                        }
                        subtitle={
                            viewContext.searchQuery
                                ? `No notes found for "${viewContext.searchQuery}"`
                                : undefined
                        }
                        image={
                            viewContext.searchQuery ? emptySearch : undefined
                        }
                    >
                        <Flex justify={'center'}>
                            <Button
                                size={'sm'}
                                colorScheme="primary"
                                onClick={() => viewContext.setFormOpen(true)}
                                leftIcon={<AddIcon />}
                            >
                                Create a note
                            </Button>
                        </Flex>
                    </EmptyState>
                )}
            </VStack>
        </Flex>
    )
}
