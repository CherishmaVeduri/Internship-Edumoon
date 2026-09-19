const User = require("../models/User");
const Availability = require("../models/Availability");
const Appointment = require("../models/Appointment");

// @route   GET /api/doctors
// @desc    List all doctors, optionally filtered by department
// @access  Public
async function getDoctors(req, res, next) {
  try {
    const filter = { role: "doctor", isActive: true };
    if (req.query.department) {
      filter.department = req.query.department;
    }
    const doctors = await User.find(filter).select("name email department specialization bio avatarColor");
    res.json({ doctors });
  } catch (err) {
    next(err);
  }
}

// @route   GET /api/doctors/:id
// @desc    Get a single doctor's profile
// @access  Public
async function getDoctorById(req, res, next) {
  try {
    const doctor = await User.findOne({ _id: req.params.id, role: "doctor" }).select(
      "name email department specialization bio avatarColor"
    );
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    res.json({ doctor });
  } catch (err) {
    next(err);
  }
}

// @route   GET /api/doctors/:id/availability?date=YYYY-MM-DD
// @desc    Get a doctor's available time slots for a specific date
// @access  Public
async function getDoctorAvailability(req, res, next) {
  try {
    const { id } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: "A date query parameter (YYYY-MM-DD) is required" });
    }

    const dayOfWeek = new Date(date + "T00:00:00").getDay();

    const availability = await Availability.findOne({ doctor: id, dayOfWeek });
    const allSlots = availability ? availability.slots : [];

    const bookedAppointments = await Appointment.find({
      doctor: id,
      date,
      status: { $ne: "cancelled" },
    }).select("time");

    const bookedTimes = new Set(bookedAppointments.map((a) => a.time));
    const freeSlots = allSlots.filter((slot) => !bookedTimes.has(slot));

    res.json({ date, allSlots, freeSlots, bookedSlots: Array.from(bookedTimes) });
  } catch (err) {
    next(err);
  }
}

module.exports = { getDoctors, getDoctorById, getDoctorAvailability };
