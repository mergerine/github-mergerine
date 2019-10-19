import run from '../run'
import * as nocks from '../nocks'

jest.mock('../config', () => () => ({
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
      restrictions: [
        {
          teams: [
            {
              id: 123,
              approvals: 2
            }
          ]
        }
      ],
      merge_method: 'squash',
      // using two labels here just to test
      priorityLabels: ['priority', 'merge'],
      phases: ['merge', 'update'],
      mergeCommitMessageSimple: true
    }
  ],
  dry: true,
  mergeableStateCheck: true,
  interval: 1000
}))

describe('run custom restrictions', () => {
  beforeEach(() => nocks.before())

  afterEach(() => nocks.after())

  it('waits when custom restriction requires 2 approvals from team', async () => {
    nocks.mergesNoRestrictions()

    const ran = await run()

    expect(ran).toMatchObject([
      {
        action: 'wait'
      }
    ])

    expect(ran[0].error).not.toBeDefined()
  })

  it('merges when custom restriction 2 approvals from team', async () => {
    nocks.mergesCustomRestrictionsTwoApprovals()

    const ran = await run()

    expect(ran).toMatchObject([
      {
        action: 'merge',
        result: {
          pull: {
            number: 91683
          }
        }
      }
    ])

    expect(ran[0].error).not.toBeDefined()
  })
})
