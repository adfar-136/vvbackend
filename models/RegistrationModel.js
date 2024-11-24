import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  goal: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
});

let Registration= mongoose.model("Registration", registrationSchema);

export { Registration };