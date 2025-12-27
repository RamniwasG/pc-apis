import Category from "../models/Category.js";
import SubCategory from "../models/Subcategory.js";
import Product from "../models/Product.js";
import User from "../models/NewUser.js";
// import Order from "../models/orderModel.js";

export const getDashboardCounts = async (req, res) => {
  try {
    const [
      categoryCount,
      subCategoryCount,
      productCount,
      userCount,
    //   orderCount
    ] = await Promise.all([
      Category.countDocuments(),
      SubCategory.countDocuments(),
      Product.countDocuments(),
      User.countDocuments(),
    //   Order.countDocuments()
    ]);

    res.status(200).json({
        categories: categoryCount,
        subcategories: subCategoryCount,
        products: productCount,
        users: userCount,
        // orders: orderCount
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};