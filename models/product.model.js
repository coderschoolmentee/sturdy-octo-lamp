const mongoose = require('mongoose')

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true
    },
    price: {
      type: Number,
      required: true
    },
    imageLink: {
      type: String,
      default: ''
    },
    description: {
      type: String
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true
    }
  },
  {
    timestamps: true
  }
)

const Product = mongoose.model('Product', productSchema)

module.exports = Product
