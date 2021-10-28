import {
  ActionPanel,
  Detail,
  ImageLike,
  List,
  ListItem,
  OpenInBrowserAction,
  PushAction,
  ToastStyle,
  showToast
} from '@raycast/api'
import {ReactElement, useEffect, useMemo, useRef, useState} from 'react'

import {debounce} from 'lodash'
import {formatRelative} from 'date-fns'
import icon from './lib/icon'
import {octokit} from './lib/octokit'
import useRequest from './lib/use-request'

type SearchResult = Awaited<
  ReturnType<typeof octokit.search.issuesAndPullRequests>
>['data']['items'][number]

/**
 * A command that searches the issues on behalf of a user.
 */
export default function SearchIssues(): ReactElement {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])

  const isLoading = useRequest(
    {
      request: octokit.search.issuesAndPullRequests,
      requestParams: ([query]) => ({q: query.trim()}),
      onSuccess: resp => setResults(resp.data.items),
      debounce: 1_000,
      debounceSettings: {leading: false, trailing: true},
      enabled: ([query]) => query.trim().length > 0
    },
    [query]
  )

  return (
    <List isLoading={isLoading} onSearchTextChange={setQuery}>
      {results.map(issue => (
        <ListItem
          key={issue.id}
          title={issue.title}
          icon={issueIcon(issue)}
          subtitle={getRepositoryNWO(issue.html_url)}
          accessoryTitle={`Opened by ${
            issue.user?.login ?? 'unknown'
          } ${formatRelative(new Date(issue.created_at), new Date())}`}
          accessoryIcon={issue.user?.avatar_url}
          actions={
            <ActionPanel>
              <OpenInBrowserAction
                title="Open in browser"
                url={issue.html_url}
                icon={icon('browser')}
              />

              <PushAction
                title="View details"
                icon={icon('eye')}
                target={<IssueDetails issue={issue} />}
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  )
}

function IssueDetails({issue}: {issue: SearchResult}): ReactElement {
  const markdown = `
  # ${issue.title || 'Untitled'}

  *Opened by ${issue.user?.login ?? 'unknown'} ${formatRelative(
    new Date(issue.created_at),
    new Date()
  )}*

  ---

  ${issue.body?.trim() || '(No issue body)'}
  `
  return <Detail markdown={markdown} />
}

function getRepositoryNWO(htmlURL: string): string {
  const match = htmlURL.match(/github\.com\/([^/]+)\/([^/]+)\//)
  const nwo = match ? `${match[1]}/${match[2]}` : ''
  return nwo
}

function issueIcon(result: SearchResult): ImageLike {
  return result.state === 'open' ? icon('issue-opened') : icon('issue-closed')
}
