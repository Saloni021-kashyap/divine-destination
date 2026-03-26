require("dotenv").config();

const express = require("express");
const path = require("path");
const engine = require("ejs-mate");
const session = require("express-session");
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

// =============================
// Database Connect
// =============================
connectDB();

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
app.use(
  session({
    secret: process.env.SESSION_SECRET || "divineSecretKey",
    resave: false,
    saveUninitialized: false,
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});