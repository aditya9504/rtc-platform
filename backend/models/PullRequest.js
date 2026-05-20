const mongoose = require('mongoose');

const prCommentSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  content: { type: String, required: true },
  line: { type: Number },
  createdAt: { type: Date, default: Date.now },
});

const pullRequestSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reviewers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: {
    type: String,
    enum: ['open', 'merged', 'closed', 'draft'],
    default: 'open',
  },
  sourceCode: { type: String },
  targetCode: { type: String },
  language: { type: String, default: 'javascript' },
  comments: [prCommentSchema],
  additions: { type: Number, default: 0 },
  deletions: { type: Number, default: 0 },
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session' },
}, { timestamps: true });

module.exports = mongoose.model('PullRequest', pullRequestSchema);
