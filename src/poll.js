import configure from './config'
import { logRun } from './log'
import run from './run'
import startHealthServer from './health'

const { interval, health } = configure()

const poll = async () => {
  logRun('starting poll...')

  if (health || health === 0) {
    startHealthServer(health)
  }

  run().then(() => {
    logRun(`...poll completed, waiting ${interval} milliseconds`)
    setTimeout(() => {
      poll()
    }, interval)
  })
}

export default poll
