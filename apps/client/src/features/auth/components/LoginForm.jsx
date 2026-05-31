import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';

const API_BASE = '/api/auth';

export function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ nickname: '', password: '' });
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
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }
      const user = data.user;
      const token = data.token;
      if (!user || !token) {
        throw new Error('Login response missing user or token');
      }
      useAuthStore.getState().setSession({ user, token });
      const nickname = user?.nickname;
      setStatus({
        type: 'success',
        message: nickname ? `Logged in as ${nickname}` : 'Logged in successfully',
      });
      setForm({ nickname: '', password: '' });
      const redirectTo = location.state?.from || '/';
      setTimeout(() => navigate(redirectTo, { replace: true }), 600);
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <p className="text-slate-400 mb-6 text-sm">
        Sign in with your nickname and password.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1" htmlFor="auth-nickname">
            Nickname
          </label>
          <input
            id="auth-nickname"
            name="nickname"
            type="text"
            required
            value={form.nickname}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-md bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm mb-1" htmlFor="auth-password">
            Password
          </label>
          <input
            id="auth-password"
            name="password"
            type="password"
            required
            value={form.password}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-md bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-4 py-2 rounded-md bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white font-medium transition-colors"
        >
          {isSubmitting ? 'Logging in…' : 'Log in'}
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
