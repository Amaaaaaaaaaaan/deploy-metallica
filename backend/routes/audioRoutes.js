const express = require("express");
const router = express.Router();
const multer = require("multer");
const mongoose = require("mongoose");
const { GridFSBucket } = require("mongodb");
const User = require("../models/user"); // Adjust path if needed
require("dotenv").config();

const mongoURI = process.env.MONGO_CONN || "mongodb://localhost:27017/music-app";

// ✅ Create Mongoose Connection
const conn = mongoose.createConnection(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// ✅ Initialize GridFSBucket when connection is open
let gridFSBucket;
conn.once("open", () => {
  gridFSBucket = new GridFSBucket(conn.db, { bucketName: "audios" });
  console.log("✅ GridFS initialized with bucket 'audios'");
});

// ✅ Configure Multer for file uploads (using memory storage)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// =====================
//  Static Routes First
// =====================

// POST: Upload Audio
router.post("/upload-audio", upload.single("audio"), async (req, res) => {
  try {
    const { userId, title, description } = req.body;
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    // Find the user by id.
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Use a provided title or fallback to a default.
    const providedTitle = title && title.trim().length > 0 ? title.trim() : "Untitled Recording";
    // Sanitize title: replace spaces with underscores.
    const sanitizedTitle = providedTitle.replace(/\s+/g, "_");
    // Extract extension from mimetype (e.g., "webm" from "audio/webm").
    // Note: If using FLAC and it causes format issues in browsers,
    // consider converting the file to MP3 or WAV.
    const fileExt = req.file.mimetype.split("/")[1] || "webm";
    // Create a custom filename.
    const customFileName = `${sanitizedTitle}.${fileExt}`;

    console.log("Custom file name:", customFileName);

    // Ensure GridFSBucket is initialized
    if (!gridFSBucket) {
      return res.status(500).json({ error: "GridFSBucket not initialized" });
    }

    // Upload file to GridFS with custom file name.
    const uploadStream = gridFSBucket.openUploadStream(customFileName, {
      metadata: {
        contentType: req.file.mimetype,
        title: providedTitle,
      },
    });
    uploadStream.end(req.file.buffer);

    uploadStream.on("finish", async () => {
      // Save file reference in user's profile including the description.
      user.audios.push({
        filename: customFileName,
        description: description || "",
      });
      await user.save();
      res.json({ success: true, filename: customFileName });
    });

    uploadStream.on("error", (err) => {
      console.error("Upload error:", err);
      res.status(500).json({ error: "File upload failed" });
    });
  } catch (err) {
    console.error("Error in upload route:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET: List All Uploaded Audio Files
router.get("/list-audios", async (req, res) => {
  try {
    const files = await conn.db.collection("audios.files").find().toArray();
    if (!files || files.length === 0)
      return res.status(404).json({ error: "No files found" });
    res.json(files);
  } catch (err) {
    console.error("Error in list-audios:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET: Retrieve User's Audio Files
router.get("/user-audios/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user.audios);
  } catch (err) {
    console.error("Error fetching user audios:", err);
    res.status(500).json({ error: err.message });
  }
});

// ============================
//  Dynamic Routes (File Ops)
// ============================

// GET: Stream an Audio File
router.get("/:filename", async (req, res) => {
  try {
    // Check GridFSBucket is ready
    if (!gridFSBucket) {
      return res.status(500).json({ error: "GridFSBucket not initialized" });
    }

    const file = await conn.db
      .collection("audios.files")
      .findOne({ filename: req.params.filename });
    if (!file) return res.status(404).json({ error: "File not found" });
    // Set the correct content type.
    res.set("Content-Type", file.metadata?.contentType || "audio/mpeg");
    const readStream = gridFSBucket.openDownloadStreamByName(req.params.filename);
    readStream.pipe(res);
  } catch (err) {
    console.error("Error streaming file:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE: Delete an Audio File
router.delete("/:filename", async (req, res) => {
  try {
    // Check GridFSBucket is ready
    if (!gridFSBucket) {
      return res.status(500).json({ error: "GridFSBucket not initialized" });
    }

    const filename = req.params.filename;
    const file = await conn.db
      .collection("audios.files")
      .findOne({ filename });
    if (!file) return res.status(404).json({ error: "File not found" });
    await gridFSBucket.delete(file._id);

    // Optionally remove the file reference from the user document.
    const { userId } = req.query;
    if (userId) {
      await User.updateOne({ _id: userId }, { $pull: { audios: { filename } } });
    }
    res.json({ message: "File deleted successfully" });
  } catch (err) {
    console.error("Error deleting file:", err);
    res.status(500).json({ error: "Error deleting file" });
  }
});

module.exports = router;
