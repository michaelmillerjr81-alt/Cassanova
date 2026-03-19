'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { CoinPackage } from '@/types';

export default function BuyGoldCoinsPage() {
  const router = useRouter();
  const { user, token, isAuthenticated, formatGC, formatSC } = useAuth();
  const [packages, setPackages] = useState<CoinPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string>('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [packagesLoading, setPackagesLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const fetchPackages = async () => {
      try {
        const data = await api.packages.getAll();
        if (Array.isArray(data) && data.length > 0) {
          setPackages(data);
        } else {
          setPackages(FALLBACK_PACKAGES);
        }
      } catch {
        setPackages(FALLBACK_PACKAGES);
      } finally {
        setPackagesLoading(false);
      }
    };

    fetchPackages();
  }, [isAuthenticated, router]);

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedPackage) {
      setError('Please select a Gold Coin package');
      return;
    }

    if (!token) {
      setError('You must be logged in to purchase');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.packages.purchase(token, {
        packageId: selectedPackage,
      });

      if (response.paymentUrl) {
        window.location.href = response.paymentUrl;
        return;
      }

      if (response.goldCoins !== undefined) {
        const pkg = packages.find((p) => p._id === selectedPackage);
        setSuccess(
          `Purchase successful! You received ${pkg?.goldCoins?.toLocaleString() ?? '?'} GC + ${pkg?.bonusSweepCoins ?? '?'} FREE SC`
        );
        setSelectedPackage('');
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else if (!response.paymentUrl) {
        setError(response.message || 'Purchase failed');
      }
    } catch {
      setError('An error occurred during purchase');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  const selectedPkg = packages.find((p) => p._id === selectedPackage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <Link href="/dashboard" className="text-yellow-400 hover:text-yellow-300 mb-4 inline-block">
            &larr; Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">Buy Gold Coins</h1>
          <p className="text-gray-300">
            Purchase Gold Coins and receive <span className="text-green-400 font-semibold">FREE Sweep Coins</span> with
            every package. Pay with 200+ cryptocurrencies via NOWPayments.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6">{error}</div>
        )}
        {success && (
          <div className="bg-green-500/20 border border-green-500 text-green-200 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handlePurchase}>
              <div className="mb-8">
                <h2 className="text-xl font-bold text-white mb-4">Select a Package</h2>
                {packagesLoading ? (
                  <div className="text-gray-400">Loading packages...</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {packages.map((pkg) => (
                      <button
                        key={pkg._id}
                        type="button"
                        onClick={() => setSelectedPackage(pkg._id)}
                        className={`relative p-6 rounded-xl border-2 text-left transition-all ${
                          selectedPackage === pkg._id
                            ? 'border-yellow-400 bg-yellow-400/10 shadow-lg shadow-yellow-400/20'
                            : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                        }`}
                      >
                        {pkg.isPopular && (
                          <span className="absolute -top-3 right-4 bg-yellow-400 text-gray-900 text-xs font-bold px-3 py-1 rounded-full">
                            POPULAR
                          </span>
                        )}
                        {pkg.discount > 0 && (
                          <span className="absolute -top-3 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                            {pkg.discount}% OFF
                          </span>
                        )}
                        <div className="text-2xl font-bold text-yellow-400 mb-1">
                          {pkg.goldCoins.toLocaleString()} GC
                        </div>
                        <div className="text-green-400 font-semibold text-sm mb-3">
                          + {pkg.bonusSweepCoins} FREE Sweep Coins
                        </div>
                        <div className="text-gray-400 text-sm">${pkg.priceUSDT} USD</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {selectedPkg && (
                <div className="bg-gray-800/80 border border-purple-500/30 rounded-xl p-6 mb-6">
                  <h3 className="text-white font-bold mb-3">Order Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-300">
                      <span>Package</span>
                      <span className="text-white">{selectedPkg.name}</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Gold Coins</span>
                      <span className="text-yellow-400 font-semibold">
                        {selectedPkg.goldCoins.toLocaleString()} GC
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>FREE Sweep Coins</span>
                      <span className="text-green-400 font-semibold">{selectedPkg.bonusSweepCoins} SC</span>
                    </div>
                    <hr className="border-gray-700" />
                    <div className="flex justify-between text-white font-bold text-base">
                      <span>Total</span>
                      <span>${selectedPkg.priceUSDT} USD</span>
                    </div>
                    <p className="text-gray-500 text-xs mt-2">
                      You&apos;ll choose your crypto on NOWPayments&apos; secure checkout — 200+ coins supported including BTC, ETH, USDT, SOL, DOGE, LTC and more.
                    </p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !selectedPackage}
                className="w-full py-4 px-6 bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-900 font-bold text-lg rounded-lg hover:from-yellow-500 hover:to-yellow-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? 'Redirecting to checkout...' : 'Buy Gold Coins'}
              </button>
            </form>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-xl p-6 text-white">
              <div className="text-sm opacity-90 mb-1">Gold Coins</div>
              <div className="text-3xl font-bold">{formatGC(user.goldCoins)}</div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-xl p-6 text-white">
              <div className="text-sm opacity-90 mb-1">Sweep Coins</div>
              <div className="text-3xl font-bold">{formatSC(user.sweepCoins)}</div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-lg border border-purple-500/20 rounded-xl p-6">
              <h3 className="text-white font-bold text-lg mb-4">How It Works</h3>
              <ul className="space-y-3 text-sm text-gray-300">
                <li className="flex items-start">
                  <span className="text-yellow-400 mr-2 font-bold">1.</span>
                  <span>Select a Gold Coin package above</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-400 mr-2 font-bold">2.</span>
                  <span>Click &quot;Buy Gold Coins&quot; to proceed</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-400 mr-2 font-bold">3.</span>
                  <span>Choose your crypto &amp; pay on NOWPayments&apos; secure checkout</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-400 mr-2 font-bold">4.</span>
                  <span>
                    Coins credited automatically + <span className="text-green-400">FREE SC</span>
                  </span>
                </li>
              </ul>
            </div>

            <div className="bg-green-900/30 border border-green-500/30 rounded-xl p-6">
              <h3 className="text-green-400 font-bold text-lg mb-2">FREE Sweep Coins</h3>
              <p className="text-sm text-gray-300">
                Every Gold Coin purchase includes FREE Sweep Coins. SC can be used in prize-eligible games and redeemed
                for crypto prizes!
              </p>
            </div>

            <div className="bg-blue-900/30 border border-blue-500/30 rounded-xl p-6">
              <h3 className="text-blue-400 font-bold text-lg mb-2">Powered by NOWPayments</h3>
              <p className="text-sm text-gray-300">
                Secure crypto payments processed by NOWPayments. Supports 200+ cryptocurrencies across multiple blockchains.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const FALLBACK_PACKAGES: CoinPackage[] = [
  {
    _id: 'pkg-1',
    name: 'Starter',
    slug: 'starter',
    goldCoins: 5000,
    bonusSweepCoins: 5,
    priceUSDT: 4.99,
    cryptoPrices: [],
    isPopular: false,
    isActive: true,
    discount: 0,
    sortOrder: 1,
  },
  {
    _id: 'pkg-2',
    name: 'Popular',
    slug: 'popular',
    goldCoins: 25000,
    bonusSweepCoins: 25,
    priceUSDT: 19.99,
    cryptoPrices: [],
    isPopular: true,
    isActive: true,
    discount: 0,
    sortOrder: 2,
  },
  {
    _id: 'pkg-3',
    name: 'Premium',
    slug: 'premium',
    goldCoins: 100000,
    bonusSweepCoins: 100,
    priceUSDT: 49.99,
    cryptoPrices: [],
    isPopular: false,
    isActive: true,
    discount: 10,
    sortOrder: 3,
  },
  {
    _id: 'pkg-4',
    name: 'Whale',
    slug: 'whale',
    goldCoins: 500000,
    bonusSweepCoins: 500,
    priceUSDT: 199.99,
    cryptoPrices: [],
    isPopular: false,
    isActive: true,
    discount: 20,
    sortOrder: 4,
  },
];
