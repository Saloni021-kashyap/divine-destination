const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");

const isLoggedIn = require("../middleware/isLoggedIn");
const isAdmin = require("../middleware/isAdmin");

// Admin Dashboard
router.get("/dashboard", isLoggedIn, isAdmin, adminController.dashboard);

module.exports = router;