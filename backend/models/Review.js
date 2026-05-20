const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  content: { type: String, required: true },
  line: { type: Number },
  createdAt: { type: Date, default: Date.now },
});

const reviewSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  code: { type: String, required: true },
  language: { type: String, default: 'javascript' },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: {
    type: String,
    enum: ['pending', 'in-review', 'approved', 'rejected', 'changes-requested'],
    default: 'pending',
  },
  comments: [commentSchema],
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session' },
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
