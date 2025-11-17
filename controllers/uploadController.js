import fs from "fs";
import cloudinary from "./../config/cloudinary.js";

export const uploadSingleImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "/",
    });

    // Delete local temp file
    fs.unlinkSync(req.file.path);

    res.status(200).json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// export const uploadSingleImage = async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ success: false, message: "No file uploaded" });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Image uploaded successfully",
//       url: req.file.path, // Cloudinary URL
//       public_id: req.file.filename,
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

export const uploadMultipleImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0)
      return res.status(400).json({ message: "No files uploaded" });

    const uploadedImages = [];

    for (let file of req.files) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "ecommerce/products",
      });

      uploadedImages.push({
        url: result.secure_url,
        public_id: result.public_id,
      });

      fs.unlinkSync(file.path);
    }

    res.status(200).json({
      success: true,
      images: uploadedImages,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// export const uploadMultipleImages = async (req, res) => {
//   try {
//     if (!req.files || req.files.length === 0) {
//       return res.status(400).json({ success: false, message: "No files uploaded" });
//     }

//     const images = req.files.map((file) => ({
//       url: file.path,
//       public_id: file.filename,
//     }));

//     res.status(200).json({
//       success: true,
//       message: "Images uploaded successfully",
//       images,
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };