import User from '../models/User.js';

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, avatar: user.avatar, role: user.role, accountType: user.accountType, isVerified: user.isVerified, verificationStatus: user.verificationStatus, isActive: user.isActive };
}

export async function syncAuthenticatedUser(req, res, next) {
  try {
    const { uid, email, name, picture } = req.firebaseUser;
    if (!email) return res.status(400).json({ success: false, message: 'A verified email address is required.' });
    const user = await User.findOneAndUpdate(
      { firebaseUid: uid },
      {
        $setOnInsert: { firebaseUid: uid },
        $set: {
          email: email.toLowerCase(),
          name: name?.trim() || email.split('@')[0],
          ...(picture ? { avatar: picture } : {}),
        },
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    );
    return res.status(200).json({ success: true, data: { user: publicUser(user) } });
  } catch (error) {
    if (error?.code === 11000) return res.status(409).json({ success: false, message: 'An account already uses this email address.' });
    return next(error);
  }
}

export async function getCurrentUser(req, res, next) {
  try {
    const user = await User.findOne({ firebaseUid: req.firebaseUser.uid });
    if (!user || !user.isActive) return res.status(404).json({ success: false, message: 'User profile not found.' });
    return res.json({ success: true, data: { user: publicUser(user) } });
  } catch (error) { return next(error); }
}
