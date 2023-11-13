const Product = require('../models/product.model')
const Category = require('../models/category.model')
const { validationResult } = require('express-validator')
const productController = {}
productController.getProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 5, search } = req.query
    const skip = (page - 1) * limit
    const query = {}

    if (search) {
      query.name = { $regex: new RegExp(search, 'i') }
    }

    const count = await Product.countDocuments(query)
    const totalPages = Math.ceil(count / limit)
    const products = await Product.find(query)
      .populate('category', 'name')
      .skip(skip)
      .limit(parseInt(limit))

    if (products.length === 0) {
      res.status(200).json({ message: 'No products found' })
    } else {
      res.status(200).json({
        products,
        currentPage: parseInt(page),
        totalPages,
        totalProducts: count
      })
    }
  } catch (error) {
    console.log('ERROR:', error)
    next(error)
  }
}
productController.getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.find().populate('category', 'name')
    res.status(200).json({ products })
  } catch (error) {
    console.log('ERROR:', error)
    next(error)
  }
}

productController.getProductsByCategory = async (req, res, next) => {
  try {
    let { categoryName } = req.params
    categoryName = categoryName.toLowerCase()
    const { page = 1, limit = 5 } = req.query
    const skip = (page - 1) * limit

    if (categoryName === 'all') {
      const count = await Product.countDocuments()
      const totalPages = Math.ceil(count / limit)

      const products = await Product.find()
        .skip(skip)
        .limit(parseInt(limit))

      return res.status(200).json({
        categoryName: 'All',
        products,
        currentPage: parseInt(page),
        totalPages,
        totalProducts: count
      })
    }

    // Continue with fetching products for a specific category
    const category = await Category.findOne({ name: categoryName })
    if (!category) {
      return res.status(404).json({ error: 'Category not found' })
    }

    const count = await Product.countDocuments({ category: category._id })
    const totalPages = Math.ceil(count / limit)

    const products = await Product.find({ category: category._id })
      .skip(skip)
      .limit(parseInt(limit))

    res.status(200).json({
      categoryName: category.name,
      products,
      currentPage: parseInt(page),
      totalPages,
      totalProducts: count
    })
  } catch (error) {
    console.log('ERROR:', error)
    next(error)
  }
}

productController.createProduct = async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      console.log('Validation Error:', errors.array())
      return res.status(400).json(errors)
    }
    const { name, price, category, imageLink } = req.body
    const existingCategory = await Category.findOne({ name: category })
    if (!existingCategory) {
      return res.status(404).json({ error: 'Category not found' })
    }
    const existingProduct = await Product.findOne({ name })
    if (existingProduct) {
      return res.status(400).json({ error: 'Product already exists' })
    }
    const newProduct = new Product({
      name,
      price,
      category: existingCategory._id,
      imageLink
    })
    await newProduct.save()
    res
      .status(200)
      .json({ message: 'Product created successfully', newProduct })
  } catch (error) {
    console.log('ERROR:', error)
    next(error)
  }
}
productController.updateProduct = async (req, res, next) => {
  try {
    const { name, price, category, imageLink } = req.body
    const { productId } = req.params
    const product = await Product.findById(productId)
    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }
    if (!name && !price && !category) {
      return res
        .status(200)
        .json({ message: 'No changes made to the product', product })
    }
    if (name) {
      product.name = name
    }
    if (price) {
      product.price = price
    }
    if (imageLink) {
      product.imageLink = imageLink
    }
    if (category) {
      const existingCategory = await Category.findOne({ name: category })
      if (!existingCategory) {
        return res.status(404).json({ error: 'Category not found' })
      }
      product.category = existingCategory._id
    }
    const updatedProduct = await product.save()
    res
      .status(200)
      .json({ message: 'Product updated successfully', updatedProduct })
  } catch (error) {
    console.log('ERROR:', error)
    next(error)
  }
}
productController.deleteProduct = async (req, res, next) => {
  try {
    const productId = req.params.productId
    const deletedProduct = await Product.findByIdAndRemove(productId)
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' })
    }
    res.status(200).json({ message: 'Product deleted successfully' })
  } catch (error) {
    console.log('ERROR:', error)
    next(error)
  }
}
module.exports = productController
