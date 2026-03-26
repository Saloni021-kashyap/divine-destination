const User = require("../models/User");

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

    // check existing user
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.render("auth/register", {
        error: "User already exists"
      });
    }

    // create new user
    const newUser = new User({
      name,
      email,
      password
    });

    await newUser.save();

    // redirect to login
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
      return res.render("auth/login", {
        error: "User not found",
        success: null
      });
    }

    // compare password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.render("auth/login", {
        error: "Invalid password",
        success: null
      });
    }

req.session.userId = user._id;   // 🔥 important
req.session.isAdmin = user.role === "admin";  // 🔥 important

req.session.user = {
  id: user._id,
  name: user.name,
  role: user.role
};

req.session.success = "Login successful!";
    // admin redirect
    if (user.role === "admin") {
      return res.redirect("/admin/dashboard");
    }

    // normal user redirect
    res.redirect("/");

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