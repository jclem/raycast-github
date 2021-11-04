import proc from 'child_process'
import {RestEndpointMethodTypes} from '@octokit/plugin-rest-endpoint-methods'
import {ActionPanel, OpenInBrowserAction, PushAction} from '@raycast/api'
import {ReactElement} from 'react'
import {Codespace} from './codespaces'
import RepoDetail from './components/repo-detail'
import Search from './components/search'
import icon from './lib/icon'
import {octokit} from './lib/octokit'

export type Repo =
  RestEndpointMethodTypes['search']['repos']['response']['data']['items'][number]

interface ActionsProps {
  item: Repo
}

export default function RepoSearch(): ReactElement {
  return (
    <Search<Repo>
      queryKey={query => ['search', 'repos', query]}
      queryFn={async q => {
        const resp = await octokit.search.repos({q})
        const repos = resp.data.items
        return repos
      }}
      itemProps={repo => ({
        key: repo.id,
        title: repo.full_name,
        subtitle: repo.description ?? '',
        icon: repo.owner?.avatar_url
      })}
      actions={RepoActions}
    />
  )
}

function RepoActions({item}: ActionsProps): ReactElement {
  const openOrCreateCodespace = async () => {
    const codespaces: Codespace[] = (
      await octokit.request(`GET /user/codespaces`)
    ).data.codespaces

    const codespace = codespaces.find(
      c => c.repository.full_name === item.full_name
    )

    let codespaceVSCode: string

    if (codespace) {
      codespaceVSCode = `vscode://github.codespaces/connect?name=${codespace.name}`
    } else {
      const resp = await octokit.request(
        `POST /repos/${item.full_name}/codespaces`,
        {location: 'EastUs'}
      )

      codespaceVSCode = `vscode://github.codespaces/connect?name=${resp.data.name}`
    }

    proc.execSync(`open ${codespaceVSCode}`)
  }

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
          <RepoDetail
            repo={item.full_name}
            actions={<RepoActions item={item} />}
          />
        }
      />

      <OpenInBrowserAction
        title="Open issues in browser"
        url={`${item.html_url}/issues`}
        icon={icon('issue-opened')}
      />

      <OpenInBrowserAction
        title="Open pull requests in browser"
        url={`${item.html_url}/pulls`}
        icon={icon('git-pull-request')}
      />

      <OpenInBrowserAction
        title="Open in GitHub.dev"
        url={`https://github.dev/${item.full_name}`}
        icon={icon('code')}
        shortcut={{key: '.', modifiers: []}}
      />

      <ActionPanel.Item
        title="Open or create Codespace"
        onAction={openOrCreateCodespace}
        icon={icon('codespaces')}
      />
    </ActionPanel>
  )
}
