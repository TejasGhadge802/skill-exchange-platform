import Notification from '../models/Notification.js';

function validId(value) { return /^[a-f\d]{24}$/i.test(value); }

export async function listNotifications(req, res, next) { try { const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(100).lean(); const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false }); return res.json({ success: true, data: { notifications, unreadCount } }); } catch (error) { return next(error); } }
export async function markRead(req, res, next) { try { if (!validId(req.params.notificationId)) return res.status(404).json({ success: false, message: 'Notification not found.' }); const notification = await Notification.findOneAndUpdate({ _id: req.params.notificationId, user: req.user._id }, { $set: { isRead: true, readAt: new Date() } }, { new: true }); if (!notification) return res.status(404).json({ success: false, message: 'Notification not found.' }); return res.json({ success: true, data: { notification } }); } catch (error) { return next(error); } }
export async function markAllRead(req, res, next) { try { await Notification.updateMany({ user: req.user._id, isRead: false }, { $set: { isRead: true, readAt: new Date() } }); return res.status(204).send(); } catch (error) { return next(error); } }
