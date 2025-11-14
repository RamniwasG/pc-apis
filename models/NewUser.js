import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  label: { type: String, default: "Home" }, // Home / Office / Other
  fullName: { type: String, required: true },
  mobile: { type: String, required: true },
  addressLine1: { type: String, required: true },
  addressLine2: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
	country: { type: String, required: true, default: "India" },
  pincode: { type: String, required: true },
  isDefault: { type: Boolean, default: false }
}, { _id: false }); // prevent subdocument _id clutter
  
const profileSchema = new mongoose.Schema({
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    dateOfBirth: { type: Date },
		sex: { type: String, enum: ["male", "female", "other", "prefer_not_to_say"] },
    avatarUrl: { type: String, default: "" }
}, { _id: false }); // prevent subdocument _id clutter


const userSchema = new mongoose.Schema({
	// for customer users
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  otp: {
    type: String
  },
  otpExpiry: {
    type: Date
  },

	// for admin, staff, seller users
  email: {
    type: String,
    lowercase: true,
    unique: true,
    trim: true
  },
  // password: {
  //   type: String,
  //   required: function() {
  //     // Required only if role is admin, staff, or seller
  //     return ['admin', 'staff', 'seller'].includes(this.role);
  //   }
  // },
	passcodeExpiresAt: {
		type: Date
	},

	// basic info
  profile: profileSchema,

	// user role and access
  role: {
    type: String,
    enum: ["customer", "admin", "staff", "seller"],
    default: "customer"
  },
	accessLevels: {
		type: [String], // e.g., ['super', 'catalog', 'orders', 'users', 'finance', 'report']
		default: []
	},

	// user personal address
	address: addressSchema,

	// shipping addresses
  shipping: [addressSchema],

	// settings for notifications, newsletters, etc.
  preferences: {
    newsletter: { type: Boolean, default: true },
    smsAlerts: { type: Boolean, default: false }
  },

	// TOS, privacy policy or marketing agreements
  agreements: {
    termsOfService: { type: Boolean, default: false },
    privacyPolicy: { type: Boolean, default: false }
  },
  
	purchaseHistory: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order" // reference to orders collection
    }
  ],
	
	tags: [String], // used interally for segmention or analytics e.g., ["vip", "wholesale"]
	
	businessDetails: { // for sellers
		businessName: { type: String },
		gstNumber: { type: String },
		businessAddress: { type: String }
	},

	// timzone: { type: String, default: "UTC" },
  
	isActive: {
    type: Boolean,
    default: true
  },
	lastLogin: {
		type: Date
	}
}, { timestamps: true, versionKey: false});

export default mongoose.model("NewUser", userSchema);
