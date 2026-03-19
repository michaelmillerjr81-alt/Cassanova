import mongoose, { Schema, Document } from 'mongoose';

export type TransactionType =
  | 'gc_purchase'
  | 'sc_redemption'
  | 'gc_bet'
  | 'gc_win'
  | 'sc_bet'
  | 'sc_win'
  | 'sc_bonus'
  | 'daily_bonus';

export type CurrencyType = 'GC' | 'SC';

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  type: TransactionType;
  currency: CurrencyType;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  cryptoCurrency?: string;
  cryptoAmount?: number;
  cryptoTxHash?: string;
  walletAddress?: string;
  packageId?: mongoose.Types.ObjectId;
  transactionId?: string;
  description?: string;
  gcBefore: number;
  gcAfter: number;
  scBefore: number;
  scAfter: number;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      required: true,
      enum: [
        'gc_purchase',
        'sc_redemption',
        'gc_bet',
        'gc_win',
        'sc_bet',
        'sc_win',
        'sc_bonus',
        'daily_bonus',
      ],
    },
    currency: {
      type: String,
      required: true,
      enum: ['GC', 'SC'],
    },
    amount: { type: Number, required: true },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'completed', 'failed', 'cancelled'],
      default: 'pending',
    },
    cryptoCurrency: { type: String },
    cryptoAmount: { type: Number },
    cryptoTxHash: { type: String },
    walletAddress: { type: String },
    packageId: { type: Schema.Types.ObjectId, ref: 'CoinPackage' },
    transactionId: { type: String },
    description: { type: String },
    gcBefore: { type: Number, required: true },
    gcAfter: { type: Number, required: true },
    scBefore: { type: Number, required: true },
    scAfter: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

TransactionSchema.index({ userId: 1, createdAt: -1 });
TransactionSchema.index({ type: 1 });
TransactionSchema.index({ currency: 1 });

export default mongoose.model<ITransaction>('Transaction', TransactionSchema);
