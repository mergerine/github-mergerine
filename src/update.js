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
    const { res, data } = await githubFetch(merges_url, {
      method: 'post',
      body: JSON.stringify(postData),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!res.ok) {
      const message = `Update failed with status ${
        res.status
      } and body: ${JSON.stringify(data)}`
      throw new Error(message)
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

export default update
