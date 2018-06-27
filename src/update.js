import githubFetch from './fetch'
import { trace } from './log'

const update = async pull => {
  const { head, base } = pull

  const { repo: { merges_url } } = head

  const postData = {
    // Intentionally inverted for updates.
    base: head.ref, // into, i.e., PR branch name
    head: base.ref // from, e.g., master
  }

  try {
    return await githubFetch(merges_url, {
      method: 'post',
      body: JSON.stringify(postData),
      headers: {
        'Content-Type': 'application/json'
      }
    })
  } catch (err) {
    trace(err)
    throw err
  }
}

export default update
