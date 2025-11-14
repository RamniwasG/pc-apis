import express from "express";
import { getAllUsers, getProfile, sendOtp, updateProfile, verifyOtp } from "../controllers/authController.js";
import { protect, authorizeRoles } from "../middlewares/auth.js";

const router = express.Router();

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.get('/get-profile/:id', protect, getProfile);
router.put('/update-profile/:id', protect, updateProfile);
router.get("/fetchAllUsers", protect, authorizeRoles("admin"), getAllUsers);

export default router;