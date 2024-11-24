import mongoose from 'mongoose';

const DocSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: {
    name: { type: String, required: true },
    image: { type: String, required: true },
  },
  date: { type: Date, default: Date.now },
  content: [{ type: String, required: true }], // Array of strings for content
  codeSnippets: [
    {
      code: { type: String, required: true },
      language: { type: String, required: true },
    },
  ],
  images: [
    {
      url: { type: String, required: true },
      altText: { type: String, required: true },
    },
  ],
  tags: [{ type: String }], // Added tags as an array of strings
});

let DocsModel = mongoose.model('Doc', DocSchema);

export { DocsModel };
