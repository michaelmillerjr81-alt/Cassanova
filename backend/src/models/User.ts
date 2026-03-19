import mongoose, { Schema, Document } from 'mongoose';

export interface ICryptoAddress {
  currency: string;
  address: string;
  label?: string;
  addedAt: Date;
}

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: Date;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  goldCoins: number;
  sweepCoins: number;
  bonusSweepCoins: number;
  lastDailyBonus?: Date;
  cryptoAddresses: ICryptoAddress[];
  isVerified: boolean;
  verificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  kycStatus: 'pending' | 'verified' | 'rejected';
  kycDocuments?: string[];
  vipLevel: 'bronze' | 'silver' | 'gold' | 'platinum';
  responsibleGaming: {
    purchaseLimit?: {
      daily?: number;
      weekly?: number;
      monthly?: number;
    };
    lossLimit?: {
      daily?: number;
      weekly?: number;
      monthly?: number;
    };
    sessionTimeLimit?: number;
    selfExclusionUntil?: Date;
  };
  favoriteGames: string[];
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  twoFactorBackupCodes?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String },
    lastName: { type: String },
    dateOfBirth: { type: Date },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      country: { type: String },
      zipCode: { type: String },
    },
    goldCoins: { type: Number, default: 0, min: 0 },
    sweepCoins: { type: Number, default: 0, min: 0 },
    bonusSweepCoins: { type: Number, default: 0, min: 0 },
    lastDailyBonus: { type: Date, default: null },
    cryptoAddresses: [{
      currency: { type: String },
      address: { type: String },
      label: { type: String },
      addedAt: { type: Date, default: Date.now },
    }],
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
    kycStatus: { 
      type: String, 
      enum: ['pending', 'verified', 'rejected'], 
      default: 'pending' 
    },
    kycDocuments: [{ type: String }],
    vipLevel: { 
      type: String, 
      enum: ['bronze', 'silver', 'gold', 'platinum'], 
      default: 'bronze' 
    },
    responsibleGaming: {
      purchaseLimit: {
        daily: { type: Number },
        weekly: { type: Number },
        monthly: { type: Number },
      },
      lossLimit: {
        daily: { type: Number },
        weekly: { type: Number },
        monthly: { type: Number },
      },
      sessionTimeLimit: { type: Number },
      selfExclusionUntil: { type: Date },
    },
    favoriteGames: [{ type: String }],
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String },
    twoFactorBackupCodes: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IUser>('User', UserSchema);
