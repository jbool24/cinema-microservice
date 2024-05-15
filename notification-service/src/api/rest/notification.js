'use strict'
const status = require('http-status')

module.exports = ({ operations }) => ({
  sendEmail: async (req, res, next) => {
    const { validate } = req.container.cradle
    try {
      const payload = await validate(req.body.payload, 'notification')
      const ok = await operations.sendEmail(payload)
      res.status(status.OK).json({ msg: 'ok' })
    } catch (error) {
      next(error)
    }
  },

  sendSMS: (req, res, next) => {
    const { validate } = req.container.cradle

    validate(req.body.payload, 'notification')
      .then(payload => {
        return operations.sendSMS(payload)
      })
      .then(ok => {
        res.status(status.OK).json({ msg: 'ok' })
      })
      .catch(next)
  }
})
