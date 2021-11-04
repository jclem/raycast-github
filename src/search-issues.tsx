import {RestEndpointMethodTypes} from '@octokit/plugin-rest-endpoint-methods'
import {
  ActionPanel,
  Color,
  ColorLike,
  Detail,
  ImageLike,
  OpenInBrowserAction,
  PushAction
} from '@raycast/api'
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
    />
  )
}

function issueIcon(issue: Issue): ImageLike {
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
    if (issue.draft) {
      return icon('git-pull-request-draft', color)
    }

    if (issue.closed_at) {
      return icon('git-pull-request', color)
    }

    return icon('git-pull-request', color)
  } else {
    if (issue.draft) {
      return icon('issue-draft', color)
    }

    if (issue.closed_at) {
      return icon('issue-closed', color)
    }

    return icon('issue-opened', color)
  }
}

function Actions({item}: ActionsProps): ReactElement {
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
            actions={<Actions item={item} />}
          />
        }
      />
    </ActionPanel>
  )
}
