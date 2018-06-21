import run from '../run'
import * as nocks from '../nocks'

jest.mock('../config', () => ({
  logDataUrlPattern: '.*',
  repos: [
    {
      baseUrl: 'https://github.example.com/api/v3',
      owner: 'your-owner',
      name: 'your-repo',
      query:
        'repo:your-owner/your-repo is:pr is:open review:approved label:merge -label:"no merge" base:master',
      labels: ['merge'],
      notLabels: ['no merge'],
      merge_method: 'squash',
      // using two labels here just to test
      priorityLabels: ['priority', 'merge']
    }
  ],
  dry: true,
  interval: 1000
}))

describe('run', () => {
  beforeEach(() => nocks.before())

  afterEach(() => nocks.after())

  it('merges with restrictions', async () => {
    nocks.merges()

    expect(await run()).toMatchObject([
      {
        action: 'merge',
        result: { pull: { number: 92510 } }
      }
    ])
  })

  it('merges when no restrictions', async () => {
    nocks.mergesNoRestrictions()
    expect(await run()).toMatchObject([
      {
        action: 'merge',
        result: { pull: { number: 91683 } }
      }
    ])
  })

  it('updates', async () => {
    nocks.updates()

    expect(await run()).toMatchObject([
      {
        action: 'update',
        result: { pull: { number: 92510 } }
      }
    ])
  })

  it('waits when none mergeable or updateable', async () => {
    nocks.none()

    expect(await run()).toMatchObject([
      {
        action: 'wait'
      }
    ])
  })

  it('waits when only mergeable by labels not reviews', async () => {
    nocks.mergeableByLabelsNotReviews()

    expect(await run()).toMatchObject([
      {
        action: 'wait'
      }
    ])
  })

  it('considers priority labels first', async () => {
    nocks.mergesPriorityLabels()
    expect(await run()).toMatchObject([
      {
        action: 'merge',
        result: { pull: { number: 92510 } }
      }
    ])
  })
})
