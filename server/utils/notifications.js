import Notification from '../models/Notification.js';

export async function notify({ user, type, title, body, resourceType, resourceId }) {
  if (!user) return null;
  return Notification.create({ user, type, title, body, resourceType, resourceId });
}
