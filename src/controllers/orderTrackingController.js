// controllers/orderTrackingController.js
import Order from "../models/Order.js";

/**
 * Get order timeline
 * GET /api/orders/:id/timeline
 */
export const getOrderTimeline = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).select("history orderStatus createdAt user");
    if (!order) return res.status(404).json({ success:false, message: "Order not found" });

    res.json({ success: true, data: { orderStatus: order.orderStatus, history: order.history, createdAt: order.createdAt } });
  } catch (err) {
    res.status(500).json({ success:false, message: err.message });
  }
};

/**
 * Add a timeline step (admin or system)
 * POST /api/orders/:id/timeline
 * body: { status, actor?, note?, location? }
 */
export const addOrderStep = async (req, res) => {
  try {
    const { status, actor = req.user?.role === "admin" ? "admin" : "system", note = "", location = "" } = req.body;
    const allowed = ["placed","processing","packed","shipped","out_for_delivery","delivered","cancelled","returned"];
    if (!status || !allowed.includes(status)) {
      return res.status(400).json({ success:false, message: "Invalid or missing status" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success:false, message: "Order not found" });

    const step = { status, actor, note, location, timestamp: new Date() };
    order.history.push(step);
    order.orderStatus = status;

    await order.save();

    res.status(201).json({ success: true, message: "Step added", step });
  } catch (err) {
    res.status(500).json({ success:false, message: err.message });
  }
};

/**
 * Update status (convenience endpoint)
 * PUT /api/orders/:id/status
 * body: { status, note?, location? }
 * This endpoint will push a new history entry and update orderStatus.
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { status, note = "", location = "" } = req.body;
    const allowed = ["placed","processing","packed","shipped","out_for_delivery","delivered","cancelled","returned"];
    if (!status || !allowed.includes(status)) return res.status(400).json({ success:false, message: "Invalid status" });

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success:false, message: "Order not found" });

    // Optional: Prevent invalid transitions (simple example)
    // e.g., can't go from delivered -> processing
    const invalidTransition = (from, to) => {
      if (from === "delivered" && to !== "returned") return true;
      if (from === "cancelled") return true;
      return false;
    };
    if (invalidTransition(order.orderStatus, status)) {
      return res.status(400).json({ success:false, message: `Cannot change status from ${order.orderStatus} to ${status}` });
    }

    const actor = req.user ? (req.user.role === "admin" ? "admin" : req.user._id) : "system";
    const step = { status, actor, note, location, timestamp: new Date() };

    order.history.push(step);
    order.orderStatus = status;

    await order.save();

    res.json({ success:true, message: "Status updated", orderStatus: order.orderStatus, step });
  } catch (err) {
    res.status(500).json({ success:false, message: err.message });
  }
};