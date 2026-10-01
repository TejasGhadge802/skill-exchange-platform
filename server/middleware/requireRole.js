import User from '../models/User.js';

export function requireRole(...roles) {
  return async (req, res, next) => {
    try {
      const user = await User.findOne({ firebaseUid: req.firebaseUser.uid });
      if (!user || !user.isActive) return res.status(403).json({ success: false, message: 'Your account is unavailable.' });
      if (!roles.includes(user.role)) return res.status(403).json({ success: false, message: 'You do not have permission for this action.' });
      req.user = user;
      return next();
    } catch (error) {
      return next(error);
    }
  };
}
