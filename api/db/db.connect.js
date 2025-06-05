const mongoose = require("mongoose");

const initializeDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "erm",
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
    });

    console.log("Successfully connected to MongoDB.");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = { initializeDatabase };
