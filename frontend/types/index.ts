export type CryptoCurrency = 'BTC' | 'ETH' | 'USDT' | 'USDC' | 'SOL' | 'DOGE' | 'LTC';

export interface CryptoAddress {
  currency: CryptoCurrency;
  address: string;
  label?: string;
  addedAt: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  goldCoins: number;
  sweepCoins: number;
  bonusSweepCoins: number;
  lastDailyBonus?: string;
  cryptoAddresses: CryptoAddress[];
  vipLevel: 'bronze' | 'silver' | 'gold' | 'platinum';
  kycStatus: 'pending' | 'verified' | 'rejected';
  role: 'user' | 'admin';
}

export interface Game {
  _id: string;
  title: string;
  slug: string;
  provider: string;
  category: 'slots' | 'table-games' | 'live-casino' | 'video-poker' | 'specialty';
  subcategory?: string;
  thumbnail: string;
  description: string;
  rtp: number;
  volatility: 'low' | 'medium' | 'high';
  features: string[];
  minBet: number;
  maxBet: number;
  isPopular: boolean;
  isNew: boolean;
  isFeatured: boolean;
  hasJackpot: boolean;
  jackpotAmount?: number;
  demoAvailable: boolean;
  launchUrl: string;
}

export interface Promotion {
  _id: string;
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
  validFrom: string;
  validUntil?: string;
  promoCode?: string;
  terms: string;
  image: string;
  isActive: boolean;
  eligibleVipLevels: string[];
}

export type TransactionType =
  | 'gc_purchase'
  | 'sc_redemption'
  | 'gc_bet'
  | 'gc_win'
  | 'sc_bet'
  | 'sc_win'
  | 'sc_bonus'
  | 'daily_bonus';

export interface Transaction {
  _id: string;
  userId: string;
  type: TransactionType;
  currency: 'GC' | 'SC';
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  cryptoCurrency?: string;
  cryptoAmount?: number;
  cryptoTxHash?: string;
  walletAddress?: string;
  packageId?: string;
  description: string;
  gcBefore: number;
  gcAfter: number;
  scBefore: number;
  scAfter: number;
  createdAt: string;
}

export interface CryptoPrice {
  currency: CryptoCurrency;
  amount: number;
}

export interface CoinPackage {
  _id: string;
  name: string;
  slug: string;
  goldCoins: number;
  bonusSweepCoins: number;
  priceUSDT: number;
  cryptoPrices: CryptoPrice[];
  isPopular: boolean;
  isActive: boolean;
  discount: number;
  sortOrder: number;
}
