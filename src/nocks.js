import nock from 'nock'
import search from './__tests__/mock/search'
import searchNoneToMerge from './__tests__/mock/search-none-to-merge'
import searchPriorityLabel from './__tests__/mock/search-priority-label'
import pulls from './__tests__/mock/pulls'
import pullsFetched from './__tests__/mock/pulls-fetched'
import pullsFetchedNoneToMerge from './__tests__/mock/pulls-fetched-none-to-merge'
import restrictions from './__tests__/mock/restrictions'

const baseNockUrl = 'https://github.example.com'

export const mockPulls = (
  nocked,
  fullPulls,
  searchIndex = search,
  pullsIndex = pulls
) =>
  nocked
    .get(/\/search\/issues/)
    .reply(200, searchIndex, {
      'X-RateLimit-Limit': 5000,
      'X-RateLimit-Remaining': 5000,
      'X-RateLimit-Reset': '2018-06-12T05:58:11.117Z' // TODO: Is this the right format?
    })
    .get(/\/pulls$/)
    .reply(200, pullsIndex)
    .get(/\/pulls\/\d+$/)
    .times(Infinity)
    .reply(200, uri => {
      const [, number] = uri.match(/\/pulls\/(\d+)$/)
      return fullPulls.find(pull => pull.number === parseInt(number, 10))
    })

export const before = () => {
  if (!nock.isActive()) nock.activate()
  nock.disableNetConnect()
}

export const after = () => {
  nock.cleanAll()
  nock.enableNetConnect()
  nock.restore()
}

export const merges = () => {
  mockPulls(nock(baseNockUrl), pullsFetched)
    .get(uri => uri.includes('/issues/11927/labels'))
    .reply(200, [
      {
        name: 'foo'
      }
    ])
    .get(uri => uri.includes('/issues/11898/labels'))
    .reply(200, [
      {
        name: 'no merge'
      }
    ])
    .get(uri => uri.includes('/issues/12628/labels'))
    .reply(200, [
      {
        name: 'no merge'
      }
    ])
    .get(uri => uri.includes('/issues/11829/labels'))
    .reply(200, [
      {
        name: 'no merge'
      },
      {
        name: 'merge'
      }
    ])
    .get(uri => uri.includes('/issues/11774/labels'))
    .reply(200, [
      {
        name: 'merge'
      }
    ])
    .get(uri => uri.includes('/pulls/11774/reviews'))
    .reply(200, [
      {
        state: 'CHANGES_REQUESTED',
        user: {
          login: 'SuperUser'
        }
      }
    ])
    .get(uri => uri.includes('/pulls/12628/reviews'))
    .reply(200, [
      {
        state: 'CHANGES_REQUESTED',
        user: {
          login: 'SuperUser'
        }
      }
    ])
    .get(uri => uri.includes('/issues/11709/labels'))
    .reply(200, [
      {
        name: 'merge'
      }
    ])
    .get(uri => uri.includes('/pulls/11709/reviews'))
    .reply(200, [
      {
        state: 'APPROVED',
        user: {
          login: 'SuperUser'
        }
      },
      {
        state: 'CHANGES_REQUESTED',
        user: {
          login: 'SomeoneElse'
        }
      }
    ])
    .get(uri => uri.includes('/issues/91683/labels'))
    .reply(200, [
      {
        name: 'merge'
      }
    ])
    .get(uri => uri.includes('/issues/92510/labels'))
    .reply(200, [
      {
        name: 'merge'
      }
    ])
    .get(uri => uri.includes('/pulls/91683/reviews'))
    .reply(200, [
      {
        state: 'APPROVED',
        user: {
          login: 'SomeRando'
        }
      },
      {
        state: 'CHANGES_REQUESTED',
        user: {
          login: 'SuperUser'
        },
        submitted_at: '2016-01-01T00:00:00Z'
      },
      {
        state: 'APPROVED',
        user: {
          login: 'SuperUser'
        },
        submitted_at: '2016-01-01T00:00:00Z'
      }
    ])
    .get(uri => uri.includes('/pulls/92510/reviews'))
    .reply(200, [
      {
        state: 'APPROVED',
        user: {
          login: 'SomeRando'
        }
      },
      {
        state: 'APPROVED',
        user: {
          login: 'SuperUser'
        },
        submitted_at: '2016-01-01T00:00:00Z'
      }
    ])
    .get(uri => uri.includes('/restrictions'))
    .reply(200, restrictions)
    // .get(uri => uri.includes('/members/SomeRando'))
    // .reply(404)
    // .get(uri => uri.includes('/members/SuperUser'))
    // .reply(204)
    .get(uri => uri.includes('/members'))
    .times(Infinity)
    .reply(200, [
      {
        login: 'SuperUser'
      }
    ])
    .put(uri => uri.includes('/merge'))
    .reply(200)
}

