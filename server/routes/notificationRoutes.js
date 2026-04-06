import express from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import Notification from '../models/Notification.js';

const router = express.Router();

// Get all notifications for the logged-in user
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user.sub;
    const role = req.user.role;
    
    // Only sponsors and clubs have notifications
    let userModel = null;
    if (role === 'sponsor') userModel = 'Sponsor';
    else if (role === 'club') userModel = 'Club';
    
    if (!userModel) {
      // Students and superadmins have no notifications
      return res.json([]);
    }
    
    const notifications = await Notification.find({ userId, userModel }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    console.error('Notification fetch error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Mark a notification as read
router.patch('/:id/read', requireAuth, async (req, res) => {
  try {
    const userId = req.user.sub;
    const role = req.user.role;
    let userModel = null;
    if (role === 'sponsor') userModel = 'Sponsor';
    else if (role === 'club') userModel = 'Club';
    
    if (!userModel) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    const notification = await Notification.findOne({ _id: req.params.id, userId, userModel });
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    notification.read = true;
    await notification.save();
    res.json({ message: 'Marked as read' });
  } catch (err) {
    console.error('Mark read error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Mark all as read
router.patch('/read-all', requireAuth, async (req, res) => {
  try {
    const userId = req.user.sub;
    const role = req.user.role;
    let userModel = null;
    if (role === 'sponsor') userModel = 'Sponsor';
    else if (role === 'club') userModel = 'Club';
    
    if (!userModel) {
      return res.json({ message: 'No notifications to mark' });
    }
    
    await Notification.updateMany({ userId, userModel }, { read: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    console.error('Mark all read error:', err);
    res.status(500).json({ message: err.message });
  }
});

export default router;