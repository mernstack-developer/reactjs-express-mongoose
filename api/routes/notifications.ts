import { Router, Request, Response } from 'express';
import Notification from '../models/notification.model';

const router = Router();

// GET all notifications
router.get('/notifications', async (req: Request, res: Response) => {
  try {
    let query: any = {};
    if (req.query.since) {
      query.createdAt = { $gt: new Date(req.query.since as string) };
    }
    const notifications = await Notification.find(query).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications' });
  }
});

// POST to mark a notification as read
router.post('/notifications/:id/read', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndUpdate(id, { read: true }, { new: true });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.status(200).json({ message: `Notification ${id} marked as read.`, notification });
  } catch (error) {
    res.status(500).json({ message: 'Error marking notification as read' });
  }
});

export default router;
