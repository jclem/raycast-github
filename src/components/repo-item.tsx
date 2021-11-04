import proc from 'child_process'
import {ActionPanel, List, OpenInBrowserAction} from '@raycast/api'
import {ReactElement} from 'react'
import {Codespace} from '../codespaces'
import icon from '../lib/icon'
import {octokit} from '../lib/octokit'
import {Repo} from '../search-repos'

interface Props {
  repo: Repo
}

export default function RepoItem({repo}: Props) {
  return (
    <List.Item
      title={repo.full_name}
      subtitle={repo.description ?? ''}
      icon={repo.owner?.avatar_url}
      actions={<RepoActions repo={repo} />}
    />
  )
}

function RepoActions({repo}: Props): ReactElement {
  const openOrCreateCodespace = async () => {
    const codespaces: Codespace[] = (
      await octokit.request(`GET /user/codespaces`)
    ).data.codespaces

    const codespace = codespaces.find(
      c => c.repository.full_name === repo.full_name
    )

    let codespaceVSCode: string

    if (codespace) {
      codespaceVSCode = `vscode://github.codespaces/connect?name=${codespace.name}`
    } else {
      const resp = await octokit.request(
        `POST /repos/${repo.full_name}/codespaces`,
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
        url={repo.html_url}
        icon={icon('browser')}
      />

      <OpenInBrowserAction
        title="Open issues in browser"
        url={`${repo.html_url}/issues`}
        icon={icon('issue-opened')}
      />

      <OpenInBrowserAction
        title="Open pull requests in browser"
        url={`${repo.html_url}/pulls`}
        icon={icon('git-pull-request')}
      />

      <OpenInBrowserAction
        title="Open in GitHub.dev"
        url={`https://github.dev/${repo.full_name}`}
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
