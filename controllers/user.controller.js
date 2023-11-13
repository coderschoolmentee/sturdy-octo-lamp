const { validationResult } = require('express-validator')
const User = require('../models/user.model')
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const { createTransport } = require('nodemailer')
const REACT_APP_EMAIL = process.env.REACT_APP_EMAIL
const REACT_APP_EMAIL_PWD = process.env.REACT_APP_EMAIL_PWD
const FRONTEND_URL = process.env.FRONTEND_URL
// const FRONTEND_URL = process.env.FRONTEND_URL_LOCAL
const userController = {}
const transporter = createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  auth: {
    user: REACT_APP_EMAIL,
    pass: REACT_APP_EMAIL_PWD
  }
})

const generateUniqueToken = () => {
  return crypto.randomBytes(5).toString('hex')
}

const sendVerifyEmail = (verificationToken, email, res) => {
  const verificationLink = `${FRONTEND_URL}/verify/${verificationToken}`
  const message = `
    <p>Hello,</p>
    <p>Thank you for registering! Click the following link to verify your email:</p>
    <a href="${verificationLink}">${verificationLink}</a>
  `
  const mailOptions = {
    from: 'Simple Coffee POS <pos@example.com>',
    to: email,
    subject: 'Email Verification',
    html: message
  }
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error)
      return res.status(500).json({ error: 'Error sending verification email' })
    } else {
      console.log('Email sent:', info.response)
      return res.status(201).json({ message: 'User created successfully' })
    }
  })
}

const sendResetTokenEmail = (token, email, res) => {
  const message = `
    <p>Hello,</p>
    <p>Here is your reset password token: <i>${token}</i></p>    
  `
  const mailOptions = {
    from: 'Simple Coffee POS <pos@example.com>',
    to: email,
    subject: 'Reset Password',
    html: message
  }
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error)
      return res.status(500).json({ error: 'Error sending reset token email' })
    } else {
      console.log('Email sent:', info.response)
      return res.status(200).json({ message: 'Reset token sent successfully' })
    }
  })
}

userController.register = async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    const { name, email, password, role } = req.body
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' })
    }
    const user = new User({
      name,
      email,
      password,
      role
    })
    const verificationToken = generateUniqueToken()
    user.verificationToken = verificationToken
    await user.save()
    sendVerifyEmail(verificationToken, email, res)
    // res
    //   .status(200)
    //   .json({ message: 'successful', verityToken: user.verificationToken })
  } catch (error) {
    console.log('ERROR: ', error)
    next(error)
  }
}

userController.verifyEmail = async (req, res, next) => {
  try {
    const token = req.params.token
    const user = await User.findOne({ verificationToken: token })
    if (!user) {
      return res.status(400).json({ message: 'Invalid verification token' })
    }
    user.isVerified = true
    user.verificationToken = undefined
    await user.save()
    return res.status(200).json({ message: 'Email verified successfully' })
  } catch (error) {
    console.error('ERROR: ', error)
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
      const isOldPasswordValid = await bcrypt.compare(
        oldPassword,
        user.password
      )
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
    res
      .status(200)
      .json({ message: 'Profile updated successfully', user: updatedUser })
  } catch (error) {
    console.log('ERROR: ', error)
    next(error)
  }
}

userController.sendPasswordResetToken = async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    const { email } = req.body
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    const resetToken = generateUniqueToken()
    user.resetPasswordToken = resetToken
    console.log('resetToken', resetToken)
    user.resetPasswordExpires = Date.now() + 3600000
    console.log('user.resetPasswordExpires', user.resetPasswordExpires)
    await user.save()
    sendResetTokenEmail(resetToken, email, res)
    // res.status(200).json({
    //   message: 'successful',
    //   resetPasswordToken: user.resetPasswordToken,
    // })
  } catch (error) {
    console.error('ERROR sendPasswordResetToken be: ', error)
    next(error)
  }
}

userController.resetPassword = async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    const { email, token, newPassword } = req.body
    const user = await User.findOne({ email })
    if (
      !user ||
      user.resetPasswordToken !== token ||
      user.resetPasswordExpires < Date.now()
    ) {
      return res.status(400).json({ error: 'Invalid or expired token' })
    }
    user.password = newPassword
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined
    await user.save()
    res.status(200).json({ message: 'Password reset successfully' })
  } catch (error) {
    console.error('ERROR: ', error)
    next(error)
  }
}

module.exports = userController
