// index.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");
const { authenticate } = require("./middleware/auth");
const path = require("path"); // Add this line
const cron = require("node-cron"); // Add this
// const { startBookingExpiryJob } = require('./utils/scheduler');

connectDB();
// startBookingExpiryJob();
const app = express();
const PORT = process.env.PORT;

// const corsOptions = {
//   // origin: 'http://localhost:5173',
//   origin: '*',
//   methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials: true,
//   optionsSuccessStatus: 200,
//   maxAge: 86400 // Cache preflight for 24 hours
// };

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://192.168.254.109:5173",
    "http://192.168.254.110:5173",
    "http://192.168.254.105:5173",
    "http://192.168.0.135:5173",
    "http://192.168.100.175:5173",
    "http://192.168.1.49:5173",
    "http://192.168.1.9:5173",
    "http://172.30.8.101:5173",
    "http://192.168.1.25:5173",
    "http://172.16.103.245:5173",
    "https://tutor-connect-woad.vercel.app/",
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Remove this duplicate line
// app.use(cors(corsOptions));
// app.options('*', cors(corsOptions));
app.use(express.json());
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Serve static files from uploads directory - USE ONLY THIS ONE
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Remove this duplicate line
// app.use("/uploads", express.static("uploads"));

// Routes
const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);

const tutorRoutes = require("./routes/tutorRoutes");
app.use("/api/tutors", tutorRoutes);

const adminRoutes = require("./routes/adminRoutes");
app.use("/api/admin", adminRoutes);

const bookingRoutes = require("./routes/bookingRoutes");
app.use("/api/bookings", bookingRoutes);

const groupSessionRoutes = require("./routes/groupSessionRoutes");
app.use("/api/group-sessions", groupSessionRoutes);

const expertiseRoutes = require("./routes/expertiseRoutes");
app.use("/api/expertise", expertiseRoutes);

const pricingRoutes = require("./routes/pricingRoutes");
app.use("/api/pricing", pricingRoutes);

const academicCalendarRoutes = require("./routes/academicCalendarRoutes");
app.use("/api/academic-calendar", academicCalendarRoutes);

const notificationRoutes = require("./routes/notificationRoutes");
app.use("/api/notifications", notificationRoutes);

const signatoryRoutes = require("./routes/signatoryRoutes");
app.use("/api/signatories", signatoryRoutes);

const { verifyToken } = require("./controllers/authController");
app.get("/api/auth/verify", authenticate, verifyToken);
// Root route
app.get("/", (req, res) => {
  res.send("Tutor Connect Backend is running!");
});

// Initialize reminder service
const ReminderService = require("./services/reminderService");
const NotificationService = require("./services/notificationService");

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server is running at http://localhost:${PORT}`);
  console.log(`✅ Also accessible at http://192.168.254.109:${PORT}`);

  // Start background jobs after server starts
  try {
    // Start session reminder cron job
    ReminderService.startReminderCron();
    console.log("✅ Session reminder cron job started");

    // Cleanup old notifications weekly (Sunday at midnight)
    cron.schedule("0 0 * * 0", async () => {
      console.log("🧹 Cleaning up old notifications...");
      try {
        const deletedCount = await NotificationService.cleanupOldNotifications(
          30
        ); // Keep 30 days
        console.log(`✅ Cleaned up ${deletedCount} old notifications`);
      } catch (cleanupError) {
        console.error("❌ Error cleaning up notifications:", cleanupError);
      }
    });
    console.log("✅ Notification cleanup cron job started");

    // Send test log
    console.log("✅ All background services initialized successfully");
  } catch (error) {
    console.error("❌ Error initializing background services:", error);
  }
});
