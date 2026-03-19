'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function PaymentCancelPage() {
  const searchParams = useSearchParams();
  const txnId = searchParams.get('txn');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-gray-800/60 border border-red-500/30 rounded-2xl p-8">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/20 border-2 border-red-400 flex items-center justify-center">
            <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-white mb-3">Payment Cancelled</h1>

          <p className="text-gray-300 mb-6">
            Your payment was cancelled. No charges were made and your balance remains unchanged.
          </p>

          {txnId && (
            <p className="text-xs text-gray-500 mb-6">
              Transaction ref: <code className="text-gray-400">{txnId}</code>
            </p>
          )}

          <div className="flex gap-3 justify-center">
            <Link
              href="/deposit"
              className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-900 font-bold rounded-lg hover:from-yellow-500 hover:to-yellow-700 transition-all"
            >
              Try Again
            </Link>
            <Link
              href="/dashboard"
              className="px-6 py-3 border border-gray-600 text-gray-300 font-medium rounded-lg hover:border-gray-500 hover:text-white transition-all"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
