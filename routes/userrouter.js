import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { Otp } from '../models/OtpModel.js';
import { User} from "../models/userModel.js";
import { Batch } from "../models/batchModel.js";
import { Session } from "../models/classModel.js";
import { Attendance } from "../models/attendanceSchema.js";
const router  = express.Router()


// Setup email transporter
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "variableverse@gmail.com",
    pass: "dkkc jqrk hjcn rigj",
  }
})
router.get('/batches', async (req, res) => {
  try {
    const batches = await Batch.find();
    res.json(batches);
  } catch (error) {
    console.error('Error fetching batches:', error);
    res.status(500).json({ error: 'Failed to fetch batches' });
  }
});
router.get('/batches/:batchId', async (req, res) => {
  try {
    const batchId = req.params.batchId;
    console.log(batchId)
    const batch = await Batch.findById(batchId);
    if (!batch) return res.status(404).json({ message: 'Batch not found' });
    res.json(batch);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching batch details' });
  }
});
router.post("/classes", async (req, res) => {
  const { title, description, thumbnailUrl, joinLink, date } = req.body;

  try {
    const newClass = new Session({
      title,
      description,
      thumbnailUrl,
      joinLink,
      date,
    });

    await newClass.save();
    res.status(201).json({ message: "Class added successfully", class: newClass });
  } catch (error) {
    console.error("Error adding class:", error);
    res.status(500).json({ message: "Failed to add class" });
  }
});
router.get('/classes/this-week', async (req, res) => {
  try {
    const today = new Date();
    
    // Calculate 3 days before today
    const threeDaysEarlier = new Date(today);
    threeDaysEarlier.setDate(today.getDate() - 3);

    // Calculate 7 days after today
    const sevenDaysLater = new Date(today);
    sevenDaysLater.setDate(today.getDate() + 7);

    // Log the range to debug
    console.log('Three Days Earlier:', threeDaysEarlier.toISOString());
    console.log('Seven Days Later:', sevenDaysLater.toISOString());

    // Query the database for classes within the specified range
    const classes = await Session.find({
      date: {
        $gte: threeDaysEarlier, // Start from 3 days before today
        $lte: sevenDaysLater,   // Up to 7 days from now
      },
    }).sort({ date: 1 }); // Sort by date in ascending order

    res.json(classes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching classes' });
  }
});



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
  
  router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
  
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }
  
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000); // Generates a 6-digit OTP
    const expiresAt = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes
  
    // Store OTP in database
    const otpRecord = new Otp({
      email,
      otp,
      expiresAt,
    });
    await otpRecord.save();
  
    // Send OTP to user's email
    const mailOptions = {
      from: 'variableverse@gmail.com', // Your email address
      to: email,
      subject: 'Password Reset OTP',
      text: `Your OTP for password reset is: ${otp}`,
    };
  
    try {
      await transporter.sendMail(mailOptions);
      return res.status(200).json({ message: 'OTP sent to email' });
    } catch (error) {
      return res.status(500).json({ message: 'Error sending OTP' });
    }
  });
  router.post('/reset-password', async (req, res) => {
    const { email, otp, newPassword } = req.body;
  
    try {
      // Retrieve OTP record from database
      const otpRecord = await Otp.findOne({ email });
      if (!otpRecord) {
        return res.status(400).json({ message: 'Invalid OTP or email' });
      }
  
      // Check if OTP has expired
      if (otpRecord.expiresAt < Date.now()) {
        await Otp.deleteOne({ email }); // Clean up expired OTP
        return res.status(400).json({ message: 'OTP expired' });
      }
  
      // Check if OTP is correct
      if (otpRecord.otp !== parseInt(otp, 10)) {
        return res.status(400).json({ message: 'Incorrect OTP' });
      }
  
      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
  
      // Update the user's password
      const user = await User.findOneAndUpdate({ email }, { password: hashedPassword });
      if (!user) {
        return res.status(400).json({ message: 'User not found' });
      }
  
      // Delete OTP record after successful password reset
      await Otp.deleteOne({ email });
  
      return res.status(200).json({ message: 'Password successfully reset' });
    } catch (error) {
      console.error("Error resetting password:", error);
      return res.status(500).json({ message: 'Failed to reset password' });
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
  
    res.cookie("token", token, { httpOnly: true, maxAge: 720000, expires:"10h" });
    return res.json({ status: true, message: "Login successfully" });
  });
  
var verifyUser =async (req,res,next)=>{
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
router.post("/mark-attendance", verifyUser,async (req, res) => {
  const { classId } = req.body;
  const userId = req.user.id; // Assuming user authentication middleware is in place

  try {
    // Ensure the class exists
    const session = await Session.findById(classId);
    if (!session) {
      return res.status(404).json({ message: "Class not found" });
    }

    // Check if attendance already exists for this user and class
    const existingAttendance = await Attendance.findOne({ classId, userId });
    if (existingAttendance) {
      return res.status(400).json({ message: "Attendance already marked for this class." });
    }

    // Create and save new attendance
    const newAttendance = new Attendance({
      classId,
      userId,
      status: "Present",
    });

    await newAttendance.save();
    res.status(200).json({ message: "Attendance marked successfully!" });
  } catch (error) {
    console.error("Error marking attendance:", error);
    res.status(500).json({ message: "Failed to mark attendance." });
  }
});
router.get("/attendance", verifyUser, async (req, res) => {
  const userId = req.user.id; // Assuming user authentication middleware is in place

  try {
    // Fetch attendance records for the user
    const sessions = await Session.find();
    const attendanceRecords = await Attendance.find({ userId }).populate("classId");

    // Check if attendance records exist
    if (!attendanceRecords || attendanceRecords.length === 0) {
      return res.status(404).json({ message: "No attendance records found." });
    }

    res.status(200).json({ attendanceRecords ,sessions});
  } catch (error) {
    console.error("Error fetching attendance records:", error);
    res.status(500).json({ message: "Failed to fetch attendance records." });
  }
});
// router.put("/updateProfile", verifyUser, async (req, res) => {
//   try {
//     const userId = req.user.id; // Assuming `verifyUser` middleware sets `req.user`
//     const { gender, dob, education, skills, phone, about, interest } = req.body;

//     // Build the update object
//     const updateData = {};

//     if (gender) updateData.gender = gender;
//     if (dob) updateData.dob = dob;
//     if (education) updateData.education = education;
//     if (skills) updateData.skills = Array.isArray(skills) ? skills : skills.split(",").map(skill => skill.trim());
//     if (phone) updateData.phone = phone;
//     if (about) updateData.about = about;
//     if (interest) updateData.interest = interest;

//     // Update the user in the database
//     const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });

//     if (!updatedUser) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     res.status(200).json({ message: "Profile updated successfully", user: updatedUser });
//   } catch (error) {
//     console.error("Error updating profile:", error);
//     res.status(500).json({ message: "An error occurred while updating the profile" });
//   }
// });
router.put("/updateProfile", verifyUser, async (req, res) => {
  try {
    const userId = req.user.id; // Assuming `verifyUser` middleware sets `req.user`
    const { gender, dob, education, skills, phone, about, interest, currentBatch } = req.body;

    // Build the update object
    const updateData = {};

    if (gender) updateData.gender = gender;
    if (dob) updateData.dob = dob;
    if (education) updateData.education = education;
    if (skills) updateData.skills = Array.isArray(skills) ? skills : skills.split(",").map(skill => skill.trim());
    if (phone) updateData.phone = phone;
    if (about) updateData.about = about;
    if (interest) updateData.interest = interest;

    // Validate and update currentBatch
    if (currentBatch) {
      const batch = await Batch.findById(currentBatch); // Find the batch by ID
      if (!batch) {
        return res.status(400).json({ message: "Invalid batch ID provided" });
      }
      updateData.currentBatch = currentBatch; // Update currentBatch if valid
    }

    // Update the user in the database
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true }).populate('currentBatch');

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "An error occurred while updating the profile" });
  }
});


router.get("/", verifyUser, async (req, res) => {
  try {
    // Ensure user details exist after middleware verification
    if (!req.user) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized: No user details found",
      });
    }
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    // If authenticated, send user details
    return res.json({
      status: true,
      message: "User details fetched successfully",
      user: user,
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    return res.status(500).json({
      status: false,
      message: "Error fetching user details",
    });
  }
});

  router.get('/getProfile', verifyUser, async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ message: 'User not found' });
      res.status(200).json({ user });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({ message: 'Error fetching profile' });
    }
  });
  
  router.post("/logout", (req, res) => {
    
    console.log(res.cookie())
    res.clearCookie('token', { httpOnly: true, secure: true, sameSite: 'strict' });
    

    return res.json({ status: true, message: 'Logged out Successfully!' });
  });
export {router as UserRouter}
export {verifyUser}