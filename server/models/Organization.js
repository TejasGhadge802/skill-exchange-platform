import mongoose from 'mongoose';
import { modelOptions, verificationStatuses } from './shared.js';

const organizationSchema = new mongoose.Schema({
  organizationName: { type: String, required: true, trim: true, maxlength: 160, index: true },
  description: { type: String, trim: true, maxlength: 5000 }, email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, trim: true, maxlength: 30 }, website: { type: String, trim: true }, logo: { type: String, trim: true },
  location: { city: String, state: String, country: String, postalCode: String }, category: { type: String, trim: true, index: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isVerified: { type: Boolean, default: false }, verificationStatus: { type: String, enum: verificationStatuses, default: 'pending', index: true },
}, modelOptions());
organizationSchema.index({ email: 1 });
export default mongoose.model('Organization', organizationSchema);
