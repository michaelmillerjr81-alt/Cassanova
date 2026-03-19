'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { CryptoCurrency } from '@/types';

const MIN_REDEMPTION = 100;

const CRYPTO_OPTIONS: { id: CryptoCurrency; name: string; icon: string }[] = [
  { id: 'BTC', name: 'Bitcoin', icon: '₿' },
  { id: 'ETH', name: 'Ethereum', icon: 'Ξ' },
  { id: 'USDT', name: 'Tether', icon: '₮' },
  { id: 'USDC', name: 'USD Coin', icon: '$' },
  { id: 'SOL', name: 'Solana', icon: '◎' },
  { id: 'DOGE', name: 'Dogecoin', icon: 'Ð' },
  { id: 'LTC', name: 'Litecoin', icon: 'Ł' },
];

export default function RedeemPage() {
  const router = useRouter();
  const { user, token, isAuthenticated, formatSC } = useAuth();
  const [amount, setAmount] = useState('');
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoCurrency>('BTC');
  const [walletAddress, setWalletAddress] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const redeemAmount = parseFloat(amount);

    if (!user) {
      setError('User information not found');
      return;
    }

    if (user.kycStatus !== 'verified') {
      setError('KYC verification is required to redeem Sweep Coins. Please complete your verification first.');
      return;
    }

    if (!redeemAmount || redeemAmount < MIN_REDEMPTION) {
      setError(`Minimum redemption is ${MIN_REDEMPTION} SC`);
      return;
    }

    if (redeemAmount > user.sweepCoins) {
      setError('Insufficient Sweep Coins');
      return;
    }

    if (!walletAddress.trim()) {
      setError('Please enter your wallet address');
      return;
    }

    if (!token) {
      setError('You must be logged in');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.packages.redeem(token, {
        amount: redeemAmount,
        cryptoCurrency: selectedCrypto,
        walletAddress: walletAddress.trim(),
      });

      if (response.sweepCoins !== undefined) {
        setSuccess(`Redemption request submitted! ${redeemAmount} SC will be sent as ${selectedCrypto} to your wallet.`);
        setAmount('');
        setWalletAddress('');
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);
      } else {
        setError(response.message || 'Redemption failed');
      }
    } catch {
      setError('An error occurred during redemption');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  const quickAmounts = [100, 250, 500, 1000];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <Link href="/dashboard" className="text-yellow-400 hover:text-yellow-300 mb-4 inline-block">
            &larr; Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">Redeem Sweep Coins</h1>
          <p className="text-gray-300">Convert your Sweep Coin winnings into cryptocurrency prizes</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-gray-800/50 backdrop-blur-lg border border-purple-500/20 rounded-xl p-8">
              {error && (
                <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-green-500/20 border border-green-500 text-green-200 px-4 py-3 rounded-lg mb-6">
                  {success}
                </div>
              )}

              {user.kycStatus !== 'verified' && (
                <div className="bg-yellow-500/20 border border-yellow-500 text-yellow-200 px-4 py-3 rounded-lg mb-6">
                  <p className="font-semibold mb-1">KYC Verification Required</p>
                  <p className="text-sm">
                    You need to complete KYC verification before you can redeem Sweep Coins.{' '}
                    <Link href="/kyc" className="underline">
                      Verify now
                    </Link>
                  </p>
                </div>
              )}

              <form onSubmit={handleRedeem} className="space-y-6">
                {/* SC Amount */}
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-2">
                    Sweep Coins to Redeem
                  </label>
                  <div className="relative">
                    <input
                      id="amount"
                      name="amount"
                      type="number"
                      step="0.01"
                      min={MIN_REDEMPTION}
                      max={user.sweepCoins}
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-4 py-4 bg-gray-700/50 border border-gray-600 rounded-lg text-white text-xl placeholder-gray-400 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition-all"
                      placeholder="0.00"
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-green-400 font-semibold">
                      SC
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-400">
                    Min: {MIN_REDEMPTION} SC | Available: {formatSC(user.sweepCoins)}
                  </p>
                </div>

                {/* Quick Amounts */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Quick Select</label>
                  <div className="grid grid-cols-4 gap-3">
                    {quickAmounts.map((qa) => (
                      <button
                        key={qa}
                        type="button"
                        onClick={() => setAmount(Math.min(qa, user.sweepCoins).toString())}
                        disabled={user.sweepCoins < MIN_REDEMPTION}
                        className="py-2 px-4 bg-gray-700/50 border border-gray-600 rounded-lg text-white hover:border-green-400 hover:bg-green-400/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {qa} SC
                      </button>
                    ))}
                  </div>
                </div>

                {/* Crypto Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-4">Receive As</label>
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                    {CRYPTO_OPTIONS.map((crypto) => (
                      <button
                        key={crypto.id}
                        type="button"
                        onClick={() => setSelectedCrypto(crypto.id)}
                        className={`p-3 rounded-lg border-2 text-center transition-all ${
                          selectedCrypto === crypto.id
                            ? 'border-green-400 bg-green-400/10'
                            : 'border-gray-600 bg-gray-700/30 hover:border-gray-500'
                        }`}
                      >
                        <div className="text-xl mb-1">{crypto.icon}</div>
                        <div className="text-white text-xs font-medium">{crypto.id}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Wallet Address */}
                <div>
                  <label htmlFor="wallet" className="block text-sm font-medium text-gray-300 mb-2">
                    {selectedCrypto} Wallet Address
                  </label>
                  <input
                    id="wallet"
                    name="wallet"
                    type="text"
                    required
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition-all font-mono text-sm"
                    placeholder={`Enter your ${selectedCrypto} wallet address`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || user.kycStatus !== 'verified'}
                  className="w-full py-4 px-6 bg-gradient-to-r from-green-400 to-green-600 text-white font-bold text-lg rounded-lg hover:from-green-500 hover:to-green-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? 'Processing...' : `Redeem ${amount || '0'} SC`}
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-xl p-6 text-white">
              <div className="text-sm opacity-90 mb-1">Available Sweep Coins</div>
              <div className="text-3xl font-bold">{formatSC(user.sweepCoins)}</div>
            </div>

            <div
              className={`bg-gradient-to-br ${
                user.kycStatus === 'verified' ? 'from-blue-500 to-blue-700' : 'from-yellow-500 to-yellow-700'
              } rounded-xl p-6 text-white`}
            >
              <div className="text-sm opacity-90 mb-1">KYC Status</div>
              <div className="text-2xl font-bold capitalize">{user.kycStatus}</div>
              {user.kycStatus !== 'verified' && (
                <Link href="/kyc" className="text-sm mt-2 opacity-90 underline inline-block">
                  Complete verification
                </Link>
              )}
            </div>

            <div className="bg-gray-800/50 backdrop-blur-lg border border-purple-500/20 rounded-xl p-6">
              <h3 className="text-white font-bold text-lg mb-4">Redemption Info</h3>
              <ul className="space-y-3 text-sm text-gray-300">
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">&#8226;</span>
                  <span>Minimum redemption: {MIN_REDEMPTION} SC</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">&#8226;</span>
                  <span>1 SC = ~1 USDT in crypto value</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">&#8226;</span>
                  <span>Processing time: 1-24 hours</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">&#8226;</span>
                  <span>KYC verification required</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
