'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';

interface AdminUser {
  _id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  goldCoins: number;
  sweepCoins: number;
  role: 'user' | 'admin';
  kycStatus: 'pending' | 'verified' | 'rejected';
  vipLevel: string;
  isVerified: boolean;
  createdAt: string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [kycFilter, setKycFilter] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
  }, [user, router]);

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, page, kycFilter]);

  const fetchUsers = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: '20' };
      if (search) params.search = search;
      if (kycFilter) params.kycStatus = kycFilter;
      const data = await api.admin.getUsers(token, params);
      setUsers(data.users || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!token) return;
    setActionLoading(userId);
    try {
      await api.admin.updateUserRole(token, userId, newRole);
      setUsers((prev) => prev.map((u) => u._id === userId ? { ...u, role: newRole as 'user' | 'admin' } : u));
    } catch (error) {
      console.error('Failed to update role:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleKYCChange = async (userId: string, newStatus: string) => {
    if (!token) return;
    setActionLoading(userId);
    try {
      await api.admin.updateUserKYC(token, userId, newStatus);
      setUsers((prev) => prev.map((u) => u._id === userId ? { ...u, kycStatus: newStatus as AdminUser['kycStatus'] } : u));
    } catch (error) {
      console.error('Failed to update KYC:', error);
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
            <h1 className="text-3xl font-bold text-white">User Management</h1>
            <p className="text-gray-400 mt-1">View and manage platform users</p>
          </div>
          <Link href="/admin" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
            Back to Admin
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by username or email..."
              className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white w-72 focus:outline-none focus:border-purple-500"
            />
            <button type="submit" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
              Search
            </button>
          </form>
          <select
            value={kycFilter}
            onChange={(e) => { setKycFilter(e.target.value); setPage(1); }}
            className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
          >
            <option value="">All KYC</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Users Table */}
        <div className="bg-gray-800/60 border border-purple-500/20 rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading users...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-700 bg-gray-800/80">
                    <th className="text-left py-3 px-4">User</th>
                    <th className="text-left py-3 px-4">Email</th>
                    <th className="text-right py-3 px-4">GC</th>
                    <th className="text-right py-3 px-4">SC</th>
                    <th className="text-left py-3 px-4">VIP</th>
                    <th className="text-left py-3 px-4">KYC</th>
                    <th className="text-left py-3 px-4">Role</th>
                    <th className="text-left py-3 px-4">Joined</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                      <td className="py-3 px-4 text-white font-medium">{u.username}</td>
                      <td className="py-3 px-4 text-gray-300">{u.email}</td>
                      <td className="py-3 px-4 text-right text-yellow-400">{u.goldCoins.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right text-green-400">{u.sweepCoins.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="py-3 px-4 text-gray-300 capitalize">{u.vipLevel}</td>
                      <td className="py-3 px-4">
                        <select
                          value={u.kycStatus}
                          onChange={(e) => handleKYCChange(u._id, e.target.value)}
                          disabled={actionLoading === u._id}
                          className={`px-2 py-1 rounded text-xs font-medium bg-gray-700 border-none cursor-pointer ${
                            u.kycStatus === 'verified' ? 'text-green-400' :
                            u.kycStatus === 'rejected' ? 'text-red-400' :
                            'text-yellow-400'
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="verified">Verified</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          disabled={actionLoading === u._id || u._id === user?.id}
                          className={`px-2 py-1 rounded text-xs font-medium bg-gray-700 border-none cursor-pointer ${
                            u.role === 'admin' ? 'text-purple-400' : 'text-gray-300'
                          }`}
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="py-3 px-4 text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        {actionLoading === u._id && <span className="text-xs text-yellow-400">Saving...</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
