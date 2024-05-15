const express = require('express')
const morgan = require('morgan')
const helmet = require('helmet')
const bodyparser = require('body-parser')
const cors = require('cors')
const _restApi = require('../api/rest')

const start = (container) => {
  return new Promise((resolve, reject) => {
    const { port } = container.resolve('serverSettings')
    const repo = container.resolve('repo')

    if (!repo) {
      reject(new Error('The server must be started with a connected repository'))
    }
    if (!port) {
      reject(new Error('The server must be started with an available port'))
    }

    const app = express()
    app.use(morgan('dev'))
    app.use(bodyparser.json())
    app.use(cors())
    app.use(helmet())

    // Default Error Handler
    app.use((err, req, res, next) => {
      reject(new Error('Something went wrong!, err:' + err))
      res.status(500).send('Something went wrong!')
      next()
    })

    // Scoped Container Middleware
    app.use((req, res, next) => {
      req.container = container.createScope()
      next()
    })

    const api = _restApi.bind(null, { repo })
    api(app)

    const server = app.listen(port, () => resolve(server))
  })
}

module.exports = Object.assign({}, { start })
