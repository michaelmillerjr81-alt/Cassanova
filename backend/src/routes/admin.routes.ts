import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/admin.middleware';
import {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
  updateUserKYC,
  getAllTransactions,
  updateTransactionStatus,
} from '../controllers/admin.controller';

const router = Router();

router.use(authenticateToken, requireAdmin);

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:userId/role', updateUserRole);
router.put('/users/:userId/kyc', updateUserKYC);
router.get('/transactions', getAllTransactions);
router.put('/transactions/:transactionId/status', updateTransactionStatus);

export default router;
