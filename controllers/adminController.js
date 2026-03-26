const Listing = require("../models/Listing");
const User = require("../models/User");
const Booking = require("../models/booking");

exports.dashboard = async (req, res) => {

  try {

    const totalListings = await Listing.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const bookings = await Booking.find()
      .populate("user")
      .populate("listing")
      .sort({ createdAt: -1 });

    res.render("admin/dashboard", {
      totalListings,
      totalUsers,
      totalBookings,
      bookings
    });

  } catch (err) {

    console.error("Admin Dashboard Error:", err.message);
    res.send("Error loading dashboard");

  }

};
