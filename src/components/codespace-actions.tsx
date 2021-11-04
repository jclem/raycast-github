import proc from 'child_process'
import {ActionPanel, closeMainWindow, List} from '@raycast/api'
import icon from '../lib/icon'
import {octokit} from '../lib/octokit'

interface Props {
  query: string
}

export default function CodespaceActions({query}: Props) {
  const createCodespace = async () => {
    closeMainWindow()

    const resp = await octokit.request(
      `POST https://api.github.com/repos/${query}/codespaces`,
      {
        location: 'EastUs'
      }
    )

    const codespaceVSCode = `vscode://github.codespaces/connect?name=${resp.data.name}`
    proc.execSync(`open ${codespaceVSCode}`)
  }
  return (
    <List.Section title="Actions">
      <List.Item
        title={`Create Codespace in ${query}`}
        actions={
          <ActionPanel>
            <ActionPanel.Item
              title="Create Codespace"
              onAction={createCodespace}
              icon={icon('codespace')}
            />
          </ActionPanel>
        }
      />
    </List.Section>
  )
}
