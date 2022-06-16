import {RestEndpointMethodTypes} from '@octokit/plugin-rest-endpoint-methods'
import {LocalStorage, showToast, Toast} from '@raycast/api'
import {useState, useEffect, useRef, useCallback} from 'react'
import {octokit} from '../lib/octokit'
import {Repo} from '../search-repos'

type RepoSingle = RestEndpointMethodTypes['repos']['get']['response']['data']

const KEY = 'favorite-repos'

type UseFavorites = {
  addFavorite: (repo: Repo | RepoSingle) => void
  addFavoriteFromQuery: (query: string) => void
  favoriteRepos: FavoriteRepoItem[]
  isFavorite: (repo: Repo) => boolean
  isFavoritable: (query: string) => boolean
  removeFavorite: (repo: Repo | FavoriteRepoItem) => void
}

type HttpError = {
  status: number
  message: string
}

export type FavoriteRepoItem = {
  id: number
  full_name: string
  html_url: string
  avatar_url?: string
}

const favoriteRepoItem = (repo: Repo | RepoSingle): FavoriteRepoItem => ({
  id: repo.id,
  full_name: repo.full_name,
  html_url: repo.html_url,
  avatar_url: repo.owner?.avatar_url
})

export default function useFavorites(): UseFavorites {
  const [favoriteRepos, setFavoriteRepos] = useState<FavoriteRepoItem[]>([])
  const prevSizeRef = useRef<number>(0)

  useEffect(() => {
    const sizeDiff = favoriteRepos.length - prevSizeRef.current

    async function storeFavorites() {
      const value = JSON.stringify(favoriteRepos)
      await LocalStorage.setItem(KEY, value)
      if (sizeDiff < 0) {
        await showToast({
          style: Toast.Style.Success,
          title: 'Success!',
          message: 'Repo removed from favorites.'
        })
      }
    }

    if (sizeDiff !== 0) {
      storeFavorites()
      prevSizeRef.current = favoriteRepos.length
    }
  }, [favoriteRepos])

  useEffect(() => {
    async function getFavoritesFromStorage() {
      const value = (await LocalStorage.getItem(KEY)) as string
      if (value) {
        setFavoriteRepos(JSON.parse(value) || [])
      }
    }
    getFavoritesFromStorage()
  }, [])

  const isFavoritable = useCallback(
    query =>
      /.+\/.+/.test(query) &&
      !favoriteRepos.some(item => item.full_name === query),
    [favoriteRepos]
  )

  const isFavorite = useCallback(
    (repo: Repo): boolean => {
      return favoriteRepos.some(item => item.id === repo.id)
    },
    [favoriteRepos]
  )

  const addFavorite = useCallback(
    repo => {
      const repoToAdd = favoriteRepoItem(repo)
      setFavoriteRepos(favoriteRepos.concat(repoToAdd))
    },
    [favoriteRepos]
  )

  const addFavoriteFromQuery = useCallback(
    async query => {
      try {
        const [owner, repo] = query.trim().split('/')
        await showToast({
          style: Toast.Style.Animated,
          title: `Trying to fetch ${query}...`
        })
        const repoResult = await octokit.rest.repos.get({owner, repo})
        addFavorite(repoResult.data)
        await showToast({
          style: Toast.Style.Success,
          title: 'Success!',
          message: `${query} has been added to favorites.`
        })
      } catch (error) {
        const httpError = error as HttpError
        await showToast({
          style: Toast.Style.Failure,
          title: httpError.status.toString(),
          message: `Error fetching ${query}: ${httpError.message}`
        })
      }
    },
    [addFavorite]
  )

  const removeFavorite = useCallback(
    repo => {
      setFavoriteRepos(favoriteRepos.filter(item => item.id !== repo.id))
    },
    [favoriteRepos]
  )

  return {
    addFavorite,
    addFavoriteFromQuery,
    favoriteRepos,
    isFavorite,
    isFavoritable,
    removeFavorite
  }
}
