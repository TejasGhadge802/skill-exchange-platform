import Task from '../models/Task.js';
import { notify } from '../utils/notifications.js';

function validId(value) { return /^[a-f\d]{24}$/i.test(value); }



export async function confirmCompletion(req, res, next) {
  try {
    if (!validId(req.params.taskId)) return res.status(404).json({ success: false, message: 'Task not found.' });
    const task = await Task.findOne({ _id: req.params.taskId, requester: req.user._id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });
    if (task.status !== 'in_progress' || !task.completion.providerRequestedAt) return res.status(409).json({ success: false, message: 'The provider must first request completion.' });
    task.completion.requesterConfirmedAt = new Date(); task.completion.completedAt = new Date(); task.status = 'completed'; await task.save();
    await notify({ user: task.selectedProvider, type: 'task_completed', title: 'Task completed', body: `“${task.title}” was confirmed complete. You can now leave a review.`, resourceType: 'task', resourceId: task._id });
    return res.json({ success: true, data: { task } });
  } catch (error) { return next(error); }
}
