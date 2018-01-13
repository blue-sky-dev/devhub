import gravatar from 'gravatar'

import * as baseTheme from '../../../styles/themes/base'
import {
  IBaseTheme,
  IGitHubCommit,
  IGitHubIcon,
  IGitHubIssue,
  IGitHubNotification,
  IGitHubPullRequest,
} from '../../../types'
import { getSteppedSize } from '../shared'

export function getUserAvatarByUsername(
  username: string,
  { size }: { size?: number } = {},
) {
  return username
    ? `https://github.com/${username}.png?size=${getSteppedSize(size)}`
    : ''
}

export function tryGetUsernameFromGitHubEmail(email?: string) {
  if (!email) return ''

  const emailSplit = email.split('@')
  if (emailSplit.length === 2 && emailSplit[1] === 'users.noreply.github.com')
    return emailSplit[0]

  return ''
}

export function getUserAvatarByEmail(
  email: string,
  { size, ...otherOptions }: { size?: number } = {},
) {
  const steppedSize = getSteppedSize(size)
  const username = tryGetUsernameFromGitHubEmail(email)
  if (username) return getUserAvatarByUsername(username, { size: steppedSize })

  const options = { size: `${steppedSize || ''}`, d: 'retro', ...otherOptions }
  return `https:${gravatar.url(email, options)}`.replace('??', '?')
}

export function isPullRequest(issue: IGitHubIssue | IGitHubPullRequest) {
  return (
    issue &&
    ((issue as IGitHubPullRequest).merged_at ||
      (issue.html_url && issue.html_url.indexOf('pull') >= 0) ||
      (issue.url && issue.url.indexOf('pull') >= 0))
  )
}

export function getOwnerAndRepo(
  repoFullName: string,
): { owner: string | undefined; repo: string | undefined } {
  if (!repoFullName) return { owner: '', repo: '' }

  const repoSplitedNames = (repoFullName || '')
    .trim()
    .split('/')
    .filter(Boolean)

  const owner = (repoSplitedNames[0] || '').trim()
  const repo = (repoSplitedNames[1] || '').trim()

  return { owner, repo }
}

export function getPullRequestIconAndColor(
  pullRequest: IGitHubPullRequest,
  theme: IBaseTheme | undefined = baseTheme,
): { icon: IGitHubIcon; color?: string } {
  const merged = pullRequest.merged_at
  const state = merged ? 'merged' : pullRequest.state

  switch (state) {
    case 'open':
      return { icon: 'git-pull-request', color: theme.green }

    case 'closed':
      return { icon: 'git-pull-request', color: theme.red }

    case 'merged':
      return { icon: 'git-merge', color: theme.purple }

    default:
      return { icon: 'git-pull-request' }
  }
}

export function getCommitIconAndColor(): { icon: IGitHubIcon; color?: string } {
  return { icon: 'git-commit' }
}

export function getIssueIconAndColor(
  issue: IGitHubIssue | IGitHubPullRequest,
  theme: IBaseTheme | undefined = baseTheme,
): { icon: IGitHubIcon; color?: string } {
  const { state } = issue

  if (isPullRequest(issue)) {
    return getPullRequestIconAndColor(issue as IGitHubPullRequest, theme)
  }

  switch (state) {
    case 'open':
      return { icon: 'issue-opened', color: theme.green }

    case 'closed':
      return { icon: 'issue-closed', color: theme.red }

    default:
      return { icon: 'issue-opened' }
  }
}

export function getNotificationIconAndColor(
  notification: IGitHubNotification,
  payload: IGitHubCommit | IGitHubIssue | IGitHubPullRequest,
  theme: IBaseTheme | undefined = baseTheme,
): { icon: IGitHubIcon; color?: string } {
  const { subject } = notification
  const { type } = subject

  switch (type.toLowerCase()) {
    case 'commit':
      return getCommitIconAndColor()
    case 'issue':
      return getIssueIconAndColor(payload as IGitHubIssue, theme)
    case 'pullrequest':
      return getPullRequestIconAndColor(payload as IGitHubPullRequest, theme)
    case 'release':
      return { icon: 'tag' }
    default:
      return { icon: 'bell' }
  }
}
