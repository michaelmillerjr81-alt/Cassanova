import { Router } from 'express';
import { getAllGames, getGameBySlug, getJackpotGames, createGame } from '../controllers/game.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/admin.middleware';

const router = Router();

router.get('/', getAllGames);
router.get('/jackpots', getJackpotGames);
router.get('/:slug', getGameBySlug);
router.post('/', authenticateToken, requireAdmin, createGame);

export default router;
