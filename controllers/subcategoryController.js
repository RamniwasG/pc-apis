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

export const deleteSubcategory = async (req, res) => {
  try {
    const { id } = req.params;
    await Subcategory.findByIdAndDelete(id);
    res.json({ message: "Subcategory deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};