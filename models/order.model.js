const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema(
  {
    totalAmount: {
      type: Number,
      required: true
    },
    staffName: {
      type: String
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
    ],
    stringId: {
      type: String
    }
  },
  {
    timestamps: true
  }
)
orderSchema.pre('save', function (next) {
  this.stringId = this._id.toString()
  next()
})
const Order = mongoose.model('Order', orderSchema)

module.exports = Order
