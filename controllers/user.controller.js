const { validationResult } = require('express-validator')
const User = require('../models/user.model')
const userController = {}

userController.register = async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    const { email, password, role } = req.body
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' })
    }
    const user = new User({
      email,
      password,
      role
    })
    await user.save()
    const accessToken = user.generateToken()
    res
      .status(201)
      .json({ message: 'User created successfully', user, accessToken })
  } catch (error) {
    console.log('ERROR: ', error)
    next(error)
  }
}

userController.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
    res.status(200).json({ message: 'User found successfully', user })
  } catch (error) {
    console.log('ERROR: ', error)
    next(error)
  }
}

userController.updateProfile = async (req, res, next) => {
  try {
    const { avatarUrl } = req.body
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { avatarUrl },
      { new: true }
    )
    res.status(200).json({ message: 'Avatar updated successfully', user: updatedUser })
  } catch (error) {
    console.log('ERROR: ', error)
    next(error)
  }
}

module.exports = userController
