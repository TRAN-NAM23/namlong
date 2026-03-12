const express = require('express');
const router = express.Router();
const SchemaModel = require('../models/Schema');

// very simple CRUD just to demonstrate connection

// GET all documents in Schema collection
router.get('/', async (req, res) => {
  try {
    const docs = await SchemaModel.find().limit(50).exec();
    res.json(docs);
  } catch (err) {
    console.error('Error reading Schema collection:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// POST a new document
router.post('/', async (req, res) => {
  try {
    const doc = new SchemaModel(req.body);
    const saved = await doc.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('Error saving Schema document:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

module.exports = router;
