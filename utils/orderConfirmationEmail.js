import nodemailer from "nodemailer";
import ejs from "ejs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

export const sendOrderConfirmationEmail = async (order) => {
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const templatePath = path.join(
    process.cwd(),
    "emails",
    "order-confirmation.ejs"
  );

  const html = await ejs.renderFile(templatePath, {
    customerName: order.customerName,
    orderId: order.orderId,
    items: order.items,
    totalAmount: order.totalAmount,
    shippingAddress: order.shippingAddress,
    year: new Date().getFullYear(),
  });

  await transporter.sendMail({
    from: `${process.env.STORE} <${process.env.SMTP_USER}>`,
    to: order.email,
    subject: "Your Order Confirmation",
    html,
  });
};