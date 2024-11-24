import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      validate: {
        validator: (v) => /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v),
        message: "Invalid email format",
      },
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      default: "Other",
    },
    dob: {
      type: Date,
    },
    education: {
      type: String,
      trim: true,
    },
    skills: {
      type: [String],
      default: [],
    },
    phone: {
      type: String,
      validate: {
        validator: (v) => /^\+?\d{7,15}$/.test(v),
        message: "Invalid phone number format",
      },
    },
    about: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    interest: {
      type: String,
      trim: true,
    },
    currentBatch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch', // Reference to the Batch model
      default: "674185cae9c2cd9281cc5d4a"
    },
  
    role: {
      type: String,
      default: "Student",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const UserModel = mongoose.model("User", userSchema);
export { UserModel as User };
