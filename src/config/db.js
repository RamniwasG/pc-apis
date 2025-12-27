import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_CLOUD_URI);
    console.log('✅ MongoDB Connected');
    mongoose.set('toJSON', {
      versionKey: false
    });
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
};
