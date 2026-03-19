import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import User from '../models/User';

export const requireAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.userId).select('role');
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  } catch (error) {
    return res.status(500).json({ message: 'Authorization check failed', error });
  }
};
