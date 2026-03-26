const mongoose = require("mongoose");
const Listing = require("../models/Listing");
const { data } = require("./data");

// Database Connect
mongoose.connect("mongodb://127.0.0.1:27017/divineDestination")
  .then(() => {
    console.log("MongoDB Connected ✅");
  })
  .catch((err) => {
    console.error("Connection Error ❌", err.message);
  });

// Seed Function
const seedDB = async () => {
  try {
    await Listing.deleteMany({});
    console.log("Old listings deleted 🗑️");

    await Listing.insertMany(data);
    console.log("Database Seeded Successfully 🌱✅");

  } catch (err) {
    console.error("Seeding Error ❌", err.message);
  }
};

// Run Seed
seedDB().then(() => {
  mongoose.connection.close();
});
