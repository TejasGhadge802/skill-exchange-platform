import mongoose from 'mongoose';
import { modelOptions } from './shared.js';

const messageSchema = new mongoose.Schema({
  conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true }, sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['text', 'system'], default: 'text' }, content: { type: String, required: true, trim: true, maxlength: 5000 }, readBy: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, readAt: { type: Date, default: Date.now } }],
}, modelOptions());
messageSchema.index({ conversation: 1, createdAt: -1 });
export default mongoose.model('Message', messageSchema);
