import express from "express";
const router = express.Router();
import { createCategory, getCategories, updateCategoryById, deleteCategory } from "../controllers/categoryController.js";
import { authorizeRoles, protect } from "../middlewares/auth.js";

router.post("/add", protect, authorizeRoles('admin'), createCategory);
router.get("/fetchAllCategories", protect, authorizeRoles('admin', 'seller', 'staff'), getCategories);
router.put("/:id", protect, authorizeRoles('admin'), updateCategoryById);
router.delete("/:id", protect, authorizeRoles('admin'), deleteCategory);

export default router;