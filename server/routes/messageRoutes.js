import express from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import Message from '../models/Message.js';
import SponsorshipRequest from '../models/SponsorshipRequest.js';

const router = express.Router();
router.use(requireAuth);

// Get all messages for a specific sponsorship request (newest first)
router.get('/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.sub;
    const role = req.user.role;

    const request = await SponsorshipRequest.findById(requestId);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if ((role === 'sponsor' && request.sponsor.toString() !== userId) ||
        (role === 'club' && request.club.toString() !== userId)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const messages = await Message.find({ requestId }).sort({ createdAt: -1 });
    
    // Mark messages as read where user is receiver
    await Message.updateMany(
      { requestId, receiverId: userId, read: false },
      { $set: { read: true } }
    );
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get unread message count for a request (for the logged-in user)
router.get('/unread/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.sub;

    const unreadCount = await Message.countDocuments({
      requestId,
      receiverId: userId,
      read: false
    });
    res.json({ unreadCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Send a new message
router.post('/', async (req, res) => {
  try {
    const { requestId, content } = req.body;
    const userId = req.user.sub;
    const role = req.user.role;

    const request = await SponsorshipRequest.findById(requestId);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    let senderId, senderModel, receiverId, receiverModel;
    if (role === 'sponsor') {
      senderId = userId;
      senderModel = 'Sponsor';
      receiverId = request.club;
      receiverModel = 'Club';
    } else if (role === 'club') {
      senderId = userId;
      senderModel = 'Club';
      receiverId = request.sponsor;
      receiverModel = 'Sponsor';
    } else {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const message = new Message({
      requestId,
      senderId,
      senderModel,
      receiverId,
      receiverModel,
      content
    });
    await message.save();
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;