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

    const isAdmin = req.session.user && req.session.user.role === "admin";
    const isOwner =
      booking.user &&
      req.session.user &&
      booking.user.toString() === req.session.user.id;

    if (!isAdmin && !isOwner) {
      req.session.error = "You are not allowed to cancel this booking";
      return res.redirect("/bookings");
    }

    await Listing.findByIdAndUpdate(booking.listing, {
      $inc: { availableSeats: booking.seats }
    });

    await Booking.findByIdAndDelete(id);

    req.session.success = "Booking cancelled successfully";

    res.redirect("/bookings");

  } catch (err) {
    console.error("Booking Controller Error:", err.message);
    req.session.error = "Unable to cancel booking";
    res.redirect("/bookings");
  }
};
