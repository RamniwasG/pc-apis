// models/Order.js
import mongoose from "mongoose";

const historySchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ["placed","processing","packed","shipped","out_for_delivery","delivered","cancelled","returned"],
    required: true,
  },
  actor: {         // who made the change: user, admin, system, courier, etc.
    type: String,
    default: "system"
  },
  note: { type: String, default: "" },
  location: { type: String, default: "" }, // optional (warehouse/city)
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      qty: { type: Number, required: true },
      price: { type: Number, required: true }
    }
  ],

  shippingAddress: { /* ... */ },

  paymentMethod: { type: String, enum: ["card","cod","upi"], default: "cod" },
  paymentStatus: { type: String, enum: ["pending","paid","failed"], default: "pending" },

  orderStatus: {
    type: String,
    enum: ["placed","processing","packed","shipped","out_for_delivery","delivered","cancelled","returned"],
    default: "placed"
  },

  history: {
    type: [historySchema],
    default: []
  },

  totalAmount: { type: Number, required: true }
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);