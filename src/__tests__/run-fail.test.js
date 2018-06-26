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
  interval: 1000
}))

describe('run fail', () => {
  beforeEach(() => nocks.before())

  afterEach(() => nocks.after())

  it('merge fails', async () => {
    nocks.mergeFails()

    expect(await run()).toMatchObject([
      {
        action: 'merge',
        result: { pull: { number: 92510 } },
        error: expect.any(Error)
      }
    ])
  })
})
