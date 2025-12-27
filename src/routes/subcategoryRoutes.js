import express from "express";
import { createSubcategory, getSubcategories, getSubcategoriesByCategory, updateSubcategoryById, deleteSubcategory } from "../controllers/subcategoryController.js";
import { authorizeRoles, protect } from "../middlewares/auth.js";

const router = express.Router();

router.post("/add", protect, authorizeRoles('admin'), createSubcategory);
router.get("/fetchAllSubcategories", protect, authorizeRoles('admin', 'seller', 'staff'), getSubcategories);
router.get("/category/:categoryId", protect, authorizeRoles('admin', 'seller', 'staff'), getSubcategoriesByCategory);
router.put("/:id", protect, authorizeRoles('admin'), updateSubcategoryById);
router.delete("/:id", protect, authorizeRoles('admin'), deleteSubcategory);

export default router;