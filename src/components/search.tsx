import {List, ListItemProps} from '@raycast/api'
import {ComponentType, Key, ReactElement, useState} from 'react'
import {QueryKey, useQuery} from 'react-query'
import {useDebouncedValue} from '../hooks/use-debounced-value'
import useFavorites, {FavoriteRepoItem} from '../hooks/use-favorites'
import withQueryClient from './with-query-client'

interface Props<T> {
  queryKey: (query: string) => QueryKey
  queryFn: (query: string) => Promise<T[]>
  itemProps: (item: T) => (ListItemProps & {key: Key}) | null
  actions: ComponentType<{item: T; query: string}>
  noQuery?: ComponentType<{
    setQuery: (query: string) => void
    searchBarAccessory: ReactElement
  }>
}

enum RepoScopeOptions {
  ALL = 0,
  GITHUB = 1,
  FAVORITES = 2
}

const repoScopeOptions = new Map([
  [
    RepoScopeOptions.ALL,
    {
      title: 'All repos',
      stringify: () => ''
    }
  ],
  [
    RepoScopeOptions.GITHUB,
    {
      title: 'GitHub org',
      stringify: () => 'org:github'
    }
  ],
  [
    RepoScopeOptions.FAVORITES,
    {
      title: 'Favorite repos',
      stringify: (favorites: FavoriteRepoItem[]) =>
        favorites.reduce((memo, next) => `${memo} repo:${next.full_name}`, '')
    }
  ]
])

export default function Search<T>(props: Props<T>) {
  return <SearchWrapper {...props} />
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SearchWrapper = withQueryClient<Props<any>>(function Search(
  props
): ReactElement {
  const {favoriteRepos} = useFavorites()
  const [query, setQuery] = useState('')
  const [scope, setScope] = useState<RepoScopeOptions>(0)
  const [favoriteQuery, setFavoriteQuery] = useState<string | undefined>()

  const repoScope = repoScopeOptions.get(scope)?.stringify(favoriteRepos)
  const debouncedQuery = useDebouncedValue(`${repoScope} ${query}`)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const {data, isFetching} = useQuery<any[]>(
    props.queryKey(debouncedQuery),
    () => props.queryFn(debouncedQuery),
    {
      keepPreviousData: true,
      enabled: debouncedQuery.trim() !== ''
    }
  )

  if (props.noQuery && query.trim() === '') {
    return (
      <props.noQuery
        setQuery={query => {
          setQuery(query)
          setFavoriteQuery(query)
        }}
        searchBarAccessory={
          <RepoScopeSelector setScope={scope => setScope(+scope)} />
        }
      />
    )
  }

  return (
    <List
      navigationTitle={favoriteQuery}
      isLoading={isFetching}
      onSearchTextChange={text => {
        setQuery(text)
        setFavoriteQuery(undefined)
      }}
      searchBarAccessory={
        <RepoScopeSelector setScope={scope => setScope(+scope)} />
      }
    >
      {data?.map(item => {
        const itemProps = props.itemProps(item)

        return itemProps ? (
          <List.Item
            {...itemProps}
            actions={<props.actions item={item} query={query} />}
          />
        ) : null
      })}
    </List>
  )
})

const RepoScopeSelector = ({
  setScope
}: {
  setScope: (scope: string) => void
}): ReactElement => {
  return (
    <List.Dropdown
      tooltip="Specify which repos to search"
      storeValue={true}
      onChange={newValue => {
        setScope(newValue)
      }}
    >
      {Array.from(repoScopeOptions, ([key, val]) => (
        <List.Dropdown.Item
          key={key}
          title={val.title}
          value={key.toString()}
        />
      ))}
    </List.Dropdown>
  )
}
