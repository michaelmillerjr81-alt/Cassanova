import { Router } from 'express';
import { getAllPromotions, getPromotionBySlug, createPromotion } from '../controllers/promotion.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/admin.middleware';

const router = Router();

router.get('/', getAllPromotions);
router.get('/:slug', getPromotionBySlug);
router.post('/', authenticateToken, requireAdmin, createPromotion);

export default router;
