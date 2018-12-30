import configure from '../config'

describe('config', () => {
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
