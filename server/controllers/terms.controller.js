import Application from '../models/Application.js';
import Task from '../models/Task.js';
import Terms from '../models/Terms.js';
import { notify } from '../utils/notifications.js';

function validId(value) { return /^[a-f\d]{24}$/i.test(value); }

async function participantContext(applicationId, userId) {
  const application = await Application.findById(applicationId);
  if (!application || application.status !== 'accepted') { const error = new Error('Accepted application not found.'); error.statusCode = 404; throw error; }
  const task = await Task.findById(application.task);
  if (!task || String(task.requester) !== String(userId) && String(application.applicant) !== String(userId)) { const error = new Error('You do not have access to these terms.'); error.statusCode = 403; throw error; }
  return { application, task, isRequester: String(task.requester) === String(userId) };
}

function parseTerms(body) {
  const price = Number(body.finalPrice);
  const duration = Number(body.durationValue);
  if (!Number.isFinite(price) || price < 0) { const error = new Error('Final price must be a valid amount.'); error.statusCode = 400; throw error; }
  if (!Number.isFinite(duration) || duration < 1) { const error = new Error('Expected duration must be at least 1.'); error.statusCode = 400; throw error; }
  if (body.startDate && Number.isNaN(new Date(body.startDate).valueOf())) { const error = new Error('Start date is invalid.'); error.statusCode = 400; throw error; }
  if (body.deadline && Number.isNaN(new Date(body.deadline).valueOf())) { const error = new Error('Deadline is invalid.'); error.statusCode = 400; throw error; }
  return { finalPrice: price, currency: (body.currency || 'INR').toUpperCase(), expectedDuration: { value: duration, unit: body.durationUnit || 'days' }, startDate: body.startDate || undefined, deadline: body.deadline || undefined, additionalNotes: body.additionalNotes?.trim() || undefined };
}

export async function getTerms(req, res, next) {
  try {
    if (!validId(req.params.applicationId)) return res.status(404).json({ success: false, message: 'Accepted application not found.' });
    const { application, task } = await participantContext(req.params.applicationId, req.user._id);
    const terms = await Terms.findOne({ application: application._id }).lean();
    return res.json({ success: true, data: { task, application, terms } });
  } catch (error) { return next(error); }
}

export async function proposeTerms(req, res, next) {
  try {
    if (!validId(req.params.applicationId)) return res.status(404).json({ success: false, message: 'Accepted application not found.' });
    const { application, task } = await participantContext(req.params.applicationId, req.user._id);
    const values = parseTerms(req.body);
    const terms = await Terms.findOneAndUpdate(
      { application: application._id },
      { $set: { ...values, proposedBy: req.user._id, requesterAcceptedAt: undefined, providerAcceptedAt: undefined }, $setOnInsert: { application: application._id, task: task._id }, $inc: { version: 1 } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: false },
    );
    if (task.status === 'provider_selected') { task.status = 'negotiating'; await task.save(); }
    const otherParticipant = String(task.requester) === String(req.user._id) ? application.applicant : task.requester;
    await notify({ user: otherParticipant, type: 'terms_proposed', title: 'New terms proposed', body: `Review the updated terms for “${task.title}”.`, resourceType: 'application', resourceId: application._id });
    return res.json({ success: true, data: { terms } });
  } catch (error) { return next(error); }
}

export async function acceptTerms(req, res, next) {
  try {
    if (!validId(req.params.applicationId)) return res.status(404).json({ success: false, message: 'Accepted application not found.' });
    const { application, task, isRequester } = await participantContext(req.params.applicationId, req.user._id);
    const acceptanceField = isRequester ? 'requesterAcceptedAt' : 'providerAcceptedAt';
    const terms = await Terms.findOneAndUpdate({ application: application._id }, { $set: { [acceptanceField]: new Date() } }, { new: true });
    if (!terms) return res.status(409).json({ success: false, message: 'Terms must be proposed before they can be accepted.' });
    const bothAccepted = Boolean(terms.requesterAcceptedAt && terms.providerAcceptedAt);
    if (bothAccepted) { task.status = 'payment_pending'; await task.save(); await notify({ user: task.requester, type: 'payment_ready', title: 'Terms accepted', body: `Payment is ready for “${task.title}”.`, resourceType: 'application', resourceId: application._id }); }
    return res.json({ success: true, data: { terms, bothAccepted } });
  } catch (error) { return next(error); }
}
