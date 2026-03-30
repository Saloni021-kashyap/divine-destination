const User = require("../models/User");
const LoginActivity = require("../models/LoginActivity");

const PERSISTENT_SESSION_MAX_AGE = 14 * 24 * 60 * 60 * 1000;

const getClientIp = (req) => req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.ip || "unknown";
const getUserAgent = (req) => req.headers["user-agent"] || "unknown";

const applySessionCookiePolicy = (req) => {
  if (req.session.user.role === "admin") {
    req.session.cookie.maxAge = null;
    return;
  }

  req.session.cookie.maxAge = PERSISTENT_SESSION_MAX_AGE;
};

const logLoginActivity = async ({ user = null, email, req, status, reason = null }) => {
  try {
    await LoginActivity.create({
      user: user ? user._id : null,
      email,
      ip: getClientIp(req),
      userAgent: getUserAgent(req),
      status,
      reason
    });
  } catch (err) {
    console.error("Login activity log error:", err.message);
  }
};

// ===============================
// Show Register Page
// ===============================
exports.showRegister = (req, res) => {
  res.render("auth/register", { error: null });
};

// ===============================
// Register User
// ===============================
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.render("auth/register", {
        error: "User already exists"
      });
    }

    const newUser = new User({
      name,
      email,
      password
    });

    await newUser.save();

    res.render("auth/login", {
      success: "Registration successful. Please login."
    });
  } catch (err) {
    console.error("REGISTRATION ERROR:", err.message);
    res.render("auth/register", {
      error: "Registration failed"
    });
  }
};

// ===============================
// Show Login Page
// ===============================
exports.showLogin = (req, res) => {
  res.render("auth/login", {
    error: null,
    success: null
  });
};

// ===============================
// Login User
// ===============================
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      await logLoginActivity({
        email,
        req,
        status: "failure",
        reason: "User not found"
      });

      return res.render("auth/login", {
        error: "User not found",
        success: null
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      await logLoginActivity({
        user,
        email,
        req,
        status: "failure",
        reason: "Invalid password"
      });

      return res.render("auth/login", {
        error: "Invalid password",
        success: null
      });
    }

    user.lastLoginAt = new Date();
    user.lastLoginIp = getClientIp(req);
    user.lastLoginUserAgent = getUserAgent(req);
    await user.save();

    await logLoginActivity({
      user,
      email,
      req,
      status: "success"
    });

    req.session.userId = user._id;
    req.session.isAdmin = user.role === "admin";

    req.session.user = {
      id: user._id,
      name: user.name,
      role: user.role
    };

    req.session.success = "Login successful!";
    applySessionCookiePolicy(req);

    if (req.session.user.role === "admin") {
      return req.session.save(() => {
        res.redirect("/admin/dashboard");
      });
    }

    return req.session.save(() => {
      res.redirect("/");
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err.message);
    res.render("auth/login", {
      error: "Login failed",
      success: null
    });
  }
};

// ===============================
// Logout
// ===============================
exports.logoutUser = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
};
