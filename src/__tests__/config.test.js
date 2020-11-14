import configure from '../config'

describe('config', () => {
  describe('extend', () => {
    it('should allow health option', () => {
      expect(
        configure({
          config: {
            health: 7777
          }
        })
      ).toMatchObject({
        health: 7777
      })
    })
    it('should allow other properties', () => {
      expect(
        configure({
          config: {
            whatever: true
          }
        })
      ).toMatchObject({
        whatever: true
      })
    })
  })
  describe('phases', () => {
    it('should default phases', () => {
      expect(
        configure({
          config: {
            repos: [{}]
          }
        }).repos[0].phases
      ).toEqual(['merge', 'update'])
    })

    it('should default repo phases to global', () => {
      expect(
        configure({
          config: {
            phases: ['merge'],
            repos: [{}]
          }
        }).repos[0].phases
      ).toEqual(['merge'])
    })

    it('should use default baseUrl on repos', () => {
      expect(
        configure({
          config: {
            baseUrl: 'https://github.example.com/api/v3',
            repos: [{}]
          }
        }).repos[0].baseUrl
      ).toEqual('https://github.example.com/api/v3')
    })

    it('should use repo override phases', () => {
      expect(
        configure({
          config: {
            phases: ['merge', 'update'],
            repos: [
              {
                phases: ['merge']
              }
            ]
          }
        }).repos[0].phases
      ).toEqual(['merge'])
    })
  })

  describe('mergeableStateCheck', () => {
    it('should work when config is true', () => {
      expect(
        configure({
          config: {
            mergeableStateCheck: true
          }
        }).mergeableStateCheck
      ).toBeTruthy()
    })

    it('should work when config is false', () => {
      expect(
        configure({
          config: {
            mergeableStateCheck: false
          }
        }).mergeableStateCheck
      ).toBeFalsy()
    })

    it('should work when env is true and override config', () => {
      expect(
        configure({
          config: {
            mergeableStateCheck: false
          },
          env: {
            MERGERINE_MERGEABLE_STATE_CHECK: 'true'
          }
        }).mergeableStateCheck
      ).toBeTruthy()
    })

    it('should work when env is false and override config', () => {
      expect(
        configure({
          config: {
            mergeableStateCheck: true
          },
          env: {
            MERGERINE_MERGEABLE_STATE_CHECK: 'false'
          }
        }).mergeableStateCheck
      ).toBeFalsy()
    })
  })
})
