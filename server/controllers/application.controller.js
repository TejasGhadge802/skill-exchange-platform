import mongoose from 'mongoose';
import Application from '../models/Application.js';
import Task from '../models/Task.js';
import Conversation from '../models/Conversation.js';
import { notify } from '../utils/notifications.js';

const editableStatuses = ['pending', 'shortlisted'];
const requesterDecisions = ['shortlisted', 'rejected', 'accepted'];

function validId(value) { return /^[a-f\d]{24}$/i.test(value); }

function proposalFrom(body) {
  const pitch = body.pitch?.trim();
  const price = body.proposedPrice === '' || body.proposedPrice === undefined ? undefined : Number(body.proposedPrice);
  const duration = body.proposedDuration === '' || body.proposedDuration === undefined ? undefined : Number(body.proposedDuration);
  if (!pitch || pitch.length < 20) { const error = new Error('Your proposal must contain at least 20 characters.'); error.statusCode = 400; throw error; }
  if (price !== undefined && (!Number.isFinite(price) || price < 0)) { const error = new Error('Proposed price must be a valid amount.'); error.statusCode = 400; throw error; }
  if (duration !== undefined && (!Number.isFinite(duration) || duration < 1)) { const error = new Error('Proposed duration must be at least 1.'); error.statusCode = 400; throw error; }
  return { pitch, proposedPrice: price, proposedDuration: duration ? { value: duration, unit: body.durationUnit || 'days' } : undefined, currency: body.currency || 'INR' };
}

export async function createApplication(req, res, next) {
  try {
    if (!validId(req.params.taskId)) return res.status(404).json({ success: false, message: 'Task not found.' });
    const task = await Task.findOne({ _id: req.params.taskId, status: { $in: ['published', 'application_open'] } });
    if (!task) return res.status(404).json({ success: false, message: 'This task is not accepting applications.' });
    if (String(task.requester) === String(req.user._id)) return res.status(400).json({ success: false, message: 'You cannot apply to your own task.' });
    const application = await Application.create({ task: task._id, applicant: req.user._id, ...proposalFrom(req.body) });
    if (task.status === 'published') { task.status = 'application_open'; await task.save(); }
    await notify({ user: task.requester, type: 'application_received', title: 'New application received', body: `A provider applied to “${task.title}”.`, resourceType: 'task', resourceId: task._id });
    return res.status(201).json({ success: true, data: { application } });
  } catch (error) {
    if (error?.code === 11000) return res.status(409).json({ success: false, message: 'You have already applied to this task.' });
    return next(error);
  }
}

export async function listMyApplications(req, res, next) {
  try {
    const applications = await Application.find({ applicant: req.user._id }).populate('task', 'title category status budget workMode location requester').sort({ updatedAt: -1 }).lean();
    return res.json({ success: true, data: { applications } });
  } catch (error) { return next(error); }
}

export async function withdrawApplication(req, res, next) {
  try {
    if (!validId(req.params.applicationId)) return res.status(404).json({ success: false, message: 'Application not found.' });
    const application = await Application.findOne({ _id: req.params.applicationId, applicant: req.user._id });
    if (!application) return res.status(404).json({ success: false, message: 'Application not found.' });
    if (!editableStatuses.includes(application.status)) return res.status(409).json({ success: false, message: 'This application can no longer be withdrawn.' });
    application.status = 'withdrawn'; application.withdrawnAt = new Date(); await application.save();
    return res.json({ success: true, data: { application } });
  } catch (error) { return next(error); }
}

export async function listTaskApplications(req, res, next) {
  try {
    if (!validId(req.params.taskId)) return res.status(404).json({ success: false, message: 'Task not found.' });
    const task = await Task.findOne({ _id: req.params.taskId, requester: req.user._id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });
    const applications = await Application.find({ task: task._id }).populate('applicant', 'name avatar bio skills experience portfolio isVerified ratingAverage ratingCount location').sort({ createdAt: -1 }).lean();
    return res.json({ success: true, data: { task, applications } });
  } catch (error) { return next(error); }
}

export async function decideApplication(req, res, next) {
  const session = await mongoose.startSession();
  try {
    if (!validId(req.params.applicationId)) return res.status(404).json({ success: false, message: 'Application not found.' });
    const decision = req.body.status;
    if (!requesterDecisions.includes(decision)) return res.status(400).json({ success: false, message: 'Choose a valid application decision.' });
    let result;
    await session.withTransaction(async () => {
      const application = await Application.findById(req.params.applicationId).session(session);
      if (!application) { const error = new Error('Application not found.'); error.statusCode = 404; throw error; }
      const task = await Task.findOne({ _id: application.task, requester: req.user._id }).session(session);
      if (!task) { const error = new Error('Task not found.'); error.statusCode = 404; throw error; }
      if (!editableStatuses.includes(application.status)) { const error = new Error('This application is no longer awaiting a decision.'); error.statusCode = 409; throw error; }
      if (decision === 'accepted') {
        if (!['application_open', 'published'].includes(task.status) || task.selectedProvider) { const error = new Error('A provider has already been selected for this task.'); error.statusCode = 409; throw error; }
        task.selectedProvider = application.applicant; task.status = 'provider_selected'; await task.save({ session });
        application.status = 'accepted'; application.decisionAt = new Date(); await application.save({ session });
        await Conversation.create([{ application: application._id, task: task._id, participants: [task.requester, application.applicant] }], { session });
        await Application.updateMany({ task: task._id, _id: { $ne: application._id }, status: { $in: ['pending', 'shortlisted'] } }, { $set: { status: 'rejected', decisionAt: new Date() } }, { session });
        await notify({ user: application.applicant, type: 'application_accepted', title: 'You were selected', body: `You were selected for “${task.title}”. Start discussing terms.`, resourceType: 'application', resourceId: application._id });
      } else { application.status = decision; application.decisionAt = new Date(); await application.save({ session }); }
      result = application;
    });
    return res.json({ success: true, data: { application: result } });
  } catch (error) { return next(error); } finally { await session.endSession(); }
}
