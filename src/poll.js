import { interval } from './config'
import run from './run'

const poll = async () => {
  console.log('starting poll...')

  run().then(() => {
    console.log(`...poll completed, waiting ${interval} milliseconds`)
    setTimeout(() => {
      poll()
    }, interval)
  })
}

export default poll
