import debug from 'debug'
import { inspect } from 'util'

const log = (...data) =>
  debug('mergerine:log')(
    ...data.map(datum =>
      inspect(datum, {
        colors: true,
        depth: null,
        maxArrayLength: null
      })
    )
  )

const trace = debug('mergerine:trace')
const logRun = debug('mergerine:run')
const logFetchOk = debug('mergerine:fetch:ok')
const logFetchErr = debug('mergerine:fetch:err')
const logDecide = debug('mergerine:decide')

export { log, logRun, logFetchOk, logFetchErr, logDecide, trace }

export default log
