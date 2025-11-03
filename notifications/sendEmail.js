import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const sendVerificationCode = async (toEmail, passcode) => {
  try {
    // Create a transporter
    const transporter = nodemailer.createTransport({
      service: "gmail", // or use 'smtp.ethereal.email' for testing
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Mail options
    const mailOptions = {
      from: `BDC<${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: "Your Login Verification Code",
      html: `
        <div style="font-family:sans-serif; padding:10px; line-height:1.6;">
          <h2>Verification Code</h2>
          <p>Hello 👋,</p>
          <p>Your 6-digit verification code is:</p>
          <h1 style="color:#2563eb;">${passcode}</h1>
          <p>This code will expire in ${process.env.OTP_TTL_MINUTES} minutes.</p>
          <hr />
          <small>If you didn’t request this, please ignore this email.</small>
        </div>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully!");

    return passcode; // You can store this in DB or cache to verify later
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw new Error("Failed to send email");
  }
};
