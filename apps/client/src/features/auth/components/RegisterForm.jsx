import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authFetch } from '../../../api/authFetch.js';

const API_BASE = '/api/auth';

export function RegisterForm({ showRole = false, onRegistered }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ nickname: '', password: '', role: 'user' });
  const [status, setStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    setIsSubmitting(true);
    try {
      const res = await authFetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Registration failed');
      }
      setStatus({ type: 'success', message: 'User registered successfully' });
      setForm({ nickname: '', password: '', role: 'user' });
      // Public registration: redirect to login. Admin Users: stay on tab and refresh list.
      setTimeout(() => {
        if (showRole) {
          if (typeof onRegistered === 'function') {
            onRegistered();
          }
        } else {
          navigate('/login', { replace: true });
        }
      }, 1000);
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Register</h1>
      <p className="text-slate-400 mb-6 text-sm">
        {showRole
          ? 'Create a user. Choose role: user or administrator.'
          : 'Enter nickname and password (password can be any, minimum 1 symbol).'}
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1" htmlFor="register-nickname">
            Nickname
          </label>
          <input
            id="register-nickname"
            name="nickname"
            type="text"
            required
            minLength={1}
            value={form.nickname}
            onChange={handleChange}
            placeholder="Display name"
            className="w-full px-3 py-2 rounded-md bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm mb-1" htmlFor="register-password">
            Password
          </label>
          <input
            id="register-password"
            name="password"
            type="password"
            required
            minLength={1}
            value={form.password}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-md bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {showRole && (
          <div>
            <label className="block text-sm mb-1" htmlFor="register-role">
              Role
            </label>
            <select
              id="register-role"
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-md bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="user">User</option>
              <option value="administrator">Administrator</option>
            </select>
          </div>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-4 py-2 rounded-md bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white font-medium transition-colors"
        >
          {isSubmitting ? 'Saving…' : 'Register'}
        </button>
      </form>
      {status && (
        <div
          className={`mt-4 text-sm ${
            status.type === 'success' ? 'text-green-400' : 'text-red-400'
          }`}
        >
          {status.message}
        </div>
      )}
    </div>
  );
}
