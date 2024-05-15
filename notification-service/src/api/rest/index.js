'use strict'
const status = require('http-status')
const notification = require('./notification');

module.exports = ({ repo }, app) => {
  const command = new Proxy(notification, {
    get: (target, name) => {
      return target[name].bind(null, { operations: repo })
    }
  });

  app.post('/notification/email', command.sendEmail)
  app.post('/notification/sms', (req, res, next) => {
    const { validate } = req.container.cradle

    validate(req.body.payload, 'notification')
      .then(payload => {
        return repo.sendSMS(payload)
      })
      .then(ok => {
        res.status(status.OK).json({ msg: 'ok' })
      })
      .catch(next)
  })
}
