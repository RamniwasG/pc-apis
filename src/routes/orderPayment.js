import express from "express";
import { createTestOrder, verifyTestOrder } from "../controllers/orderController.js";
import { authorizeRoles, protect } from "../middlewares/auth.js";

const router = express.Router();

router.post('/create-order', protect, authorizeRoles('admin','seller', 'user'), createTestOrder);
router.post('/verify-payment', protect, authorizeRoles('admin','seller', 'user'), verifyTestOrder)

export default router;
