const Order = require('../models/order.model')
const { validationResult } = require('express-validator')

const orderController = {}

orderController.getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().populate('items.product', 'name')
    res.status(200).json(orders)
  } catch (error) {
    console.log('ERROR:', error)
    next(error)
  }
}

orderController.createOrder = async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { totalAmount, items } = req.body
    const newOrder = new Order({ totalAmount, items })
    const savedOrder = await newOrder.save()

    const populatedOrder = await Order.findById(savedOrder._id).populate(
      'items.product',
      'name'
    )

    res
      .status(200)
      .json({ message: 'Order created successfully', order: populatedOrder })
  } catch (error) {
    console.log('ERROR:', error)
    next(error)
  }
}

orderController.updateOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params
    const { totalAmount, customer, items } = req.body

    const order = await Order.findById(orderId)
    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    if (totalAmount) {
      order.totalAmount = totalAmount
    }
    if (customer) {
      order.customer = customer
    }
    if (items) {
      order.items = items
    }

    const updatedOrder = await order.save()
    res
      .status(200)
      .json({ message: 'Order updated successfully', order: updatedOrder })
  } catch (error) {
    console.log('ERROR:', error)
    next(error)
  }
}

orderController.deleteOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params

    const deletedOrder = await Order.findByIdAndRemove(orderId)
    if (!deletedOrder) {
      return res.status(404).json({ error: 'Order not found' })
    }

    res.status(200).json({ message: 'Order deleted successfully' })
  } catch (error) {
    console.log('ERROR:', error)
    next(error)
  }
}

module.exports = orderController
