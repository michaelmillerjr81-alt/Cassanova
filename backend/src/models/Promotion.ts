import mongoose, { Schema, Document } from 'mongoose';

export interface IPromotion extends Document {
  title: string;
  slug: string;
  description: string;
  type: 'welcome-bonus' | 'purchase-bonus' | 'free-sc' | 'daily-bonus' | 'vip-bonus';
  bonusGoldCoins?: number;
  bonusSweepCoins?: number;
  bonusPercentage?: number;
  freeSpins?: number;
  minGCPurchase?: number;
  maxBonusSC?: number;
  wageringRequirement: number;
  validFrom: Date;
  validUntil?: Date;
  promoCode?: string;
  terms: string;
  image: string;
  isActive: boolean;
  eligibleVipLevels: string[];
  createdAt: Date;
  updatedAt: Date;
}

const PromotionSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: ['welcome-bonus', 'purchase-bonus', 'free-sc', 'daily-bonus', 'vip-bonus'],
    },
    bonusGoldCoins: { type: Number },
    bonusSweepCoins: { type: Number },
    bonusPercentage: { type: Number },
    freeSpins: { type: Number },
    minGCPurchase: { type: Number },
    maxBonusSC: { type: Number },
    wageringRequirement: { type: Number, required: true },
    validFrom: { type: Date, required: true },
    validUntil: { type: Date },
    promoCode: { type: String },
    terms: { type: String, required: true },
    image: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    eligibleVipLevels: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IPromotion>('Promotion', PromotionSchema);
