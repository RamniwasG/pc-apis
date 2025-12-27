// routes/orderTrackingRoutes.js
import express from "express";
import { getOrderTimeline, addOrderStep } from "../controllers/orderTrackingController.js";
import { protect, authorizeRoles } from "../middlewares/auth.js";
import { sendOrderConfirmationEmail } from "../utils/orderConfirmationEmail.js";
import { cancelOrder, createOrder, getMyOrder, getOrders, updateOrderStatus, updatePaymentStatus } from "../controllers/orderController.js";

const router = express.Router();

// admin/system endpoints
router.get("/fetchAllOrders", protect, authorizeRoles('admin'), getOrders);
router.post("/create", protect, createOrder);
router.get("/my-order", protect, getMyOrder);
router.put("/:id/status", protect, authorizeRoles('admin'), updateOrderStatus);
router.put("/:id/pay", updatePaymentStatus);
router.put("/:id/cancel", protect,cancelOrder);
router.post('/send-order-confirmation-email', protect, authorizeRoles('admin','seller', 'user'), sendOrderConfirmationEmail);


// public (if you want the user to view their timeline)
router.get("/:id/timeline", protect, getOrderTimeline);
router.post("/:id/timeline", protect, authorizeRoles('admin'), addOrderStep);     // only admin can add arbitrary step
router.put("/:id/status", protect, authorizeRoles('admin'), updateOrderStatus);   // admin updates status

export default router;
