import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import twilio from "twilio";
import User from "../models/User.js";

dotenv.config();

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

// Send OTP API
export const sendOtp = async (req, res) => {
  try {
    const { mobile } = req.body;
    
    if (!mobile) return res.status(400).json({ message: "Mobile number is required" });

    const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
    const otpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes from now

    let user = await User.findOne({ mobile });
    if (!user) {
      user = new User({ mobile });
    }
    user.otp = otp;
    user.otpExpiry = otpExpiry;

    await user.save();

    // Send via Twilio
    await client.messages.create({
      body: `Your PC login OTP is ${otp}`,
      from: process.env.TWILIO_PHONE,
      to: `+91${mobile}`, // For Indian numbers
    });

    res.json({ success: true, message: "OTP sent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
};

// Verify OTP API
export const verifyOtp = async (req, res) => {
  const { mobile, otp } = req.body;

  if (!mobile || !otp) return res.status(400).json({ message: "Missing fields" });
  
  const user = await User.findOne({ mobile });

  if (!user) return res.status(404).json({ message: 'User not found' });
  if (user.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });
  if (Date.now() > user.otpExpiry) return res.status(400).json({ message: 'OTP expired' });

  user.otp = null;
  await user.save();

  const token = jwt.sign({ mobile }, process.env.JWT_SECRET, { expiresIn: "1w" });
  res.json({
    success: true,
    message: 'Login successful',
    user: { id: user._id, mobile: user.mobile, name: user.name, token },
  });
};

export const getProfile = async (req, res) => {
  const { mobile } = req.params;
  const user = await User.findOne({ mobile });
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
};

export const updateProfile = async (req, res) => {
  const { mobile } = req.params;
  const { name, email, address, avatar } = req.body;

  const user = await User.findOneAndUpdate(
    { mobile },
    { name, email, avatar, $push: { addresses: address } },
    { new: true }
  );

  res.json(user);
};