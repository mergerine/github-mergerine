import githubFetch from './fetch'
import { trace } from './log'
import configure from './config'

const { deleteBranchAfterMerge } = configure()

const deleteBranch = async (pull, repo) => {
  const { head: { ref, repo: { git_refs_url } } } = pull

  const branchRefUrl = git_refs_url.replace('{/sha}', `/heads/${ref}`)

  try {
    return await githubFetch(branchRefUrl, {
      method: 'delete'
    })
  } catch (err) {
    trace(err)
    throw err
  }
}

const merge = async (pull, repo) => {
  const { url } = pull

  const mergeUrl = `${url}/merge`

  const putData = {}

  // TODO: Get merge method from config or infer from repo API:
  //   https://developer.github.com/v3/pulls/#merge-a-pull-request-merge-button
  //   https://developer.github.com/changes/2016-09-26-pull-request-merge-api-update/
  //  Can be 'merge', 'squash', or 'rebase'. Default is 'merge'.
  if (repo.merge_method) {
    putData.merge_method = repo.merge_method
  }

  // `commit_title` and `commit_message` have proper defaults.
  if (repo.mergeCommitMessageSimple) {
    putData.commit_title = `${pull.title} (#${pull.number})`
    // It seems we need to provide a `commit_message` to prevent the default rollup of commits.
    putData.commit_message = ''
  }

  try {
    const { res, data } = await githubFetch(mergeUrl, {
      method: 'put',
      body: JSON.stringify(putData),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!res.ok) {
      const message = `Merge failed with status ${
        res.status
      } and body: ${JSON.stringify(data)}`
      throw new Error(message)
    }

    if (deleteBranchAfterMerge) {
      await deleteBranch(pull, repo)
    }

    return {
      res,
      data
    }
  } catch (err) {
    trace(err)

    throw err
  }
}

export default merge
