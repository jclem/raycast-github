import {RestEndpointMethodTypes} from '@octokit/plugin-rest-endpoint-methods'
import {ActionPanel, OpenInBrowserAction} from '@raycast/api'
import {ReactElement} from 'react'
import Search from './components/search'
import icon from './lib/icon'
import {octokit} from './lib/octokit'

export type Issue =
  RestEndpointMethodTypes['search']['issuesAndPullRequests']['response']['data']['items'][number]

interface ActionsProps {
  item: Issue
}

export default function IssueSearch(): ReactElement {
  return (
    <Search<Issue>
      queryKey={query => ['search', 'commits', query]}
      queryFn={async q => {
        const resp = await octokit.search.issuesAndPullRequests({q})
        const repos = resp.data.items
        return repos
      }}
      itemProps={result => {
        const nwoMatch = result.html_url.match(
          /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/issues\/\d+$/
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
          icon: result.user?.avatar_url,
          accessoryTitle: nwo,
          accessoryIcon: `https://github.com/${owner}.png`
        }
      }}
      actions={Actions}
    />
  )
}

function Actions({item}: ActionsProps): ReactElement {
  return (
    <ActionPanel>
      <OpenInBrowserAction
        title="Open in browser"
        url={item.html_url}
        icon={icon('browser')}
      />
    </ActionPanel>
  )
}
