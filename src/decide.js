import configure from './config'
import { sortBy } from 'lodash'
import delay from 'delay'
import githubFetch, { repoFetch } from './fetch'
import log, { logDecide, trace } from './log'
import { processQuery } from './helpers'
import lint from '@commitlint/lint'
import load from '@commitlint/load'

const { mergeableStateRefreshInterval, mergeableStateCheck } = configure()

const makeStatusUrl = pull => {
  const { head } = pull
  const { repo, sha } = head
  const commitsUrl = repo.commits_url.replace('{/sha}', `/${sha}`)
  const statusUrl = `${commitsUrl}/status`
  return statusUrl
}

// const isUserInTeam = async (login, team) => {
//   try {
//     const url = team.members_url.replace('{/member}', `/${login}`)
//     trace('DEV USER IN TEAM', { login, team, url })
//     const { res } = await githubFetch(url)
//     return res.ok
//   } catch (err) {
//     trace(err)
//     // TODO: 404 is expected, but what about other non-404 errors, e.g., 5XX?
//     return false
//   }
// }

const isUserInTeamTree = async (login, team) => {
  try {
    const url = team.members_url.replace('{/member}', '')
    trace('DEV USER IN TEAM', { login, team, url })
    const { res, data } = await githubFetch(url)

    if (!res.ok) {
      const message = `Get users in team failed with status ${
        res.status
      } and body: ${JSON.stringify(data)}`
      throw new Error(message)
    }

    const some = data.some(user => user.login === login)

    return some
  } catch (err) {
    trace(err)
    // TODO: 404 is expected, but what about other non-404 errors, e.g., 5XX?
    return false
  }
}

const isUserInUsers = (login, users) => users.some(user => user.login === login)

const isUserInTeams = async (pull, login, teams) => {
  for (let team of teams) {
    if (await isUserInTeamTree(login, team)) {
      logDecide(
        `${pull.html_url} allows user "${login}" in team "${team.name}"`
      )
      return true
    }
  }

  logDecide(`${pull.html_url} has no user "${login}" in teams`)

  return false
}

const isUserInUsersOrTeams = async (pull, login, users, teams) => {
  const userIsInUsers = isUserInUsers(login, users)
  if (userIsInUsers) {
    logDecide(`${pull.html_url} allows user "${login}" in users`)
    return true
  }

  return isUserInTeams(pull, login, teams)
}

const isUserAllowedToMerge = (login, pull, restrictions) => {
  const { users, teams = [] } = restrictions

  return isUserInUsersOrTeams(pull, login, users, teams)
}

const isLabelInLabels = (name, labels) =>
  labels.some(label => label.name === name)

const everyLabelInLabels = (labels, requireds) =>
  requireds.every(label => isLabelInLabels(label, labels))

const someLabelInLabels = (labels, candidates) =>
  candidates.some(label => isLabelInLabels(label, labels))

const fetchLabels = async (pull, options) => {
  const labelsUrl = `${pull.url.replace('/pulls/', '/issues/')}/labels`
  const { data: labels } = await githubFetch(labelsUrl)
  return labels
}

const isMergeableByLabels = async (pull, options) => {
  // TODO: Does this shorthand work to get labels on `pull` itself from a search (not a pulls list)?
  const labels = pull.labels || (await fetchLabels(pull, options))
  logDecide(
    pull.html_url,
    'labels',
    labels && labels.map(l => l.name),
    'vs. expected',
    options.labels
  )
  if (
    (options.labels && !everyLabelInLabels(labels, options.labels)) ||
    (options.notLabels && someLabelInLabels(labels, options.notLabels))
  ) {
    return false
  }
  return true
}

const getRequiredStatusChecksContexts = async (pull, options) => {
  const {
    base: { ref: baseRef }
  } = pull
  try {
    const { res, data } = await repoFetch(
      `/branches/${baseRef}/protection/required_status_checks/contexts`,
      options
    )

    if (!res.ok) {
      const message = `Check required contexts failed with status ${
        res.status
      } and body: ${JSON.stringify(data)}`
      throw new Error(message)
    }

    return data
  } catch (err) {
    trace(err)
    // TODO: 404 is expected, but what about other non-404 errors, e.g., 5XX?
  }
}

const getRestrictions = async (pull, options) => {
  const {
    base: { ref: baseRef }
  } = pull
  try {
    const { res, data } = await repoFetch(
      `/branches/${baseRef}/protection/restrictions`,
      options
    )

    if (!res.ok) {
      const message = `Check required contexts failed with status ${
        res.status
      } and body: ${JSON.stringify(data)}`
      throw new Error(message)
    }

    return data
  } catch (err) {
    trace(err)
    // TODO: 404 is expected, but what about other non-404 errors, e.g., 5XX?
  }
}

