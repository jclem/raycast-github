import {getLocalStorageItem, List, setLocalStorageItem} from '@raycast/api'
import {useQuery} from '@tanstack/react-query'
import {ReactElement, useEffect, useState} from 'react'
import CodespaceItem from './components/codespace-item'
import withQueryClient from './components/with-query-client'
import {octokit} from './lib/octokit'

export interface Codespace {
  id: number
  name: string
  display_name: string
  repository: {
    full_name: string
    owner: {
      avatar_url: string
    }
  }
  machine: {
    display_name: string
  }
  state: string
  url: string
  web_url: string
  start_url: string
  stop_url: string
}

/**
 * A command that searches the user's Codespaces and allows them to be opened
 * and controlled.
 */
export default withQueryClient(function Codespaces(): ReactElement {
  const [query, setQuery] = useState('')
  const [allSpaces, isLoading] = useAllSpaces()
  const filteredSpaces = useFilteredSpaces(allSpaces, query)

  return (
    <List isLoading={isLoading} onSearchTextChange={setQuery}>
      {filteredSpaces.map(space => (
        <CodespaceItem key={space.id} space={space} />
      ))}
    </List>
  )
})

function useAllSpaces(): [Codespace[], boolean] {
  const [allSpaces, setAllSpaces] = useState<Codespace[]>([])

  const {data, isLoading} = useQuery<Codespace[]>(
    ['codespaces'],
    async () => {
      const resp = await octokit.request('GET /user/codespaces')
      const spaces = resp.data.codespaces as Codespace[]
      return spaces
    },
    {
      refetchInterval: 1_000,
      keepPreviousData: true
    }
  )

  // Use the cached spaces if we have yet to complete one fetch.
  useEffect(() => {
    const loadSpaces = async () => {
      const storedSpaces = await getLocalStorageItem<string>('spaces')

      if (isLoading && storedSpaces) {
        const parsedSpaces = JSON.parse(storedSpaces) as Codespace[]
        setAllSpaces(parsedSpaces)
      }
    }

    loadSpaces()
  }, [isLoading])

  // Update our state variable when data updates (we do this because we have an
  // async effect also potentially updating state).
  useEffect(() => {
    if (data) {
      setAllSpaces(data)
      setLocalStorageItem('spaces', JSON.stringify(data))
    }
  }, [data])

  return [allSpaces, isLoading]
}

function useFilteredSpaces(allSpaces: Codespace[], query: string) {
  const [filteredSpaces, setFilteredSpaces] = useState<Codespace[]>([])

  // Filter all of the spaces by the user's query.
  useEffect(() => {
    setFilteredSpaces(
      allSpaces.filter(
        s =>
          s.name.toLowerCase().includes(query) ||
          s.repository.full_name.toLowerCase().includes(query) ||
          s.machine.display_name.toLowerCase().includes(query)
      )
    )
  }, [allSpaces, query])

  return filteredSpaces
}
