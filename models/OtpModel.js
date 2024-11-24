import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  otp: {
    type: Number,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  username: {
    type: String,
    
  },
  hashedPassword: {
    type: String,
   
  },
});

const Otp = mongoose.model('Otp', otpSchema);

export { Otp };
