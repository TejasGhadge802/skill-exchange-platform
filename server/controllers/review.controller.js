import Review from '../models/Review.js';
import Task from '../models/Task.js';
import User from '../models/User.js';
import { notify } from '../utils/notifications.js';

function validId(value) { return /^[a-f\d]{24}$/i.test(value); }

async function refreshRating(userId) {
  const [stats] = await Review.aggregate([{ $match: { reviewee: userId } }, { $group: { _id: '$reviewee', average: { $avg: '$rating' }, count: { $sum: 1 } } }]);
  await User.updateOne({ _id: userId }, { $set: { ratingAverage: stats?.average || 0, ratingCount: stats?.count || 0 } });
}

export async function createReview(req, res, next) {
  try {
    if (!validId(req.params.taskId)) return res.status(404).json({ success: false, message: 'Task not found.' });
    const task = await Task.findById(req.params.taskId);
    if (!task || task.status !== 'completed') return res.status(409).json({ success: false, message: 'Reviews are available only after task completion.' });
    const reviewerId = String(req.user._id); const isRequester = reviewerId === String(task.requester); const isProvider = reviewerId === String(task.selectedProvider);
    if (!isRequester && !isProvider) return res.status(403).json({ success: false, message: 'Only task participants can leave a review.' });
    const rating = Number(req.body.rating); const comment = req.body.comment?.trim();
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) return res.status(400).json({ success: false, message: 'Rating must be a whole number from 1 to 5.' });
    const reviewee = isRequester ? task.selectedProvider : task.requester;
    const review = await Review.create({ reviewer: req.user._id, reviewee, task: task._id, rating, comment });
    await refreshRating(reviewee);
    await notify({ user: reviewee, type: 'review_received', title: 'New review received', body: `You received a ${rating}-star review for “${task.title}”.`, resourceType: 'task', resourceId: task._id });
    return res.status(201).json({ success: true, data: { review } });
  } catch (error) { if (error?.code === 11000) return res.status(409).json({ success: false, message: 'You have already reviewed this participant for this task.' }); return next(error); }
}

export async function listTaskReviews(req, res, next) {
  try {
    if (!validId(req.params.taskId)) return res.status(404).json({ success: false, message: 'Task not found.' });
    const reviews = await Review.find({ task: req.params.taskId }).populate('reviewer', 'name avatar').populate('reviewee', 'name avatar').sort({ createdAt: -1 }).lean();
    return res.json({ success: true, data: { reviews } });
  } catch (error) { return next(error); }
}
