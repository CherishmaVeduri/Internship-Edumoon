const express = require("express");
const router = express.Router();
const {
  createDoctor,
  setAvailability,
  getDoctorWeeklyAvailability,
  getPatients,
  deactivateUser,
} = require("../controllers/adminController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

router.use(protect, restrictTo("admin")); // every route below requires an admin

router.post("/doctors", createDoctor);
router.put("/availability", setAvailability);
router.get("/availability/:doctorId", getDoctorWeeklyAvailability);
router.get("/patients", getPatients);
router.patch("/users/:id/deactivate", deactivateUser);

module.exports = router;
