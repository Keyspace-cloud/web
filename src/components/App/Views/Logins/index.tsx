import { AddIcon } from '@chakra-ui/icons'
import { Button, Flex, SimpleGrid, VStack } from '@chakra-ui/react'
import { useContext } from 'react'
import { ViewContext } from '../../../../contexts/view'
import { useGetVaultQuery } from '../../../../services/api'
import { useAppSelector } from '../../../../store/hooks'
import { ItemType, VaultItem, LoginItem, Tag } from '../../../../types'
import { fuzzyMatch, resolveItems } from '../../../../utils/vault'
import { EmptyState } from '../../Vault/EmptyState'
import { LoginCard } from './LoginCard'
import emptySearch from '../../../../assets/images/empty-search.svg'

export const LoginsView = () => {
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
     * Converts the given login into a string of searchable fields. Sensisite fields like password and totp secrets are excluded.
     * 
     * @param login - Login item
     * @returns {string}
     */
    const loginItemSearchable = (login: LoginItem) => {
        const tag = tags.find((tag) => tag.id === login.tagId) as Tag
        return `
        ${login.name} 
        ${login.notes} 
        ${login.loginData.email} 
        ${login.loginData.siteUrls} 
        ${login.loginData.username} 
        ${tag?.name}
        `
    }

    const matchSearchQuery = (login: VaultItem) => {
        return !viewContext.searchQuery
            ? true
            : fuzzyMatch(
                  viewContext.searchQuery.toLowerCase(),
                  loginItemSearchable(login as LoginItem).toLowerCase()
              )
    }

    const sortByDate = (a: VaultItem, b: VaultItem) =>
        b.dateCreated - a.dateCreated

    const logins = data
        ? resolveItems(data.data, ItemType.Login)
              .sort(sortByDate)
              .filter(matchSearchQuery)
        : []

    const showEmptyState = logins.length === 0 && !isLoading

    return (
        <Flex w="full" p={{ base: '4', lg: '8' }}>
            <VStack w="full">
                <SimpleGrid
                    w="full"
                    columns={{ base: 1, md: 2, xl: 3 }}
                    spacing={{ base: '4', lg: '8' }}
                >
                    {logins
                        .sort((a, b) => b.dateCreated - a.dateCreated)
                        .map((login, n) => (
                            <LoginCard
                                key={login.id}
                                login={login as LoginItem}
                                tags={tags as Array<Tag>}
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
                                ? `No logins found matching "${viewContext.searchQuery}"`
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
                                Create a login
                            </Button>
                        </Flex>
                    </EmptyState>
                )}
            </VStack>
        </Flex>
    )
}
