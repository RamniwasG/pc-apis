// scripts/backfillOrderHistory.js
import mongoose from "mongoose";
import Order from "../models/Order.js";
import dotenv from "dotenv";
dotenv.config();

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const orders = await Order.find({ history: { $in: [null, []] } });
  console.log("To backfill:", orders.length);
  for (const order of orders) {
    const placedStep = {
      status: order.orderStatus || "placed",
      actor: "system",
      note: "Backfilled initial status",
      timestamp: order.createdAt || new Date()
    };
    order.history = [placedStep];
    await order.save();
  }
  console.log("Done");
  process.exit(0);
};

run().catch(err => { console.error(err); process.exit(1); });
