import mongoose from 'mongoose';

const classSchema = new mongoose.Schema({
  title: String,
  description: String,
  thumbnailUrl: String,
  joinLink: String,
  date: { type: Date, required: true },
});

const Session = mongoose.model('Sessions', classSchema);
export { Session };
