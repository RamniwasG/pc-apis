import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import twilio from "twilio";
import User from "../models/User.js";
import Otp from "../models/Otp.js";
import dotenv from "dotenv";
dotenv.config(); 

const {
  TWILIO_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_PHONE,
  JWT_SECRET,
  JWT_EXPIRES_IN = "7d",
  OTP_TTL_MINUTES = 5,
  OTP_MAX_ATTEMPTS = 5,
  BCRYPT_SALT_ROUNDS = 10
} = process.env;

let twilioClient = null;
if (TWILIO_SID && TWILIO_AUTH_TOKEN) {
  try {
    twilioClient = twilio(TWILIO_SID, TWILIO_AUTH_TOKEN);
  } catch (e) {
    console.error("Twilio init error:", e);
    twilioClient = null;
  }
}

function generateNumericOtp(length = 6) {
  let otp = "";
  for (let i = 0; i < length; i++) otp += Math.floor(Math.random() * 10);
  return otp;
}

function signToken(user) {
  return jwt.sign({ id: user._id.toString(), role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// POST /api/auth/send-otp
export  const sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: "Phone is required" });

    // Optional: simple rate limiting per phone using existing OTP attempts
    const latest = await Otp.findOne({ phone }).sort({ createdAt: -1 });
    if (latest && latest.attempts >= Number(OTP_MAX_ATTEMPTS || 5)) {
      return res.status(429).json({ message: "Too many attempts. Try again later." });
    }

    const otp = generateNumericOtp(6);
    const saltRounds = Number(BCRYPT_SALT_ROUNDS || 10);
    const otpHash = await bcrypt.hash(otp, saltRounds);
    const ttlMinutes = Number(OTP_TTL_MINUTES || 5);
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

    // Remove older OTPs for this phone and create new
    await Otp.deleteMany({ phone });
    await Otp.create({ phone, otpHash, expiresAt });

    // Send via Twilio (or fallback to console in non-production)
    if (twilioClient && TWILIO_PHONE) {
      await twilioClient.messages.create({
        body: `Your PC login OTP is ${otp}. It expires in ${ttlMinutes} minutes.`,
        from: TWILIO_PHONE,
        to:  `+91${phone}`
      });
    } else {
      if (ENV !== "production") {
        console.log(`[DEV OTP] phone=${phone} otp=${otp}`);
      } else {
        console.warn("Twilio not configured in production — OTP not sent.");
      }
    }

    // return res.json({ message: "OTP sent (if phone is valid)", ttlMinutes });
    res.json({ success: true, message: "OTP sent successfully" });
  } catch (err) {
    console.error("sendOtp error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// POST /api/auth/verify-otp
// body: { phone, otp, name? }
// NOTE: Do not accept role from client here in production.
export const verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) return res.status(400).json({ message: "Phone and OTP required" });

    const record = await Otp.findOne({ phone });
    if (!record) return res.status(400).json({ message: "OTP not found or expired" });

    // Check expiry
    if (record.expiresAt < new Date()) {
      await Otp.deleteMany({ phone });
      return res.status(400).json({ message: "OTP expired. Request a new one." });
    }

    // Check attempts limit
    if (record.attempts >= Number(OTP_MAX_ATTEMPTS || 5)) {
      await Otp.deleteMany({ phone });
      return res.status(429).json({ message: "Too many attempts. Request a new OTP." });
    }

    // Compare OTP using bcrypt
    const match = await bcrypt.compare(String(otp), record.otpHash);
    if (!match) {
      record.attempts = (record.attempts || 0) + 1;
      await record.save();
      return res.status(400).json({ message: "Incorrect OTP" });
    }

    // OTP valid => remove OTPs
    await Otp.deleteMany({ phone });

    // Find or create user (default role: user)
    let user = await User.findOne({ phone });
    if (!user) {
      user = await User.create({ phone });
    }

    const token = signToken(user);
    return res.json({
      message: "Login successful!",
      token,
      user: { id: user._id, phone: user.phone, name: user.name, role: user.role }
    });
  } catch (err) {
    console.error("verifyOtp error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Admin-only: change user role
export const updateRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    const allowedRoles = ["user","seller","admin"];
    if (!allowedRoles.includes(role)) return res.status(400).json({ message: "Invalid role" });

    const user = await User.findByIdAndUpdate(userId, { role }, { new: true });
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json({ message: "Role updated", user: { id: user._id, phone: user.phone, role: user.role } });
  } catch (err) {
    console.error("updateRole error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getProfile = async (req, res) => {
  const { id } = req.params;
  console.log(id)
  const user = await User.findById(id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
};

export const updateProfile = async (req, res) => {
  const { id } = req.params;
  const { name, email, address, avatar } = req.body;

  const user = await User.findOneAndUpdate(
    { id },
    { name, email, avatar, $push: { addresses: address } },
    { new: true }
  );

  res.json(user);
};
