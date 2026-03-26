require("dotenv").config();

const express = require("express");
const path = require("path");
const engine = require("ejs-mate");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const methodOverride = require("method-override");

// =============================
// Custom Files
// =============================
const connectDB = require("./config/db");
const Listing = require("./models/Listing");

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const listingRoutes = require("./routes/listingRoutes");
const bookingRoutes = require("./routes/bookingRoutes");

// =============================
// App Initialize
// =============================
const app = express();
const isProduction = process.env.NODE_ENV === "production";
const mongoSessionUrl = process.env.MONGO_URI || process.env.MONGO_URL;
const sessionSecret = process.env.SESSION_SECRET;

// const dbUrl = process.env.MONGO_URL;

// =============================
// View Engine Setup
// =============================
app.engine("ejs", engine);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// =============================
// Middlewares
// =============================
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// =============================
// Session Setup
// =============================
if (isProduction) {
  app.set("trust proxy", 1);
}

if (!mongoSessionUrl) {
  throw new Error("Missing MongoDB session connection string. Set MONGO_URI in your environment.");
}

if (!sessionSecret) {
  throw new Error("Missing SESSION_SECRET in environment.");
}

const sessionStore = MongoStore.create({
  mongoUrl: mongoSessionUrl,
  collectionName: "sessions",
  ttl: 14 * 24 * 60 * 60,
  autoRemove: "native",
});

sessionStore.on("error", err => {
  console.error("Session store error:", err.message);
});

app.use(
  session({
    secret: sessionSecret,
    name: "divine.sid",
    resave: false,
    saveUninitialized: false,
    rolling: true,
    store: sessionStore,
    cookie: {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      maxAge: 14 * 24 * 60 * 60 * 1000
    }
  })
);

// =============================
// Flash + Current User Middleware
// =============================
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user;
  res.locals.success = req.session.success || null;
  res.locals.error = req.session.error || null;

  if (req.session.success) req.session.success = null;
  if (req.session.error) req.session.error = null;

  next();
});

// =============================
// Routes
// =============================
app.use("/", authRoutes);
app.use("/listings", listingRoutes);
app.use("/bookings", bookingRoutes);
app.use("/admin", adminRoutes);

// =============================
// Home Route
// =============================
app.get("/", async (req, res) => {
  try {
    const listings = await Listing.find().limit(30);
    return res.render("listings/index", { listings });
  } catch (err) {
    console.error("Home Route Error:", err.message);
    res.status(500).send("Server Error");
  }
});

// =============================
// 404 Handler (MUST be last)
// =============================
app.use((req, res) => {
  res.status(404).send("404 - Page Not Found");
});

// =============================
// Error Handler (MUST be after 404)
// =============================
app.use((err, req, res, next) => {
  console.error("Global Error Handler:", err);
  console.error(err.stack);
  res.status(err.status || 500).send(err.message || "Server Error");
});

// =============================
// Server Start
// =============================
const PORT = process.env.PORT || 3000;
let server;

process.on("unhandledRejection", err => {
  console.error("Unhandled promise rejection:", err);
});

process.on("uncaughtException", err => {
  console.error("Uncaught exception:", err);
  process.exit(1);
});

const startServer = async () => {
  try {
    await connectDB();
    server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Startup error:", err.message);
    process.exit(1);
  }
};

process.on("SIGTERM", () => {
  if (server) {
    server.close(() => process.exit(0));
  } else {
    process.exit(0);
  }
});

startServer();
