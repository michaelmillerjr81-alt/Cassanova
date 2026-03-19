'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const txnId = searchParams.get('txn');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = '/dashboard';
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-gray-800/60 border border-green-500/30 rounded-2xl p-8">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 border-2 border-green-400 flex items-center justify-center">
            <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-white mb-3">Payment Submitted!</h1>

          <p className="text-gray-300 mb-6">
            Your crypto payment is being confirmed on the blockchain. Your Gold Coins and FREE Sweep Coins will be
            credited automatically once the transaction is verified.
          </p>

          <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-400 mb-1">This usually takes</p>
            <p className="text-yellow-400 font-bold text-lg">1 — 15 minutes</p>
            <p className="text-xs text-gray-500 mt-1">depending on blockchain congestion</p>
          </div>

          {txnId && (
            <p className="text-xs text-gray-500 mb-4">
              Transaction ref: <code className="text-gray-400">{txnId}</code>
            </p>
          )}

          <p className="text-gray-400 text-sm mb-6">
            Redirecting to dashboard in <span className="text-white font-bold">{countdown}s</span>...
          </p>

          <div className="flex gap-3 justify-center">
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-900 font-bold rounded-lg hover:from-yellow-500 hover:to-yellow-700 transition-all"
            >
              Go to Dashboard
            </Link>
            <Link
              href="/deposit"
              className="px-6 py-3 border border-gray-600 text-gray-300 font-medium rounded-lg hover:border-gray-500 hover:text-white transition-all"
            >
              Buy More
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
