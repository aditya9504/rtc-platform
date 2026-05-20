const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  code: { type: String, default: '// Start coding here...' },
  language: { type: String, default: 'javascript' },
  isActive: { type: Boolean, default: true },
  roomId: { type: String, unique: true },
}, { timestamps: true });

sessionSchema.pre('save', function (next) {
  if (!this.roomId) {
    this.roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  next();
});

module.exports = mongoose.model('Session', sessionSchema);
