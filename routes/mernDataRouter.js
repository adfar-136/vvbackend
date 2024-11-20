import express from "express";
import { MernData } from "../models/moduleMern.js";// Import the module model
const router = express.Router();

// Endpoint to get all modules and topics
router.get("/modules", async (req, res) => {
  try {
    const modules = await MernData.find(); // Fetch all modules
    res.json(modules); // Return the modules as JSON
  } catch (error) {
    console.error("Error fetching modules:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export {router as MernDataRouter}
