require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

const mongoURI = process.env.MONGO_URI;

mongoose
  .connect(mongoURI)
  .then(() => console.log("✅ Successfully connected to 'travelo' database"))
  .catch((err) => console.error("❌ Connection error:", err));

// --- SCHEMAS & MODELS ---

const DestinationSchema = new mongoose.Schema({
  id: Number,
  name: String,
  location: String,
  category: String,
  description: String,
  image: String,
  rating: Number,
});
const Destination = mongoose.model(
  "Destination",
  DestinationSchema,
  "destinations",
);

const PackageSchema = new mongoose.Schema({
  id: Number,
  package_name: String,
  destination: String,
  duration: String,
  price_bdt: Number,
  category: String,
  activities: [String],
  inclusions: [String],
  rating: Number,
  operator: String,
});
const Package = mongoose.model("Package", PackageSchema, "packages");

const ContactSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  phone: String,
  destination: String,
  message: String,
  createdAt: { type: Date, default: Date.now },
});
const Contact = mongoose.model("Contact", ContactSchema, "contacts");

// --- ROUTES ---

// 1. GET Top Rated Packages (Specific route MUST come before dynamic :id routes)
app.get("/api/destinations/top-rated", async (req, res) => {
  try {
    const data = await Destination.find({ rating: { $gt: 4.8 } }).sort({
      rating: -1,
    });
    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. GET all Travel Packages
app.get("/api/packages", async (req, res) => {
  try {
    const data = await Package.find({});
    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. GET all destinations
app.get("/api/destinations", async (req, res) => {
  try {
    const data = await Destination.find({});
    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. GET single destination by ID (Dynamic route stays at the bottom)
app.get("/api/destinations/:id", async (req, res) => {
  try {
    // Explicitly converting to Number since your schema uses Number for id
    const targetId = Number(req.params.id);

    const data = await Destination.findOne({ id: targetId });
    if (!data) {
      return res
        .status(404)
        .json({ success: false, message: "Destination not found" });
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. POST Contact Form
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
