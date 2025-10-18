import express from "express";
const router = express.Router();
import { createCategory, getCategories, deleteCategory } from "../controllers/categoryController.js";

router.post("/add", createCategory);
router.get("/getAll", getCategories);
router.delete("/:id", deleteCategory);

export default router;