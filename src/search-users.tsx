import {RestEndpointMethodTypes} from '@octokit/plugin-rest-endpoint-methods'
import {ActionPanel, OpenInBrowserAction} from '@raycast/api'
import {ReactElement} from 'react'
import Search from './components/search'
import icon from './lib/icon'
import {octokit} from './lib/octokit'

export type User =
  RestEndpointMethodTypes['search']['users']['response']['data']['items'][number]

interface ActionsProps {
  item: User
}

export default function UserSearch(): ReactElement {
  return (
    <Search<User>
      queryKey={query => ['search', 'commits', query]}
      queryFn={async q => {
        const resp = await octokit.search.users({q})
        const repos = resp.data.items
        return repos
      }}
      itemProps={result => ({
        key: result.id,
        title: result.login,
        icon: result.avatar_url
      })}
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
