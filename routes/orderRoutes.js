// routes/orderTrackingRoutes.js
import express from "express";
import { getOrderTimeline, addOrderStep, updateOrderStatus } from "../controllers/orderTrackingController.js";
import auth from "../middleware/auth.js";
import admin from "../middleware/admin.js";

const router = express.Router();

// public (if you want the user to view their timeline)
router.get("/:id/timeline", auth, getOrderTimeline);

// admin/system endpoints
router.post("/:id/timeline", auth, admin, addOrderStep);     // only admin can add arbitrary step
router.put("/:id/status", auth, admin, updateOrderStatus);   // admin updates status

export default router;
