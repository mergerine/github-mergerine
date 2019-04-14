import express from 'express'

const startHealthServer = health => {
  const app = express()

  app.get('/health', (req, res) => {
    res.set('content-type', 'application/health+json')
    res.send({
      status: 'pass'
    })
  })

  const port = typeof health === 'number' ? health : 0
  const server = app.listen(port, () => {
    const url = `http://localhost:${server.address().port}`
    // eslint-disable-next-line no-console
    console.log(`health check at ${url}/health`)
  })
}

export default startHealthServer
