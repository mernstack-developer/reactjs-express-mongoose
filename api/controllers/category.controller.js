const categoryService = require('../services/category.service');
const { validationResult } = require('express-validator');

async function getCategories(req, res) {
  try {
    const categories = await categoryService.getAllCategories();
    res.json({ data: categories, status: 200 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch categories', status: 500 });
  }
}

async function getCategory(req, res) {
  try {
    const id = req.params.id;
    const result = await categoryService.getCategoryById(id);
    if (!result) return res.status(404).json({ message: 'Category not found', status: 404 });
    res.json({ data: result, status: 200 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch category', status: 500 });
  }
}

async function createCategory(req, res) {
  try {
    const payload = req.body;
    // basic validation
    if (!payload.name) return res.status(400).json({ message: 'Name is required', status: 400 });
    payload.slug = payload.slug || payload.name.toLowerCase().replace(/\s+/g, '-');
    const cat = await categoryService.createCategory(payload);
    res.status(201).json({ data: cat, message: 'Category created', status: 201 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create category', status: 500 });
  }
}

async function updateCategory(req, res) {
  try {
    const id = req.params.id;
    const payload = req.body;
    const updated = await categoryService.updateCategory(id, payload);
    res.json({ data: updated, message: 'Category updated', status: 200 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update category', status: 500 });
  }
}

async function removeCategory(req, res) {
  try {
    const id = req.params.id;
    await categoryService.deleteCategory(id);
    res.json({ message: 'Category deleted', status: 200 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete category', status: 500 });
  }
}

module.exports = {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  removeCategory,
};
