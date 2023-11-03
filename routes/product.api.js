const express = require('express')
const router = express.Router()
const productController = require('../controllers/product.controller')
const authMiddleware = require('../middlewares/auth.middleware')
const { body } = require('express-validator')

router.get('/', authMiddleware.loginRequired, productController.getProducts)
router.get('/:categoryName', authMiddleware.loginRequired, productController.getProductsByCategory)

router.post(
  '/',
  [
    body('name', 'Product name must contain at least 3 characters')
      .trim()
      .isLength({ min: 3 })
      .escape(),
    body('price', 'Product price must be 10000 minimum').isInt({ min: 10000 })
  ],
  authMiddleware.loginRequired,
  authMiddleware.adminRequired,
  productController.createProduct
)

router.put(
  '/:productId',
  [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 3 })
      .withMessage('Product name must contain at least 3 characters'),
    body('price')
      .optional()
      .isInt({ min: 10000 })
      .withMessage('Product price must be 10000 minimum'),
    body('category').optional().isMongoId().withMessage('Invalid category ID')
  ],
  authMiddleware.loginRequired,
  authMiddleware.adminRequired,
  productController.updateProduct
)
router.delete(
  '/:productId',
  authMiddleware.loginRequired,
  authMiddleware.adminRequired,
  productController.deleteProduct
)

module.exports = router
