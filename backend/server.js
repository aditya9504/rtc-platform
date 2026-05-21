const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const sessionRoutes = require('./routes/sessions');
const reviewRoutes = require('./routes/reviews');
const prRoutes = require('./routes/pullRequests');
const runRoutes = require('./routes/run');
const aiRoutes = require('./routes/ai');
const { setupSocket } = require('./socket/socketHandler');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

// Middleware
app.use(cors({
  origin: "https://rtc-platform.vercel.app",
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/pull-requests', prRoutes);
app.use('/api/run', runRoutes);
app.use('/api/ai', aiRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Socket.IO setup
setupSocket(io);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/rtc_platform')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
