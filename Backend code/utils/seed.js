// Run with: npm run seed
// Populates the database with a sample admin, doctors, and weekly availability
// so you have something to test against immediately.

require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const Availability = require("../models/Availability");

const DOCTORS = [
  { name: "Dr. Amara Okafor", email: "amara.okafor@harborview.com", department: "Cardiology", specialization: "Heart & vascular health", avatarColor: "#2F6B5E" },
  { name: "Dr. Wei Lin", email: "wei.lin@harborview.com", department: "Dermatology", specialization: "Skin conditions", avatarColor: "#B5562F" },
  { name: "Dr. Sofia Mendez", email: "sofia.mendez@harborview.com", department: "Pediatrics", specialization: "Child healthcare", avatarColor: "#3B6E8C" },
  { name: "Dr. Daniel Cohen", email: "daniel.cohen@harborview.com", department: "Orthopedics", specialization: "Bones & joints", avatarColor: "#6B5B95" },
  { name: "Dr. Priya Nair", email: "priya.nair@harborview.com", department: "General Medicine", specialization: "Primary care", avatarColor: "#2F6B5E" },
];

const WEEKDAY_SLOTS = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"];

async function seed() {
  await connectDB();

  console.log("🌱 Seeding database...");

  // Clear existing demo data (only doctors/admin, not real patient data)
  await User.deleteMany({ role: { $in: ["doctor", "admin"] } });
  await Availability.deleteMany({});

  // Create admin
  const admin = await User.create({
    name: "Clinic Admin",
    email: "admin@harborview.com",
    password: "admin123",
    role: "admin",
  });
  console.log(`✅ Admin created: ${admin.email} / password: admin123`);

  // Create doctors + their Mon–Fri availability
  for (const docData of DOCTORS) {
    const doctor = await User.create({
      ...docData,
      password: "doctor123",
      role: "doctor",
    });

    // Monday (1) through Friday (5) get the same slot template
    for (let day = 1; day <= 5; day++) {
      await Availability.create({
        doctor: doctor._id,
        dayOfWeek: day,
        slots: WEEKDAY_SLOTS,
      });
    }

    console.log(`✅ Doctor created: ${doctor.name} (${doctor.email}) / password: doctor123`);
  }

  console.log("\n🎉 Seeding complete. You can now log in with any of the accounts above.");
  await mongoose.connection.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
