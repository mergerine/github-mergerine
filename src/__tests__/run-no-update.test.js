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
      merge_method: 'squash',
      // using two labels here just to test
      priorityLabels: ['priority', 'merge'],
      phases: ['merge']
    }
  ],
  dry: true,
  mergeableStateCheck: true,
  interval: 1000
}))

describe('run no update', () => {
  beforeEach(() => nocks.before())

  afterEach(() => nocks.after())

  it('does not update', async () => {
    nocks.updates()

    expect(await run()).toMatchObject([
      {
        action: 'wait'
      }
    ])
  })
})
