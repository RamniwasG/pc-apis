import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from 'dotenv';
dotenv.config();

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "seller"],
      default: "admin",
    },
  },
  { timestamps: true }
);

// Hash password before saving
adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  console.log(process.env.BCRYPT_SALT_ROUNDS)
  const salt = Number(process.env.BCRYPT_SALT_ROUNDS || 10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
adminSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const AdminUser = mongoose.model("AdminUser", adminSchema);
export default AdminUser;