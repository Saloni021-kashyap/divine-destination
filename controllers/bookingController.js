const Booking = require("../models/Booking");
const Listing = require("../models/Listing");

const CANCELLATION_WINDOW_DAYS = 14;
const CANCELLATION_FEE_RATE = 0.10;

const getStartOfDay = (value) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

const isBookingOwner = (booking, userId) =>
  Boolean(booking.user && userId && booking.user.toString() === userId.toString());

const canCancelBooking = (travelDate) => {
  const currentDate = getStartOfDay(new Date());
  const tripDate = getStartOfDay(travelDate);
  const diffInDays = (tripDate - currentDate) / (1000 * 60 * 60 * 24);

  return diffInDays >= CANCELLATION_WINDOW_DAYS;
};

const getBookingTotalPrice = (booking, listing) => {
  if (typeof booking.totalPrice === "number" && !Number.isNaN(booking.totalPrice)) {
    return booking.totalPrice;
  }

  if (listing && typeof listing.price === "number") {
    return booking.seats * listing.price;
  }

  return 0;
};

exports.listBookings = async (req, res) => {
  try {
    let bookings;

    if (req.session.user && req.session.user.role === "admin") {
      bookings = await Booking.find().populate("listing user");
    } else {
      bookings = await Booking.find({
        user: req.session.user.id
      }).populate("listing");
    }

    bookings = bookings.filter(booking => booking.listing !== null);

    return res.render("bookings/index", { bookings });
  } catch (err) {
    console.error("Booking Error:", err.message);
    req.session.error = "Unable to load bookings";
    return res.redirect("/listings");
  }
};

exports.showEditBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("listing");

    if (!booking) {
      req.session.error = "Booking not found";
      return res.redirect("/bookings");
    }

    if (!isBookingOwner(booking, req.session.user.id)) {
      req.session.error = "You can only edit your own bookings";
      return res.redirect("/bookings");
    }

    if (booking.status === "cancelled") {
      req.session.error = "Cancelled bookings cannot be edited";
      return res.redirect("/bookings");
    }

    return res.render("bookings/edit", { booking });
  } catch (err) {
    console.error("Show Edit Booking Error:", err.message);
    req.session.error = "Unable to load booking";
    return res.redirect("/bookings");
  }
};

exports.updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("listing");

    if (!booking) {
      req.session.error = "Booking not found";
      return res.redirect("/bookings");
    }

    if (!isBookingOwner(booking, req.session.user.id)) {
      req.session.error = "You can only edit your own bookings";
      return res.redirect("/bookings");
    }

    if (booking.status === "cancelled") {
      req.session.error = "Cancelled bookings cannot be edited";
      return res.redirect("/bookings");
    }

    const seats = Number(req.body.seats);
    const phone = (req.body.phone || "").trim();

    if (!Number.isInteger(seats) || seats <= 0) {
      req.session.error = "Invalid seat number";
      return res.redirect(`/bookings/${booking._id}/edit`);
    }

    if (!phone) {
      req.session.error = "Phone number is required";
      return res.redirect(`/bookings/${booking._id}/edit`);
    }

    const listing = await Listing.findById(booking.listing._id);

    if (!listing) {
      req.session.error = "Listing not found";
      return res.redirect("/bookings");
    }

    const seatDifference = seats - booking.seats;

    if (seatDifference > 0 && seatDifference > listing.availableSeats) {
      req.session.error = "Not enough seats available";
      return res.redirect(`/bookings/${booking._id}/edit`);
    }

    listing.availableSeats -= seatDifference;
    await listing.save();

    booking.phone = phone;
    booking.seats = seats;
    booking.totalPrice = seats * listing.price;
    await booking.save();

    req.session.success = "Booking updated successfully";
    return res.redirect("/bookings");
  } catch (err) {
    console.error("Update Booking Error:", err.message);
    req.session.error = "Unable to update booking";
    return res.redirect("/bookings");
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("listing");

    if (!booking) {
      req.session.error = "Booking not found";
      return res.redirect("/bookings");
    }

    if (!isBookingOwner(booking, req.session.user.id)) {
      req.session.error = "You can only cancel your own bookings";
      return res.redirect("/bookings");
    }

    if (booking.status === "cancelled") {
      req.session.error = "Booking is already cancelled";
      return res.redirect("/bookings");
    }

    if (!canCancelBooking(booking.travelDate)) {
      req.session.error = "Cancellation not allowed within 14 days of travel";
      return res.redirect("/bookings");
    }

    const listing = await Listing.findById(booking.listing._id);

    if (listing) {
      listing.availableSeats += booking.seats;
      await listing.save();
    }

    booking.status = "cancelled";
    booking.totalPrice = getBookingTotalPrice(booking, listing || booking.listing);
    booking.refundAmount = Number((booking.totalPrice * (1 - CANCELLATION_FEE_RATE)).toFixed(2));
    await booking.save();

    req.session.success = "10% cancellation fee applied";
    return res.redirect("/bookings");
  } catch (err) {
    console.error("Cancel Booking Error:", err.message);
    req.session.error = "Unable to cancel booking";
    return res.redirect("/bookings");
  }
};
