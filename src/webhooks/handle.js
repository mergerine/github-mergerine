import configure from '../config'
import { runOne } from '../run'

const config = configure()
const { repos } = config

const handle = req => {
  const eventType = req.headers['x-github-event']

  const { body } = req

  // https://developer.github.com/webhooks/#events
  if (eventType === 'pull_request') {
    // https://developer.github.com/v3/activity/events/types/#pullrequestevent

    const { repository } = body

    const { name, owner: { login } } = repository

    const repo = repos.find(repo =>
      repo.name === name && repo.owner === login
    )

    if (!repo) return

    runOne(repo)
  }
}

export default handle
