import mongoose, { Schema, Document } from 'mongoose';

export interface ICryptoPrice {
  currency: string;
  amount: number;
}

export interface ICoinPackage extends Document {
  name: string;
  slug: string;
  goldCoins: number;
  bonusSweepCoins: number;
  priceUSDT: number;
  cryptoPrices: ICryptoPrice[];
  isPopular: boolean;
  isActive: boolean;
  discount: number;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const CoinPackageSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    goldCoins: { type: Number, required: true, min: 0 },
    bonusSweepCoins: { type: Number, required: true, min: 0 },
    priceUSDT: { type: Number, required: true, min: 0 },
    cryptoPrices: [{
      currency: { type: String, required: true },
      amount: { type: Number, required: true, min: 0 },
    }],
    isPopular: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    discount: { type: Number, default: 0, min: 0, max: 100 },
    sortOrder: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ICoinPackage>('CoinPackage', CoinPackageSchema);
