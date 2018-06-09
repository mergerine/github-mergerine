import { getInterval } from '../configHelper'

describe('configHelper', () => {
  describe('getInterval', () => {
    it('should handle ms ints', () => {
      expect(getInterval(1000)).toBe(1000)
    })
    it('should handle ms strings', () => {
      expect(getInterval('1000')).toBe(1000)
    })
    it('should handle minutes in string', () => {
      expect(getInterval('1m')).toBe(60000)
    })
    it('should handle minutes and seconds in string', () => {
      expect(getInterval('2 min 30s')).toBe(150000)
    })
  })
})
