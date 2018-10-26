import { resolve } from 'path'
import { readFileSync } from 'fs'
import { getInterval } from './configHelper'
import { logConfig } from './log'

const {
  MERGERINE_CONFIG = 'mergerine.json',
  MERGERINE_INTERVAL,
  MERGERINE_MERGABLE_STATE_REFRESH_INTERVAL,
  MERGERINE_DELETE_BRANCH_AFTER_MERGE,
  MERGERINE_DRY,
  MERGERINE_GITHUB_TOKEN,
  GITHUB_TOKEN
} = process.env

let config = JSON.parse(
  readFileSync(resolve(process.cwd(), MERGERINE_CONFIG), 'utf8')
)

const repos = (config.repos || []).map(repo => ({
  ...repo,
  baseUrl: repo.baseUrl || 'https://api.github.com'
}))

const token = MERGERINE_GITHUB_TOKEN || GITHUB_TOKEN || config.token

logConfig({ tokenPrefix: token && token.substr(0, 2) })

const rawInterval = parseInt(MERGERINE_INTERVAL) || config.interval || 120000 // 2 minutes
const interval = getInterval(rawInterval)

const rawMergableStateRefreshInterval =
  parseInt(MERGERINE_MERGABLE_STATE_REFRESH_INTERVAL) ||
  config.mergable_state_refresh_interval ||
  5000 // 5 seconds
const mergableStateRefreshInterval = getInterval(
  rawMergableStateRefreshInterval
)

const deleteBranchAfterMerge =
  MERGERINE_DELETE_BRANCH_AFTER_MERGE === 'true' ||
  config.deleteBranchAfterMerge

const dry = MERGERINE_DRY === 'true' || config.dry

const { logDataUrlPattern } = config

export {
  repos,
  logDataUrlPattern,
  token,
  interval,
  mergableStateRefreshInterval,
  deleteBranchAfterMerge,
  dry
}
