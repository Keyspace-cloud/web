import { AddIcon } from '@chakra-ui/icons'
import { Flex, VStack, SimpleGrid, Button } from '@chakra-ui/react'
import { useContext } from 'react'
import { ViewContext } from '../../../../contexts/view'
import { useGetVaultQuery } from '../../../../services/api'
import { useAppSelector } from '../../../../store/hooks'
import { ItemType, VaultItem, PaymentCard, Tag } from '../../../../types'
import { resolveItems } from '../../../../utils/vault'
import { EmptyState } from '../../Vault/EmptyState'
import { PaymentCardTile } from './PaymentCard'
import emptySearch from '../../../../assets/images/empty-search.svg'

export const CardsView = () => {
    const authStore = useAppSelector((state) => state.session.session)
    const viewContext = useContext(ViewContext)
    const { data, isLoading } = useGetVaultQuery(
        authStore.keyring.symmetricKey,
        {
            pollingInterval: 5000,
        }
    )
    const matchSearchQuery = (payments: VaultItem) => {
        return !viewContext.searchQuery
            ? true
            : Object.values(payments)
                  .join('')
                  .toLowerCase()
                  .search(viewContext.searchQuery.toLowerCase()) !== -1
    }
    const sortByDate = (a: VaultItem, b: VaultItem) =>
        b.dateCreated - a.dateCreated

    const cards = data
        ? resolveItems(data.data, ItemType.PaymentCard)
              .sort(sortByDate)
              .filter(matchSearchQuery)
        : []
    const tags = data ? resolveItems(data.data, ItemType.Tag) : []
    const showEmptyState = cards.length === 0 && !isLoading

    return (
        <Flex w="full" p={{ base: '4', lg: '8' }}>
            <VStack w="full">
                <SimpleGrid
                    w="full"
                    columns={{ base: 1, md: 2, xl: 3, '2xl': 4 }}
                    spacing={8}
                >
                    {cards
                        .sort((a, b) => b.dateCreated - a.dateCreated)
                        .map((card, n) => (
                            <PaymentCardTile
                                key={card.id}
                                paymentCard={card as PaymentCard}
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
                                ? `No payments found for "${viewContext.searchQuery}"`
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
                                Add a payment
                            </Button>
                        </Flex>
                    </EmptyState>
                )}
            </VStack>
        </Flex>
    )
}
