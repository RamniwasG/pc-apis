import express from "express";
import { getProfile, sendOtp, updateProfile, verifyOtp } from "../controllers/authController.js";
import { protect, authorizeRoles } from "../middlewares/auth.js";

const router = express.Router();

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.get('/get-profile/:id', protect, getProfile);
router.put('/update-profile/:id', protect, updateProfile);

export default router;