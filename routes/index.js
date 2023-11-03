const express = require('express')
const router = express.Router()

router.get('/', function (req, res, next) {
  res.send('Hello')
})

const authApi = require('./auth.api')
router.use('/auth', authApi)

const userApi = require('./user.api')
router.use('/users', userApi)

const productApi = require('./product.api')
router.use('/products', productApi)

const categoryApi = require('./category.api')
router.use('/categories', categoryApi)

const orderApi = require('./order.api')
router.use('/orders', orderApi)

module.exports = router
