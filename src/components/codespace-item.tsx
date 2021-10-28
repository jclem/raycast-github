import {ActionPanel, ListItem, OpenInBrowserAction} from '@raycast/api'

import {Codespace} from '../codespaces'
import {ReactElement} from 'react'
import {octokit} from '../lib/octokit'

interface Props {
  space: Codespace
}

/**
 * A list item for a Codespace.
 */
export default function CodespaceItem({space}: Props): ReactElement {
  return (
    <ListItem
      key={space.id}
      title={space.repository.full_name}
      subtitle={space.machine.display_name}
      accessoryTitle={space.state}
      actions={<CodespaceActions space={space} />}
    />
  )
}

function CodespaceActions({space}: Props): ReactElement {
  const startCodespace = () => octokit.request(`POST ${space.start_url}`)
  const stopCodespace = () => octokit.request(`POST ${space.stop_url}`)
  const codespaceVSCode = `vscode://github.codespaces/connect?name=${space.name}`

  return (
    <ActionPanel>
      <OpenInBrowserAction title="Open in VSCode" url={codespaceVSCode} />
      <OpenInBrowserAction title="Open in browser" url={space.web_url} />
      <ActionPanel.Item title="Start Codespace" onAction={startCodespace} />
      <ActionPanel.Item title="Stop Codespace" onAction={stopCodespace} />
    </ActionPanel>
  )
}
