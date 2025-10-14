import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import twilio from "twilio";

dotenv.config();

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

// Temporary in-memory OTP store
const otpStore = new Map();

// Send OTP API
export const sendOtp = async (req, res) => {
  try {
    const { mobile } = req.body;
    console.log(mobile);
    if (!mobile) return res.status(400).json({ message: "Mobile number is required" });

    const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
    otpStore.set(mobile, otp);

    // Send via Twilio
    await client.messages.create({
      body: `Your PC login OTP is ${otp}`,
      from: process.env.TWILIO_PHONE,
      to: `+91${mobile}`,
    });

    console.log(`OTP for ${mobile}: ${otp}`);
    res.json({ success: true, message: "OTP sent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
};

// Verify OTP API
export const verifyOtp = (req, res) => {
  const { mobile, otp } = req.body;

  if (!mobile || !otp) return res.status(400).json({ message: "Missing fields" });

  const storedOtp = otpStore.get(mobile);
  if (parseInt(otp) === storedOtp) {
    otpStore.delete(mobile); // clear OTP after success

    const token = jwt.sign({ mobile }, process.env.JWT_SECRET, { expiresIn: "1h" });
    return res.json({ success: true, token, message: "Login successful" });
  } else {
    return res.status(400).json({ success: false, message: "Invalid OTP" });
  }
};