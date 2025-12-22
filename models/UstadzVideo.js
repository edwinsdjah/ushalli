import mongoose from "mongoose";

const VideoSchema = new mongoose.Schema({
  videoId: String,
  title: String,
  thumbnail: String,
  publishedAt: Date,
});

const UstadzVideoSchema = new mongoose.Schema({
  ustadzSlug: {
    type: String,
    unique: true,
    required: true,
  },
  name: String,
  videos: {
    type: [VideoSchema], // 🔥 penting
    default: [],
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.UstadzVideo ||
  mongoose.model("UstadzVideo", UstadzVideoSchema);
