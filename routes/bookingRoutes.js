const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const Booking = require("../models/booking");
// middleware import
const { isLoggedIn } = require("../middleware/auth");

// apply to all routes
router.use(isLoggedIn);

// cancel booking
router.post("/:id/cancel", bookingController.cancelBooking);

// My Bookings page
router.get("/", async (req, res) => {
  try {

    let bookings;

    if (req.session.user && req.session.user.role === "admin") {
      // 🔥 Admin → sab bookings
      bookings = await Booking.find().populate("listing user");
    } else {
      // 👤 User → sirf apni bookings
      bookings = await Booking.find({
        user: req.session.user.id
      }).populate("listing");
    }

    res.render("bookings/index", { bookings });

  } catch (err) {
    console.error("Booking Error:", err.message);
    res.redirect("/listings");
  }
});

module.exports = router;