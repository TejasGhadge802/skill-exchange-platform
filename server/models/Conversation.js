import mongoose from 'mongoose';
import { modelOptions } from './shared.js';

const conversationSchema = new mongoose.Schema({
  application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true, unique: true }, task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true, index: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }], lastMessageAt: { type: Date, default: Date.now, index: true }, lastMessagePreview: { type: String, trim: true, maxlength: 300 },
}, modelOptions());
conversationSchema.index({ participants: 1, lastMessageAt: -1 });
export default mongoose.model('Conversation', conversationSchema);
