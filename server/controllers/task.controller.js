import Task from '../models/Task.js';

const editableStatuses = ['draft', 'rejected'];
const publicStatuses = ['published', 'application_open'];
const allowedWorkModes = ['online', 'offline', 'hybrid'];

function hasValidId(value) { return /^[a-f\d]{24}$/i.test(value); }

function parseTaskInput(body) {
  const { title, description, category, requiredSkills, budgetMin, budgetMax, isNegotiable, durationValue, durationUnit, estimatedHours, deadline, locationCity, locationState, locationCountry, locationAddress, workMode, additionalRequirements } = body;
  const errors = [];
  if (!title?.trim() || title.trim().length < 5) errors.push('Title must contain at least 5 characters.');
  if (!description?.trim() || description.trim().length < 20) errors.push('Description must contain at least 20 characters.');
  if (!category?.trim()) errors.push('Choose a category.');
  if (!allowedWorkModes.includes(workMode)) errors.push('Choose a valid work mode.');
  const min = budgetMin === '' || budgetMin === undefined ? undefined : Number(budgetMin);
  const max = budgetMax === '' || budgetMax === undefined ? undefined : Number(budgetMax);
  if ((min !== undefined && (!Number.isFinite(min) || min < 0)) || (max !== undefined && (!Number.isFinite(max) || max < 0))) errors.push('Budget must be a positive number.');
  if (min !== undefined && max !== undefined && min > max) errors.push('Minimum budget cannot exceed maximum budget.');
  if (deadline && Number.isNaN(new Date(deadline).valueOf())) errors.push('Deadline is invalid.');
  if (durationValue && (!Number.isFinite(Number(durationValue)) || Number(durationValue) < 1)) errors.push('Duration must be at least 1.');
  if (estimatedHours && (!Number.isFinite(Number(estimatedHours)) || Number(estimatedHours) < 0)) errors.push('Estimated hours cannot be negative.');
  if (errors.length) { const error = new Error(errors.join(' ')); error.statusCode = 400; throw error; }
  return {
    title: title.trim(), description: description.trim(), category: category.trim(), requiredSkills: Array.isArray(requiredSkills) ? requiredSkills.map((skill) => skill.trim()).filter(Boolean) : String(requiredSkills || '').split(',').map((skill) => skill.trim()).filter(Boolean),
    budget: { min, max, isNegotiable: isNegotiable !== false && isNegotiable !== 'false' },
    expectedDuration: durationValue ? { value: Number(durationValue), unit: durationUnit || 'days' } : undefined, estimatedHours: estimatedHours ? Number(estimatedHours) : undefined,
    deadline: deadline || undefined, location: { city: locationCity?.trim(), state: locationState?.trim(), country: locationCountry?.trim(), address: locationAddress?.trim() },
    workMode, additionalRequirements: additionalRequirements?.trim() || undefined,
  };
}

export async function createTask(req, res, next) {
  try { const task = await Task.create({ ...parseTaskInput(req.body), requester: req.user._id }); return res.status(201).json({ success: true, data: { task } }); } catch (error) { return next(error); }
}

export async function updateTask(req, res, next) {
  try {
    if (!hasValidId(req.params.taskId)) return res.status(404).json({ success: false, message: 'Task not found.' });
    const task = await Task.findOne({ _id: req.params.taskId, requester: req.user._id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });
    if (!editableStatuses.includes(task.status)) return res.status(409).json({ success: false, message: 'Only draft or rejected tasks can be edited.' });
    task.set(parseTaskInput(req.body)); await task.save(); return res.json({ success: true, data: { task } });
  } catch (error) { return next(error); }
}

export async function submitTask(req, res, next) {
  try {
    if (!hasValidId(req.params.taskId)) return res.status(404).json({ success: false, message: 'Task not found.' });
    const task = await Task.findOne({ _id: req.params.taskId, requester: req.user._id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });
    if (!editableStatuses.includes(task.status)) return res.status(409).json({ success: false, message: 'This task cannot be submitted in its current state.' });
    task.status = 'pending_approval'; task.moderation = undefined; await task.save(); return res.json({ success: true, data: { task } });
  } catch (error) { return next(error); }
}

export async function deleteTask(req, res, next) {
  try {
    if (!hasValidId(req.params.taskId)) return res.status(404).json({ success: false, message: 'Task not found.' });
    const task = await Task.findOne({ _id: req.params.taskId, requester: req.user._id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });
    if (!editableStatuses.includes(task.status)) return res.status(409).json({ success: false, message: 'Only draft or rejected tasks can be deleted.' });
    await task.deleteOne(); return res.status(204).send();
  } catch (error) { return next(error); }
}

export async function listTasks(req, res, next) {
  try {
    const { q, category, skill, workMode, location, minBudget, maxBudget, page = 1, limit = 12 } = req.query;
    const filter = { status: { $in: publicStatuses } };
    if (category) filter.category = category;
    if (skill) filter.requiredSkills = skill;
    if (workMode && allowedWorkModes.includes(workMode)) filter.workMode = workMode;
    if (location) filter['location.city'] = new RegExp(location, 'i');
    if (q?.trim()) filter.$text = { $search: q.trim() };
    if (minBudget || maxBudget) filter['budget.max'] = { ...(minBudget ? { $gte: Number(minBudget) } : {}), ...(maxBudget ? { $lte: Number(maxBudget) } : {}) };
    const safeLimit = Math.min(Math.max(Number(limit) || 12, 1), 50); const safePage = Math.max(Number(page) || 1, 1);
    const [tasks, total] = await Promise.all([Task.find(filter).populate('requester', 'name avatar isVerified ratingAverage location').sort(q ? { score: { $meta: 'textScore' }, createdAt: -1 } : { createdAt: -1 }).skip((safePage - 1) * safeLimit).limit(safeLimit).lean(), Task.countDocuments(filter)]);
    return res.json({ success: true, data: { tasks, pagination: { page: safePage, limit: safeLimit, total, pages: Math.ceil(total / safeLimit) } } });
  } catch (error) { return next(error); }
}

export async function getTask(req, res, next) {
  try {
    if (!hasValidId(req.params.taskId)) return res.status(404).json({ success: false, message: 'Task not found.' });
    const task = await Task.findById(req.params.taskId).populate('requester', 'name avatar bio isVerified ratingAverage ratingCount location skills');
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });
    const isOwner = req.user && String(task.requester._id || task.requester) === String(req.user._id);
    const isSelectedProvider = req.user && String(task.selectedProvider || '') === String(req.user._id);
    if (!publicStatuses.includes(task.status) && !isOwner && !isSelectedProvider && req.user?.role !== 'admin') return res.status(404).json({ success: false, message: 'Task not found.' });
    return res.json({ success: true, data: { task } });
  } catch (error) { return next(error); }
}

export async function listMyTasks(req, res, next) {
  try { const tasks = await Task.find({ requester: req.user._id }).sort({ updatedAt: -1 }).lean(); return res.json({ success: true, data: { tasks } }); } catch (error) { return next(error); }
}
