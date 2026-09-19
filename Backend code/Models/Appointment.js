const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: String, // stored as "YYYY-MM-DD" for easy querying
      required: true,
    },
    time: {
      type: String, // "HH:mm"
      required: true,
    },
    reason: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["confirmed", "completed", "cancelled"],
      default: "confirmed",
    },
    notes: {
      type: String, // doctor/admin notes after the visit
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

// Prevent double-booking the same doctor at the same date/time
appointmentSchema.index({ doctor: 1, date: 1, time: 1 }, { unique: true, partialFilterExpression: { status: { $ne: "cancelled" } } });

module.exports = mongoose.model("Appointment", appointmentSchema);
