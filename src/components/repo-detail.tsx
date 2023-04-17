import {Detail, List} from '@raycast/api'
import {useQuery} from '@tanstack/react-query'
import {ReactElement} from 'react'
import {octokit} from '../lib/octokit'
import withQueryClient from './with-query-client'

interface Props {
  repo: string
  actions?: ReactElement
  sidepanel?: boolean
}

export default withQueryClient(function RepoDetail({
  repo,
  actions,
  sidepanel
}: Props): ReactElement {
  const [owner, repoName] = repo.split('/')

  const {data, isLoading} = useQuery(['repo', 'readme', repo], async () => {
    const resp = await octokit.repos.getReadme({
      owner,
      repo: repoName
    })

    return resp.data.content
  })

  let fullMarkdown: string

  if (data != null) {
    const markdown = Buffer.from(data, 'base64').toString()
    fullMarkdown = `# ${repo}\n\n${markdown}`
  } else {
    fullMarkdown = `# ${repo}\n\n*...Loading.*`
  }

  return sidepanel ? (
    <List.Item.Detail isLoading={isLoading} markdown={fullMarkdown} />
  ) : (
    <Detail isLoading={isLoading} markdown={fullMarkdown} actions={actions} />
  )
})
