import Category from "../models/Category.js";
import Subcategory from "../models/Subcategory.js";

export const createSubcategory = async (req, res) => {
  try {
    const { name, category, description } = req.body;

    const subcategory = await Subcategory.create({ name, category, description });
    res.status(201).json(subcategory);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getSubcategories = async (req, res) => {
  try {
    const subcategories = await Subcategory.find().populate("category", "name");
    res.json(subcategories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getSubcategoriesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const subcategories = await Subcategory.find({ category: categoryId });
    res.json(subcategories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateSubcategoryById = async (req, res) => {
  try {
    const { id } = req.params; // subcategory ID
    const { name, categoryId } = req.body;

    // Validate inputs
    if (!name || !categoryId) {
      return res.status(400).json({ message: "Name and categoryId are required" });
    }

    // Check if category exists
    const existingCategory = await Category.findById(categoryId);
    if (!existingCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Update subcategory
    const updatedSubcategory = await Subcategory.findByIdAndUpdate(
      id,
      { name, category: categoryId },
      { new: true, runValidators: true }
    ).populate("category", "name"); // populate to return category info

    if (!updatedSubcategory) {
      return res.status(404).json({ message: "Subcategory not found" });
    }

    res.status(200).json({
      message: "Subcategory updated successfully",
      subcategory: updatedSubcategory,
    });
  } catch (error) {
    console.error("Error updating subcategory:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteSubcategory = async (req, res) => {
  try {
    const { id } = req.params;
    await Subcategory.findByIdAndDelete(id);
    res.json({ message: "Subcategory deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};