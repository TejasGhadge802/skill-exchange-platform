import Task from '../models/Task.js';
import Class from '../models/Class.js';
import Report from '../models/Report.js';
import AdminAction from '../models/AdminAction.js';

function validId(value) { return /^[a-f\d]{24}$/i.test(value); }
async function audit(admin, action, targetType, targetId, reason) { return AdminAction.create({ admin, action, targetType, targetId, reason }); }

export async function moderationQueue(req, res, next) {
  try {
    const [tasks, classes, reports] = await Promise.all([
      Task.find({ status: 'pending_approval' }).populate('requester', 'name email isVerified').sort({ createdAt: 1 }).lean(),
      Class.find({ status: 'pending_approval' }).populate('instructor', 'name email isVerified').sort({ createdAt: 1 }).lean(),
      Report.find({ status: { $in: ['open', 'in_review'] } }).populate('reporter', 'name email').sort({ createdAt: 1 }).lean(),
    ]);
    return res.json({ success: true, data: { tasks, classes, reports } });
  } catch (error) { return next(error); }
}

export async function moderateTask(req, res, next) {
  try {
    if (!validId(req.params.taskId)) return res.status(404).json({ success: false, message: 'Task not found.' });
    const decision = req.body.decision; if (!['approve', 'reject'].includes(decision)) return res.status(400).json({ success: false, message: 'Choose approve or reject.' });
    const task = await Task.findOne({ _id: req.params.taskId, status: 'pending_approval' }); if (!task) return res.status(404).json({ success: false, message: 'Pending task not found.' });
    task.status = decision === 'approve' ? 'published' : 'rejected'; task.moderation = { reviewedBy: req.user._id, reviewedAt: new Date(), note: req.body.note?.trim() || undefined }; await task.save();
    await audit(req.user._id, `task_${decision}`, 'task', task._id, task.moderation.note);
    return res.json({ success: true, data: { task } });
  } catch (error) { return next(error); }
}

export async function moderateClass(req, res, next) {
  try {
    if (!validId(req.params.classId)) return res.status(404).json({ success: false, message: 'Class not found.' });
    const decision = req.body.decision; if (!['approve', 'reject'].includes(decision)) return res.status(400).json({ success: false, message: 'Choose approve or reject.' });
    const workshop = await Class.findOne({ _id: req.params.classId, status: 'pending_approval' }); if (!workshop) return res.status(404).json({ success: false, message: 'Pending class not found.' });
    workshop.status = decision === 'approve' ? 'published' : 'rejected'; workshop.moderation = { reviewedBy: req.user._id, reviewedAt: new Date(), note: req.body.note?.trim() || undefined }; await workshop.save();
    await audit(req.user._id, `class_${decision}`, 'class', workshop._id, workshop.moderation.note);
    return res.json({ success: true, data: { class: workshop } });
  } catch (error) { return next(error); }
}

export async function resolveReport(req, res, next) {
  try {
    if (!validId(req.params.reportId)) return res.status(404).json({ success: false, message: 'Report not found.' });
    const status = req.body.status; if (!['in_review', 'resolved', 'dismissed'].includes(status)) return res.status(400).json({ success: false, message: 'Choose a valid report status.' });
    const report = await Report.findById(req.params.reportId); if (!report) return res.status(404).json({ success: false, message: 'Report not found.' });
    report.status = status; if (['resolved', 'dismissed'].includes(status)) { report.resolvedBy = req.user._id; report.resolvedAt = new Date(); } await report.save();
    await audit(req.user._id, `report_${status}`, 'report', report._id, req.body.note?.trim());
    return res.json({ success: true, data: { report } });
  } catch (error) { return next(error); }
}
