import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';

function validId(value) { return /^[a-f\d]{24}$/i.test(value); }

export async function listMyConversations(req, res, next) {
  try {
    const conversations = await Conversation.find({ participants: req.user._id })
      .populate('task', 'title status')
      .populate('participants', 'name avatar')
      .sort({ lastMessageAt: -1 })
      .lean();
    return res.json({ success: true, data: { conversations } });
  } catch (error) { return next(error); }
}

export async function getConversationMessages(req, res, next) {
  try {
    if (!validId(req.params.conversationId)) return res.status(404).json({ success: false, message: 'Conversation not found.' });
    const conversation = await Conversation.findOne({ _id: req.params.conversationId, participants: req.user._id }).populate('task', 'title').lean();
    if (!conversation) return res.status(404).json({ success: false, message: 'Conversation not found.' });
    const messages = await Message.find({ conversation: conversation._id }).populate('sender', 'name avatar').sort({ createdAt: 1 }).limit(200).lean();
    return res.json({ success: true, data: { conversation, messages } });
  } catch (error) { return next(error); }
}
