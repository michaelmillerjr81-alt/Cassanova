import mongoose from 'mongoose';
import dotenv from 'dotenv';
import CoinPackage from './models/CoinPackage';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cassanova';

const SUPPORTED_CRYPTOS = ['BTC', 'ETH', 'USDT', 'SOL', 'DOGE', 'LTC'];

function cryptoPrices(usdtPrice: number) {
  const rates: Record<string, number> = {
    BTC: 65000,
    ETH: 3400,
    USDT: 1,
    SOL: 145,
    DOGE: 0.12,
    LTC: 85,
  };
  return SUPPORTED_CRYPTOS.map((currency) => ({
    currency,
    amount: parseFloat((usdtPrice / rates[currency]).toFixed(8)),
  }));
}

const packages = [
  {
    name: 'Starter Pack',
    slug: 'starter-pack',
    goldCoins: 10_000,
    bonusSweepCoins: 1,
    priceUSDT: 4.99,
    isPopular: false,
    discount: 0,
    sortOrder: 1,
  },
  {
    name: 'Bronze Bundle',
    slug: 'bronze-bundle',
    goldCoins: 50_000,
    bonusSweepCoins: 5,
    priceUSDT: 19.99,
    isPopular: false,
    discount: 0,
    sortOrder: 2,
  },
  {
    name: 'Silver Bundle',
    slug: 'silver-bundle',
    goldCoins: 150_000,
    bonusSweepCoins: 18,
    priceUSDT: 49.99,
    isPopular: true,
    discount: 10,
    sortOrder: 3,
  },
  {
    name: 'Gold Bundle',
    slug: 'gold-bundle',
    goldCoins: 500_000,
    bonusSweepCoins: 75,
    priceUSDT: 99.99,
    isPopular: true,
    discount: 15,
    sortOrder: 4,
  },
  {
    name: 'Platinum Bundle',
    slug: 'platinum-bundle',
    goldCoins: 1_500_000,
    bonusSweepCoins: 250,
    priceUSDT: 249.99,
    isPopular: false,
    discount: 20,
    sortOrder: 5,
  },
  {
    name: 'Diamond Bundle',
    slug: 'diamond-bundle',
    goldCoins: 5_000_000,
    bonusSweepCoins: 1000,
    priceUSDT: 499.99,
    isPopular: false,
    discount: 25,
    sortOrder: 6,
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const existing = await CoinPackage.countDocuments();
    if (existing > 0) {
      console.log(`Found ${existing} existing packages. Clearing...`);
      await CoinPackage.deleteMany({});
    }

    const docs = packages.map((pkg) => ({
      ...pkg,
      cryptoPrices: cryptoPrices(pkg.priceUSDT),
    }));

    const result = await CoinPackage.insertMany(docs);
    console.log(`Seeded ${result.length} coin packages:`);
    result.forEach((pkg) => {
      console.log(
        `  ${pkg.name}: ${pkg.goldCoins.toLocaleString()} GC + ${pkg.bonusSweepCoins} SC — $${pkg.priceUSDT}`
      );
    });

    await mongoose.disconnect();
    console.log('Done.');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seed();
