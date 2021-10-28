import {Octokit} from '@octokit/rest'
import {preferences} from '@raycast/api'

export const octokit = new Octokit({
  auth: preferences.pat.value,
  userAgent: 'raycast-github'
})
