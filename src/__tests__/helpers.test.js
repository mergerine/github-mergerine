import { format, subDays, subWeeks } from 'date-fns'
import { processQuery } from '../helpers'

describe('helpers', () => {
  describe('processQuery', () => {
    describe('dates', () => {
      it('should replace relative dates with magic syntax', () => {
        const date = new Date()
        const created = format(subDays(date, 2), 'YYYY-MM-DD')
        const updated = format(subWeeks(date, 4), 'YYYY-MM-DD')
        expect(
          // eslint-disable-next-line no-template-curly-in-string
          processQuery('is:open created:<${date(-2d)} updated:<${date(-4w)}')
        ).toEqual(`is:open created:<${created} updated:<${updated}`)
      })
    })
  })
})
