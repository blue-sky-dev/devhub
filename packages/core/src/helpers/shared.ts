import _ from 'lodash'
import moment, { MomentInput } from 'moment'

import {
  ActivityColumnFilters,
  Column,
  ColumnFilters,
  ColumnSubscription,
  EnhancedGitHubEvent,
  EnhancedGitHubIssueOrPullRequest,
  EnhancedGitHubNotification,
  EnhancedItem,
  GitHubEventAction,
  GitHubItemSubjectType,
  GitHubNotification,
  GitHubStateType,
  IssueOrPullRequestColumnFilters,
  NotificationColumnFilters,
} from '../types'
import { getOwnerAndRepoFormattedFilter } from './filters'
import {
  allSubjectTypes,
  eventActions,
  eventSubjectTypes,
  getOwnerAndRepo,
  issueOrPullRequestStateTypes,
  issueOrPullRequestSubjectTypes,
  notificationReasons,
  notificationSubjectTypes,
  sortEvents,
  sortIssuesOrPullRequests,
  sortNotifications,
} from './github'

export function capitalize(str: string) {
  return str.toLowerCase().replace(/^.| ./g, _.toUpper)
}

export function memoizeMultipleArgs<FN extends (...args: any[]) => any>(
  fn: FN,
): FN {
  return _.memoize(fn, (...args) => JSON.stringify(args))
}

export function guid() {
  const str4 = () =>
    (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1) // tslint:disable-line
  return `${str4() +
    str4()}-${str4()}-${str4()}-${str4()}-${str4()}${str4()}${str4()}`
}

export function isNight() {
  const hours = new Date().getHours()
  return hours >= 18 || hours < 6
}

export function getFullDateText(date: MomentInput) {
  if (!date) return ''

  const momentDate = moment(date)
  if (!momentDate.isValid()) return ''

  return momentDate.format('llll')
}

export function getDateSmallText(date: MomentInput, includeExactTime = false) {
  if (!date) return ''

  const momentDate = moment(date)
  if (!momentDate.isValid()) return ''

  const momentNow = moment(new Date())
  const timeText = momentDate.format('HH:mm')

  const secondsDiff = momentNow.diff(momentDate, 'seconds')
  const minutesDiff = momentNow.diff(momentDate, 'minutes')
  const hoursDiff =
    momentNow.diff(momentDate, 'minutes') >= 60
      ? Math.round(secondsDiff / (60 * 60))
      : Math.floor(secondsDiff / (60 * 60))
  const daysDiff =
    momentNow.diff(momentDate, 'hours') >= 24
      ? Math.round(secondsDiff / (24 * 60 * 60))
      : Math.floor(secondsDiff / (24 * 60 * 60))

  if (daysDiff < 1) {
    if (hoursDiff < 1) {
      if (minutesDiff < 1) {
        if (secondsDiff <= 1) {
          return 'now'
        }

        return `${secondsDiff}s`
      }

      return `${minutesDiff}m${includeExactTime ? ` (${timeText})` : ''}`
    }

    return `${hoursDiff}h${includeExactTime ? ` (${timeText})` : ''}`
  }

  if (daysDiff <= 3) {
    return `${daysDiff}d${includeExactTime ? ` (${timeText})` : ''}`
  }

  if (momentDate.year() !== moment().year()) {
    return momentDate.format('L').toLowerCase()
  }

  return momentDate.format('MMM Do').toLowerCase()
}

// sizes will be multiples of 50 for caching (e.g 50, 100, 150, ...)
export function getSteppedSize(
  size?: number,
  sizeSteps = 50,
  getPixelSizeForLayoutSizeFn?: (size: number) => number,
) {
  const steppedSize =
    typeof size === 'number'
      ? sizeSteps * Math.max(1, Math.ceil(size / sizeSteps))
      : sizeSteps

  return getPixelSizeForLayoutSizeFn
    ? getPixelSizeForLayoutSizeFn(steppedSize)
    : steppedSize
}

export function randomBetween(minNumber: number, maxNumber: number) {
  return Math.floor(Math.random() * maxNumber) + minNumber
}

export function trimNewLinesAndSpaces(text?: string, maxLength: number = 120) {
  if (!text || typeof text !== 'string') return ''

  let newText = text.replace(/\s+/g, ' ').trim()
  if (maxLength > 0 && newText.length > maxLength) {
    newText = `${newText.substr(0, maxLength).trim()}...`
  }

  return newText
}

