const Appointment = require("../models/Appointment");
const User = require("../models/User");

// @route   POST /api/appointments
// @desc    Book a new appointment (logged-in patient)
// @access  Private (patient)
async function createAppointment(req, res, next) {
  try {
    const { doctor, date, time, reason } = req.body;

    if (!doctor || !date || !time) {
      return res.status(400).json({ message: "doctor, date and time are required" });
    }

    const doctorExists = await User.findOne({ _id: doctor, role: "doctor" });
    if (!doctorExists) {
      return res.status(404).json({ message: "Selected doctor was not found" });
    }

    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor,
      date,
      time,
      reason: reason || "",
    });

    const populated = await appointment.populate("doctor", "name department specialization avatarColor");

    res.status(201).json({ appointment: populated });
  } catch (err) {
    // Duplicate key = slot already booked
    if (err.code === 11000) {
      return res.status(409).json({ message: "That time slot was just booked by someone else. Please pick another." });
    }
    next(err);
  }
}

// @route   GET /api/appointments/me
// @desc    Get the logged-in patient's own appointments
// @access  Private (patient)
async function getMyAppointments(req, res, next) {
  try {
    const appointments = await Appointment.find({ patient: req.user._id })
      .populate("doctor", "name department specialization avatarColor")
      .sort({ date: 1, time: 1 });
    res.json({ appointments });
  } catch (err) {
    next(err);
  }
}

// @route   GET /api/appointments/doctor/me
// @desc    Get appointments for the logged-in doctor
// @access  Private (doctor)
async function getDoctorAppointments(req, res, next) {
  try {
    const appointments = await Appointment.find({ doctor: req.user._id })
      .populate("patient", "name email phone")
      .sort({ date: 1, time: 1 });
    res.json({ appointments });
  } catch (err) {
    next(err);
  }
}

// @route   GET /api/appointments
// @desc    Get ALL appointments (admin only), with optional filters
// @access  Private (admin)
async function getAllAppointments(req, res, next) {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.doctor) filter.doctor = req.query.doctor;
    if (req.query.date) filter.date = req.query.date;

    const appointments = await Appointment.find(filter)
      .populate("doctor", "name department specialization avatarColor")
      .populate("patient", "name email phone")
      .sort({ date: 1, time: 1 });

    res.json({ appointments });
  } catch (err) {
    next(err);
  }
}

// @route   PATCH /api/appointments/:id/status
// @desc    Update appointment status (completed / cancelled)
// @access  Private (doctor, admin) or the owning patient (cancel only)
async function updateAppointmentStatus(req, res, next) {
  try {
    const { status, notes } = req.body;
    const validStatuses = ["confirmed", "completed", "cancelled"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Status must be one of: ${validStatuses.join(", ")}` });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const isOwner = appointment.patient.toString() === req.user._id.toString();
    const isStaff = ["doctor", "admin"].includes(req.user.role);

    // Patients may only cancel their own appointment, not mark it completed
    if (isOwner && !isStaff && status !== "cancelled") {
      return res.status(403).json({ message: "Patients can only cancel their own appointments" });
    }

    if (!isOwner && !isStaff) {
      return res.status(403).json({ message: "You are not authorized to update this appointment" });
    }

    appointment.status = status;
    if (notes !== undefined) appointment.notes = notes;
    await appointment.save();

    res.json({ appointment });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createAppointment,
  getMyAppointments,
  getDoctorAppointments,
  getAllAppointments,
  updateAppointmentStatus,
};
