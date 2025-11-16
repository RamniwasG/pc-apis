export const uploadSingleImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      url: req.file.path, // Cloudinary URL
      public_id: req.file.filename,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const uploadMultipleImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "No files uploaded" });
    }

    const images = req.files.map((file) => ({
      url: file.path,
      public_id: file.filename,
    }));

    res.status(200).json({
      success: true,
      message: "Images uploaded successfully",
      images,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};