import mongoose from 'mongoose';
import { modelOptions, verificationStatuses } from './shared.js';

const skillSchema = new mongoose.Schema({ name: { type: String, required: true, trim: true, maxlength: 80 }, level: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'expert'] } }, { _id: false });
const portfolioSchema = new mongoose.Schema({ title: { type: String, required: true, trim: true, maxlength: 120 }, url: { type: String, trim: true }, description: { type: String, trim: true, maxlength: 1000 } }, { _id: false });

const userSchema = new mongoose.Schema({
  firebaseUid: { type: String, required: true, unique: true, trim: true, immutable: true },
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  avatar: { type: String, trim: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user', index: true },
  accountType: { type: String, enum: ['individual', 'organization'], default: 'individual' },
  bio: { type: String, trim: true, maxlength: 2000 },
  phone: { type: String, trim: true, maxlength: 30 },
  location: { city: { type: String, trim: true }, state: { type: String, trim: true }, country: { type: String, trim: true }, postalCode: { type: String, trim: true } },
  skills: [skillSchema], experience: { type: String, trim: true, maxlength: 5000 }, portfolio: [portfolioSchema],
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  isVerified: { type: Boolean, default: false }, verificationStatus: { type: String, enum: verificationStatuses, default: 'pending', index: true },
  isActive: { type: Boolean, default: true, index: true }, ratingAverage: { type: Number, default: 0, min: 0, max: 5 }, ratingCount: { type: Number, default: 0, min: 0 },
}, modelOptions());
userSchema.index({ 'location.city': 1 });
userSchema.index({ 'skills.name': 1 });
export default mongoose.model('User', userSchema);
