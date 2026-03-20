import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth.middleware';
import Transaction from '../models/Transaction';
import User from '../models/User';
import CoinPackage from '../models/CoinPackage';
import * as payments from '../services/coinbase-commerce.service';

const DAILY_BONUS_SC = 0.3;
const DAILY_BONUS_GC = 1000;
const MIN_REDEMPTION_SC = 100;

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

const SC_TO_USD_RATE = 1;

export const getUserTransactions = async (req: AuthRequest, res: Response) => {
  try {
    const { type, status, currency } = req.query;
    const filter: Record<string, unknown> = { userId: req.userId };

    if (type) filter.type = type;
    if (status) filter.status = status;
    if (currency) filter.currency = currency;

    const transactions = await Transaction.find(filter).sort({ createdAt: -1 }).limit(50);
    res.json(transactions);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Failed to fetch transactions', error });
  }
};

export const purchaseGoldCoins = async (req: AuthRequest, res: Response) => {
  try {
    const { packageId } = req.body;

    if (!packageId) {
      return res.status(400).json({ message: 'Package ID is required' });
    }

    const coinPackage = await CoinPackage.findById(packageId);
    if (!coinPackage || !coinPackage.isActive) {
      return res.status(404).json({ message: 'Coin package not found or inactive' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const gcBefore = user.goldCoins;
    const scBefore = user.sweepCoins;
    const gcAfter = gcBefore + coinPackage.goldCoins;
    const scAfter = scBefore + coinPackage.bonusSweepCoins;

    const transaction = new Transaction({
      userId: req.userId,
      type: 'gc_purchase',
      currency: 'GC',
      amount: coinPackage.goldCoins,
      status: 'pending',
      packageId: coinPackage._id,
      description: `Purchased ${coinPackage.name} (${coinPackage.goldCoins.toLocaleString()} GC + ${coinPackage.bonusSweepCoins} FREE SC)`,
      gcBefore,
      gcAfter,
      scBefore,
      scAfter,
    });

    await transaction.save();

    const txnId = (transaction._id as mongoose.Types.ObjectId).toString();

    console.log('Coinbase Commerce configured:', payments.isConfigured(), '| Key present:', !!process.env.COINBASE_COMMERCE_API_KEY);

    if (payments.isConfigured()) {
      const charge = await payments.createCharge({
        name: coinPackage.name,
        description: `${coinPackage.goldCoins.toLocaleString()} Gold Coins + ${coinPackage.bonusSweepCoins} FREE Sweep Coins`,
        amountUsd: coinPackage.priceUSDT,
        orderId: txnId,
        redirectUrl: `${FRONTEND_URL}/payment/success?txn=${txnId}`,
        cancelUrl: `${FRONTEND_URL}/payment/cancel?txn=${txnId}`,
      });

      transaction.chargeCode = charge.code;
      transaction.chargeId = charge.id;
      await transaction.save();

      return res.status(201).json({
        message: 'Payment charge created',
        paymentUrl: charge.hosted_url,
        transactionId: txnId,
      });
    }

    transaction.status = 'completed';
    await transaction.save();
    user.goldCoins = gcAfter;
    user.sweepCoins = scAfter;
    await user.save();

    res.status(201).json({
      message: 'Gold Coins purchase successful',
      transaction,
      goldCoins: user.goldCoins,
      sweepCoins: user.sweepCoins,
    });
  } catch (error) {
    console.error('Purchase error:', error);
    res.status(500).json({ message: 'Purchase failed', error });
  }
};

export const redeemSweepCoins = async (req: AuthRequest, res: Response) => {
  try {
    const { amount, cryptoCurrency, walletAddress } = req.body;

    if (!amount || amount < MIN_REDEMPTION_SC) {
      return res.status(400).json({
        message: `Minimum redemption is ${MIN_REDEMPTION_SC} SC`,
      });
    }

    if (!cryptoCurrency || !walletAddress) {
      return res.status(400).json({ message: 'Crypto currency and wallet address are required' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.kycStatus !== 'verified') {
      return res.status(400).json({ message: 'KYC verification required for redemptions' });
    }

    if (user.sweepCoins < amount) {
      return res.status(400).json({ message: 'Insufficient Sweep Coins' });
    }

    const gcBefore = user.goldCoins;
    const scBefore = user.sweepCoins;
    const scAfter = scBefore - amount;

    user.sweepCoins = scAfter;
    await user.save();

    const transaction = new Transaction({
      userId: req.userId,
      type: 'sc_redemption',
      currency: 'SC',
      amount,
      status: 'pending',
      cryptoCurrency: cryptoCurrency.toUpperCase(),
      walletAddress,
      description: `Redeem ${amount} SC for ${cryptoCurrency.toUpperCase()}`,
      gcBefore,
      gcAfter: gcBefore,
      scBefore,
      scAfter,
    });

    await transaction.save();

    // Coinbase Commerce handles inbound payments only — outbound
    // payouts are processed via the admin panel or a separate service.

    res.status(201).json({
      message: 'Redemption request submitted — payout processing',
      transaction,
      sweepCoins: user.sweepCoins,
    });
  } catch (error) {
    console.error('Redemption error:', error);
    res.status(500).json({ message: 'Redemption failed', error });
  }
};

export const claimDailyBonus = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const now = new Date();
    if (user.lastDailyBonus) {
      const hoursSinceLast = (now.getTime() - user.lastDailyBonus.getTime()) / (1000 * 60 * 60);
      if (hoursSinceLast < 24) {
        const nextBonusAt = new Date(user.lastDailyBonus.getTime() + 24 * 60 * 60 * 1000);
        return res.status(400).json({
          message: 'Daily bonus already claimed',
          nextBonusAt,
        });
      }
    }

    const gcBefore = user.goldCoins;
    const scBefore = user.sweepCoins;
    const gcAfter = gcBefore + DAILY_BONUS_GC;
    const scAfter = scBefore + DAILY_BONUS_SC;

    const transaction = new Transaction({
      userId: req.userId,
      type: 'daily_bonus',
      currency: 'SC',
      amount: DAILY_BONUS_SC,
      status: 'completed',
      description: `Daily bonus: ${DAILY_BONUS_GC.toLocaleString()} GC + ${DAILY_BONUS_SC} FREE SC`,
      gcBefore,
      gcAfter,
      scBefore,
      scAfter,
    });

    await transaction.save();

    user.goldCoins = gcAfter;
    user.sweepCoins = scAfter;
    user.lastDailyBonus = now;
    await user.save();

    res.json({
      message: 'Daily bonus claimed!',
      transaction,
      goldCoins: user.goldCoins,
      sweepCoins: user.sweepCoins,
      nextBonusAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
    });
  } catch (error) {
    console.error('Daily bonus error:', error);
    res.status(500).json({ message: 'Failed to claim daily bonus', error });
  }
};
