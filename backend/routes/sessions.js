const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Session = require('../models/Session');

// GET all sessions for user
router.get('/', auth, async (req, res) => {
  try {
    const sessions = await Session.find({
      $or: [{ owner: req.user._id }, { participants: req.user._id }]
    }).populate('owner', 'username avatar').populate('participants', 'username avatar')
      .sort({ updatedAt: -1 }).limit(20);
    res.json({ sessions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create session
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, language, code } = req.body;
    const session = new Session({
      title,
      description,
      language: language || 'javascript',
      code: code || '// Start coding here...',
      owner: req.user._id,
      participants: [req.user._id],
    });
    await session.save();
    await session.populate('owner', 'username avatar');
    res.status(201).json({ session });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single session
router.get('/:id', auth, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('owner', 'username avatar email')
      .populate('participants', 'username avatar email');
    if (!session) return res.status(404).json({ message: 'Session not found' });
    res.json({ session });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update session code
router.put('/:id', auth, async (req, res) => {
  try {
    const session = await Session.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true }
    ).populate('owner', 'username avatar');
    res.json({ session });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE session
router.delete('/:id', auth, async (req, res) => {
  try {
    await Session.findByIdAndDelete(req.params.id);
    res.json({ message: 'Session deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
