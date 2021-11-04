import {RestEndpointMethodTypes} from '@octokit/plugin-rest-endpoint-methods'
import {ActionPanel, OpenInBrowserAction} from '@raycast/api'
import {ReactElement} from 'react'
import Search from './components/search'
import icon from './lib/icon'
import {octokit} from './lib/octokit'

export type CodeResult =
  RestEndpointMethodTypes['search']['code']['response']['data']['items'][number]

interface ActionsProps {
  item: CodeResult
}

export default function RepoSearch(): ReactElement {
  return (
    <Search<CodeResult>
      queryKey={query => ['search', 'repos', query]}
      queryFn={async q => {
        const resp = await octokit.search.code({q})
        const repos = resp.data.items
        return repos
      }}
      itemProps={result => ({
        key: result.html_url,
        title: result.repository.full_name,
        subtitle: result.path,
        icon: result.repository.owner.avatar_url
      })}
      actions={CodeActions}
    />
  )
}

function CodeActions({item}: ActionsProps): ReactElement {
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
    </ActionPanel>
  )
}
