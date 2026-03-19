import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import User from '../models/User';
import Transaction from '../models/Transaction';
import CoinPackage from '../models/CoinPackage';

export const getDashboardStats = async (_req: AuthRequest, res: Response) => {
  try {
    const [
      totalUsers,
      verifiedUsers,
      totalTransactions,
      pendingRedemptions,
      activePackages,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ kycStatus: 'verified' }),
      Transaction.countDocuments(),
      Transaction.countDocuments({ type: 'sc_redemption', status: 'pending' }),
      CoinPackage.countDocuments({ isActive: true }),
    ]);

    const recentTransactions = await Transaction.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'username email');

    const totalGCPurchased = await Transaction.aggregate([
      { $match: { type: 'gc_purchase', status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const totalSCRedeemed = await Transaction.aggregate([
      { $match: { type: 'sc_redemption', status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    res.json({
      totalUsers,
      verifiedUsers,
      totalTransactions,
      pendingRedemptions,
      activePackages,
      totalGCPurchased: totalGCPurchased[0]?.total || 0,
      totalSCRedeemed: totalSCRedeemed[0]?.total || 0,
      recentTransactions,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard stats', error });
  }
};

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { search, kycStatus, vipLevel, role } = req.query;
    const filter: Record<string, unknown> = {};

    if (kycStatus) filter.kycStatus = kycStatus;
    if (vipLevel) filter.vipLevel = vipLevel;
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password -twoFactorSecret -twoFactorBackupCodes -verificationToken -passwordResetToken')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    res.json({ users, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Failed to fetch users', error });
  }
};

export const updateUserRole = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    if (userId === req.userId) {
      return res.status(400).json({ message: 'Cannot change your own role' });
    }

    const user = await User.findByIdAndUpdate(userId, { role }, { new: true })
      .select('-password -twoFactorSecret -twoFactorBackupCodes');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: `User role updated to ${role}`, user });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ message: 'Failed to update user role', error });
  }
};

export const updateUserKYC = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { kycStatus } = req.body;

    if (!['pending', 'verified', 'rejected'].includes(kycStatus)) {
      return res.status(400).json({ message: 'Invalid KYC status' });
    }

    const user = await User.findByIdAndUpdate(userId, { kycStatus }, { new: true })
      .select('-password -twoFactorSecret -twoFactorBackupCodes');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: `KYC status updated to ${kycStatus}`, user });
  } catch (error) {
    console.error('Update KYC error:', error);
    res.status(500).json({ message: 'Failed to update KYC status', error });
  }
};

export const getAllTransactions = async (req: AuthRequest, res: Response) => {
  try {
    const { type, status, currency } = req.query;
    const filter: Record<string, unknown> = {};

    if (type) filter.type = type;
    if (status) filter.status = status;
    if (currency) filter.currency = currency;

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'username email'),
      Transaction.countDocuments(filter),
    ]);

    res.json({ transactions, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Get all transactions error:', error);
    res.status(500).json({ message: 'Failed to fetch transactions', error });
  }
};

export const updateTransactionStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { transactionId } = req.params;
    const { status } = req.body;

    if (!['completed', 'failed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (transaction.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending transactions can be updated' });
    }

    if (transaction.type === 'sc_redemption' && status === 'completed') {
      // SC was already deducted when redemption was created; just mark complete
    }

    if (transaction.type === 'sc_redemption' && (status === 'failed' || status === 'cancelled')) {
      const user = await User.findById(transaction.userId);
      if (user) {
        user.sweepCoins += transaction.amount;
        await user.save();
      }
    }

    transaction.status = status;
    await transaction.save();

    res.json({ message: `Transaction ${status}`, transaction });
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ message: 'Failed to update transaction', error });
  }
};
