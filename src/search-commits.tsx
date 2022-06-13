import {RestEndpointMethodTypes} from '@octokit/plugin-rest-endpoint-methods'
import {
  ActionPanel,
  CopyToClipboardAction,
  OpenInBrowserAction
} from '@raycast/api'
import {ReactElement} from 'react'
import Search from './components/search'
import icon from './lib/icon'
import {octokit} from './lib/octokit'

export type Commit =
  RestEndpointMethodTypes['search']['commits']['response']['data']['items'][number]

interface ActionsProps {
  item: Commit
}

export default function CommitSearch(): ReactElement {
  return (
    <Search<Commit>
      queryKey={query => ['search', 'commits', query]}
      queryFn={async q => {
        const resp = await octokit.search.commits({q})
        const repos = resp.data.items
        return repos
      }}
      itemProps={result => ({
        key: result.node_id,
        title: result.commit.message,
        subtitle: result.author?.login,
        icon: result.author?.avatar_url,
        accessoryTitle: result.repository.full_name,
        accessoryIcon: result.repository.owner.avatar_url
      })}
      actions={CommitActions}
    />
  )
}

function CommitActions({item}: ActionsProps): ReactElement {
  return (
    <ActionPanel>
      <OpenInBrowserAction
        title="Open in browser"
        url={item.html_url}
        icon={icon('browser')}
      />

      <OpenInBrowserAction
        title="Open in GitHub.dev"
        url={`https://github.dev/${item.html_url.replace(
          /^https:\/\/github.com\//,
          ''
        )}`}
        icon={icon('code')}
        shortcut={{key: '.', modifiers: []}}
      />
      <CopyToClipboardAction
        title="Copy URL to clipboard"
        content={item.html_url}
        shortcut={{modifiers: ['cmd', 'shift'], key: 'c'}}
      />
    </ActionPanel>
  )
}
