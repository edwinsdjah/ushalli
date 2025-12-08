import mongoose from "mongoose";

const SubscriptionSchema = new mongoose.Schema(
  {
    endpoint: {
      type: String,
      required: true,
      unique: true,
    },
    keys: {
      p256dh: { type: String },
      auth: { type: String },
    },
    // optional: associate with user later
    userId: { type: String, default: null },
    createdAt: { type: Date, default: () => new Date() },
    lastSeenAt: { type: Date, default: () => new Date() }, // update tiap ping
  },
  {
    versionKey: false,
  }
);

// Avoid model overwrite in dev (Next hot reload)
export default mongoose.models.Subscription ||
  mongoose.model("Subscription", SubscriptionSchema);
