'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data =
        mode === 'login'
          ? await api.login({ email: form.email, password: form.password })
          : await api.register(form);
      login(data.user, data.token);
      router.push('/chat');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0e0e10] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-[-120px] left-[-120px] w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(99,84,217,0.18) 0%, transparent 70%)' }} />
      <div className="absolute bottom-[-100px] right-[-100px] w-80 h-80 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.12) 0%, transparent 70%)' }} />

      <div className="w-full max-w-md bg-[#13121a] border border-[#1e1d26] rounded-2xl p-8 shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl text-[#f0ede8] tracking-tight mb-1">
            {mode === 'login' ? (
              <>Welcome <em className="text-[#a78bfa]">back</em></>
            ) : (
              <>Create <em className="text-[#a78bfa]">account</em></>
            )}
          </h1>
          <p className="text-sm text-[#7b7880] font-light">
            {mode === 'login'
              ? 'Sign in to continue your conversations.'
              : 'Join and start chatting with AI.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-[11px] font-medium text-[#7b7880] uppercase tracking-widest mb-1.5">
                Full name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Jane Smith"
                required
                className="w-full bg-[#1a1a1f] border border-[#2c2b33] rounded-xl px-4 py-3 text-sm text-[#f0ede8] placeholder-[#4a4855] outline-none focus:border-[#6354d9] transition-colors"
              />
            </div>
          )}

          <div>
            <label className="block text-[11px] font-medium text-[#7b7880] uppercase tracking-widest mb-1.5">
              Email address
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              className="w-full bg-[#1a1a1f] border border-[#2c2b33] rounded-xl px-4 py-3 text-sm text-[#f0ede8] placeholder-[#4a4855] outline-none focus:border-[#6354d9] transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#7b7880] uppercase tracking-widest mb-1.5">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              className="w-full bg-[#1a1a1f] border border-[#2c2b33] rounded-xl px-4 py-3 text-sm text-[#f0ede8] placeholder-[#4a4855] outline-none focus:border-[#6354d9] transition-colors"
            />
          </div>

          {mode === 'login' && (
            <div className="flex justify-end">
              <button type="button" className="text-xs text-[#7b7880] hover:text-[#a78bfa] transition-colors">
                Forgot password?
              </button>
            </div>
          )}

          {error && (
            <div className="bg-red-950/40 border border-red-900/50 rounded-xl px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#6354d9] hover:bg-[#7668e8] active:scale-[0.98] rounded-xl text-sm font-medium text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            {loading
              ? mode === 'login' ? 'Signing in…' : 'Creating account…'
              : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-[#4a4855]">
          {mode === 'login' ? (
            <>
              New here?{' '}
              <button onClick={() => { setMode('register'); setError(''); }} className="text-[#a78bfa] hover:underline">
                Create an account →
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button onClick={() => { setMode('login'); setError(''); }} className="text-[#a78bfa] hover:underline">
                Sign in →
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}