export function isEventPrivate(event: EnhancedGitHubEvent) {
  if (!event) return false
  return !!(
    event.public === false ||
    ('repo' in event && event.repo && event.repo.private) ||
    ('repos' in event && event.repos && event.repos.some(repo => repo.private))
  )
}

export function isNotificationPrivate(notification: GitHubNotification) {
  if (!notification) return false
  return !!(notification.repository && notification.repository.private)
}

export function deepMapper<T extends object, R = T>(
  obj: T,
  mapper: (obj: T) => any,
): R {
  if (!(obj && _.isPlainObject(obj))) return obj as any

  return mapper(_.mapValues(obj, v =>
    _.isPlainObject(v) ? deepMapper(v as any, mapper) : v,
  ) as any)
}

const urlsToKeep = ['url', 'html_url', 'avatar_url', 'latest_comment_url']
export function removeUselessURLsFromResponseItem<
  T extends Record<string, any>
>(item: T) {
  return deepMapper(item, obj => {
    const keys = Object.keys(obj)

    keys.forEach(key => {
      if (!(key && typeof key === 'string')) return
      if (
        !(key.includes('_url') || key.includes('_link') || key.includes('href'))
      )
        return

      if (!urlsToKeep.includes(key)) {
        delete (obj as any)[key]
      }
    })
    return obj
  })
}

