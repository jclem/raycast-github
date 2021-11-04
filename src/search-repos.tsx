import {RestEndpointMethodTypes} from '@octokit/plugin-rest-endpoint-methods'
import {List} from '@raycast/api'
import {ReactElement, useState} from 'react'
import {useQuery} from 'react-query'
import RepoItem from './components/repo-item'
import withQueryClient from './components/with-query-client'
import {useDebouncedValue} from './hooks/use-debounced-value'
import {octokit} from './lib/octokit'

export type Repo =
  RestEndpointMethodTypes['search']['repos']['response']['data']['items'][number]

export default withQueryClient(function Search(): ReactElement {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebouncedValue(query)

  const {data, isFetching} = useQuery<Repo[]>(
    ['search', 'repos', debouncedQuery],
    async () => {
      const resp = await octokit.search.repos({q: debouncedQuery})
      const repos = resp.data.items
      return repos
    },
    {
      keepPreviousData: true,
      enabled: debouncedQuery.trim() !== ''
    }
  )

  return (
    <List isLoading={isFetching} onSearchTextChange={setQuery}>
      {data?.map(repo => (
        <RepoItem key={repo.id} repo={repo} />
      ))}
    </List>
  )
})
