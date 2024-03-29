import {Action, ActionPanel, List} from '@raycast/api'
import {ReactElement} from 'react'
import {Codespace} from '../codespaces'
import icon from '../lib/icon'
import {octokit} from '../lib/octokit'

interface Props {
  space: Codespace
}

/**
 * A list item for a Codespace.
 */
export default function CodespaceItem({space}: Props): ReactElement {
  return (
    <List.Item
      key={space.id}
      title={space.repository.full_name}
      subtitle={space.machine.display_name}
      icon={space.repository.owner.avatar_url}
      accessories={[
        {text: space.display_name},
        {text: space.state, tooltip: space.state}
      ]}
      actions={<CodespaceActions space={space} />}
    />
  )
}

function CodespaceActions({space}: Props): ReactElement {
  const startCodespace = () => octokit.request(`POST ${space.start_url}`)
  const stopCodespace = () => octokit.request(`POST ${space.stop_url}`)
  const deleteCodespace = () => octokit.request(`DELETE ${space.url}`)
  const codespaceVSCode = `vscode://github.codespaces/connect?name=${space.name}`

  return (
    <ActionPanel>
      <Action.OpenInBrowser
        title="Open in VSCode"
        url={codespaceVSCode}
        icon={icon('code')}
      />

      <Action.OpenInBrowser
        title="Open in browser"
        url={space.web_url}
        icon={icon('browser')}
      />

      {space.state === 'Shutdown' && (
        <Action
          title="Start Codespace"
          onAction={startCodespace}
          icon={icon('play')}
        />
      )}

      {space.state !== 'Shutdown' && (
        <Action
          title="Stop Codespace"
          onAction={stopCodespace}
          icon={icon('stop')}
        />
      )}

      <Action
        title="Delete Codespace"
        onAction={deleteCodespace}
        icon={icon('trash')}
      />
    </ActionPanel>
  )
}
