/*
 * curl -i http://localhost:8877 -X POST -d @src/__tests__/webhooks-fixtures/pull_request/event.json -H 'Content-Type: application/json' -H 'X-GitHub-Event: pull_request'
 */
import express from 'express'
import bodyParser from 'body-parser'
import { logWebhooks } from '../log'
import handle from './handle'


const app = express()

const port = process.env.PORT || 8877

app.listen(port, () => {
  logWebhooks(`Webhooks server listening on port ${port}.`)
})

app.use(bodyParser.json())

app.post('/', (req, res) => {
  handle(req)

  res.sendStatus(200)
})
