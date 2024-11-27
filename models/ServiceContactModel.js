// models/ServiceContact.js
import mongoose from "mongoose";

const serviceContactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
  },
  service: {
    type: String,
    required: true,
    enum: [
        'Personalized Mentorship',
        'Custom Website Development',
        'Brand Strategy & Development',
        'Expert Interview Preparation',
        'Interactive Live Classes',
        'Tailored Solutions (Custom Requests)'
      ]
      ,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

let ServiceContact= mongoose.model('ServiceContact', serviceContactSchema);
export {ServiceContact}
