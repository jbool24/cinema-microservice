import status from 'http-status'

export default {
  name: 'createBooking',
  execute: async (container, data) => {
    const { repo, validate, paymentService, notificationService } = container.cradle

    try {
      const [user, booking] = await Promise.all([
        validate(data.user, 'user'),
        validate(data.booking, 'booking')
      ])

      const payment = {
        userName: user.name + ' ' + user.lastName,
        currency: 'mxn',
        number: user.creditCard.number,
        cvc: user.creditCard.cvc,
        exp_month: user.creditCard.exp_month,
        exp_year: user.creditCard.exp_year,
        amount: booking.totalAmount,
        description: `
          Ticket(s) for movie ${booking.movie},
          with seat(s) ${booking.seats.toString()}
          at time ${booking.schedule}`
      }

      const paid = paymentService(payment)

      const newBooking = repo.makeBooking(user, booking)
      const ticket = repo.generateTicket(paid, newBooking)
      const payload = Object.assign({}, ticket, { user: { name: user.name + user.lastName, email: user.email } })
      notificationService(payload)
      res.status(status.OK).json(ticket)
    } catch (err) {
      next(err)
    }
  }
}