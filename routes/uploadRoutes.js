import express from "express";
import upload from "../middleware/multer.js";
import {
  uploadSingleImage,
  uploadMultipleImages,
} from "../controllers/uploadController.js";

const router = express.Router();

router.post("/single", upload.single("image"), uploadSingleImage);

router.post("/multiple", upload.array("images", 10), uploadMultipleImages);

export default router;