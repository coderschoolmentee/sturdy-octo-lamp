const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema(
  {
    totalAmount: {
      type: Number,
      required: true
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer'
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true
        },
        quantity: {
          type: Number,
          required: true,
          default: 1
        },
        price: {
          type: Number,
          required: true
        }
      }
    ]
  },
  {
    timestamps: true
  }
)

const Order = mongoose.model('Order', orderSchema)

module.exports = Order
