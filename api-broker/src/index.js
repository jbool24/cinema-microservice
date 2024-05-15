'use strict'
const { EventEmitter } = require('events')
const broker = require('../../notification-service/src/server/service-broker').default
const repository = require('../../notification-service/src/repository/repository').default
const di = require('../../notification-service/src/config')
const mediator = new EventEmitter()

console.log('--- Notification Service ---')
console.log('Connecting to notification repository...')

process.on('uncaughtException', (err) => {
  console.error('Unhandled Exception', err)
})

process.on('uncaughtRejection', (err) => {
  console.error('Unhandled Rejection', err)
})

process.on("SIGINT", () => broker.stop());
process.on("SIGTERM", () => broker.stop());


mediator.on('di.ready', (container) => {
  repository.connect(container)
    .then(repo => {
      console.log('Connected. Starting Server')
      container.registerValue({ repo })
      return broker.start(container)
    })
    .then(app => {
      console.log(`Server started successfully, running on port: ${app.address().port}.`)
      app.on('close', () => {
        container.resolve('repo').disconnect()
      })
    })
})

di.init(mediator)

mediator.emit('init')
