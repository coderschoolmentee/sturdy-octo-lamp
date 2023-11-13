const express = require('express')
const router = express.Router()
const categoryController = require('../controllers/category.controller')
const authMiddleware = require('../middlewares/auth.middleware')
const { body } = require('express-validator')

router.get('/', authMiddleware.loginRequired, categoryController.getCategories)
router.get('/all', authMiddleware.loginRequired, categoryController.getAllCategories)

router.post(
  '/',
  [
    body('name', 'Category name must contain at least 3 characters')
      .trim()
      .isLength({ min: 3 })
      .escape()
  ],
  authMiddleware.loginRequired,
  authMiddleware.adminRequired,
  categoryController.createCategory
)

router.put(
  '/:categoryId',
  body('name', 'Category name must contain at least 3 characters')
    .trim()
    .isLength({ min: 3 })
    .escape(),
  categoryController.updateCategory
)

router.delete(
  '/:categoryId',
  authMiddleware.loginRequired,
  authMiddleware.adminRequired,
  categoryController.deleteCategory
)

module.exports = router
