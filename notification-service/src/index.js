'use strict'
const { EventEmitter } = require('events')
const server = require('./server/http-express')
const repository = require('./repository/repository').default
const di = require('./config')
const mediator = new EventEmitter()

console.log('--- Notification Service ---')
console.log('Connecting to notification repository...')

process.on('uncaughtException', (err) => {
  console.error('Unhandled Exception', err)
})

process.on('uncaughtRejection', (err, promise) => {
  console.error('Unhandled Rejection', err)
})

mediator.on('di.ready', async (container) => {
  const repo = repository.connect(container);
  container.registerValue({ repo })

  console.log('Connected. Starting Server')
  const app = await server.start(container)

  console.log(`Server started successfully, running on port: ${app.address().port}.`)

  app.on('close', () => {
    repo.disconnect()
  })
})

di.init(mediator)

mediator.emit('init')
