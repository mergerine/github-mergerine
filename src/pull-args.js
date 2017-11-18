import { parse } from 'url'
import parseGithubUrl from 'parse-github-url'

const protocolize = url =>
  /^http/.test(url) ? url : `https://${url.replace(/^:\/\//, '')}`

const getBaseUrl = host =>
  /\bgithub\.com$/.test(host)
    ? 'https://api.github.com'
    : `https://${host}/api/v3`

const parseGithubUrlOrApiUrl = url => {
  url = protocolize(url)

  if (/\bapi\.github\.com\b/.test(url) || /\/api\/v3\//.test(url)) {
    url = url.replace('/api/v3/', '/')
    const { host, pathname } = parse(url)
    const [, , owner, name, , number] = pathname.split('/')

    const baseUrl = getBaseUrl(host)

    return {
      baseUrl,
      owner,
      name,
      number
    }
  }

  const { host, owner, name, filepath: number } = parseGithubUrl(url)

  const baseUrl = getBaseUrl(host)

  return {
    baseUrl,
    owner,
    name,
    number
  }
}

const getPullArgs = args => {
  if (args.length === 4) {
    const [url, owner, name, number] = args
    return parseGithubUrlOrApiUrl(`${url}/${owner}/${name}/pull/${number}`)
  }

  if (args.length === 3) {
    const [url, ownerAndName, number] = args
    return parseGithubUrlOrApiUrl(`${url}/${ownerAndName}/pull/${number}`)
  }

  if (args.length === 2) {
    const [urlAndOwnerAndName, number] = args
    return parseGithubUrlOrApiUrl(`${urlAndOwnerAndName}/pull/${number}`)
  }

  const [url] = args

  return parseGithubUrlOrApiUrl(url)
}

export default getPullArgs
