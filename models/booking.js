const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Listing",
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  seats: {
    type: Number,
    required: true,
    min: 1
  },
  travelDate: {
    type: Date,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Booking", bookingSchema);
