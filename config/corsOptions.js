// Trusted origins
const allowedOrigins = [
  "https://pc-admin.onrender.com/",
  "https://pc-app.onrender.com/",
//   "capacitor://localhost",
  // remove in production
  // "http://localhost:3000",
  // "http://localhost:3001", 
];

// CORS options
export const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error("CORS policy: This origin is not allowed"));
  },
  methods: "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "x-rtb-fingerprint-id"
  ],
  credentials: true, // allow cookies, authorization headers
  optionsSuccessStatus: 204,
};