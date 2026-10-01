import mongoose from 'mongoose';
import { modelOptions } from './shared.js';

const reportSchema = new mongoose.Schema({
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true }, targetType: { type: String, enum: ['user', 'task', 'class', 'message', 'review'], required: true }, targetId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true }, reason: { type: String, required: true, trim: true, maxlength: 1000 }, details: { type: String, trim: true, maxlength: 5000 },
  status: { type: String, enum: ['open', 'in_review', 'resolved', 'dismissed'], default: 'open', index: true }, resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, resolvedAt: Date,
}, modelOptions());
reportSchema.index({ targetType: 1, targetId: 1, status: 1 });
export default mongoose.model('Report', reportSchema);
