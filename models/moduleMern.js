import mongoose from "mongoose";

// Topic Schema
const topicSchema = new mongoose.Schema({
  classNumber: { type: Number, required: true },
  topicName: { type: String, required: true },
  youtubeLink: { type: String, required: true },
});

// Module Schema
const moduleSchema = new mongoose.Schema({
  moduleName: { type: String, required: true },
  topics: [topicSchema], // Embedded topics array
});

// Module Model
const MernDataModule = mongoose.model("Module", moduleSchema);

export  {MernDataModule as MernData}; 
