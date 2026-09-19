const express = require("express");
const router = express.Router();
const {
  createAppointment,
  getMyAppointments,
  getDoctorAppointments,
  getAllAppointments,
  updateAppointmentStatus,
} = require("../controllers/appointmentController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

router.use(protect); // every appointment route requires login

router.post("/", restrictTo("patient"), createAppointment);
router.get("/me", restrictTo("patient"), getMyAppointments);
router.get("/doctor/me", restrictTo("doctor"), getDoctorAppointments);
router.get("/", restrictTo("admin"), getAllAppointments);
router.patch("/:id/status", updateAppointmentStatus); // permission logic handled inside controller

module.exports = router;
