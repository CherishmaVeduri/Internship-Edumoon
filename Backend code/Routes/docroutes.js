const express = require("express");
const router = express.Router();
const { getDoctors, getDoctorById, getDoctorAvailability } = require("../controllers/doctorController");

router.get("/", getDoctors);
router.get("/:id", getDoctorById);
router.get("/:id/availability", getDoctorAvailability);

module.exports = router;