const isMergeableByReviews = async (pull, options) => {
  const reviewsUrl = `${pull.url}/reviews`
  const { data: reviews } = await githubFetch(reviewsUrl)
  if (!reviews || !reviews.length) {
    logDecide(`${pull.html_url} has no reviews`)
    return false
  }

  const approvals = reviews.filter(({ state }) => state === 'APPROVED')
  if (!approvals || !approvals.length) {
    logDecide(`${pull.html_url} has no approvals`)
    return false
  }

  const changesRequesteds = reviews.filter(
    ({ state }) => state === 'CHANGES_REQUESTED'
  )

  if (changesRequesteds && changesRequesteds.length) {
    const areChangesRequestedsReplacedByApprovals = changesRequesteds.every(
      changesRequested => {
        // TODO: Test the structure of approvals user.
        const approvalsByUser = approvals.filter(
          approval => approval.user.login === changesRequested.user.login
        )
        // Be sure it was approved more recently than changes were requested.
        return approvalsByUser.some(
          approval => approval.submitted_at > changesRequested.submitted_at
        )
      }
    )

    if (areChangesRequestedsReplacedByApprovals) {
      logDecide(
        `${pull.html_url} has changes requested but are replaced by later approvals from same users`
      )
    } else {
      logDecide(
        `${pull.html_url} has changes requested that are not replaced by later approvals from same users`
      )
      return false
    }
  }

  if (options.restrictions && options.restrictions.length) {
    for (let restriction of options.restrictions) {
      if (restriction.teams && restriction.teams.length) {
        for (let team of restriction.teams) {
          const members_url = `${options.baseUrl}/teams/${team.id}/members`
          const { data: members } = await githubFetch(members_url)

          if (team.approvals && team.approvals > 0) {
            let count = 0
            for (let approval of approvals) {
              const {
                user: { login }
              } = approval

              trace(`${pull.html_url} members`, members)

              if (members.some(member => member.login === login)) {
                count++
              }

              if (count === team.approvals) {
                break
              }
            }

            if (count !== team.approvals) {
              trace(
                `${pull.html_url} has only ${count} approvals by team ${team.id} but requires ${team.approvals}`
              )
              return false
            }
          }
        }
      }
    }
  }

  const restrictions = await getRestrictions(pull, options)

  if (!restrictions) {
    // TODO: Handle no restrictions.
    logDecide(`${pull.html_url} has no restrictions`)
    return true
  }

  for (let approval of approvals) {
    const {
      user: { login }
    } = approval

    const userIsAllowedToMerge = await isUserAllowedToMerge(
      login,
      pull,
      restrictions
    )

    if (userIsAllowedToMerge) {
      return true
    }
  }

  return false
}

const isMergeableByCommitlint = async (pull, options) => {
  if (options.commitlint) {
    try {
      const rules = (await load(options.commitlint)).rules
      const report = await lint(pull.title, rules)
      if (report.valid) {
        return true
      } else {
        logDecide(`${pull.html_url} is not mergeable by commitlint`, report)
        return false
      }
    } catch (error) {
      logDecide(`${pull.html_url} is not mergeable by commitlint`, error)
      return false
    }
  }

  return true
}

const isMergeableByMetadata = async (pull, options) => {
  // TODO: See if we should even auto-merge to the given branch, per configuration.

  if (!(await isMergeableByCommitlint(pull, options))) {
    const description = 'commitlint'
    return { merge: false, description }
  }

  // TODO: Bypass this labels check if we're not configured to care about labels,
  //  or if assumed optional based on search query rules.
  if (!(await isMergeableByLabels(pull, options))) {
    logDecide(`${pull.html_url} is not mergeable by labels`)
    const description = 'labels'
    return { merge: false, description }
  }

  // TODO: Bypass this if the branch isn't protected with approval requirement.
  if (!(await isMergeableByReviews(pull, options))) {
    logDecide(`${pull.html_url} is not mergeable by reviews`)
    const description = 'reviews'
    return { merge: false, description }
  }

  logDecide(`${pull.html_url} is mergeable by labels and reviews`)

  return { merge: true }
}

const relevantMergeableStates = ['clean', 'behind']

const hasRelevantMergeableState = pull =>
  relevantMergeableStates.includes(pull.mergeable_state)

