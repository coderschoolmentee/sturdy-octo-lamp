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
    body('role').notEmpty().withMessage('Role is required')
  ],
  userController.register
)

router.get('/me', authMiddleware.loginRequired, userController.getMe)

router.put('/:id', [
  body('oldPassword').notEmpty().withMessage('Old password is required'),
  body('newPassword').notEmpty().withMessage('New password is required').isLength({ min: 3 }).withMessage('Minimum 3 characters')
], authMiddleware.loginRequired, userController.updateProfile)

module.exports = router
