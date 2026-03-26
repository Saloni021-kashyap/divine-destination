const mongoose = require("mongoose");

const mongoUrl = process.env.MONGO_URI || process.env.MONGO_URL;

const connectDB = async () => {
  if (!mongoUrl) {
    throw new Error("Missing MongoDB connection string. Set MONGO_URI or MONGO_URL in your environment.");
  }

  await mongoose.connect(mongoUrl, {
    serverSelectionTimeoutMS: 10000,
  });
};

module.exports = connectDB;
