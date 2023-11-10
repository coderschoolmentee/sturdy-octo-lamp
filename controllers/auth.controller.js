const User = require('../models/user.model')
const { validationResult } = require('express-validator')
const authController = {}

authController.loginWithEmail = async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    const { email, password } = req.body
    const user = await User.findOne({ email }, '+password')
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password!' })
    }
    if (!user.isVerified) {
      return res.status(401).json({ error: 'Email not verified.' })
    }
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password!' })
    }
    const accessToken = user.generateToken()
    res
      .status(200)
      .json({ message: 'Login successful', user, email: user.email, accessToken })
  } catch (error) {
    console.log('ERROR:', error)
    next(error)
  }
}

module.exports = authController
