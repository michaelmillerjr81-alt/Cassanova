import { Request, Response } from 'express';
import CoinPackage from '../models/CoinPackage';

export const getAllPackages = async (_req: Request, res: Response) => {
  try {
    const packages = await CoinPackage.find({ isActive: true }).sort({ sortOrder: 1 });
    res.json(packages);
  } catch (error) {
    console.error('Get packages error:', error);
    res.status(500).json({ message: 'Failed to fetch packages', error });
  }
};

export const createPackage = async (req: Request, res: Response) => {
  try {
    const { name, slug, goldCoins, bonusSweepCoins, priceUSDT, cryptoPrices, isPopular, discount, sortOrder } = req.body;

    const existing = await CoinPackage.findOne({ slug });
    if (existing) {
      return res.status(400).json({ message: 'Package with this slug already exists' });
    }

    const coinPackage = new CoinPackage({
      name,
      slug,
      goldCoins,
      bonusSweepCoins,
      priceUSDT,
      cryptoPrices: cryptoPrices || [],
      isPopular: isPopular || false,
      discount: discount || 0,
      sortOrder: sortOrder || 0,
    });

    await coinPackage.save();
    res.status(201).json({ message: 'Package created', package: coinPackage });
  } catch (error) {
    console.error('Create package error:', error);
    res.status(500).json({ message: 'Failed to create package', error });
  }
};
