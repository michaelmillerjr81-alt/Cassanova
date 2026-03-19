import { Router } from 'express';
import { getAllPackages, createPackage } from '../controllers/coinpackage.controller';
import { purchaseGoldCoins, redeemSweepCoins, claimDailyBonus } from '../controllers/transaction.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/admin.middleware';

const router = Router();

router.get('/', getAllPackages);
router.post('/', authenticateToken, requireAdmin, createPackage);
router.post('/purchase', authenticateToken, purchaseGoldCoins);
router.post('/daily-bonus', authenticateToken, claimDailyBonus);
router.post('/redeem', authenticateToken, redeemSweepCoins);

export default router;
