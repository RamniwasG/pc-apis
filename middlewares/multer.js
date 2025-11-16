import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

// Storage settings
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "pc/uploads",    // your folder name
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

// Multer instance
const upload = multer({ storage });

export default upload;