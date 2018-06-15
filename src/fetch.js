import fetch from 'node-fetch'
import fetchPaginate from 'fetch-paginate'
import { logFetchOk, logFetchErr, trace } from './log'
import { token, logDataUrlPattern } from './config'

const logDataUrlRegExp = logDataUrlPattern && new RegExp(logDataUrlPattern)

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
      const { headers, status } = res

      const shouldLogData = logDataUrlRegExp && logDataUrlRegExp.test(url)

      logFetchOk(url, {
        method,
        status,
        reqData: shouldLogData ? options.data : options.data && 'redacted',
        rateLimit: {
          limit: headers.get('x-ratelimit-limit'),
          remaining: headers.get('x-ratelimit-remaining'),
          reset: headers.get('x-ratelimit-reset')
        },
        resData: shouldLogData ? data : data && 'redacted'
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
