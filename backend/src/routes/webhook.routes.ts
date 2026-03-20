import { Router, Request, Response } from 'express';
import Transaction from '../models/Transaction';
import User from '../models/User';
import { verifyWebhookSignature } from '../services/coinbase-commerce.service';

const router = Router();

/**
 * Coinbase Commerce sends webhook POST callbacks when charge status changes.
 *
 * Event types: charge:created, charge:pending, charge:confirmed,
 *              charge:failed, charge:delayed, charge:resolved
 *
 * We credit coins on "charge:confirmed" or "charge:resolved".
 * Raw body is needed for HMAC signature verification.
 */
router.post('/coinbase', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-cc-webhook-signature'] as string | undefined;
    const rawBody = JSON.stringify(req.body);

    if (signature && !verifyWebhookSignature(rawBody, signature)) {
      console.warn('Coinbase Commerce webhook: invalid signature');
      return res.status(400).json({ message: 'Invalid signature' });
    }

    const event = req.body?.event;
    if (!event) {
      return res.status(400).json({ message: 'Missing event' });
    }

    const eventType: string = event.type;
    const chargeData = event.data;
    const orderId = chargeData?.metadata?.order_id;
    const chargeCode: string = chargeData?.code || '';
    const chargeId: string = chargeData?.id || '';

    if (!orderId) {
      console.warn('Coinbase Commerce webhook: missing order_id in metadata');
      return res.status(400).json({ message: 'Missing order_id' });
    }

    const transaction = await Transaction.findById(orderId);
    if (!transaction) {
      console.warn(`Coinbase Commerce webhook: transaction ${orderId} not found`);
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (transaction.status !== 'pending') {
      return res.json({ message: 'Already processed' });
    }

    if (chargeCode) transaction.chargeCode = chargeCode;
    if (chargeId) transaction.chargeId = chargeId;

    if (eventType === 'charge:confirmed' || eventType === 'charge:resolved') {
      transaction.status = 'completed';
      await transaction.save();

      const user = await User.findById(transaction.userId);
      if (user) {
        user.goldCoins = transaction.gcAfter;
        user.sweepCoins = transaction.scAfter;
        await user.save();
      }

      console.log(`Coinbase Commerce: charge ${chargeCode} ${eventType} — credited user ${transaction.userId}`);
    } else if (eventType === 'charge:failed') {
      transaction.status = 'failed';
      await transaction.save();
      console.log(`Coinbase Commerce: charge ${chargeCode} failed`);
    } else {
      await transaction.save();
      console.log(`Coinbase Commerce: charge ${chargeCode} ${eventType} (no action)`);
    }

    res.json({ message: 'OK' });
  } catch (error) {
    console.error('Coinbase Commerce webhook error:', error);
    res.status(500).json({ message: 'Webhook processing failed' });
  }
});

export default router;
