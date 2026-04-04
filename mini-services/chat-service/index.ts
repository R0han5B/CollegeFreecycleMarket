import { Server } from 'socket.io';

const PORT = 3003;
const io = new Server(PORT, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

console.log(`🚀 Chat service running on port ${PORT}`);

// Store user sessions: { socketId: userId }
const userSessions = new Map<string, string>();

io.on('connection', (socket) => {
  console.log(`✅ Client connected: ${socket.id}`);

  // User joins chat
  socket.on('user:join', (userId: string) => {
    console.log(`👤 User ${userId} joined with socket ${socket.id}`);
    userSessions.set(socket.id, userId);

    // Join user's personal room for direct messages
    socket.join(`user:${userId}`);
  });

  // Send message to specific user
  socket.on('message:send', (data: {
    messageId: string;
    senderId: string;
    receiverId: string;
    itemId: string;
    content: string | null;
    imageUrl: string | null;
    createdAt: string;
  }) => {
    console.log(`💬 Message from ${data.senderId} to ${data.receiverId}`);

    // Send to receiver's room
    io.to(`user:${data.receiverId}`).emit('message:receive', data);

    // Also send back to sender for confirmation
    socket.emit('message:receive', data);
  });

  // Mark message as read
  socket.on('message:read', (data: { messageId: string; userId: string }) => {
    console.log(`📖 Message ${data.messageId} read by ${data.userId}`);
    // Notify sender that message was read
    io.to(`user:${data.userId}`).emit('message:read', data);
  });

  // User typing indicator
  socket.on('typing:start', (data: { senderId: string; receiverId: string }) => {
    io.to(`user:${data.receiverId}`).emit('typing:start', { senderId: data.senderId });
  });

  socket.on('typing:stop', (data: { senderId: string; receiverId: string }) => {
    io.to(`user:${data.receiverId}`).emit('typing:stop', { senderId: data.senderId });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    const userId = userSessions.get(socket.id);
    if (userId) {
      console.log(`❌ User ${userId} disconnected`);
      userSessions.delete(socket.id);
    }
  });
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down chat service...');
  io.close();
  process.exit(0);
});
