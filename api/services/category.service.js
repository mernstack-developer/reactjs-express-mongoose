const Category = require('../models/category.model');
const Course = require('../models/course.model');

async function getAllCategories() {
  // return categories with their children
  const categories = await Category.find().lean();
  return categories;
}

async function getCategoryById(id) {
  const category = await Category.findById(id).lean();
  if (!category) return null;
  // find subcategories
  const subcategories = await Category.find({ parent: category._id }).lean();
  // find courses in this category
  const courses = await Course.find({ category: category._id }).select('title description imageUrl price enrollmentType').lean();
  return { ...category, subcategories, courses };
}

async function createCategory(payload) {
  const category = await Category.create(payload);
  return category;
}

async function updateCategory(id, payload) {
  const category = await Category.findByIdAndUpdate(id, payload, { new: true }).lean();
  return category;
}

async function deleteCategory(id) {
  // remove category and optionally orphan children (set parent=null)
  await Category.findByIdAndDelete(id);
  await Category.updateMany({ parent: id }, { $set: { parent: null } });
  // Note: courses linking to this category still reference it; admin should reassign
  return true;
}

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
