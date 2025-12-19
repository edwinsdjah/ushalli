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
    unique: true, // 🔑 penting
    required: true,
  },
  name: {
    type: String,
  },
  videos: {
    type: Array,
    default: [],
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

// ⛔ cegah duplikasi cache
UstadzVideoSchema.index({ ustadzSlug: 1 }, { unique: true });

export default mongoose.models.UstadzVideo ||
  mongoose.model("UstadzVideo", UstadzVideoSchema);
