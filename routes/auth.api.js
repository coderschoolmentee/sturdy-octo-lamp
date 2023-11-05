const express = require('express')
const { body } = require('express-validator')
const router = express.Router()
const authController = require('../controllers/auth.controller')

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Invalid email!'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  authController.loginWithEmail
)

module.exports = router
