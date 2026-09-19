const mongoose = require("mongoose");

// Defines which time slots a doctor offers on which weekday.
// e.g. { doctor: ..., dayOfWeek: 1 (Monday), slots: ["09:00","09:30",...] }
const availabilitySchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    dayOfWeek: {
      type: Number, // 0 = Sunday ... 6 = Saturday
      required: true,
      min: 0,
      max: 6,
    },
    slots: {
      type: [String], // ["09:00", "09:30", ...]
      default: [],
    },
  },
  { timestamps: true }
);

availabilitySchema.index({ doctor: 1, dayOfWeek: 1 }, { unique: true });

module.exports = mongoose.model("Availability", availabilitySchema);
