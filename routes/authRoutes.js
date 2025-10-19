import express from "express";
import { getProfile, sendOtp, updateProfile, verifyOtp } from "../controllers/authController.js";

const router = express.Router();

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.get('/get-profile/:id', getProfile);
router.put('/update-profile/:id', updateProfile);

export default router;