const isClosed = pull => pull.state !== 'open' || pull.merged

const isMergeableCore = async (pull, options) => {
  if (isClosed(pull)) {
    const description = 'closed'
    logDecide(`${pull.html_url} is ${description}, not merging`)
    return { merge: false, description }
  }

  if (!pull.mergeable) {
    const description = 'not mergeable'
    logDecide(`${pull.html_url} is ${description}, not merging`)
    return { merge: false, description }
  }

  return isMergeableByMetadata(pull, options)
}

/**
 *
 * "mergeable": true
 * "mergeable_state": "blocked"
 *
 */
const isMergeableExceptPendingStatuses = async (pull, options) => {
  if (pull.mergeable_state !== 'blocked') {
    logDecide(
      `${pull.html_url} is not blocked (but "${
        pull.mergeable_state
      }"), not pending statuses`
    )
    return false
  }

  logDecide(`${pull.html_url} is blocked, checking if otherwise mergeable`)

  if (!(isMergeableCore(pull, options).merge)) {
    return false
  }

  const requiredContexts = await getRequiredStatusChecksContexts(pull, options)

  if (!requiredContexts || !requiredContexts.length) {
    logDecide(`no required status checks found, not pending`)
    return false
  }

  const statusUrl = makeStatusUrl(pull)

  const { res: resStatuses, data } = await githubFetch(statusUrl)

  if (!resStatuses.ok) {
    const message = `Fetch statuses failed with status ${
      resStatuses.status
    } and body: ${JSON.stringify(data)}`
    throw new Error(message)
  }

  const { statuses } = data

  return requiredContexts.some(requiredContext =>
    statuses.some(
      status => status.context === requiredContext && status.state === 'pending'
    )
  )
}

const shouldMerge = async (pull, options) => {
  if (pull.mergeable_state === 'unstable' && mergeableStateCheck) {
    return isMergeableCore(pull, options)
  }

  if (pull.mergeable_state !== 'clean') {
    console.log('ADJ WHY ARE YOU NOT CLEAN', pull.number)
    const description = 'not clean'

    logDecide(`${pull.html_url} is ${description}, not merging`)

    return { merge: false, description }
  }

  return isMergeableCore(pull, options)
}

const shouldUpdate = async (pull, options) => {
  if (isClosed(pull)) {
    logDecide(`${pull.html_url} is closed, not updating`)
    return false
  }

  if (pull.mergeable_state !== 'behind') {
    logDecide(`${pull.html_url} is not behind, not updating`)
    return false
  }

  return isMergeableByMetadata(pull, options).merge
}

const shouldSkip = pull => isClosed(pull) || !hasRelevantMergeableState(pull)

const decideForPull = async (pull, options) => {
  const result = { pull }
  const results = [result]

  if (await isMergeableExceptPendingStatuses(pull, options)) {
    const description = 'pending statuses'
    logDecide(`${pull.html_url} is mergeable except ${description}, waiting`)
    return { action: 'wait', description, result, results, options }
  }

  const { merge, description } = await shouldMerge(pull, options)

  console.log('ADJ merge', merge, description)

  if (merge) {
    return {
      action: 'merge',
      result,
      results,
      options
    }
  }

  if (await shouldUpdate(pull, options)) {
    return {
      action: 'update',
      result,
      results,
      options
    }
  }

  return { action: 'wait', description, result, results, options }
}

const sortForDate = (date, direction = 'desc') => {
  if (!date) return 0
  const time = new Date(date).getTime()
  return direction === 'asc' ? time : -time
}

// TODO: Support other custom sort strategies?
const sortResults = (results, options = {}) =>
  results &&
  sortBy(
    results,
    result => {
      const { priorityLabels } = options
      if (!priorityLabels) return 0

      const { labels } = result.pull
      if (!labels) return 0

      // priorityLabels: ['a', 'b']
      // 1: ['b', 'a'] // score 2 + 1 = 3
      // 2: ['a'] // score 1

      const score = priorityLabels.reduce((acc, priorityLabelName, index) => {
        const has = labels.some(label => label.name === priorityLabelName)
        return has ? acc + index + 1 : acc
      }, 0)

      return -score
    },
    result => {
      const { sort = 'created', direction } = options
      if (sort === 'created') {
        return sortForDate(result.pull.created_at, direction)
      } else if (sort === 'updated') {
        return sortForDate(result.pull.updated_at, direction)
      } else {
        throw new Error(`unsupported "sort" value "${sort}"`)
      }
    },
    result => result.pull.number
  )

