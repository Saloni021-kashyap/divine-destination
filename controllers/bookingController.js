const Booking = require("../models/booking");
const Listing = require("../models/Listing");

exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id);

    if (!booking) {
      req.session.error = "Booking not found";
      return res.redirect("/bookings");
    }

    // 🔥 Seats wapas add karo
    await Listing.findByIdAndUpdate(booking.listing, {
      $inc: { availableSeats: booking.seats }
    });

    // 🔥 Booking delete karo
    await Booking.findByIdAndDelete(id);

    req.session.success = "Booking cancelled successfully ❌";

    res.redirect("/bookings");

  } catch (err) {
    console.error("Booking Controller Error:", err.message);
    res.redirect("/bookings");
  }
};