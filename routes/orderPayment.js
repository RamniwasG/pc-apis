import express from "express";
import { createTestOrder, verifyTestOrder } from "../controllers/orderController.js";

const router = express.Router();

router.post('/create-order', createTestOrder);
router.post('/verify-payment', verifyTestOrder)

export default router;
