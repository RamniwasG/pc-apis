import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  label: { type: String, default: "Home" }, // Home / Office / Other
  fullName: { type: String, required: true },
  mobile: { type: String, required: true },
  addressLine1: { type: String, required: true },
  addressLine2: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  isDefault: { type: Boolean, default: false }
}, { _id: false }); // prevent subdocument _id clutter
  

const userSchema = new mongoose.Schema({
  mobile: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    trim: true
  },
  avatar: {
    type: String, // URL or filename
    default: ""
  },
  otp: {
    type: String
  },
  otpExpiry: {
    type: Date
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  },
  addresses: [addressSchema],
  orders: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order" // reference to orders collection
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("User", userSchema);
