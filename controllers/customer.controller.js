const Customer = require('../models/customer.model')
const customerController = {}
const { validationResult } = require('express-validator')

customerController.register = async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    const { name, email, password, phone } = req.body
    const existingCustomer = await Customer.findOne({
      $or: [{ email }, { phone }]
    })
    if (existingCustomer) {
      return res.status(409).json({ error: 'Customer already exists' })
    }
    const user = new Customer({
      name,
      email,
      password,
      phone
    })
    await user.save()
    res
      .status(201)
      .json({ data: user, message: 'Customer created successfully' })
  } catch (error) {
    console.log('ERROR: ', error)
  }
}

customerController.getCustomer = async (req, res, next) => {
  try {
    const customerId = req.params.customerId
    const customer = await Customer.findById(customerId)
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' })
    }
    res.status(200).json({ data: customer })
  } catch (error) {
    console.log('ERROR: ', error)
    next(error)
  }
}

customerController.updateCustomer = async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    const customerId = req.params.customerId
    const updatedCustomer = req.body
    const customer = await Customer.findByIdAndUpdate(
      customerId,
      updatedCustomer,
      {
        new: true
      }
    )
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' })
    }
    res
      .status(200)
      .json({ data: customer, message: 'Customer updated successfully' })
  } catch (error) {
    console.log('ERROR: ', error)
    next(error)
  }
}

customerController.deleteCustomer = async (req, res, next) => {
  try {
    const customerId = req.params.customerId
    const customer = await Customer.findByIdAndUpdate(
      customerId,
      { isDeleted: true },
      { new: true }
    )
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' })
    }
    res
      .status(200)
      .json({ data: customer, message: 'Customer deleted successfully' })
  } catch (error) {
    console.log('ERROR: ', error)
    next(error)
  }
}

module.exports = customerController
