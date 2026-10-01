import { Server } from 'socket.io';
import admin, { firebaseAdminConfigured } from '../config/firebaseAdmin.js';
import User from '../models/User.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';

export function configureSockets(httpServer, clientUrl) {
  const io = new Server(httpServer, { cors: { origin: clientUrl, credentials: true } });
  io.use(async (socket, next) => {
    try {
      if (!firebaseAdminConfigured) return next(new Error('Firebase Admin is not configured.'));
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication token is required.'));
      const decoded = await admin.auth().verifyIdToken(token);
      const user = await User.findOne({ firebaseUid: decoded.uid, isActive: true });
      if (!user) return next(new Error('User profile not found.'));
      socket.user = user;
      return next();
    } catch { return next(new Error('Invalid authentication token.')); }
  });

  io.on('connection', (socket) => {
    socket.on('join_conversation', async ({ conversationId }, acknowledge) => {
      try {
        const conversation = await Conversation.findOne({ _id: conversationId, participants: socket.user._id });
        if (!conversation) throw new Error('Conversation not found.');
        socket.join(`conversation:${conversation.id}`);
        acknowledge?.({ ok: true });
      } catch (error) { acknowledge?.({ ok: false, message: error.message }); }
    });

    socket.on('send_message', async ({ conversationId, content }, acknowledge) => {
      try {
        const trimmed = content?.trim();
        if (!trimmed || trimmed.length > 5000) throw new Error('Messages must contain 1–5000 characters.');
        const conversation = await Conversation.findOne({ _id: conversationId, participants: socket.user._id });
        if (!conversation) throw new Error('Conversation not found.');
        const message = await Message.create({ conversation: conversation._id, sender: socket.user._id, content: trimmed });
        conversation.lastMessageAt = message.createdAt; conversation.lastMessagePreview = trimmed.slice(0, 300); await conversation.save();
        const payload = await Message.findById(message._id).populate('sender', 'name avatar').lean();
        io.to(`conversation:${conversation.id}`).emit('message_created', payload);
        acknowledge?.({ ok: true, message: payload });
      } catch (error) { acknowledge?.({ ok: false, message: error.message }); }
    });

    socket.on('typing', async ({ conversationId, isTyping }) => {
      const conversation = await Conversation.exists({ _id: conversationId, participants: socket.user._id });
      if (conversation) socket.to(`conversation:${conversationId}`).emit('typing_changed', { userId: socket.user.id, isTyping: Boolean(isTyping) });
    });
  });
  return io;
}
