import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { Otp } from '../models/OtpModel.js';
import { User} from "../models/userModel.js";

const router  = express.Router()

const otpStore = {};

// Setup email transporter
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "variableverse@gmail.com",
    pass: "dkkc jqrk hjcn rigj",
  },
})
router.post("/signup", async (req, res) => {
    const { username, email, password } = req.body;
  
    try {
      // Check if user already exists
      const user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ message: "User already exists" });
      }
  
      // Hash the password
      const hashedPass = await bcrypt.hash(password, 10);
  
      // Generate OTP
      const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
  
      // Store OTP in database
      const otpRecord = new Otp({
        email,
        otp,
        expiresAt,
        username,
        hashedPassword: hashedPass,
      });
  
      await otpRecord.save();
  
      // Send OTP via email
      await transporter.sendMail({
        to: email,
        subject: "Email Verification",
        text: `Your OTP for email verification is: ${otp}`,
      });
  
      return res.json({ status: true, message: "OTP sent to email." });
    } catch (error) {
      console.error("Error during signup:", error);
      return res.status(500).json({ message: "Failed to send OTP." });
    }
  });

  router.post("/verify-otp", async (req, res) => {
    const { email, otp } = req.body;
  
    try {
      // Retrieve OTP record from database
      const otpRecord = await Otp.findOne({ email });
      if (!otpRecord) {
        return res.status(400).json({ status: false, message: "Invalid email or OTP." });
      }
  
      // Check if OTP has expired
      if (otpRecord.expiresAt < Date.now()) {
        await Otp.deleteOne({ email }); // Clean up expired OTP
        return res.status(400).json({ status: false, message: "OTP expired." });
      }
  
      // Check if OTP is correct
      if (otpRecord.otp !== parseInt(otp, 10)) {
        return res.status(400).json({ status: false, message: "Incorrect OTP." });
      }
  
      // Create user after successful OTP verification
      const newUser = new User({
        username: otpRecord.username,
        email,
        password: otpRecord.hashedPassword,
        isVerified: true,
      });
  
      await newUser.save();
  
      // Delete OTP record from database after successful verification
      await Otp.deleteOne({ email });
  
      return res.json({ status: true, message: "Email verified, account created!" });
    } catch (error) {
      console.error("Error during OTP verification:", error);
      return res.status(500).json({ message: "Failed to verify OTP." });
    }
  });
  
    
  router.post("/signin", async (req, res) => {
    const { email, password } = req.body;
  
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: "User does not exist" });
    }
  
    if (!user.isVerified) {
      return res.json({ message: "Please verify your email before signing in." });
    }
  
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.json({ message: "Password is incorrect!" });
    }
  
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.KEY,
      { expiresIn: "3h" }
    );
  
    res.cookie("token", token, { httpOnly: true, maxAge: 720000 });
    return res.json({ status: true, message: "Login successfully" });
  });
  
const verifyUser =async (req,res,next)=>{
    try {
        const token = req.cookies.token;
   if (!token) {
    return res.json({ status: false , message: 'Auth failed' });
   } 
   const decoded =await jwt.verify(token, process.env.KEY);
   req.user = decoded;
   next()
    } catch (error) {
        
    }
   
}
router.get("/", verifyUser, async (req, res) => {
    try {
      // If user is authenticated, send their details
      return res.json({ status: true, user: req.user });
    } catch (error) {
      return res.status(500).json({ status: false, message: "Error fetching user details" });
    }
  });

  router.post("/logout", (req, res) => {
    res.clearCookie('token', { httpOnly: true, secure: true, sameSite: 'strict' });
    return res.json({ status: true, message: 'Logged out Successfully!' });
  });
export {router as UserRouter}
export {verifyUser}