export const mergeFails = () => {
  mockPulls(nock(baseNockUrl), pullsFetched)
    .get(uri => uri.includes('/issues/11927/labels'))
    .reply(200, [
      {
        name: 'foo'
      }
    ])
    .get(uri => uri.includes('/issues/11898/labels'))
    .reply(200, [
      {
        name: 'no merge'
      }
    ])
    .get(uri => uri.includes('/issues/12628/labels'))
    .reply(200, [
      {
        name: 'no merge'
      }
    ])
    .get(uri => uri.includes('/issues/11829/labels'))
    .reply(200, [
      {
        name: 'no merge'
      },
      {
        name: 'merge'
      }
    ])
    .get(uri => uri.includes('/issues/11774/labels'))
    .reply(200, [
      {
        name: 'merge'
      }
    ])
    .get(uri => uri.includes('/pulls/11774/reviews'))
    .reply(200, [
      {
        state: 'CHANGES_REQUESTED',
        user: {
          login: 'SuperUser'
        }
      }
    ])
    .get(uri => uri.includes('/pulls/12628/reviews'))
    .reply(200, [
      {
        state: 'CHANGES_REQUESTED',
        user: {
          login: 'SuperUser'
        }
      }
    ])
    .get(uri => uri.includes('/issues/11709/labels'))
    .reply(200, [
      {
        name: 'merge'
      }
    ])
    .get(uri => uri.includes('/pulls/11709/reviews'))
    .reply(200, [
      {
        state: 'APPROVED',
        user: {
          login: 'SuperUser'
        }
      },
      {
        state: 'CHANGES_REQUESTED',
        user: {
          login: 'SomeoneElse'
        }
      }
    ])
    .get(uri => uri.includes('/issues/91683/labels'))
    .reply(200, [
      {
        name: 'merge'
      }
    ])
    .get(uri => uri.includes('/issues/92510/labels'))
    .reply(200, [
      {
        name: 'merge'
      }
    ])
    .get(uri => uri.includes('/pulls/91683/reviews'))
    .reply(200, [
      {
        state: 'APPROVED',
        user: {
          login: 'SomeRando'
        }
      },
      {
        state: 'CHANGES_REQUESTED',
        user: {
          login: 'SuperUser'
        },
        submitted_at: '2016-01-01T00:00:00Z'
      },
      {
        state: 'APPROVED',
        user: {
          login: 'SuperUser'
        },
        submitted_at: '2016-01-01T00:00:00Z'
      }
    ])
    .get(uri => uri.includes('/pulls/92510/reviews'))
    .reply(200, [
      {
        state: 'APPROVED',
        user: {
          login: 'SomeRando'
        }
      },
      {
        state: 'APPROVED',
        user: {
          login: 'SuperUser'
        },
        submitted_at: '2016-01-01T00:00:00Z'
      }
    ])
    .get(uri => uri.includes('/restrictions'))
    .reply(200, restrictions)
    // .get(uri => uri.includes('/members/SomeRando'))
    // .reply(404)
    // .get(uri => uri.includes('/members/SuperUser'))
    // .reply(204)
    .get(uri => uri.includes('/members'))
    .times(Infinity)
    .reply(200, [
      {
        login: 'SuperUser'
      }
    ])
    .put(uri => uri.includes('/merge'))
    .reply(500)
}

