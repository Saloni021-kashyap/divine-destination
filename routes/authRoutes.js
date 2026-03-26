const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// ==========================
// Register Routes
// ==========================

// show register page
router.get("/register", authController.showRegister);

// create new user
router.post("/register", authController.registerUser);


// ==========================
// Login Routes
// ==========================

// show login page
router.get("/login", authController.showLogin);

// login user
router.post("/login", authController.loginUser);


// ==========================
// Logout Route
// ==========================

router.get("/logout", authController.logoutUser);


// ==========================
// Export Router
// ==========================

module.exports = router;