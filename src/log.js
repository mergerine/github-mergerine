import debug from 'debug'
import { inspect } from 'util'

const { NODE_ENV } = process.env

const stringify = (label, args) =>
  JSON.stringify({
    label,
    time: new Date().getTime(),
    data: args
  })

const inspectify = args => [
  new Date().getTime(),
  ...args.map(arg =>
    inspect(arg, {
      colors: true,
      depth: null,
      maxArrayLength: null
    })
  )
]

const debugOneLine = label => (...args) =>
  NODE_ENV === 'production'
    ? debug.enabled(label) && console.log(stringify(label, args)) // eslint-disable-line no-console
    : debug(label)(...inspectify(args))

const log = debugOneLine('mergerine:log')
const logConfig = debugOneLine('mergerine:config')
const trace = debugOneLine('mergerine:trace')
const logRun = debugOneLine('mergerine:run')
const logFetchOk = debugOneLine('mergerine:fetch:ok')
const logFetchErr = debugOneLine('mergerine:fetch:err')
const logDecide = debugOneLine('mergerine:decide')

export { log, logConfig, logRun, logFetchOk, logFetchErr, logDecide, trace }

export default log
