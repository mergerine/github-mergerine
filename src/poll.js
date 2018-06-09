import { interval } from './config'
import { logRun } from './log'
import run from './run'

const poll = async () => {
  logRun('starting poll...')

  run().then(() => {
    logRun(`...poll completed, waiting ${interval} milliseconds`)
    setTimeout(() => {
      poll()
    }, interval)
  })
}

export default poll
