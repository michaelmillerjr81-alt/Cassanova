'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';

interface AdminTransaction {
  _id: string;
  type: string;
  currency: string;
  amount: number;
  status: string;
  cryptoCurrency?: string;
  cryptoAmount?: number;
  walletAddress?: string;
  description?: string;
  createdAt: string;
  userId?: { _id: string; username: string; email: string };
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

export default function AdminTransactionsPage() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
  }, [user, router]);

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, page, typeFilter, statusFilter]);

  const fetchTransactions = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: '20' };
      if (typeFilter) params.type = typeFilter;
      if (statusFilter) params.status = statusFilter;
      const data = await api.admin.getTransactions(token, params);
      setTransactions(data.transactions || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (transactionId: string, newStatus: string) => {
    if (!token) return;
    setActionLoading(transactionId);
    try {
      const result = await api.admin.updateTransactionStatus(token, transactionId, newStatus);
      if (result.transaction) {
        setTransactions((prev) =>
          prev.map((tx) => tx._id === transactionId ? { ...tx, status: newStatus } : tx)
        );
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setActionLoading(null);
    }
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">All Transactions</h1>
            <p className="text-gray-400 mt-1">View and manage platform transactions</p>
          </div>
          <Link href="/admin" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
            Back to Admin
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
          >
            <option value="">All Types</option>
            <option value="gc_purchase">GC Purchase</option>
            <option value="sc_redemption">SC Redemption</option>
            <option value="gc_bet">GC Bet</option>
            <option value="gc_win">GC Win</option>
            <option value="sc_bet">SC Bet</option>
            <option value="sc_win">SC Win</option>
            <option value="daily_bonus">Daily Bonus</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Transactions Table */}
        <div className="bg-gray-800/60 border border-purple-500/20 rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading transactions...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-700 bg-gray-800/80">
                    <th className="text-left py-3 px-4">User</th>
                    <th className="text-left py-3 px-4">Type</th>
                    <th className="text-left py-3 px-4">Currency</th>
                    <th className="text-right py-3 px-4">Amount</th>
                    <th className="text-left py-3 px-4">Crypto</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Date</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx._id} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                      <td className="py-3 px-4 text-white">{tx.userId?.username || 'Unknown'}</td>
                      <td className="py-3 px-4 text-gray-300">{TYPE_LABELS[tx.type] || tx.type}</td>
                      <td className="py-3 px-4 text-gray-300">{tx.currency}</td>
                      <td className="py-3 px-4 text-right text-white">{tx.amount.toLocaleString()}</td>
                      <td className="py-3 px-4 text-gray-400">
                        {tx.cryptoCurrency && (
                          <span>{tx.cryptoAmount} {tx.cryptoCurrency}</span>
                        )}
                        {tx.walletAddress && (
                          <div className="text-xs text-gray-500 truncate max-w-[120px]" title={tx.walletAddress}>
                            {tx.walletAddress}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          tx.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                          tx.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                          tx.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-400">{new Date(tx.createdAt).toLocaleString()}</td>
                      <td className="py-3 px-4">
                        {tx.status === 'pending' ? (
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleStatusChange(tx._id, 'completed')}
                              disabled={actionLoading === tx._id}
                              className="px-2 py-1 bg-green-600/30 hover:bg-green-600/50 text-green-400 rounded text-xs transition-colors disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleStatusChange(tx._id, 'cancelled')}
                              disabled={actionLoading === tx._id}
                              className="px-2 py-1 bg-red-600/30 hover:bg-red-600/50 text-red-400 rounded text-xs transition-colors disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {transactions.length === 0 && (
                <div className="p-8 text-center text-gray-400">No transactions found</div>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg disabled:opacity-50 transition-colors"
            >
              Previous
            </button>
            <span className="text-gray-400">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg disabled:opacity-50 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
