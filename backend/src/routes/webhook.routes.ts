import { Router, Request, Response } from 'express';
import Transaction from '../models/Transaction';
import User from '../models/User';
import { verifyIpnSignature } from '../services/nowpayments.service';

const router = Router();

/**
 * NOWPayments sends IPN (Instant Payment Notification) POST callbacks
 * when payment status changes.
 *
 * Statuses: waiting, confirming, confirmed, sending,
 *           partially_paid, finished, failed, refunded, expired
 *
 * We credit coins only on "finished".
 */
router.post('/nowpayments', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-nowpayments-sig'] as string | undefined;

    if (!verifyIpnSignature(req.body, signature || '')) {
      console.warn('NOWPayments IPN: invalid signature');
      return res.status(400).json({ message: 'Invalid signature' });
    }

    const {
      order_id: orderId,
      payment_status: status,
      pay_amount: payAmount,
      pay_currency: payCurrency,
      payment_id: paymentId,
    } = req.body;

    const transaction = await Transaction.findById(orderId);
    if (!transaction) {
      console.warn(`NOWPayments IPN: transaction ${orderId} not found`);
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (transaction.status !== 'pending') {
      return res.json({ message: 'Already processed' });
    }

    if (payAmount) transaction.cryptoAmount = parseFloat(payAmount);
    if (payCurrency) transaction.cryptoCurrency = payCurrency;
    if (paymentId) transaction.coingateOrderId = paymentId;

    if (status === 'finished' || status === 'confirmed') {
      transaction.status = 'completed';
      await transaction.save();

      const user = await User.findById(transaction.userId);
      if (user) {
        user.goldCoins = transaction.gcAfter;
        user.sweepCoins = transaction.scAfter;
        await user.save();
      }

      console.log(`NOWPayments: order ${orderId} ${status} — credited user ${transaction.userId}`);
    } else if (status === 'failed' || status === 'expired' || status === 'refunded') {
      transaction.status = 'failed';
      await transaction.save();
      console.log(`NOWPayments: order ${orderId} ${status}`);
    } else {
      await transaction.save();
      console.log(`NOWPayments: order ${orderId} status=${status} (no action)`);
    }

    res.json({ message: 'OK' });
  } catch (error) {
    console.error('NOWPayments IPN error:', error);
    res.status(500).json({ message: 'IPN processing failed' });
  }
});

export default router;
