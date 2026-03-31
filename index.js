require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const port = 4000;

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// --- DB CONNECTION ---
const mongoURI = process.env.MONGO_URI;

mongoose
  .connect(mongoURI)
  .then(() => console.log("✅ Successfully connected to 'travelo' database"))
  .catch((err) => console.error("❌ Connection error:", err));

// --- SCHEMAS & MODELS ---

// 1. Destination Model
const DestinationSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
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

// 2. Package Model
const PackageSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
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

// 3. Contact Model
const ContactSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  phone: String,
  destination: String,
  message: String,
  createdAt: { type: Date, default: Date.now },
});
const Contact = mongoose.model("Contact", ContactSchema, "contacts");

// 4. International Tour Model
const TourSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true }, // Added numeric ID for frontend consistency
    title: { type: String, required: true },
    country: { type: String, required: true },
    duration_days: { type: Number, required: true },
    price_usd: { type: Number, required: true },
    rating: { type: Number, default: 4.5 },
    image: { type: String, required: true },
    description: { type: String, required: true },
  },
  {
    timestamps: true,
    collection: "international-tour",
  },
);
const Tour = mongoose.model("Tour", TourSchema);

// --- ROUTES ---

/**
 * DESTINATIONS
 */
app.get("/api/destinations", async (req, res) => {
  try {
    const data = await Destination.find({});
    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

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

app.get("/api/destinations/:id", async (req, res) => {
  try {
    const targetId = Number(req.params.id);
    const data = await Destination.findOne({ id: targetId });
    if (!data)
      return res
        .status(404)
        .json({ success: false, message: "Destination not found" });
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PACKAGES
 */
app.get("/api/packages", async (req, res) => {
  try {
    const data = await Package.find({});
    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/api/packages/:id", async (req, res) => {
  try {
    const targetId = Number(req.params.id);
    const data = await Package.findOne({ id: targetId });
    if (!data)
      return res
        .status(404)
        .json({ success: false, message: "Package not found" });
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * INTERNATIONAL TOURS
 */
app.get("/api/tours", async (req, res) => {
  try {
    const { country } = req.query;
    let filter = {};
    if (country) filter.country = country;

    const data = await Tour.find(filter);
    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Fixed: Route now correctly uses Tour model and searches by numeric 'id'
app.get("/api/tours/:id", async (req, res) => {
  try {
    const targetId = Number(req.params.id);
    // Attempt numeric ID first (consistency), fallback to MongoDB _id if not a number
    const data = isNaN(targetId)
      ? await Tour.findById(req.params.id)
      : await Tour.findOne({ id: targetId });

    if (!data)
      return res
        .status(404)
        .json({ success: false, message: "Tour not found" });
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * CONTACT
 */
app.post("/api/contact", async (req, res) => {
  try {
    const newMessage = new Contact(req.body);
    await newMessage.save();
    res
      .status(201)
      .json({ success: true, message: "Message saved successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- SERVER START ---
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
