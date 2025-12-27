import nodemailer from "nodemailer";
import ejs from "ejs";
import path from "path";
import dotenv from "dotenv";

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

  let templatePath = path.join(
    process.cwd(), // ⭐ CRITICAL
    "views",
    "emails",
    "order-confirmation.ejs"
  );
  
  if(templatePath.includes('src')) {
    templatePath = templatePath.replace('src/', '')
  }
  console.log("Template Path:", templatePath);

  try {
    const order = req.body;
    const htmlTemplate = await ejs.renderFile(templatePath, {
      customerName: req.user.username,
      orderId: order._id,
      items: order.items,
      totalAmount: order.totalAmount / 100,
      shippingAddress: order.shippingAddress,
      year: new Date().getFullYear(),
    });
    
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