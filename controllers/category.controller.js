const Category = require('../models/category.model')
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

createDefaultCategory()

categoryController.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find()
    res.status(200).json(categories)
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
    const category = await Category.findById(req.params.categoryId)
    if (!category) {
      return res.status(404).json({ error: 'Category not found' })
    }
    await Category.findByIdAndRemove(req.params.categoryId)
    res.status(200).json({ message: 'Category deleted successfully' })
  } catch (error) {
    console.log('ERROR:', error)
    next(error)
  }
}

module.exports = categoryController
