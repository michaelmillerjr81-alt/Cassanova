'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { CoinPackage } from '@/types';

export default function AdminPackagesPage() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [packages, setPackages] = useState<CoinPackage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    const fetchPackages = async () => {
      try {
        const data = await api.packages.getAll();
        if (Array.isArray(data)) {
          setPackages(data);
        }
      } catch (error) {
        console.error('Failed to fetch packages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, [user, token, router]);

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Coin Packages</h1>
            <p className="text-gray-400 mt-1">Manage purchasable Gold Coin bundles</p>
          </div>
          <Link href="/admin" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
            Back to Admin
          </Link>
        </div>

        {loading ? (
          <div className="text-center text-gray-400 py-12">Loading packages...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <div
                key={pkg._id}
                className={`bg-gray-800/60 border rounded-xl p-6 ${
                  pkg.isPopular ? 'border-yellow-500/40' : 'border-purple-500/20'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">{pkg.name}</h3>
                  <div className="flex gap-2">
                    {pkg.isPopular && (
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs font-medium">Popular</span>
                    )}
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      pkg.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {pkg.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Gold Coins</span>
                    <span className="text-yellow-400 font-medium">{pkg.goldCoins.toLocaleString()} GC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Free Sweep Coins</span>
                    <span className="text-green-400 font-medium">{pkg.bonusSweepCoins} SC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Price (USDT)</span>
                    <span className="text-white font-medium">${pkg.priceUSDT}</span>
                  </div>
                  {pkg.discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Discount</span>
                      <span className="text-purple-400 font-medium">{pkg.discount}%</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-400">Sort Order</span>
                    <span className="text-gray-300">{pkg.sortOrder}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="text-xs text-gray-500 mb-2">Crypto Prices</div>
                  <div className="flex flex-wrap gap-2">
                    {pkg.cryptoPrices.map((cp) => (
                      <span key={cp.currency} className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300">
                        {cp.amount} {cp.currency}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
