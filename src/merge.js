import githubFetch from './fetch'
import { trace } from './log'
import { config } from './config'

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

  const data = {
    // `commit_title` and `commit_message` have proper defaults.
    // could use `sha` to restrict merge to SHA at approval
    // TODO: Get merge method from config or infer from repo API:
    //   https://developer.github.com/v3/pulls/#merge-a-pull-request-merge-button
    //   https://developer.github.com/changes/2016-09-26-pull-request-merge-api-update/
    //  Can be 'merge', 'squash', or 'rebase'. Default is 'merge'.
    merge_method: repo.merge_method
  }

  try {
    const merged = await githubFetch(mergeUrl, {
      method: 'put',
      data
    })
    if (config.deleteBranchAfterMerge) {
      await deleteBranch(pull, repo)
    }
    return merged
  } catch (err) {
    trace(err)
    throw err
  }
}

export default merge
