import timestring from 'timestring'

const getInterval = rawInterval =>
  typeof rawInterval === 'string' && !/^\d+$/.test(rawInterval)
    ? timestring(rawInterval) * 1000
    : parseInt(rawInterval)

export { getInterval }
