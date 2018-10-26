import { allMergeableStateUnknown, sortResults, makeStatusUrl } from '../decide'
import approvedPending from './mock/approved-pending.json'

describe('decide', () => {
  describe('allMergeableStateUnknown', () => {
    it('should return false on undefined', () => {
      expect(allMergeableStateUnknown()).toBe(false)
    })

    it('should return false on no PRs', () => {
      expect(allMergeableStateUnknown([])).toBe(false)
    })

    it('should return false if a PR is not unknown', () => {
      expect(
        allMergeableStateUnknown([
          {
            mergeable_state: 'unknown'
          },
          {
            mergeable_state: 'clean'
          },
          {
            mergeable_state: 'unknown'
          }
        ])
      ).toBe(false)
    })

    it('should return true if all PRs are unknown', () => {
      expect(
        allMergeableStateUnknown([
          {
            mergeable_state: 'unknown'
          },
          {
            mergeable_state: 'unknown'
          },
          {
            mergeable_state: 'unknown'
          }
        ])
      ).toBe(true)
    })
  })

  describe('makeStatusUrl', () => {
    it('should work', () => {
      expect(makeStatusUrl(approvedPending)).toBe(
        'https://github.example.com/api/v3/repos/your-owner/your-repo/commits/123abcdefg/status'
      )
    })
  })

  describe('sortResults', () => {
    it('should work for undefined', () => {
      expect(sortResults()).toBeUndefined()
    })
    it('should work for null', () => {
      expect(sortResults(null)).toBe(null)
    })
    it('should work for empty', () => {
      expect(sortResults([])).toEqual([])
    })
    it('should sort by number', () => {
      expect(
        sortResults([
          {
            pull: { number: 2 }
          },
          {
            pull: { number: 1 }
          }
        ])
      ).toEqual([
        {
          pull: { number: 1 }
        },
        {
          pull: { number: 2 }
        }
      ])
    })
    it('should sort by number when all else equal', () => {
      expect(
        sortResults([
          {
            pull: { number: 2, created_at: '2016-01-01T00:00:00Z' }
          },
          {
            pull: { number: 1, created_at: '2016-01-01T00:00:00Z' }
          }
        ])
      ).toEqual([
        {
          pull: { number: 1, created_at: '2016-01-01T00:00:00Z' }
        },
        {
          pull: { number: 2, created_at: '2016-01-01T00:00:00Z' }
        }
      ])
    })
    it('should sort by created desc by default', () => {
      expect(
        sortResults([
          {
            pull: { number: 2, created_at: '2017-01-01T00:00:00Z' }
          },
          {
            pull: { number: 1, created_at: '2016-01-01T00:00:00Z' }
          }
        ])
      ).toEqual([
        {
          pull: { number: 2, created_at: '2017-01-01T00:00:00Z' }
        },
        {
          pull: { number: 1, created_at: '2016-01-01T00:00:00Z' }
        }
      ])
    })
    it('should sort by created asc if configured', () => {
      expect(
        sortResults(
          [
            {
              pull: { number: 2, created_at: '2017-01-01T00:00:00Z' }
            },
            {
              pull: { number: 1, created_at: '2016-01-01T00:00:00Z' }
            }
          ],
          {
            sort: 'created',
            direction: 'asc'
          }
        )
      ).toEqual([
        {
          pull: { number: 1, created_at: '2016-01-01T00:00:00Z' }
        },
        {
          pull: { number: 2, created_at: '2017-01-01T00:00:00Z' }
        }
      ])
    })
    it('should sort by updated desc if configured', () => {
      expect(
        sortResults(
          [
            {
              pull: { number: 2, updated_at: '2017-01-01T00:00:00Z' }
            },
            {
              pull: { number: 1, updated_at: '2016-01-01T00:00:00Z' }
            }
          ],
          {
            sort: 'updated'
          }
        )
      ).toEqual([
        {
          pull: { number: 2, updated_at: '2017-01-01T00:00:00Z' }
        },
        {
          pull: { number: 1, updated_at: '2016-01-01T00:00:00Z' }
        }
      ])
    })
    it('should sort by updated asc if configured', () => {
      expect(
        sortResults(
          [
            {
              pull: { number: 2, updated_at: '2017-01-01T00:00:00Z' }
            },
            {
              pull: { number: 1, updated_at: '2016-01-01T00:00:00Z' }
            }
          ],
          {
            sort: 'updated',
            direction: 'asc'
          }
        )
      ).toEqual([
        {
          pull: { number: 1, updated_at: '2016-01-01T00:00:00Z' }
        },
        {
          pull: { number: 2, updated_at: '2017-01-01T00:00:00Z' }
        }
      ])
    })
  })
})
