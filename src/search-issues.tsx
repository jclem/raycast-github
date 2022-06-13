import {RestEndpointMethodTypes} from '@octokit/plugin-rest-endpoint-methods'
import {
  ActionPanel,
  CopyToClipboardAction,
  Color,
  ColorLike,
  Detail,
  getLocalStorageItem,
  ImageLike,
  List,
  OpenInBrowserAction,
  PushAction,
  setLocalStorageItem
} from '@raycast/api'
import {FC, useEffect, useState, VFC} from 'react'
import Search from './components/search'
import icon from './lib/icon'
import {octokit} from './lib/octokit'

export type Issue =
  RestEndpointMethodTypes['search']['issuesAndPullRequests']['response']['data']['items'][number]

interface ActionsProps {
  item: Issue
  query: string
}

const IssueSearch: VFC = () => (
  <Search<Issue>
    queryKey={query => ['search', 'commits', query]}
    queryFn={async q => {
      const resp = await octokit.search.issuesAndPullRequests({q})
      const repos = resp.data.items
      return repos
    }}
    itemProps={result => {
      const nwoMatch = result.repository_url.match(
        /^https:\/\/api\.github\.com\/repos\/([^/]+)\/([^/]+)$/
      )

      if (!nwoMatch) {
        return null
      }

      const [, owner, repo] = nwoMatch
      const nwo = `${owner}/${repo}`

      return {
        key: result.id,
        title: result.title,
        subtitle: result.user?.login,
        icon: issueIcon(result),
        accessoryTitle: nwo,
        accessoryIcon: `https://github.com/${owner}.png`
      }
    }}
    actions={Actions}
    noQuery={NoQuery}
  />
)

export default IssueSearch

const NoQuery: VFC<{setQuery: (query: string) => void}> = ({setQuery}) => {
  const {savedQueries, deleteSavedQuery} = useSavedQueries()

  return (
    <List onSearchTextChange={setQuery}>
      {savedQueries.map((query, i) => (
        <List.Item
          key={i}
          title={query}
          actions={
            <ActionPanel>
              <ActionPanel.Item
                title="Search"
                onAction={() => setQuery(query)}
              />

              <ActionPanel.Item
                title="Delete saved query"
                onAction={() => deleteSavedQuery(query)}
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  )
}

const issueIcon = (issue: Issue): ImageLike => {
  let color: ColorLike | null = null

  if (issue.draft && issue.state === 'open') {
    color = null
  } else {
    switch (issue.state) {
      case 'open':
        color = Color.Green
        break
      case 'closed':
        color = Color.Purple
    }
  }

  if (issue.pull_request) {
    if (issue.draft) return icon('git-pull-request-draft', color)
    if (issue.closed_at) return icon('git-pull-request', color)
    return icon('git-pull-request', color)
  } else {
    if (issue.draft) return icon('issue-draft', color)
    if (issue.closed_at) return icon('issue-closed', color)
    return icon('issue-opened', color)
  }
}

const Actions: FC<ActionsProps> = ({item, query}) => {
  const {saveQuery} = useSavedQueries()

  return (
    <ActionPanel>
      <OpenInBrowserAction
        title="Open in browser"
        url={item.html_url}
        icon={icon('browser')}
      />

      <PushAction
        title="View details"
        target={
          <Detail
            markdown={`# ${item.title}\n\n${item.body}`}
            actions={<Actions item={item} query={query} />}
          />
        }
      />
      <CopyToClipboardAction
        title="Copy URL to clipboard"
        content={item.html_url}
        shortcut={{modifiers: ['cmd', 'shift'], key: 'c'}}
      />
      <ActionPanel.Item title="Save query" onAction={() => saveQuery(query)} />
    </ActionPanel>
  )
}

const useSavedQueries = () => {
  const [savedQueries, setSavedQueries] = useState<string[]>([])
  const [reloadSavedQueriesSignal, setReloadSavedQueriesSignal] =
    useState<number>(0)
  const storageKey = 'saved-issues-queries'

  const reloadSavedQueries = () =>
    setReloadSavedQueriesSignal(signal => signal + 1)

  const loadSavedQueries = async () => {
    const json = await getLocalStorageItem<string>(storageKey)
    const savedQueries = json ? JSON.parse(json) : []
    return savedQueries
  }

  useEffect(() => {
    const updateSavedQueriesState = async () => {
      const savedQueries = await loadSavedQueries()
      setSavedQueries(savedQueries)
    }

    updateSavedQueriesState()
  }, [reloadSavedQueriesSignal])

  const deleteSavedQuery = async (query: string) => {
    const newSavedQueries = savedQueries.filter(q => q !== query)
    setLocalStorageItem(storageKey, JSON.stringify(newSavedQueries))
    reloadSavedQueries()
  }

  const saveQuery = async (query: string) => {
    const newSavedQueries = [...savedQueries, query]
    setLocalStorageItem(storageKey, JSON.stringify(newSavedQueries))
    reloadSavedQueries()
  }

  return {
    savedQueries,
    saveQuery,
    deleteSavedQuery
  }
}
