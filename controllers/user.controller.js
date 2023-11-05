const { validationResult } = require('express-validator')
const User = require('../models/user.model')
const bcrypt = require('bcrypt')
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
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    const { oldPassword, newPassword, avatarUrl } = req.body
    if (oldPassword && newPassword) {
      const user = await User.findById(req.user.id).select('+password')
      const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password)
      if (!isOldPasswordValid) {
        return res.status(401).json({ error: 'Invalid old password' })
      }
      user.password = newPassword
      await user.save()
      return res.status(200).json({ message: 'Password changed successfully' })
    }
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { avatarUrl },
      { new: true }
    )
    res.status(200).json({ message: 'Profile updated successfully', user: updatedUser })
  } catch (error) {
    console.log('ERROR: ', error)
    next(error)
  }
}

module.exports = userController
