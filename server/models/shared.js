import mongoose from 'mongoose';

export const objectId = { type: mongoose.Schema.Types.ObjectId, required: true };

export const verificationStatuses = ['pending', 'approved', 'rejected'];
export const taskStatuses = ['draft', 'pending_approval', 'published', 'application_open', 'provider_selected', 'negotiating', 'payment_pending', 'in_progress', 'completed', 'cancelled', 'disputed', 'closed', 'rejected'];
export const applicationStatuses = ['pending', 'shortlisted', 'rejected', 'accepted', 'withdrawn'];

export function modelOptions() {
  return { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } };
}
