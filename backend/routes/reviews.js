const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Review = require('../models/Review');

router.get('/', auth, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { $or: [{ author: req.user._id }, { reviewer: req.user._id }] };
    if (status) filter.status = status;
    const reviews = await Review.find(filter)
      .populate('author', 'username avatar')
      .populate('reviewer', 'username avatar')
      .populate('comments.author', 'username avatar')
      .sort({ updatedAt: -1 });
    res.json({ reviews });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const review = new Review({ ...req.body, author: req.user._id });
    await review.save();
    await review.populate('author', 'username avatar');
    res.status(201).json({ review });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('author', 'username avatar')
      .populate('reviewer', 'username avatar')
      .populate('comments.author', 'username avatar');
    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.json({ review });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('author', 'username avatar')
      .populate('reviewer', 'username avatar');
    res.json({ review });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/comments', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    review.comments.push({ author: req.user._id, content: req.body.content, line: req.body.line });
    await review.save();
    await review.populate('comments.author', 'username avatar');
    res.json({ review });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
