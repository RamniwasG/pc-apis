import express from "express";
import { createSubcategory, getSubcategories, getSubcategoriesByCategory, deleteSubcategory } from "../controllers/subcategoryController.js";
const router = express.Router();

router.post("/add", createSubcategory);
router.get("/getAll", getSubcategories);
router.get("/category/:categoryId", getSubcategoriesByCategory);
router.delete("/:id", deleteSubcategory);

export default router;