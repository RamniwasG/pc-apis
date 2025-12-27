import nodemailer from "nodemailer";
import ejs from "ejs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
// import orderEmailTemplate from "../emails/email-template.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

export const sendOrderConfirmationEmail = async (req, res) => {
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // const templatePath = path.join(
  //   __dirname,
  //   "../emails/order-confirmation.ejs"
  // );
  // console.log("Template Path:", templatePath);

  try {
    // const html = await ejs.renderFile(templatePath, {
    //   customerName: order.customerName,
    //   orderId: order.orderId,
    //   items: order.items,
    //   totalAmount: order.totalAmount,
    //   shippingAddress: order.shippingAddress,
    //   year: new Date().getFullYear(),
    // });
    const order = req.body;
    const templateData = {
      customerName: req.user.username,
      orderId: order._id,
      items: order.items,
      totalAmount: order.totalAmount / 100,
      shippingAddress: order.shippingAddress,
      year: new Date().getFullYear(),
    };
    const { customerName, orderId, items, totalAmount, shippingAddress, year } = templateData;
    const htmlTemplate = `
        <html>
            <head>
            <meta charset="UTF-8" />
            </head>
            <body style="font-family:Arial;">
                <h2 style="color:#333;">Order Confirmed</h2>
                <p>Your order <b>#${orderId}</b> has been placed successfully.</p>
            </body>
        </html>
    `;
    await transporter.sendMail({
      from: `${process.env.STORE} <${process.env.EMAIL_USER}>`,
      to: req.user.email,
      subject: "Order Successful",
      html: htmlTemplate
    });

    res.status(200).send({ success: true })
  } catch (error) {
    console.error("Error rendering email template:", error);
    throw new Error(error);
  }
};