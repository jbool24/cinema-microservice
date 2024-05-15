'use strict'
const { EventEmitter } = require('events')
const server = require('./server/server')
const repository = require('./repository/repository')
const config = require('./config')
const mediator = new EventEmitter()

console.log('--- Movies Service ---')
console.log('Connecting to movies repository...')

process.on('uncaughtException', (err) => {
  console.error('Unhandled Exception', err)
})

process.on('uncaughtRejection', (err, promise) => {
  console.error('Unhandled Rejection', err)
})

mediator.on('db.ready', async (db) => {
  const repo = await repository.connect(db);

  console.log('Connected. Starting Server')

  const app = await server.start({
    port: config.serverSettings.port,
    ssl: config.serverSettings.ssl,
    repo
  })

  console.log(`Server started successfully, running on port: ${config.serverSettings.port}.`);

  app.on('close', () => {
    repo.disconnect()
  })
})

mediator.on('db.error', (err) => {
  console.error(err)
})

config.db.connect(config.dbSettings, mediator)

mediator.emit('boot.ready')
