import timestring from 'timestring'
import { format } from 'date-fns'

const processQuery = query =>
  query.replace(/\$\{date\((-)?(.*?)\)\}/g, (_, sign, duration) => {
    const ms = timestring(duration) * 1000
    const now = Date.now()
    const date = new Date(sign === '-' ? now - ms : now + ms)
    return format(date, 'YYYY-MM-DD')
  })

export { processQuery }
