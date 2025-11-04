import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import twilio from "twilio";
import User from "../models/NewUser.js";
import Otp from "../models/Otp.js";
import dotenv from "dotenv";
import { generateAlphaNumericPassCode, generateNumericOtp } from "../utils/index.js";
import { sendVerificationCode } from "../notifications/sendEmail.js";
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

function signToken(user) {
  return jwt.sign({ id: user._id.toString(), role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// POST /api/auth/send-otp
export  const sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;

    let isEmail = false;
    if(phone.includes('@')) {
      isEmail = true;
    }
    
    if (!phone) return res.status(400).json({ message: `${isEmail ? 'Email' : 'Phone'} is required` });

    // Optional: simple rate limiting per email using existing OTP attempts
    const latest = await Otp.findOne({ phone }).sort({ createdAt: -1 });
    if (latest && latest.attempts >= Number(OTP_MAX_ATTEMPTS || 5)) {
      return res.status(429).json({ message: "Too many attempts. Try again later." });
    }

    const otp = isEmail ? generateAlphaNumericPassCode(6) : generateNumericOtp(6);
    console.log(`Generated Passcode/OTP for ${phone}: ${otp}`);

    const saltRounds = Number(BCRYPT_SALT_ROUNDS || 10);
    const otpHash = await bcrypt.hash(otp, saltRounds);
    const ttlMinutes = Number(OTP_TTL_MINUTES || 5);
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

    // Remove older OTPs for this phone and create new
    await Otp.deleteMany({ phone });
    await Otp.create({ phone, otpHash, expiresAt });

    if(isEmail) {
      const passcode = await sendVerificationCode(phone, otp);
      console.log(`[Email Passcode] email=${phone} passcode=${passcode}`);
    } else if (twilioClient && TWILIO_PHONE) {
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

    let successMsg = isEmail ? `Passcode has been sent to ${phone} (if valid), Please check!` : `OTP has been sent to ${phone} (if valid)`;
    
    let existingUser = null
    let user = await User.findOne(isEmail ? { email: phone } : { phone } );
    if(user) {
      existingUser = { id: user._id, phone: user.phone, role: user.role };
    }

    let responsePayload = { success: true, message:  successMsg , ttlMinutes }
    if(isEmail) {
      responsePayload = { ...responsePayload, user: existingUser };
    }
    res.json(responsePayload);
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
    const { phone, mobile, otp, role = "customer" } = req.body;

    let isEmail = false;
    if(phone.includes('@')) {
      isEmail = true;
    }

    if (!phone || !otp) return res.status(400).json({ message: `${isEmail ? 'Email' : 'Phone'} and ${isEmail ?' Passcode' : 'OTP'} required` });

    const record = await Otp.findOne({ phone });
    if (!record) return res.status(400).json({ message: `${isEmail ?' Passcode' : 'OTP'} not found or expired` });

    // Check expiry
    if (record.expiresAt < new Date()) {
      await Otp.deleteMany({ phone });
      return res.status(400).json({ message: `${isEmail ?' Passcode' : 'OTP'} expired. Request a new one.` });
    }

    // Check attempts limit
    if (record.attempts >= Number(OTP_MAX_ATTEMPTS || 5)) {
      await Otp.deleteMany({ phone });
      return res.status(429).json({ message: `Too many attempts. Request a new ${isEmail ?' Passcode' : 'OTP'}.` });
    }

    // Compare OTP using bcrypt
    const match = await bcrypt.compare(String(otp), record.otpHash);
    if (!match) {
      record.attempts = (record.attempts || 0) + 1;
      await record.save();
      return res.status(400).json({ message: `Incorrect ${isEmail ?' Passcode' : 'OTP'}` });
    }

    // OTP valid => remove OTPs
    await Otp.deleteMany({ phone });

    let query = {};
    if(isEmail) {
      query.email = phone;
    } else {
      query.phone = phone;
    }
    // Find or create user (default role: customer)
    let user = await User.findOne(query);
    
    query.phone = mobile || user.phone;
    if (!user) {
      query.role = role;
      user = await User.create(query);
    }

    const token = signToken(user);
    return res.json({
      message: "Login successful!",
      token,
      user: { id: user._id, phone: user.phone, email: user.email, name: user.name, role: user.role }
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
