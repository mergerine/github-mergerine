import fetch from 'node-fetch'
import fetchPaginate from 'fetch-paginate'
import { logFetchOk, logFetchErr, trace } from './log'
import { token } from './config'

global.fetch = fetch

const accepts = [
  'application/vnd.github.v3+json',
  'application/vnd.github.loki-preview+json',
  'application/vnd.github.hellcat-preview+json',
  // TODO: Should this include "+json" suffix or no?
  'application/vnd.github.polaris-preview',
  'application/vnd.github.polaris-preview+json',
  'application/json'
]

const githubFetch = (url, options = {}) => {
  const { headers = {}, method = 'get', ...rest } = options

  const allHeaders = {
    Accept: accepts.join(','),
    Authorization: `token ${token}`,
    ...headers
  }

  return fetchPaginate(url, {
    headers: allHeaders,
    method,
    items: data => (data.searchData ? data.searchData.items : data),
    ...rest
  })
    .then(({ res, data }) => {
      const { status } = res

      logFetchOk(url, {
        method,
        status,
        reqData: options.data,
        rateLimit: {
          limit: res.headers.get('x-ratelimit-limit'),
          remaining: res.headers.get('x-ratelimit-remaining'),
          reset: res.headers.get('x-ratelimit-reset')
        },
        resData: data
      })

      return {
        res,
        data
      }
    })
    .catch(err => {
      const { message } = err
      logFetchErr(url, {
        method,
        message
      })
      trace(err)
      throw err
    })
}

const repoFetch = (path, options) =>
  githubFetch(
    `${options.baseUrl}/repos/${options.owner}/${options.name}${path}`
  )

export { repoFetch }
export default githubFetch
