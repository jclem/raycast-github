import {List, getLocalStorageItem, setLocalStorageItem} from '@raycast/api'
import {ReactElement, useEffect, useRef, useState} from 'react'

import CodespaceItem from './components/codespace-item'
import {octokit} from './lib/octokit'

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

/** Frequency with which we refresh our Codespaces list */
const refreshInterval = 1_000

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
  const refetchInterval = useRef<NodeJS.Timeout | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const didFetchOnce = useRef(false)

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

  useEffect(() => {
    const fetchCodespaces = async () => {
      const resp = await octokit.request('GET /user/codespaces')
      const spaces = resp.data.codespaces as Codespace[]
      setAllSpaces(spaces)
      setIsLoading(false) // We only use this for initial loading, so it's okay to set it as false repeatedly.
      setLocalStorageItem('spaces', JSON.stringify(spaces))
    }

    refetchInterval.current = setInterval(() => {
      fetchCodespaces()
    }, refreshInterval)

    return () => {
      if (refetchInterval.current != null)
        clearInterval(refetchInterval.current)
    }
  }, [])

  return [allSpaces, isLoading]
}

function useFilteredSpaces(allSpaces: Codespace[], query: string) {
  const [filteredSpaces, setFilteredSpaces] = useState<Codespace[]>([])

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
