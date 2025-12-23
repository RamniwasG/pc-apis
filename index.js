import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from 'cors';
import authRoutes from "./routes/authRoutes.js";
import adminAuthRoutes from './routes/adminAuth.js';
import categoryRoutes from "./routes/categoryRoutes.js";
import subcategoryRoutes from "./routes/subcategoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import paymentRoutes from "./routes/orderPayment.js";

// Database connection && CORS options
import { connectDB } from "./config/db.js";
import { corsOptions } from "./config/corsOptions.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors(corsOptions));
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