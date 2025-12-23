import express from "express";
// import Order from "../models/Order1.js";
import crypto from "crypto";
import razorpay from '../config/razorpay.js';
import Order from '../models/Order.js';
import NewOrder from '../models/NewOrder.js';

const router = express.Router();

export const createTestOrder = async (req, res) => {
  try {
    const { userId, items, amount } = req.body

    const razorpayOrder = await razorpay.orders.create({
      amount: amount * 100,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`
    })

    const order = await NewOrder.create({
      userId,
      items,
      amount,
      razorpayOrderId: razorpayOrder.id
    })

    res.json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
};

export const verifyTestOrder = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body

    const sign = razorpay_order_id + '|' + razorpay_payment_id

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest('hex')

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid signature' })
    }

    const order = await NewOrder.findOne({ razorpayOrderId: razorpay_order_id })

    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    order.razorpayPaymentId = razorpay_payment_id
    order.razorpaySignature = razorpay_signature
    order.status = 'PAID'
    await order.save()

    res.json({ success: true, order })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
};

export const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;

    if (!items || items.length === 0)
      return res.status(400).json({ message: "No items found" });

    const totalAmount = items.reduce(
      (sum, item) => sum + item.qty * item.price,
      0
    );

    const order = await Order.create({
      user: req.user.id,
      items,
      shippingAddress,
      paymentMethod,
      totalAmount,
    });

    res.status(201).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyOrder = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort("-createdAt");
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getOrders = async(req, res) => {
  try {
    const orders = await Order.find().populate("user", "name email");
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.orderStatus = orderStatus;
    await order.save();

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updatePaymentStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.paymentStatus = "paid";
    await order.save();

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.orderStatus === "delivered")
      return res.status(400).json({ message: "Delivered orders cannot be cancelled" });

    order.orderStatus = "cancelled";
    await order.save();

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export default router;