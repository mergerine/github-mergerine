import { get } from 'lodash'
import { logDecide, logRun, trace } from './log'
import decide from './decide'
import merge from './merge'
import update from './update'
import configure from './config'

const { repos, dry } = configure()

const runOne = async repo => {
  const decision = await decide(repo)

  const html_url = get(decision, 'result.pull.html_url')

  if (html_url) {
    logDecide(`action=${decision.action} for ${html_url}`)
  } else {
    logDecide(`action=${decision.action}`)
  }

  if (dry) {
    logRun('dry mode, not acting...')
    return decision
  }

  logRun('acting...')

  try {
    if (decision.action === 'merge') {
      logRun('merging...')
      await merge(decision.result.pull, repo)
      logRun('...done merging')

      logRun('checking for any others to update...')

      // run again in case any immediate updates can be made after merging
      let postDecision
      try {
        postDecision = await runOne(repo)
      } catch (err) {
        trace(err)
        logRun('error executing post-merge decision', decision)
        // eslint-disable-next-line no-console
        console.error('error executing post-merge decision', postDecision)
      }

      logRun('...done checking for any others to update')
    } else if (decision.action === 'update') {
      logRun('updating...')
      await update(decision.result.pull)
      logRun('...done updating')
    }
  } catch (err) {
    trace(err)
    logRun('error executing decision', decision)
    // eslint-disable-next-line no-console
    console.error('error executing decision', decision)

    decision.error = err
  }

  logRun('...done acting')

  return decision
}

const run = async () => {
  const decisions = []

  for (let repo of repos) {
    const decision = await runOne(repo)
    decisions.push(decision)
  }

  return decisions
}

export { runOne }

export default run
