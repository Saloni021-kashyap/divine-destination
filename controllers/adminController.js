const Listing = require("../models/Listing");
const User = require("../models/User");
const Booking = require("../models/booking");
const mongoose = require("mongoose");

const getActiveUsersCount = async () => {
  try {
    const sessionsCollection = mongoose.connection.collection("sessions");

    const activeUsers = await sessionsCollection.distinct("session.user.id", {
      expires: { $gt: new Date() },
      "session.user.id": { $exists: true, $ne: null }
    });

    return activeUsers.length;
  } catch (err) {
    console.error("Active users count error:", err.message);
    return 0;
  }
};

exports.dashboard = async (req, res) => {
  try {
    const [totalListings, totalUsers, totalBookings, allRecentBookings, activeUsers, adminUser] = await Promise.all([
      Listing.countDocuments(),
      User.countDocuments(),
      Booking.countDocuments(),
      Booking.find().populate("user").populate("listing").sort({ createdAt: -1 }).limit(10),
      getActiveUsersCount(),
      User.findById(req.session.user.id).select("lastLoginAt")
    ]);

    const bookings = allRecentBookings.filter(booking => booking.listing !== null);

    res.render("admin/dashboard", {
      totalListings,
      totalUsers,
      totalBookings,
      activeUsers,
      bookings,
      lastLoginAt: adminUser ? adminUser.lastLoginAt : null
    });
  } catch (err) {
    console.error("Admin Dashboard Error:", err.message);
    res.send("Error loading dashboard");
  }
};
