import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Sessions", // Reference to the Sessions model
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User model
    required: true,
  },
  status: {
    type: String,
    enum: ["Present", "Absent"],
    default: "Present", // Defaults to present when marking attendance
  },
  date: {
    type: Date,
    default: Date.now, // Automatically set to current date
  },
});

const Attendance = mongoose.model("Attendance", attendanceSchema);

export { Attendance };
