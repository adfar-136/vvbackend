import mongoose from "mongoose";

const batchSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  startDate: { type: Date },
  endDate: { type: Date },
}, {
  timestamps: true,
});

const BatchModel = mongoose.model('Batch', batchSchema);

export {BatchModel as Batch}