const decideWithResults = async (results, options) => {
  const { phases } = options

  logDecide(`phases: ${phases.join(', ')}`)

  results = sortResults(results, options)

  logDecide('results', results.map(r => r.pull.number).join(','))

  logDecide('phase: pending')

  for (let result of results) {
    const { pull } = result
    if (await isMergeableExceptPendingStatuses(pull, options)) {
      const description = 'blocked by pending statuses'
      logDecide(`${pull.html_url} is mergeable except ${description}, waiting`)
      return { action: 'wait', result, results, options }
    }
  }

  let description

  if (phases.includes('merge')) {
    logDecide('phase: mergeable')

    for (let result of results) {
      const { pull } = result
      const { merge, description: desc } = await shouldMerge(pull, options)
      description = desc
      if (merge) {
        return { action: 'merge', result, results, options }
      }
    }
  }

  // Since none were mergeable, find one to update:

  if (phases.includes('update')) {
    logDecide('phase: updateable')

    for (let result of results) {
      const { pull } = result
      console.log('ADJ phase update')
      if (await shouldUpdate(pull, options)) {
        return { action: 'update', result, results, options }
      }
    }
  }

  return { action: 'wait', description, results, options }
}

const decideWithPulls = (pulls, options) =>
  decideWithResults(pulls.map(pull => ({ pull })), options)

// fetchPulls gets a list of PRs based on search query
const fetchPulls = async ({ baseUrl, owner, name, pullsMode, query }) => {
  let pulls
  if (pullsMode === 'search') {
    try {
      const { data } = await githubFetch(
        `${baseUrl}/search/issues?q=${encodeURIComponent(query)}`
      )
      log({ searchData: data })
      pulls = data
    } catch (err) {
      trace(err)
      // TODO: Detect if it's fatal or not.
    }
  } else {
    try {
      const { data } = await githubFetch(
        `${baseUrl}/repos/${owner}/${name}/pulls`
      )
      log({ listData: data })
      pulls = data.filter(shouldSkip)
    } catch (err) {
      trace(err)
      // TODO: Detect if it's fatal or not.
    }
  }

  log({ pulls })

  return pulls
}

// fetchFullPulls gets full data for each pull request provided
const fetchFullPulls = async ({ baseUrl, owner, name, pulls }) => {
  const fullPulls = []

  for (let pull of pulls) {
    try {
      const url = `${baseUrl}/repos/${owner}/${name}/pulls/${pull.number}`

      const { res, data: fullPull } = await githubFetch(url)

      log({ pullNum: pull.html_url, res, fullPull })

      // carry over labels from search results, since full pull doesn't have
      fullPull.labels = pull.labels

      fullPulls.push(fullPull)
    } catch (err) {
      trace(err)
    }
  }

  return fullPulls
}

const isStateUnknown = pull => pull.mergeable_state === 'unknown'

const allMergeableStateUnknown = pulls => {
  if (pulls === undefined || pulls.length === 0) {
    return false
  }

  return pulls.every(isStateUnknown)
}

const decide = async options => {
  let { query } = options
  const {
    baseUrl, // e.g. 'https://api.github.com' or https://github.example.com/api/v3'
    owner, // repo user or org
    name, // repo name
    pullsMode = query ? 'search' : 'list' // whether to use list or search for pulls
  } = options

  query = processQuery(query)

  // For search instead of list:
  //
  // 'review:approved' seems to filter out any PRs with changes requested, even if they also have approvals.
  //
  //   'is:pr is:open review:approved label:merge -label:"no merge" base:master'
  //
  //  'status:success' seems to exclude PRs that are simply behind base, so we'll not use that

  const pulls = await fetchPulls({ baseUrl, owner, name, pullsMode, query })

  if (!pulls || !pulls.length) return { action: 'wait' }

  let fullPulls = await fetchFullPulls({ baseUrl, owner, name, pulls })

  // if all PRs are in an unknown mergeable state refetch
  if (allMergeableStateUnknown(fullPulls)) {
    log(
      `All PRs are in mergeable state "unknown", waiting ${mergeableStateRefreshInterval}ms to refresh...`
    )
    await delay(mergeableStateRefreshInterval)
    fullPulls = await fetchFullPulls({ baseUrl, owner, name, pulls })
  }

  return decideWithPulls(fullPulls, options)
}

export {
  shouldMerge,
  shouldUpdate,
  decideForPull,
  sortResults,
  makeStatusUrl,
  allMergeableStateUnknown,
  isMergeableByCommitlint
}

export default decide
