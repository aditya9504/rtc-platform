const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const PullRequest = require('../models/PullRequest');

router.get('/', auth, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { $or: [{ author: req.user._id }, { reviewers: req.user._id }] };
    if (status) filter.status = status;
    const prs = await PullRequest.find(filter)
      .populate('author', 'username avatar')
      .populate('reviewers', 'username avatar')
      .sort({ updatedAt: -1 });
    res.json({ pullRequests: prs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const pr = new PullRequest({ ...req.body, author: req.user._id });
    await pr.save();
    await pr.populate('author', 'username avatar');
    res.status(201).json({ pullRequest: pr });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const pr = await PullRequest.findById(req.params.id)
      .populate('author', 'username avatar')
      .populate('reviewers', 'username avatar')
      .populate('comments.author', 'username avatar');
    if (!pr) return res.status(404).json({ message: 'PR not found' });
    res.json({ pullRequest: pr });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const pr = await PullRequest.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('author', 'username avatar')
      .populate('reviewers', 'username avatar');
    res.json({ pullRequest: pr });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/comments', auth, async (req, res) => {
  try {
    const pr = await PullRequest.findById(req.params.id);
    pr.comments.push({ author: req.user._id, content: req.body.content, line: req.body.line });
    await pr.save();
    await pr.populate('comments.author', 'username avatar');
    res.json({ pullRequest: pr });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
