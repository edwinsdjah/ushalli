import mongoose from "mongoose";

const PrayerTimesSchedule = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    date: { type: String, required: true }, // simpan format ISO atau YYYY-MM-DD
    timezone: { type: String },
    location: {
      lat: Number,
      lon: Number,
      name: String,
    },
    timings: {
      fajr: String,
      dhuhr: String,
      asr: String,
      maghrib: String,
      isha: String,
      sunrise: String,
    },
    timingsEpoch: {
      fajr: Number,
      dhuhr: Number,
      asr: Number,
      maghrib: Number,
      isha: Number,
    },
    notificationsSent: {
      fajr: { type: Boolean, default: false },
      dhuhr: { type: Boolean, default: false },
      asr: { type: Boolean, default: false },
      maghrib: { type: Boolean, default: false },
      isha: { type: Boolean, default: false },
    },
    source: { type: String }, // mis. "aladhan"
    createdAt: { type: Date, default: () => new Date() },
  },
  {
    versionKey: false,
  }
);

export default mongoose.models.PrayerTimes ||
  mongoose.model("PrayerTimes", PrayerTimesSchedule);
