import express from "express";
const router = express.Router();
import {
  createProduct,
  getProducts,
  getProductById,
  getProductsByCategory,
  getProductsBySubcategory,
  updateProduct,
  deleteProduct
} from "../controllers/productController.js";
import { authorizeRoles, protect } from "../middlewares/auth.js";

// CRUD
router.post("/add", protect, authorizeRoles('admin', 'seller'), createProduct);
router.get("/fetchAllProducts", getProducts);
router.get("/:id", getProductById);
router.put("/:id", protect, authorizeRoles('admin', 'seller'), updateProduct);
router.delete("/:id", protect, authorizeRoles('admin'), deleteProduct);

// Filtered
router.get("/category/:categoryId", getProductsByCategory);
router.get("/subcategory/:subcategoryId", getProductsBySubcategory);

export default router;