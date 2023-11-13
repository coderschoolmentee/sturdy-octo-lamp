const Order = require('../models/order.model')
const { validationResult } = require('express-validator')
const orderController = {}

orderController.getOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', date } = req.query
    const skip = (page - 1) * limit
    const query = {
      stringId: new RegExp(search, 'i')
    }

    if (date) {
      const startDate = new Date(date)
      startDate.setHours(0, 0, 0, 0)
      const endDate = new Date(date)
      endDate.setHours(23, 59, 59, 999)
      query.createdAt = { $gte: startDate, $lte: endDate }
    }

    const [totalOrders, orders] = await Promise.all([
      Order.countDocuments(query),
      Order.find(query)
        .sort({ createdAt: -1 })
        .populate('items.product', 'name')
        .skip(skip)
        .limit(parseInt(limit))
    ])

    const totalPages = Math.ceil(totalOrders / limit)
    res.status(200).json({
      loading: false,
      orders,
      currentPage: parseInt(page),
      totalPages,
      totalOrders
    })
  } catch (error) {
    console.log('ERROR:', error)
    next(error)
  }
}

orderController.createOrder = async (req, res, next) => {
  try {
    // add name
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    const { totalAmount, items, staffName } = req.body
    const newOrder = new Order({ totalAmount, items, staffName })
    const savedOrder = await newOrder.save()
    const populatedOrder = await Order.findById(savedOrder._id).populate(
      'items.product',
      'name'
    )
    res
      .status(200)
      .json({ message: 'Order created successfully', order: populatedOrder, staffName })
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
