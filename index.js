require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const port = 4000;

// Middleware
app.use(cors());
app.use(express.json());

// 1. DATABASE CONNECTION
// Ensure your .env has /travelo before the ?
const mongoURI = process.env.MONGO_URI;

mongoose
  .connect(mongoURI)
  .then(() => console.log("✅ Successfully connected to 'travelo' database"))
  .catch((err) => console.error("❌ Connection error:", err));

// 2. DATA MODELS
// Destination Schema (Matches your 20 items)
const DestinationSchema = new mongoose.Schema({
  id: Number,
  name: String,
  location: String,
  category: String,
  description: String,
  image: String,
  rating: Number,
});

// The 3rd argument "destinations" forces Mongoose to use your exact collection
const Destination = mongoose.model(
  "Destination",
  DestinationSchema,
  "destinations",
);

// Contact Schema (For your form)
const ContactSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  phone: String,
  destination: String,
  message: String,
  createdAt: { type: Date, default: Date.now },
});
const Contact = mongoose.model("Contact", ContactSchema, "contacts");

// 3. ROUTES

// GET all 20 destinations
app.get("/api/destinations", async (req, res) => {
  try {
    const data = await Destination.find({});
    res.status(200).json({
      success: true,
      count: data.length,
      data: data,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.get("/api/destinations/:id", async (req, res) => {
  try {
    const data = await Destination.findOne({});
    res.status(200).json({
      success: true,
      count: data.length,
      data: data,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST a new contact message
app.post("/api/contact", async (req, res) => {
  try {
    const newMessage = new Contact(req.body);
    await newMessage.save();
    res.status(201).json({ success: true, message: "Message saved!" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
