const mongoose = require("mongoose");

const initializeDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Successfully connected to the database.");
  } catch (error) {
    console.error("Database connection failed:", error.message);
  }
};

module.exports = { initializeDatabase };
