const express = require('express')
const router = express.Router()
const { body } = require('express-validator')
const orderController = require('../controllers/order.controller')

const validateOrderData = [
  body('totalAmount').isNumeric().withMessage('Total amount must be a number'),
  body('customer').optional().isMongoId().withMessage('Invalid customer ID'),
  body('items')
    .isArray({ min: 1 })
    .withMessage('Items must be an array with at least one element')
]

router.get('/', orderController.getOrders)
router.post('/', validateOrderData, orderController.createOrder)
router.put('/:orderId', validateOrderData, orderController.updateOrder)
router.delete('/:orderId', orderController.deleteOrder)

module.exports = router
