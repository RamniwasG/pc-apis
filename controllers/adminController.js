// controllers/adminController.js
import mongoose from "mongoose";
import Order from "../models/Order.js";
import User from "../models/User.js";
import Product from "../models/Product.js";

/**
 * GET /api/admin/stats
 * Returns overall totals, today's totals, counts by status, monthly revenue chart (last 12 months),
 * orders per day (last 7 days) and top products by quantity sold.
 */
export const getAdminStats = async (req, res) => {
  try {
    // Today date range (server timezone). Adjust to user's timezone if needed.
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // 12 months ago
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0,0,0,0);

    // 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6); // include today => 7 days
    sevenDaysAgo.setHours(0,0,0,0);

    // Single aggregation pipeline on orders to compute many stats in one DB call
    const ordersAgg = await Order.aggregate([
      {
        $facet: {
          // 1) overall counts & revenue
          totals: [
            {
              $group: {
                _id: null,
                totalOrders: { $sum: 1 },
                totalRevenue: { $sum: "$totalAmount" }
              }
            }
          ],

          // 2) today's counts & revenue (paid orders)
          today: [
            {
              $match: {
                createdAt: { $gte: todayStart, $lte: todayEnd }
              }
            },
            {
              $group: {
                _id: null,
                todayOrders: { $sum: 1 },
                todayRevenue: { $sum: "$totalAmount" }
              }
            }
          ],

          // 3) counts by status
          byStatus: [
            {
              $group: {
                _id: "$orderStatus",
                count: { $sum: 1 }
              }
            }
          ],

          // 4) monthly revenue for last 12 months
          monthlyRevenue: [
            {
              $match: {
                createdAt: { $gte: twelveMonthsAgo }
              }
            },
            {
              $project: {
                year: { $year: "$createdAt" },
                month: { $month: "$createdAt" },
                amount: "$totalAmount"
              }
            },
            {
              $group: {
                _id: { year: "$year", month: "$month" },
                revenue: { $sum: "$amount" },
                orders: { $sum: 1 }
              }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
          ],

          // 5) orders per day for last 7 days
          ordersPerDay: [
            {
              $match: { createdAt: { $gte: sevenDaysAgo } }
            },
            {
              $project: {
                day: {
                  $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                }
              }
            },
            {
              $group: {
                _id: "$day",
                count: { $sum: 1 }
              }
            },
            { $sort: { "_id": 1 } }
          ],

          // 6) top products (by quantity) - unwind items, last 6 months
          topProducts: [
            { $unwind: "$items" },
            { $project: { product: "$items.product", qty: "$items.qty", createdAt: 1 } },
            { $match: { createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) } } },
            { $group: { _id: "$product", qtySold: { $sum: "$qty" } } },
            { $sort: { qtySold: -1 } },
            { $limit: 10 }
          ]
        }
      }
    ]).allowDiskUse(true);

    const agg = ordersAgg[0] || {};

    // totals & today may be empty arrays
    const totals = (agg.totals && agg.totals[0]) || { totalOrders: 0, totalRevenue: 0 };
    const today = (agg.today && agg.today[0]) || { todayOrders: 0, todayRevenue: 0 };

    // transform byStatus to key:value
    const statusCounts = {};
    (agg.byStatus || []).forEach(s => { statusCounts[s._id] = s.count; });

    // format monthlyRevenue into array with year-month label
    const monthly = (agg.monthlyRevenue || []).map(m => ({
      year: m._id.year,
      month: m._id.month,
      revenue: m.revenue,
      orders: m.orders
    }));

    const ordersPerDay = (agg.ordersPerDay || []).map(d => ({ day: d._id, orders: d.count }));

    // Resolve topProducts product details
    const topProductIds = (agg.topProducts || []).map(p => p._id).filter(Boolean);
    let topProducts = [];
    if (topProductIds.length) {
      const products = await Product.find({ _id: { $in: topProductIds } })
        .select("title images price")
        .lean();

      // preserve order from aggregation
      topProducts = (agg.topProducts || []).map(p => {
        const prod = products.find(x => String(x._id) === String(p._id));
        return {
          productId: p._id,
          qtySold: p.qtySold,
          product: prod || null
        };
      });
    }

    // counts for users and products
    const [userCount, productCount] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments()
    ]);

    res.json({
      success: true,
      data: {
        totals: {
          totalOrders: totals.totalOrders,
          totalRevenue: totals.totalRevenue || 0,
          totalUsers: userCount,
          totalProducts: productCount
        },
        today: {
          todayOrders: today.todayOrders || 0,
          todayRevenue: today.todayRevenue || 0
        },
        byStatus: statusCounts,
        monthlyRevenue: monthly,
        ordersPerDay,
        topProducts
      }
    });

  } catch (err) {
    console.error("Admin stats error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
