require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

// bot
require("./bot/bot");

const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 3000;

const bootstrap = async () => {
  try {
    await mongoose.connect(MONGO_URI, {});

    console.log("✅ MongoDB connected");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
  }
};

bootstrap();
