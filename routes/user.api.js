const express = require('express')
const { body } = require('express-validator')
const router = express.Router()
const userController = require('../controllers/user.controller')
const authMiddleware = require('../middlewares/auth.middleware')

router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Invalid email'),
    body('password').notEmpty().withMessage('Password is required'),
    body('role').notEmpty().withMessage('Role is required'),
    body('name').notEmpty().withMessage('Name is required')
  ],
  userController.register
)
router.get('/verify/:token', userController.verifyEmail)

router.get('/me', authMiddleware.loginRequired, userController.getMe)

router.put('/:id', authMiddleware.loginRequired, userController.updateProfile)

router.post(
  '/send-password-reset-token',
  // [body('email').isEmail().withMessage('Invalid email domain')],
  userController.sendPasswordResetToken
)

router.post(
  '/reset-password',
  [
    body('email').isEmail().withMessage('Invalid email'),
    body('token').notEmpty().withMessage('Token is required'),
    body('newPassword').notEmpty().withMessage('New password is required')
  ],
  userController.resetPassword
)

module.exports = router
