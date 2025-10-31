import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
)

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true,
      maxlength: [120, 'Product title too long'],
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true,
      minlength: [10, 'Product description too short'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be positive'],
    },
    discount: {
      type: Number,
      default: 0,
    },
    stock: {
      type: Number,
      required: true,
      min: [0, 'Stock cannot be negative'],
    },
    images: [
      {
        url: { type: String, required: true },
        public_id: { type: String },
      },
    ],
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    subcategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubCategory',
    },
    brand: { type: String },
    color: [{ type: String }], // Example: ["Red", "Blue", "Black"]
    size: [{ type: String }], // Example: ["S", "M", "L", "XL", "8mm", "12mm"]
    weight: { type: String }, // Example: "g", "kg", "pound"

    rating: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot exceed 5'],
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    reviews: [reviewSchema],

    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    tags: [{ type: String, trim: true }],
    sku: {
      type: String,
      unique: true,
      sparse: true,
    },

    // SEO & analytics
    slug: { type: String, unique: true, trim: true },
    views: { type: Number, default: 0 },
    sold: { type: Number, default: 0 },
  },
  { timestamps: true }
)

// Auto-generate slug from title
productSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = this.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
  }
  next()
})

const Product = mongoose.models.Product || mongoose.model('Product', productSchema)
export default Product
