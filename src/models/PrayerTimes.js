import mongoose from 'mongoose';

const PrayerTimesSchedule = new mongoose.Schema(
  {
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
      // tambahkan yang lain jika perlu
    },
    source: { type: String }, // mis. "aladhan"
    createdAt: { type: Date, default: () => new Date() },
  },
  {
    versionKey: false,
  }
);

export default mongoose.models.PrayerTimes ||
  mongoose.model('PrayerTimes', PrayerTimesSchema);
