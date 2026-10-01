import mongoose from 'mongoose';
import { modelOptions } from './shared.js';

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true }, type: { type: String, required: true, trim: true, maxlength: 80 }, title: { type: String, required: true, trim: true, maxlength: 160 }, body: { type: String, trim: true, maxlength: 1000 },
  resourceType: { type: String, trim: true }, resourceId: { type: mongoose.Schema.Types.ObjectId }, isRead: { type: Boolean, default: false, index: true }, readAt: Date,
}, modelOptions());
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });
export default mongoose.model('Notification', notificationSchema);
