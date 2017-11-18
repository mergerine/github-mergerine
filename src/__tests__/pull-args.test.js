import getPullArgs from '../pull-args'

describe('getPullArgs', () => {
  it('api url enterprise', () => {
    expect(
      getPullArgs([
        'https://github.example.com/api/v3/repos/your-owner/your-repo/pulls/3206'
      ])
    ).toEqual({
      baseUrl: 'https://github.example.com/api/v3',
      owner: 'your-owner',
      name: 'your-repo',
      number: '3206'
    })
  })

  it('api url hosted', () => {
    expect(
      getPullArgs([
        'https://api.github.com/repos/your-owner/your-repo/pulls/3206'
      ])
    ).toEqual({
      baseUrl: 'https://api.github.com',
      owner: 'your-owner',
      name: 'your-repo',
      number: '3206'
    })
  })

  it('html url enterprise', () => {
    expect(
      getPullArgs(['https://github.example.com/your-owner/your-repo/pull/3206'])
    ).toEqual({
      baseUrl: 'https://github.example.com/api/v3',
      owner: 'your-owner',
      name: 'your-repo',
      number: '3206'
    })
  })

  it('html url hosted', () => {
    expect(
      getPullArgs(['https://github.com/your-owner/your-repo/pull/3206'])
    ).toEqual({
      baseUrl: 'https://api.github.com',
      owner: 'your-owner',
      name: 'your-repo',
      number: '3206'
    })
  })

  it('fragments enterprise', () => {
    expect(
      getPullArgs([
        'https://github.example.com',
        'your-owner',
        'your-repo',
        '3206'
      ])
    ).toEqual({
      baseUrl: 'https://github.example.com/api/v3',
      owner: 'your-owner',
      name: 'your-repo',
      number: '3206'
    })
  })

  it('fragments without protocol enterprise', () => {
    expect(
      getPullArgs(['github.example.com', 'your-owner', 'your-repo', '3206'])
    ).toEqual({
      baseUrl: 'https://github.example.com/api/v3',
      owner: 'your-owner',
      name: 'your-repo',
      number: '3206'
    })
  })

  it('fragments with owner/name enterprise', () => {
    expect(
      getPullArgs([
        'https://github.example.com',
        'your-owner/your-repo',
        '3206'
      ])
    ).toEqual({
      baseUrl: 'https://github.example.com/api/v3',
      owner: 'your-owner',
      name: 'your-repo',
      number: '3206'
    })
  })

  it('fragments with owner/name without protocol enterprise', () => {
    expect(
      getPullArgs(['github.example.com', 'your-owner/your-repo', '3206'])
    ).toEqual({
      baseUrl: 'https://github.example.com/api/v3',
      owner: 'your-owner',
      name: 'your-repo',
      number: '3206'
    })
  })

  it('only number as fragment enterpise', () => {
    expect(
      getPullArgs(['https://github.example.com/your-owner/your-repo', '3206'])
    ).toEqual({
      baseUrl: 'https://github.example.com/api/v3',
      owner: 'your-owner',
      name: 'your-repo',
      number: '3206'
    })
  })

  it('only number as fragment no protocol enterpise', () => {
    expect(
      getPullArgs(['github.example.com/your-owner/your-repo', '3206'])
    ).toEqual({
      baseUrl: 'https://github.example.com/api/v3',
      owner: 'your-owner',
      name: 'your-repo',
      number: '3206'
    })
  })
})
