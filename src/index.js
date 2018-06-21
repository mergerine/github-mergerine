#!/usr/bin/env node

import 'babel-polyfill'
import yargs from 'yargs'
import { repos } from './config'
import poll from './poll'
import { decideForPull } from './decide'
import githubFetch from './fetch'
import getPullArgs from './pull-args'
import run, { runOne } from './run'

const { argv: { _ } } = yargs
const [command = 'poll', ...restArgs] = _

const findRepoForArgs = ({ baseUrl, owner, name }) =>
  repos.find(r => r.baseUrl === baseUrl && r.owner === owner && r.name === name)

// run with async/await
;(async () => {
  if (command === 'decide') {
    const { baseUrl, owner, name, number } = getPullArgs(restArgs)
    const repo = findRepoForArgs({ baseUrl, owner, name })
    const apiUrl = `${baseUrl}/repos/${owner}/${name}/pulls/${number}`
    const { data: pull } = await githubFetch(apiUrl)
    const decision = await decideForPull(pull, repo)
    // eslint-disable-next-line no-console
    console.log({ decision })
  } else if (command === 'run') {
    if (restArgs.length) {
      const { baseUrl, owner, name } = getPullArgs(restArgs)
      const repo = findRepoForArgs({ baseUrl, owner, name })
      await runOne(repo)
    } else {
      run()
    }
  } else if (command === 'poll') {
    poll()
  } else {
    // eslint-disable-next-line no-console
    console.error(`unsupported command "${command}"`)
    process.exit(1)
  }
})()
