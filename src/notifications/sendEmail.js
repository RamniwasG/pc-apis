import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// It is better to use services like SendGrid, Mailgun, or Amazon SES for production
// Here, we use nodemailer with Gmail SMTP for simplicity
// it only works with SMTP not with HTTPS, for HTTPS use services like SendGrid, Mailgun, etc.

// TODO: replace nodemaller with a more robust service in production like SendGrid, Mailgun, Amazon SES, etc.
export const sendVerificationCode = async (toEmail, passcode) => {
  try {
    // Create a transporter
    console.log(process.env);
    console.log(toEmail, passcode);
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE, // or use 'smtp.ethereal.email' for testing
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
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
