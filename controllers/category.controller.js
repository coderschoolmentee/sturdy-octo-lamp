const Category = require('../models/category.model')
const Product = require('../models/product.model')
const categoryController = {}
const { validationResult } = require('express-validator')

async function createDefaultCategory () {
  try {
    const existingCategory = await Category.findOne({ name: 'Uncategorized' })
    if (!existingCategory) {
      const defaultCategory = new Category({
        name: 'Uncategorized'
      })
      await defaultCategory.save()
    }
  } catch (error) {
    console.log('ERROR:', error)
  }
}

categoryController.getCategories = async (req, res, next) => {
  try {
    const { page = 1, limit = 5, search } = req.query
    const skip = (page - 1) * limit
    const query = {}

    if (search) {
      query.name = { $regex: new RegExp(search, 'i') }
    }

    const count = await Category.countDocuments(query)
    const totalPages = Math.ceil(count / limit)

    const categories = await Category.find(query)
      .sort({ name: 1 })
      .skip(skip)
      .limit(parseInt(limit))
    if (categories.length === 0) {
      return res.status(200).json({
        message: 'No categories found.'
      })
    }
    res.status(200).json({
      loading: false,
      categories,
      currentPage: parseInt(page),
      totalPages,
      totalCategories: count
    })
  } catch (error) {
    console.log('ERROR:', error)
    next(error)
  }
}

categoryController.getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 })
    if (categories.length === 0) {
      return res.status(200).json({
        message: 'No categories found.'
      })
    }
    res.status(200).json({
      loading: false,
      categories,
      totalCategories: categories.length
    })
  } catch (error) {
    console.log('ERROR:', error)
    next(error)
  }
}

categoryController.createCategory = async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    const { name, description } = req.body
    const existingCategory = await Category.findOne({ name })
    if (existingCategory) {
      return res.status(400).json({ error: 'Category already exists' })
    }
    const newCategory = new Category({ name, description })
    await newCategory.save()
    res
      .status(200)
      .json({ message: 'Category created successfully', newCategory })
  } catch (error) {
    console.log('ERROR:', error)
    next(error)
  }
}

categoryController.updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.categoryId)
    console.log('Received categoryId:', req.params.categoryId)
    if (!category) {
      return res.status(404).json({ error: 'Category not found' })
    }
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.categoryId,
      req.body,
      { new: true }
    )
    res
      .status(200)
      .json({ message: 'Category updated successfully', updatedCategory })
  } catch (error) {
    console.log('ERROR:', error)
    next(error)
  }
}

categoryController.deleteCategory = async (req, res, next) => {
  try {
    const categoryId = req.params.categoryId

    const category = await Category.findById(categoryId)
    if (!category) {
      return res.status(404).json({ error: 'Category not found' })
    }

    if (category.name.toLowerCase() === 'uncategorized') {
      return res.status(400).json({ error: 'Uncategorized category cannot be deleted' })
    }

    const productsWithDeletedCategory = await Product.find({ category: categoryId })

    const uncategorizedCategory = await Category.findOne({ name: 'uncategorized' })
    const uncategorizedCategoryId = uncategorizedCategory ? uncategorizedCategory._id : await createDefaultCategory()

    for (const product of productsWithDeletedCategory) {
      product.category = uncategorizedCategoryId
      await product.save()
    }

    await Category.findByIdAndRemove(categoryId)

    res.status(200).json({ message: 'Category deleted successfully' })
  } catch (error) {
    console.log('ERROR:', error)
    next(error)
  }
}

module.exports = categoryController
