'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';

interface DashboardStats {
  totalUsers: number;
  verifiedUsers: number;
  totalTransactions: number;
  pendingRedemptions: number;
  activePackages: number;
  totalGCPurchased: number;
  totalSCRedeemed: number;
  recentTransactions: Array<{
    _id: string;
    type: string;
    currency: string;
    amount: number;
    status: string;
    createdAt: string;
    userId?: { username: string; email: string };
  }>;
}

const TYPE_LABELS: Record<string, string> = {
  gc_purchase: 'GC Purchase',
  sc_redemption: 'SC Redemption',
  gc_bet: 'GC Bet',
  gc_win: 'GC Win',
  sc_bet: 'SC Bet',
  sc_win: 'SC Win',
  sc_bonus: 'SC Bonus',
  daily_bonus: 'Daily Bonus',
};

export default function AdminDashboard() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    const fetchStats = async () => {
      if (!token) return;
      try {
        const data = await api.admin.getStats(token);
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user, token, router]);

  if (!user || user.role !== 'admin' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white">Admin Panel</h1>
            <p className="text-gray-400 mt-1">Platform overview and management</p>
          </div>
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>

        {stats && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gray-800/60 border border-purple-500/20 rounded-xl p-6">
                <div className="text-gray-400 text-sm mb-1">Total Users</div>
                <div className="text-3xl font-bold text-white">{stats.totalUsers.toLocaleString()}</div>
                <div className="text-xs text-green-400 mt-1">{stats.verifiedUsers} KYC verified</div>
              </div>

              <div className="bg-gray-800/60 border border-purple-500/20 rounded-xl p-6">
                <div className="text-gray-400 text-sm mb-1">Total Transactions</div>
                <div className="text-3xl font-bold text-white">{stats.totalTransactions.toLocaleString()}</div>
              </div>

              <div className="bg-gray-800/60 border border-yellow-500/20 rounded-xl p-6">
                <div className="text-gray-400 text-sm mb-1">GC Purchased</div>
                <div className="text-3xl font-bold text-yellow-400">{stats.totalGCPurchased.toLocaleString()} GC</div>
              </div>

              <div className="bg-gray-800/60 border border-red-500/20 rounded-xl p-6">
                <div className="text-gray-400 text-sm mb-1">Pending Redemptions</div>
                <div className="text-3xl font-bold text-red-400">{stats.pendingRedemptions}</div>
                <div className="text-xs text-gray-400 mt-1">{stats.totalSCRedeemed.toLocaleString()} SC redeemed total</div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Link
                href="/admin/users"
                className="bg-gray-800/60 border border-purple-500/20 rounded-xl p-6 hover:border-purple-400 transition-all"
              >
                <h3 className="text-lg font-bold text-white mb-1">Manage Users</h3>
                <p className="text-gray-400 text-sm">View users, update roles, approve KYC</p>
              </Link>
              <Link
                href="/admin/transactions"
                className="bg-gray-800/60 border border-purple-500/20 rounded-xl p-6 hover:border-purple-400 transition-all"
              >
                <h3 className="text-lg font-bold text-white mb-1">Transactions</h3>
                <p className="text-gray-400 text-sm">View all transactions, manage redemptions</p>
              </Link>
              <Link
                href="/admin/packages"
                className="bg-gray-800/60 border border-purple-500/20 rounded-xl p-6 hover:border-purple-400 transition-all"
              >
                <h3 className="text-lg font-bold text-white mb-1">Coin Packages</h3>
                <p className="text-gray-400 text-sm">{stats.activePackages} active packages</p>
              </Link>
            </div>

            {/* Recent Transactions */}
            <div className="bg-gray-800/60 border border-purple-500/20 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Recent Transactions</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 border-b border-gray-700">
                      <th className="text-left py-3 px-2">User</th>
                      <th className="text-left py-3 px-2">Type</th>
                      <th className="text-left py-3 px-2">Currency</th>
                      <th className="text-right py-3 px-2">Amount</th>
                      <th className="text-left py-3 px-2">Status</th>
                      <th className="text-left py-3 px-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentTransactions.map((tx) => (
                      <tr key={tx._id} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                        <td className="py-3 px-2 text-white">
                          {tx.userId?.username || 'Unknown'}
                        </td>
                        <td className="py-3 px-2 text-gray-300">{TYPE_LABELS[tx.type] || tx.type}</td>
                        <td className="py-3 px-2 text-gray-300">{tx.currency}</td>
                        <td className="py-3 px-2 text-right text-white">{tx.amount.toLocaleString()}</td>
                        <td className="py-3 px-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            tx.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                            tx.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {tx.status}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-gray-400">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
