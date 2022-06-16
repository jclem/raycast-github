import {
  ActionPanel,
  CopyToClipboardAction,
  List,
  OpenInBrowserAction
} from '@raycast/api'
import {ReactElement, useCallback, useState, FC} from 'react'
import useFavorites, {FavoriteRepoItem} from './hooks/use-favorites'
import icon from './lib/icon'

type FavoritesActionsProps = {
  repo: FavoriteRepoItem
  onAction: (repo: FavoriteRepoItem) => void
  setQuery: (query: string) => void
}

type NewFavoritesActionsProps = {
  query: string
  onAction: (query: string) => void
  setQuery: (query: string) => void
}

const GitHubManageFavorites: FC = () => {
  const {favoriteRepos, addFavoriteFromQuery, isFavoritable, removeFavorite} =
    useFavorites()
  const [query, setQuery] = useState('')

  const ListItems = favoriteRepos
    .filter(repo => !query.trim() || ~repo.full_name.indexOf(query))
    .map(repo => (
      <List.Item
        key={repo.id}
        title={repo.full_name}
        icon={repo.avatar_url}
        actions={
          <FavoritesActions
            repo={repo}
            onAction={removeFavorite}
            setQuery={setQuery}
          />
        }
      />
    ))

  if (query.trim() && isFavoritable(query)) {
    ListItems.push(
      <List.Item
        icon={icon('heart-fill')}
        key="new"
        title={`Add ${query}`}
        actions={
          <NewFavoriteActions
            query={query}
            onAction={addFavoriteFromQuery}
            setQuery={setQuery}
          />
        }
      />
    )
  }

  return (
    <List searchText={query} onSearchTextChange={setQuery}>
      {ListItems}
    </List>
  )
}

export default GitHubManageFavorites

function NewFavoriteActions({
  query,
  onAction,
  setQuery
}: NewFavoritesActionsProps): ReactElement {
  const onAdd = useCallback(() => {
    onAction(query)
    setQuery('')
  }, [onAction, query, setQuery])
  return (
    <ActionPanel>
      <ActionPanel.Item
        title="Add to Favorites"
        onAction={onAdd}
        icon={icon('heart-fill')}
      />
    </ActionPanel>
  )
}

function FavoritesActions({
  repo,
  onAction,
  setQuery
}: FavoritesActionsProps): ReactElement {
  const onRemove = useCallback(() => {
    onAction(repo)
    setQuery('')
  }, [onAction, repo, setQuery])
  return (
    <ActionPanel>
      <ActionPanel.Item
        title="Remove from favorites"
        onAction={onRemove}
        icon={icon('heart')}
      />
      <OpenInBrowserAction
        title="Open in browser"
        url={repo.html_url}
        icon={icon('browser')}
      />
      <CopyToClipboardAction
        title="Copy URL to clipboard"
        content={repo.html_url}
        shortcut={{modifiers: ['cmd', 'shift'], key: 'c'}}
      />
    </ActionPanel>
  )
}
