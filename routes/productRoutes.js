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

// CRUD
router.post("/add", createProduct);
router.get("/getAll", getProducts);
router.get("/:id", getProductById);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

// Filtered
router.get("/category/:categoryId", getProductsByCategory);
router.get("/subcategory/:subcategoryId", getProductsBySubcategory);

export default router;