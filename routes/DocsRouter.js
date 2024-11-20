// routes/docRoutes.js
import express from 'express';
import {DocsModel} from '../models/DocsModel.js';

const router = express.Router();

// Get all documents
router.get('/', async (req, res) => {
  try {
    const docs = await DocsModel.find();
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a single document by ID
router.get('/:id', async (req, res) => {
  try {
    const doc = await DocsModel.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new document
router.post('/', async (req, res) => {
  const { title, author, content, codeSnippets, images } = req.body;
  const doc = new Doc({ title, author, content, codeSnippets, images });

  try {
    const newDoc = await doc.save();
    res.status(201).json(newDoc);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export  {router as DocsRouter};
