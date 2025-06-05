const mongoose = require("mongoose");

const initializeDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
    });

    console.log("Successfully connected to MongoDB.");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
  }
};

module.exports = { initializeDatabase };
