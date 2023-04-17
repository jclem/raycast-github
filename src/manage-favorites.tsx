import {
  ActionPanel,
  CopyToClipboardAction,
  List,
  OpenInBrowserAction,
  PushAction
} from '@raycast/api'
import {FC, ReactElement, useCallback, useState} from 'react'
import RepoDetail from './components/repo-detail'
import useFavorites, {FavoriteRepoItem} from './hooks/use-favorites'
import icon from './lib/icon'
import {RepoActions} from './search-repos'

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
        detail={<FavoriteDetail repo={repo} />}
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

  const isShowingDetail = !!favoriteRepos.length && !!ListItems.length

  return (
    <List
      searchText={query}
      onSearchTextChange={setQuery}
      isShowingDetail={isShowingDetail}
    >
      {ListItems.length ? (
        ListItems
      ) : (
        <List.EmptyView
          icon={icon('heart')}
          title="No favorites found!"
          description="Type repo/owner to add one. For example: raycast/extensions."
        />
      )}
    </List>
  )
}

export default GitHubManageFavorites

type FavoriteDetailProps = {
  repo: FavoriteRepoItem
}

function FavoriteDetail({repo}: FavoriteDetailProps): ReactElement {
  return (
    <List.Item.Detail
      markdown={`![${repo.full_name}](${repo.avatar_url})`}
      metadata={
        <List.Item.Detail.Metadata>
          {Object.entries(repo).map(([key, val]) => (
            <List.Item.Detail.Metadata.Label
              key={key}
              title={key}
              text={val?.toString()}
            />
          ))}
        </List.Item.Detail.Metadata>
      }
    />
  )
}

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
      <PushAction
        title="View details"
        target={
          <RepoDetail
            repo={repo.full_name}
            actions={<RepoActions item={repo} />}
          />
        }
        icon={icon('info')}
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
