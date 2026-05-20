const jwt = require('jsonwebtoken');
const Session = require('../models/Session');

// Track active rooms: roomId -> { users: Map<socketId, userInfo> }
const rooms = new Map();

const setupSocket = (io) => {
  // Auth middleware for socket
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      socket.userId = decoded.userId;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id} (user: ${socket.userId})`);

    // Join a collaboration room
    socket.on('join-room', async ({ roomId, user }) => {
      socket.join(roomId);
      socket.currentRoom = roomId;
      socket.userInfo = user;

      if (!rooms.has(roomId)) rooms.set(roomId, { users: new Map() });
      rooms.get(roomId).users.set(socket.id, { ...user, socketId: socket.id, cursor: null });

      // Send current users to the new joiner
      const roomUsers = Array.from(rooms.get(roomId).users.values());
      socket.emit('room-users', roomUsers);

      // Notify others
      socket.to(roomId).emit('user-joined', { ...user, socketId: socket.id });

      // Load latest code from DB
      try {
        const session = await Session.findOne({ roomId });
        if (session) socket.emit('code-sync', { code: session.code, language: session.language });
      } catch (e) {
        console.error('Error loading session code:', e.message);
      }
    });

    // Real-time code change
    socket.on('code-change', ({ roomId, code, userId }) => {
      socket.to(roomId).emit('code-update', { code, userId });
    });

    // Cursor position sync
    socket.on('cursor-change', ({ roomId, cursor, userId, username }) => {
      socket.to(roomId).emit('cursor-update', { cursor, userId, username, socketId: socket.id });
    });

    // Language change
    socket.on('language-change', ({ roomId, language }) => {
      socket.to(roomId).emit('language-update', { language });
    });

    // Save code to DB periodically (triggered by client)
    socket.on('save-code', async ({ roomId, code, language }) => {
      try {
        await Session.findOneAndUpdate({ roomId }, { code, language }, { new: true });
        socket.emit('code-saved', { timestamp: new Date() });
      } catch (e) {
        socket.emit('save-error', { message: e.message });
      }
    });

    // Chat message in session
    socket.on('send-message', ({ roomId, message, user }) => {
      io.to(roomId).emit('new-message', { message, user, timestamp: new Date() });
    });

    // Disconnect
    socket.on('disconnect', () => {
      const roomId = socket.currentRoom;
      if (roomId && rooms.has(roomId)) {
        rooms.get(roomId).users.delete(socket.id);
        socket.to(roomId).emit('user-left', { socketId: socket.id, user: socket.userInfo });
        if (rooms.get(roomId).users.size === 0) rooms.delete(roomId);
      }
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });
};

module.exports = { setupSocket };
