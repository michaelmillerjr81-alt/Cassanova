import { Router, Request, Response } from 'express';
import Transaction from '../models/Transaction';
import User from '../models/User';

const router = Router();

/**
 * CoinGate sends POST callbacks when order status changes.
 * Statuses: new, pending, confirming, paid, invalid, expired, canceled
 * We credit coins only on "paid".
 */
router.post('/coingate', async (req: Request, res: Response) => {
  try {
    const {
      id: coingateOrderId,
      order_id: orderId,
      status,
      pay_amount,
      pay_currency,
      token: callbackToken,
    } = req.body;

    const expectedToken = process.env.COINGATE_CALLBACK_TOKEN;
    if (expectedToken && callbackToken !== expectedToken) {
      console.warn('CoinGate webhook: invalid token');
      return res.status(400).json({ message: 'Invalid token' });
    }

    const transaction = await Transaction.findById(orderId);
    if (!transaction) {
      console.warn(`CoinGate webhook: transaction ${orderId} not found`);
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (transaction.status !== 'pending') {
      return res.json({ message: 'Already processed' });
    }

    transaction.coingateOrderId = coingateOrderId;
    if (pay_amount) transaction.cryptoAmount = parseFloat(pay_amount);
    if (pay_currency) transaction.cryptoCurrency = pay_currency;

    if (status === 'paid') {
      transaction.status = 'completed';
      await transaction.save();

      const user = await User.findById(transaction.userId);
      if (user) {
        user.goldCoins = transaction.gcAfter;
        user.sweepCoins = transaction.scAfter;
        await user.save();
      }

      console.log(`CoinGate: order ${orderId} paid — credited user ${transaction.userId}`);
    } else if (status === 'invalid' || status === 'expired' || status === 'canceled') {
      transaction.status = status === 'canceled' ? 'cancelled' : 'failed';
      await transaction.save();
      console.log(`CoinGate: order ${orderId} ${status}`);
    } else {
      await transaction.save();
      console.log(`CoinGate: order ${orderId} status=${status} (no action)`);
    }

    res.json({ message: 'OK' });
  } catch (error) {
    console.error('CoinGate webhook error:', error);
    res.status(500).json({ message: 'Webhook processing failed' });
  }
});

export default router;
