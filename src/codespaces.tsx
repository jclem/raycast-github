import {List, getLocalStorageItem, setLocalStorageItem} from '@raycast/api'
import {ReactElement, useEffect, useRef, useState} from 'react'

import CodespaceItem from './components/codespace-item'
import {RequestParameters} from '@octokit/types/dist-types'
import {octokit} from './lib/octokit'
import useRequest from './lib/use-request'

export interface Codespace {
  id: number
  name: string
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
export default function Codespaces(): ReactElement {
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
}

function useAllSpaces(): [Codespace[], boolean] {
  const [allSpaces, setAllSpaces] = useState<Codespace[]>([])
  const didFetchOnce = useRef(false)

  // Use the cached spaces if we have yet to complete one fetch.
  useEffect(() => {
    const loadSpaces = async () => {
      const storedSpaces = await getLocalStorageItem<string>('spaces')

      if (!didFetchOnce.current && storedSpaces) {
        const parsedSpaces = JSON.parse(storedSpaces) as Codespace[]
        setAllSpaces(parsedSpaces)
      }
    }

    loadSpaces()
  }, [])

  // On an interval, fetch all spaces and update the cache.
  const isLoading = useRequest(
    {
      request: (params: RequestParameters) =>
        octokit.request('GET /user/codespaces', params),
      onSuccess: resp => {
        const spaces = resp.data.codespaces as Codespace[]
        setAllSpaces(spaces)
        setLocalStorageItem('spaces', JSON.stringify(spaces))
      },
      refreshInterval: 1_000,
      initialLoadingOnly: true
    },
    []
  )

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
