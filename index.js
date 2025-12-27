import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from 'cors';
import authRoutes from "./src/routes/authRoutes.js";
import adminAuthRoutes from './src/routes/adminAuth.js';
import categoryRoutes from "./src/routes/categoryRoutes.js";
import subcategoryRoutes from "./src/routes/subcategoryRoutes.js";
import productRoutes from "./src/routes/productRoutes.js";
import orderRoutes from "./src/routes/orderRoutes.js";
import dashboardRoutes from "./src/routes/dashboardRoutes.js";
import uploadRoutes from "./src/routes/uploadRoutes.js";
import paymentRoutes from "./src/routes/orderPayment.js";

// Database connection && CORS options
import { connectDB } from "./src/config/db.js";
// import { corsOptions } from "./config/corsOptions.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("✅ API is running...");
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin-auth", adminAuthRoutes)
app.use("/api/categories", categoryRoutes);
app.use("/api/subcategories", subcategoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/uploads", uploadRoutes);

// Global error handler
// app.use((err, req, res, next) => {
//   if (err.message.includes("CORS")) {
//     return res.status(403).json({ error: err.message });
//   }
//   next(err);
// });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));