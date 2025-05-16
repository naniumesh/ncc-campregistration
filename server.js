// Load environment variables from .env file
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const session = require("express-session");

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static(path.join(__dirname, "public"))); // Serve frontend

// Default route to load registration page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "register.html"));
});

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// MongoDB Models
const Registration = mongoose.model("Registration", new mongoose.Schema({
  rank: String,
  fullname: String,
  year: String,
  enroll: String,
  regnum: String,
  battalion: String,
  camp: String,
  sd: String,
  image: String,
}));

const Setting = mongoose.model("Setting", new mongoose.Schema({
  registrationEnabled: Boolean,
}));

const CampData = mongoose.model("CampData", new mongoose.Schema({
  battalion: String,
  camp: String,
}));

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// APIs

// Settings
app.get("/api/settings", async (req, res) => {
  let setting = await Setting.findOne();
  if (!setting) {
    setting = new Setting({ registrationEnabled: true });
    await setting.save();
  }
  res.json(setting);
});

app.post("/api/settings", async (req, res) => {
  let setting = await Setting.findOne();
  if (!setting) {
    setting = new Setting(req.body);
  } else {
    setting.registrationEnabled = req.body.registrationEnabled;
  }
  await setting.save();
  res.sendStatus(200);
});

// Camps
app.get("/api/camps", async (req, res) => {
  const camps = await CampData.find();
  const grouped = {};
  camps.forEach(({ battalion, camp }) => {
    if (!grouped[battalion]) grouped[battalion] = [];
    grouped[battalion].push(camp);
  });
  res.json(grouped);
});
app.post("/api/camps", async (req, res) => {
  const { battalion, camp } = req.body;
  const exists = await CampData.findOne({ battalion, camp });
  if (!exists) {
    await CampData.create({ battalion, camp });
    res.json({ success: true });
  } else {
    res.status(409).json({ message: "Camp already exists." });
  }
});

app.delete("/api/camps", async (req, res) => {
  const { battalion, camp } = req.body;
  const result = await CampData.deleteOne({ battalion, camp });
  if (result.deletedCount > 0) {
    res.json({ success: true });
  } else {
    res.status(404).json({ message: "Camp not found." });
  }
});

// Registrations APIS
app.post("/api/register", upload.single("image"), async (req, res) => {
    try {
      console.log("Received registration request with body:", req.body);
      console.log("Uploaded file:", req.file);
  
      const {
        rank, fullname, year, enroll,
        regnum, battalion, camp, sd
      } = req.body;
  
      const newReg = new Registration({
        rank,
        fullname,
        year,
        enroll,
        regnum,
        battalion,
        camp,
        sd,
        image: req.file ? req.file.path : "",
      });
  
      const saved = await newReg.save();
      console.log("Saved to MongoDB:", saved);
      res.json({ success: true });
    } catch (err) {
      console.error("Registration error:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  });  

app.get("/api/registrations", async (req, res) => {
  const data = await Registration.find();
  res.json(data);
});

app.delete("/api/registrations/:id", async (req, res) => {
  await Registration.findByIdAndDelete(req.params.id);
  res.sendStatus(200);
});


// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
