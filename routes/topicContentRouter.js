import express from 'express';
import TopicContent from '../models/topicContentModel.js';

const router = express.Router();

// Fetch all topic content
router.get('/topic', async (req, res) => {
  try {
    const content = await TopicContent.find();
    res.status(200).json(content);
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({ message: 'Error fetching content' });
  }
});

// Create a new topic content
router.post('/topic', async (req, res) => {
  const {
    title,
    introduction,
    definitions,
    images,
    codeSnippets,
    additionalNotes,
  } = req.body;

  try {
    const newTopicContent = new TopicContent({
      title,
      introduction,
      definitions,
      images,
      codeSnippets,
      additionalNotes,
    });

    await newTopicContent.save();
    res.status(201).json(newTopicContent);
  } catch (error) {
    console.error('Error creating content:', error);
    res.status(500).json({ message: 'Error creating content' });
  }
});

export  {router as TopicContentRouter};
