import { useEffect, useMemo, useState } from 'react';
import { RegisterForm } from '../../auth';
import { authFetch } from '../../../api/authFetch.js';

const API_BASE = '/api/admin';

export function AdminRegister() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const loadUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authFetch(`${API_BASE}/users`);
      const data = await res.json().catch(() => []);
      if (!res.ok) {
        throw new Error(data.message || 'Failed to load users');
      }
      setUsers(Array.isArray(data) ? data : data.users || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      if (!term) return true;
      const haystack = `${u.nickname || ''} ${u.login || ''} ${u.email || ''}`.toLowerCase();
      return haystack.includes(term);
    });
  }, [users, search, roleFilter]);

  const handleDelete = async (user) => {
    if (!user.id) return;
    if (!window.confirm(`Delete user "${user.nickname}"?`)) return;
    try {
      const res = await authFetch(`${API_BASE}/users/${encodeURIComponent(user.id)}`, {
        method: 'DELETE',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'Failed to delete user');
      }
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-4 max-w-6xl">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 bg-white/5 border border-white/10 backdrop-blur-xl shadow-inner shadow-black/20">
            <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-cyan-300 to-fuchsia-400" />
            <span className="text-xs text-white/70">Users</span>
          </div>
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight mt-3">Users and administrators</h1>
          <p className="text-xs text-white/50 mt-1">Search, filter, and remove accounts.</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[360px_1fr] items-start">
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-inner shadow-black/20 p-4 relative overflow-hidden">
          <div className="pointer-events-none absolute -top-12 -right-14 w-40 h-40 rounded-full bg-fuchsia-400/15 blur-3xl" />
          <div className="relative">
            <RegisterForm showRole onRegistered={loadUsers} />
          </div>
        </div>

        <section className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-inner shadow-black/20 p-4 relative overflow-hidden">
          <div className="pointer-events-none absolute -top-16 -left-16 w-44 h-44 rounded-full bg-cyan-300/12 blur-3xl" />
          <div className="relative">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-3">
              <div>
                <div className="text-sm font-semibold tracking-tight">Directory</div>
                <div className="text-xs text-white/50 mt-1">
                  Find accounts by nickname, login, or email.
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <div>
                  <label className="block text-xs mb-1 text-white/60" htmlFor="users-search">
                    Search
                  </label>
                  <input
                    id="users-search"
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="nickname, login, email"
                    className="px-3 py-1.5 rounded-xl bg-slate-900 text-slate-100 border border-slate-600/90 text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                  />
                </div>

                <div>
                  <label className="block text-xs mb-1 text-white/60" htmlFor="users-role-filter">
                    Role
                  </label>
                  <select
                    id="users-role-filter"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 text-slate-100 border border-slate-600/90 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                  >
                    <option value="all" className="bg-slate-900 text-slate-100">
                      All
                    </option>
                    <option value="user" className="bg-slate-900 text-slate-100">
                      User
                    </option>
                    <option value="administrator" className="bg-slate-900 text-slate-100">
                      Administrator
                    </option>
                  </select>
                </div>

                <div className="self-end">
                  <button
                    type="button"
                    onClick={loadUsers}
                    disabled={isLoading}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-60 border border-white/10 text-xs text-white/80 backdrop-blur-xl shadow-inner shadow-black/20"
                  >
                    {isLoading ? 'Refreshing…' : 'Refresh'}
                  </button>
                </div>
              </div>
            </div>

            {error && <p className="text-xs text-red-200 mb-2">{error}</p>}

            <div className="overflow-auto rounded-2xl border border-white/10 bg-slate-950/40">
              <table className="min-w-full text-xs">
                <thead className="bg-slate-900/50">
                  <tr>
                    <th className="text-left px-2 py-2 border-b border-white/10 text-slate-200">Nickname</th>
                    <th className="text-left px-2 py-2 border-b border-white/10 text-slate-200">Role</th>
                    <th className="text-right px-2 py-2 border-b border-white/10 text-slate-200">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-3 py-6 text-center text-slate-400">
                        {isLoading ? 'Loading users…' : 'No users found.'}
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id || u.nickname} className="hover:bg-white/5">
                        <td className="px-2 py-2 border-t border-white/10 text-slate-100 font-medium">
                          {u.nickname || '—'}
                        </td>
                        <td className="px-2 py-2 border-t border-white/10 text-slate-200">
                          {u.role === 'administrator'
                            ? 'Administrator'
                            : u.role === 'user'
                              ? 'User'
                              : u.role || 'User'}
                        </td>
                        <td className="px-2 py-2 border-t border-white/10 text-right">
                          <button
                            type="button"
                            onClick={() => handleDelete(u)}
                            className="px-3 py-1 rounded-xl bg-red-500/10 hover:bg-red-500/15 border border-red-400/25 text-[11px] text-red-100 shadow-inner shadow-black/20"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
