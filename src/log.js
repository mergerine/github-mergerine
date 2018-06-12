import debug from 'debug'
import { inspect } from 'util'

const { NODE_ENV } = process.env

const stringify = args =>
  args.map(arg => (typeof arg === 'string' ? arg : JSON.stringify(arg)))

const inspectify = args =>
  args.map(arg =>
    inspect(arg, {
      colors: true,
      depth: null,
      maxArrayLength: null
    })
  )

const debugOneLine = label => {
  const dbg = debug(label)
  return (...args) =>
    dbg(...(NODE_ENV === 'production' ? stringify(args) : inspectify(args)))
}

const log = debugOneLine('mergerine:log')
const trace = debugOneLine('mergerine:trace')
const logRun = debugOneLine('mergerine:run')
const logFetchOk = debugOneLine('mergerine:fetch:ok')
const logFetchErr = debugOneLine('mergerine:fetch:err')
const logDecide = debugOneLine('mergerine:decide')

export { log, logRun, logFetchOk, logFetchErr, logDecide, trace }

export default log
