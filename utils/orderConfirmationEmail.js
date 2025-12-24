import nodemailer from "nodemailer";
import ejs from "ejs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    __dirname,
    "../emails/order-confirmation.ejs"
  );
  console.log("Template Path:", templatePath);
  const html = await ejs.renderFile(templatePath, {
    customerName: order.customerName,
    orderId: order.orderId,
    items: order.items,
    totalAmount: order.totalAmount,
    shippingAddress: order.shippingAddress,
    year: new Date().getFullYear(),
  });

  await transporter.sendMail({
    from: `${process.env.STORE} <${process.env.EMAIL_USER}>`,
    to: order.email,
    subject: "Your Order Confirmation",
    html,
  });
};