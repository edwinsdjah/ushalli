import mongoose from "mongoose";

const VideoSchema = new mongoose.Schema({
  videoId: String,
  title: String,
  thumbnail: String,
  publishedAt: Date,
});

const UstadzVideoSchema = new mongoose.Schema(
  {
    ustadzSlug: {
      type: String,
      required: true,
      index: true,
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
      index: true,
    },
    videos: [VideoSchema],
    source: {
      type: String,
      default: "youtube",
    },
  },
  { timestamps: true }
);

// ⛔ cegah duplikasi cache
UstadzVideoSchema.index({ ustadzSlug: 1, date: 1 }, { unique: true });

export default mongoose.models.UstadzVideo ||
  mongoose.model("UstadzVideo", UstadzVideoSchema);
