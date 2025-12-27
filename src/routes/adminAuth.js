import express from "express";
import {
  registerUser,
  loginUser,
  getProfile,
  getAllUsers,
} from "./../controllers/adminAuthController.js";
import { protect, authorizeRoles } from "./../middlewares/auth.js";

const router = express.Router();

// Auth routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected routes
router.get("/profile", protect, getProfile);
router.get("/users", protect, authorizeRoles("admin"), getAllUsers);

export default router;