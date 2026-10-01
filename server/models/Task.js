import mongoose from 'mongoose';
import { modelOptions, taskStatuses } from './shared.js';

const attachmentSchema = new mongoose.Schema({ name: { type: String, required: true, trim: true }, url: { type: String, required: true, trim: true }, mimeType: { type: String, trim: true } }, { _id: false });
const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, minlength: 5, maxlength: 160 }, description: { type: String, required: true, trim: true, minlength: 20, maxlength: 10000 },
  category: { type: String, required: true, trim: true, index: true }, requiredSkills: [{ type: String, trim: true, maxlength: 80 }],
  budget: { min: { type: Number, min: 0 }, max: { type: Number, min: 0 }, isNegotiable: { type: Boolean, default: true } }, currency: { type: String, default: 'INR', uppercase: true, trim: true },
  expectedDuration: { value: { type: Number, min: 1 }, unit: { type: String, enum: ['hours', 'days', 'weeks', 'months'], default: 'days' } }, estimatedHours: { type: Number, min: 0 },
  startDate: Date, deadline: { type: Date, index: true }, location: { city: { type: String, trim: true }, state: { type: String, trim: true }, country: { type: String, trim: true }, address: { type: String, trim: true } },
  workMode: { type: String, enum: ['online', 'offline', 'hybrid'], required: true, index: true }, additionalRequirements: { type: String, trim: true, maxlength: 5000 }, attachments: [attachmentSchema], numberOfProviders: { type: Number, default: 1, min: 1, max: 1 },
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true }, organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' }, selectedProvider: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: taskStatuses, default: 'draft', index: true }, moderation: { reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, reviewedAt: Date, note: { type: String, trim: true, maxlength: 1000 } },
  completion: { providerRequestedAt: Date, requesterConfirmedAt: Date, completedAt: Date },
}, modelOptions());
taskSchema.index({ title: 'text', description: 'text', requiredSkills: 'text' });
taskSchema.index({ category: 1, status: 1, createdAt: -1 });
taskSchema.index({ 'location.city': 1, workMode: 1 });
taskSchema.index({ requiredSkills: 1 });
export default mongoose.model('Task', taskSchema);
