import express from "express";
import { getDashboardCounts } from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/counts", getDashboardCounts);

export default router;