// Modified version of: https://github.com/stiang/remove-markdown
// License: MIT
export function stripMarkdown(
  md: string,
  _options?: {
    listUnicodeChar?: boolean
    stripListLeaders?: boolean
    githubFlavoredMarkdown?: boolean
    useImgAltText?: boolean
  },
) {
  const options = _options || {}

  options.listUnicodeChar = options.hasOwnProperty('listUnicodeChar')
    ? options.listUnicodeChar
    : false

  options.stripListLeaders = options.hasOwnProperty('stripListLeaders')
    ? options.stripListLeaders
    : true

  options.githubFlavoredMarkdown = options.hasOwnProperty('gfm')
    ? options.githubFlavoredMarkdown
    : true

  options.useImgAltText = options.hasOwnProperty('useImgAltText')
    ? options.useImgAltText
    : true

  let output = md || ''

  // Remove horizontal rules (stripListHeaders conflict with this rule, which is why it has been moved to the top)
  output = output.replace(/^(-\s*?|\*\s*?|_\s*?){3,}\s*$/gm, '')

  try {
    if (options.stripListLeaders) {
      if (options.listUnicodeChar)
        output = output.replace(
          /^([\s\t]*)([\*\-\+]|\d+\.)\s+/gm,
          `${options.listUnicodeChar} $1`,
        )
      else output = output.replace(/^([\s\t]*)([\*\-\+]|\d+\.)\s+/gm, '$1')
    }
    if (options.githubFlavoredMarkdown) {
      output = output
        // Header
        .replace(/\n={2,}/g, '\n')
        // Fenced codeblocks
        .replace(/~{3}.*\n/g, '')
        // Strikethrough
        .replace(/~~/g, '')
        // Fenced codeblocks
        .replace(/`{3}.*\n/g, '')
    }
    output = output
      // Remove HTML tags
      .replace(/<[^>]*>/g, '')
      // Remove Comments
      .replace(/<[^>]*>/g, '')
      .replace(/\>(.*)([\r\n]+|$)/g, '')
      // Remove setext-style headers
      .replace(/^[=\-]{2,}\s*$/g, '')
      // Remove footnotes?
      .replace(/\[\^.+?\](\: .*?$)?/g, '')
      .replace(/\s{0,2}\[.*?\]: .*?$/g, '')
      // Remove images
      .replace(/\!\[(.*?)\][\[\(].*?[\]\)]/g, options.useImgAltText ? '$1' : '')
      // Remove inline links
      .replace(/\[(.*?)\][\[\(].*?[\]\)]/g, '$1')
      // Remove blockquotes
      .replace(/^\s{0,3}>\s?/g, '')
      // Remove reference-style links?
      .replace(/^\s{1,2}\[(.*?)\]: (\S+)( ".*?")?\s*$/g, '')
      // Remove atx-style headers
      .replace(
        /^(\n)?\s{0,}#{1,6}\s+| {0,}(\n)?\s{0,}#{0,} {0,}(\n)?\s{0,}$/gm,
        '$1$2$3',
      )
      // Remove emphasis (repeat the line to remove double emphasis)
      .replace(/([\*_]{1,3})(\S.*?\S{0,1})\1/g, '$2')
      .replace(/([\*_]{1,3})(\S.*?\S{0,1})\1/g, '$2')
      // Remove code blocks
      .replace(/(`{3,})(.*?)\1/gm, '$2')
      // Remove inline code
      .replace(/`(.+?)`/g, '$1')
      .replace(/`/g, '')
      // Replace two or more newlines with exactly two? Not entirely sure this belongs here...
      .replace(/\n{2,}/g, '\n\n')
  } catch (e) {
    console.error(e)
    return md
  }
  return output
}

export function normalizeUsername(username: string | undefined) {
  if (!username || typeof username !== 'string') return undefined
  return username.trim().toLowerCase()
}

export function convertObjectKeysToCamelCase<T extends Record<string, any>>(
  obj: T,
): Record<string, any> {
  return _.mapKeys(obj, (_value, key) => _.camelCase(key))
}

export function genericGitHubResponseMapper(
  response: Record<string, any> | undefined,
): Record<string, any> | undefined {
  if (!(response && _.isPlainObject(response))) return response

  return _.mapValues(convertObjectKeysToCamelCase(response), obj => {
    if (_.isPlainObject(obj)) return genericGitHubResponseMapper(obj)
    return obj
  })
}

export function intercalateWithArray<T extends any[], U>(arr: T, separator: U) {
  return _.flatMap(arr, (item, index) =>
    index === 0 ? item : [separator, item],
  )
}

export function getSubscriptionOwnerOrOrg(
  subscription: ColumnSubscription | undefined,
) {
  if (!(subscription && subscription.params)) return undefined

  if ('owner' in subscription.params && subscription.params.owner)
    return subscription.params.owner

  if ('org' in subscription.params && subscription.params.org)
    return subscription.params.org

  const {
    allIncludedOwners,
    allIncludedRepos,
  } = getOwnerAndRepoFormattedFilter(
    'owners' in subscription.params
      ? { owners: subscription.params.owners }
      : undefined,
  )

  const _org = allIncludedOwners.length === 1 ? allIncludedOwners[0] : undefined
  const _ownerAndRepo =
    allIncludedRepos.length === 1
      ? getOwnerAndRepo(allIncludedOwners[0])
      : { owner: undefined, repo: undefined }

  return _org || _ownerAndRepo.owner || undefined
}

export function getSearchQueryFromFilter(
  type: Column['type'],
  filters: ColumnFilters | undefined,
): string {
  if (!(type && filters)) return ''

  const queries: string[] = []

  const {
    // clearedAt,
    bot,
    draft,
    owners,
    private: _private,
    query,
    saved,
    state: states,
    subjectTypes,
    unread,
  } = filters

  const { activity } = filters as ActivityColumnFilters
  const { involves } = filters as IssueOrPullRequestColumnFilters
  const { notifications } = filters as NotificationColumnFilters

  function getMaybeNegate(filter: boolean | null | undefined) {
    return filter === false ? '-' : ''
  }

  function handleRecordFilter(
    queryKey: string,
    filterRecord: Record<string, boolean | undefined> | undefined,
    transform?: (
      key: string,
      value: boolean | undefined,
    ) => [string, boolean | undefined],
  ) {
    if (!filterRecord) return

    const include: string[] = []
    const exclude: string[] = []
    Object.entries(filterRecord).forEach(params => {
      const [_item, value] = transform
        ? transform(params[0], params[1])
        : params

      const item = `${_item || ''}`.toLowerCase().trim()
      if (!(item && typeof value === 'boolean')) return

      if (value) include.push(item)
      else if (value === false) exclude.push(item)
    })

    if (include.length)
      queries.push(`${queryKey}:${_.sortBy(include).join(',')}`)
    if (exclude.length)
      queries.push(`-${queryKey}:${_.sortBy(exclude).join(',')}`)
  }

  const inbox = getItemInbox(type, filters)
  if (inbox !== 'all') {
    queries.push(`inbox:${inbox}`)
  }

  if (owners) {
    const { ownerFilters, repoFilters } = getOwnerAndRepoFormattedFilter({
      owners,
    })

    handleRecordFilter('owner', ownerFilters)
    handleRecordFilter('repo', repoFilters)
  }

  if (involves) {
    handleRecordFilter('involves', involves)
  }

  if (typeof saved === 'boolean') {
    const n = getMaybeNegate(saved)
    queries.push(`${n}is:saved`)
  }

  if (unread === true) queries.push('is:unread')
  if (unread === false) queries.push('is:read')

  if (typeof _private === 'boolean')
    queries.push(_private ? 'is:private' : 'is:public')

  if (subjectTypes)
    handleRecordFilter('is', subjectTypes, (_key, value) => {
      const key = `${_key || ''}`.toLowerCase().trim()
      if (key === 'pullrequest') return ['pr', value]
      return [key, value]
    })

  if (states) handleRecordFilter('is', states)

  if (typeof bot === 'boolean') {
    const n = getMaybeNegate(bot)
    queries.push(`${n}is:bot`)
  }

  if (typeof draft === 'boolean') {
    const n = getMaybeNegate(draft)
    queries.push(`${n}is:draft`)
  }

  if (notifications && notifications.reasons)
    handleRecordFilter('reason', notifications.reasons)

  if (activity && activity.actions)
    handleRecordFilter('action', activity.actions)

  // if (clearedAt) queries.push(`clear:${clearedAt}`)

  if (query) queries.push(query)

  return queries.join(' ')
}

export function getSearchQueryTerms(
  query: string | undefined,
): Array<[string, boolean] | [string, string, boolean]> {
  if (!(query && typeof query === 'string')) return []

  let q = query

  q = q.replace(/(^|\s)NOT(\s)/gi, '$1-').trim()

  // TODO: Fix regex
  // const exactStringsWithBackslash = q.match(/("-?([^\\][^"])+")/g)
  // if (exactStringsWithBackslash && exactStringsWithBackslash.length) {
  //   exactStringsWithBackslash.forEach((str, index) => {
  //     q = q.replace(str, '')
  //   })
  // }

  const otherExactStrings = q.match(/(-?"[^"]+")/g)
  if (otherExactStrings && otherExactStrings.length) {
    otherExactStrings.forEach(str => {
      q = q.replace(str, '')
    })
  }

  q = q.replace(/\s+/g, ' ').trim()

  const queryItems: string[] = q
    .split(' ')
    .map(queryItem => {
      const dotParts = queryItem.split(':')

      // handle queries with comma, like: owner:facebook,styled-components
      // by splitting them into: owner:facebook owner:styled-components
      if (
        dotParts.length === 2 &&
        dotParts[0] &&
        dotParts[1] &&
        dotParts[1].split(',').length > 1
      ) {
        return dotParts[1]
          .split(',')
          .map(subItem => subItem && `${dotParts[0]}:${subItem.trim()}`)
          .filter(Boolean)
      }

      return queryItem
    })
    .flat()
    .filter(Boolean)

  const otherStrings: string[] = []
  const keyValueItems: Array<[string, string, boolean]> = []

  queryItems.forEach(queryItem => {
    const dotParts = queryItem.split(':')

    if (dotParts.length === 1) {
      otherStrings.push(dotParts[0])
    } else if (dotParts.length === 2) {
      const _key = dotParts[0]
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase()
      const isNegated = _key[0] === '-'
      const key = isNegated ? _key.slice(1) : _key
      const value = dotParts[1]
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase()

      if (key && value) {
        keyValueItems.push([key, value, isNegated])
      }
    }
  })

  const stringItems = [
    // ...(exactStringsWithBackslash || []),
    ...(otherExactStrings || []),
    ...(otherStrings || []),
  ]
    .map(_str => {
      if (!(_str && typeof _str === 'string')) return undefined

      let isNegated = false
      let str = _str

      if (str[0] === '-') {
        isNegated = true
        str = _str.slice(1)
      }

      return [str, isNegated]
    })
    .filter(Boolean) as Array<[string, boolean]>

  return [...keyValueItems, ...stringItems]
}

export function getFilterFromSearchQuery(
  type: Column['type'],
  query: string | undefined,
  otherFilters?: Pick<ColumnFilters, 'clearedAt'> | undefined,
): ColumnFilters {
  const filters: ColumnFilters = {
    ...otherFilters,
  }

  if (!type) return filters

  const searchTerms = getSearchQueryTerms(query)

  let unknownKeyValueQueries = ''
  filters.query = ''

  searchTerms.forEach(searchTerm => {
    if (Array.isArray(searchTerm) && searchTerm.length === 2) {
      const [_query, _isNegated] = searchTerm
      if (
        !(
          _query &&
          typeof _query === 'string' &&
          typeof _isNegated === 'boolean'
        )
      )
        return

      const _str = `${_isNegated ? '-' : ''}${_query}`
      filters.query = `${filters.query} ${_str}`.trim()
      return
    }

    if (!(Array.isArray(searchTerm) && searchTerm.length === 3)) return

    const [key, value, isNegated] = searchTerm

    if (
      !(
        key &&
        value &&
        typeof key === 'string' &&
        typeof value === 'string' &&
        typeof isNegated === 'boolean'
      )
    )
      return

    const activityFilters = filters as ActivityColumnFilters
    const issueOrPRFilters = filters as IssueOrPullRequestColumnFilters
    const notificationsFilters = filters as NotificationColumnFilters

    switch (key) {
      case 'inbox': {
        const inbox = `${value || ''}`.toLowerCase().trim()

        if (type === 'notifications') {
          notificationsFilters.notifications =
            notificationsFilters.notifications || {}
          notificationsFilters.notifications.participating =
            inbox === 'participating'
        }
        break
      }

      case 'org':
      case 'owner':
      case 'user': {
        const owner = `${value || ''}`.toLowerCase().trim()
        filters.owners = filters.owners || {}
        filters.owners[owner] = filters.owners[owner] || {
          repos: {},
          value: undefined,
        }
        filters.owners[owner]!.value = !isNegated
        break
      }

      case 'repo': {
        const repoFullName = `${value || ''}`.toLowerCase().trim()
        const { owner, repo } = getOwnerAndRepo(repoFullName)
        if (!(owner && repo)) return

        filters.owners = filters.owners || {}
        filters.owners[owner] = filters.owners[owner] || {
          repos: {},
          value: undefined,
        }
        filters.owners[owner]!.repos = filters.owners[owner]!.repos || {}
        filters.owners[owner]!.repos![repo] = !isNegated
        break
      }

      case 'involves': {
        const user = `${value || ''}`.toLowerCase().trim()
        issueOrPRFilters.involves = issueOrPRFilters.involves || {}
        issueOrPRFilters.involves[user] = !isNegated
        break
      }

      case 'is': {
        switch (value) {
          case 'saved': {
            filters.saved = !isNegated
            break
          }

          case 'unread': {
            filters.unread = !isNegated
            break
          }

          case 'read': {
            filters.unread = !!isNegated
            break
          }

          case 'public': {
            filters.private = !!isNegated
            break
          }

          case 'private': {
            filters.private = !isNegated
            break
          }

          case 'bot': {
            filters.bot = !isNegated
            break
          }

          case 'draft': {
            filters.draft = !isNegated
            break
          }

          case 'open': {
            filters.state = filters.state || {}
            filters.state.open = !isNegated
            break
          }

          case 'closed': {
            filters.state = filters.state || {}
            filters.state.closed = !isNegated
            break
          }

          case 'merged': {
            filters.state = filters.state || {}
            filters.state.merged = !isNegated
            break
          }

          case 'pr': {
            filters.subjectTypes = filters.subjectTypes || {}
            ;(filters.subjectTypes as Record<
              GitHubItemSubjectType,
              boolean
            >).PullRequest = !isNegated
            break
          }

          default: {
            const validSubjectTypes =
              type === 'activity'
                ? eventSubjectTypes
                : type === 'issue_or_pr'
                ? issueOrPullRequestSubjectTypes
                : type === 'notifications'
                ? notificationSubjectTypes
                : allSubjectTypes

            if (
              validSubjectTypes
                .map(subjectType => subjectType.toLowerCase())
                .includes(value)
            ) {
              filters.subjectTypes = filters.subjectTypes || {}

              validSubjectTypes.forEach(subjectType => {
                if (subjectType.toLowerCase() === value) {
                  ;(filters.subjectTypes as Record<
                    GitHubItemSubjectType,
                    boolean
                  >)[subjectType] = !isNegated
                }
              })
              break
            }

            // TODO: Investigate
            // for some reason that I don't know,
            // the code was not going to the next "default" here,
            // so I had to copy-paste the code code below
            if (key && value) {
              const q = `${isNegated ? '-' : ''}${key}:${value}`
              unknownKeyValueQueries = `${unknownKeyValueQueries} ${q}`.trim()
              break
            }
          }
        }
      }

      case 'action': {
        if (type !== 'activity') return

        const action = `${value || ''}`.toLowerCase().trim() as
          | GitHubEventAction
          | string

        activityFilters.activity = activityFilters.activity || {}
        activityFilters.activity.actions =
          activityFilters.activity.actions || {}

        // invalid
        if (!eventActions.includes(action as GitHubEventAction)) return

        activityFilters.activity.actions[
          action as GitHubEventAction
        ] = !isNegated
        break
      }

      case 'state': {
        const state = `${value || ''}`.toLowerCase().trim() as
          | GitHubStateType
          | string

        filters.state = filters.state || {}

        // invalid
        if (!issueOrPullRequestStateTypes.includes(state as GitHubStateType))
          return

        filters.state[state as GitHubStateType] = !isNegated
        break
      }

      case 'type': {
        const subjectType = `${value || ''}`.toLowerCase().trim() as
          | GitHubItemSubjectType
          | string

        filters.subjectTypes = filters.subjectTypes || {}
        const subjectTypesFilter = filters.subjectTypes as Record<
          GitHubItemSubjectType,
          boolean
        >

        // invalid
        if (!allSubjectTypes.includes(subjectType as GitHubItemSubjectType))
          return

        subjectTypesFilter[subjectType as GitHubItemSubjectType] = !isNegated
        break
      }

      case 'reason': {
        if (type !== 'notifications') return

        const reason = `${value || ''}`.toLowerCase().trim() as
          | EnhancedGitHubNotification['reason']
          | string

        notificationsFilters.notifications =
          notificationsFilters.notifications || {}
        notificationsFilters.notifications.reasons =
          notificationsFilters.notifications.reasons || {}
        const reasonsFilter = notificationsFilters.notifications
          .reasons as Record<EnhancedGitHubNotification['reason'], boolean>

        // invalid
        if (
          !notificationReasons.includes(
            reason as EnhancedGitHubNotification['reason'],
          )
        )
          return

        reasonsFilter[
          reason as EnhancedGitHubNotification['reason']
        ] = !isNegated
        break
      }

      default: {
        if (key && value) {
          const q = `${isNegated ? '-' : ''}${key}:${value}`
          unknownKeyValueQueries = `${unknownKeyValueQueries} ${q}`.trim()
        }

        return
      }
    }
  })

  filters.query = filters.query || ''
  if (unknownKeyValueQueries)
    filters.query = `${unknownKeyValueQueries} ${filters.query}`.trim()

  return filters
}

const _emptyItemsFromSubscriptions: EnhancedItem[] = []
export function getItemsFromSubscriptions(subscriptions: ColumnSubscription[]) {
  let items = _emptyItemsFromSubscriptions

  if (!(subscriptions && subscriptions.length)) return items

  subscriptions.forEach(subscription => {
    if (
      !(
        subscription &&
        subscription.data &&
        subscription.data.items &&
        subscription.data.items.length
      )
    )
      return

    if (!items) {
      items = subscription.data.items
    } else if (subscription.data.items) {
      items = [...items, ...subscription.data.items] as any
    }
  })

  if (!(items && items.length)) return items || _emptyItemsFromSubscriptions

  if (subscriptions[0] && subscriptions[0]!.type === 'activity') {
    return sortEvents(items as EnhancedGitHubEvent[])
  }

  if (subscriptions[0] && subscriptions[0]!.type === 'issue_or_pr') {
    return sortIssuesOrPullRequests(items as EnhancedGitHubIssueOrPullRequest[])
  }

  if (subscriptions[0] && subscriptions[0]!.type === 'notifications') {
    return sortNotifications(items as EnhancedGitHubNotification[])
  }

  console.error(`Unhandled subscription type: ${subscriptions[0]!.type}`)
  return items
}

export function getItemInbox(type: Column['type'], filters: Column['filters']) {
  if (type === 'notifications') {
    const f = filters as NotificationColumnFilters

    return f && f.notifications && f.notifications.participating
      ? 'participating'
      : 'all'
  }

  return 'all'
}