export const mergesPriorityLabels = () => {
  mockPulls(nock(baseNockUrl), pullsFetched, searchPriorityLabel)
    .get(uri => uri.includes('/labels'))
    .times(Infinity)
    .reply(200, [
      {
        name: 'merge'
      }
    ])
    .get(uri => uri.includes('/92510/labels'))
    .times(Infinity)
    .reply(200, [
      {
        name: 'merge'
      },
      {
        id: 456,
        url:
          'https://git.target.com/api/v3/repos/your-owner/your-repo/labels/priority',
        name: 'priority',
        color: '000000',
        default: false
      }
    ])
    .get(uri => uri.includes('/reviews'))
    .times(Infinity)
    .reply(200, [
      {
        state: 'APPROVED',
        user: {
          login: 'SomeRando'
        }
      },
      {
        state: 'APPROVED',
        user: {
          login: 'SuperUser'
        }
      }
    ])
    .get(uri => uri.includes('/restrictions'))
    .reply(404)
    .get(uri => uri.includes('/members'))
    .reply(404)
    .put(uri => uri.includes('/merge'))
    .reply(200)
}

export const mergesNoRestrictions = () => {
  mockPulls(nock(baseNockUrl), pullsFetched)
    .get(uri => uri.includes('/labels'))
    .times(Infinity)
    .reply(200, [
      {
        name: 'merge'
      }
    ])
    .get(uri => uri.includes('/reviews'))
    .times(Infinity)
    .reply(200, [
      {
        state: 'APPROVED',
        user: {
          login: 'SomeRando'
        }
      },
      {
        state: 'APPROVED',
        user: {
          login: 'SuperUser'
        }
      }
    ])
    .get(uri => uri.includes('/restrictions'))
    .reply(404)
    .get(uri => uri.includes('/members'))
    .reply(404)
    .put(uri => uri.includes('/merge'))
    .reply(200)
}

export const updates = () => {
  mockPulls(nock(baseNockUrl), pullsFetchedNoneToMerge, searchNoneToMerge)
    .get(uri => uri.includes('/issues/92510/labels'))
    .reply(200, [
      {
        name: 'merge'
      }
    ])
    .get(uri => uri.includes('/pulls/92510/reviews'))
    .reply(200, [
      {
        state: 'APPROVED',
        user: {
          login: 'SomeRando'
        }
      },
      {
        state: 'APPROVED',
        user: {
          login: 'SuperUser'
        }
      }
    ])
    .get(uri => uri.includes('/labels'))
    .times(Infinity)
    .reply(200, [])
    .get(uri => uri.includes('/reviews'))
    .times(Infinity)
    .reply(200, [])
    .get(uri => uri.includes('/restrictions'))
    .reply(200, restrictions)
    // .get(uri => uri.includes('/members/SomeRando'))
    // .reply(404)
    // .get(uri => uri.includes('/members/SuperUser'))
    // .reply(204)
    .get(uri => uri.includes('/members'))
    .times(Infinity)
    .reply(200, [
      {
        login: 'SuperUser'
      }
    ])
    .post(uri => uri.includes('/merges'))
    .reply(200)
}

export const none = () => {
  mockPulls(nock(baseNockUrl), pullsFetchedNoneToMerge)
    .get(uri => uri.includes('/labels'))
    .times(Infinity)
    .reply(200, [])
    .get(uri => uri.includes('/reviews'))
    .times(Infinity)
    .reply(200, [])
    .get(uri => uri.includes('/restrictions'))
    .reply(200, restrictions)
    .get(uri => uri.includes('/members'))
    .reply(404)
}

export const mergeableByLabelsNotReviews = () => {
  mockPulls(nock(baseNockUrl), pullsFetched)
    .get(uri => uri.includes('/labels'))
    .times(Infinity)
    .reply(200, [
      {
        name: 'merge'
      }
    ])
    .get(uri => uri.includes('/reviews'))
    .times(Infinity)
    .reply(200, [])
    .get(uri => uri.includes('/restrictions'))
    .reply(200, restrictions)
    .get(uri => uri.includes('/members'))
    .reply(404)
}
