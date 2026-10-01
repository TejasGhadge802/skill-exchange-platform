import mongoose from 'mongoose';
import { modelOptions } from './shared.js';

const adminActionSchema = new mongoose.Schema({
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true }, action: { type: String, required: true, trim: true, maxlength: 100 }, targetType: { type: String, required: true, trim: true, maxlength: 80 }, targetId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true }, reason: { type: String, trim: true, maxlength: 2000 }, metadata: { type: mongoose.Schema.Types.Mixed },
}, modelOptions());
adminActionSchema.index({ targetType: 1, targetId: 1, createdAt: -1 });
export default mongoose.model('AdminAction', adminActionSchema);
