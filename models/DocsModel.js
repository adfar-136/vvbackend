// models/Doc.js
import mongoose from 'mongoose';

const DocSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: {
    name: { type: String, required: true },
    image: { type: String, required: true },
  },
  date: { type: Date, default: Date.now },
  content: { type: String, required: true },
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
});
let DocsModel = new mongoose.model('Doc', DocSchema)

export {DocsModel};
