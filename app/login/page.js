'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const FAKE_EMAIL_DOMAIN = 'hrapp.internal';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const supabase = createClient();
    const email = `${username.trim().toLowerCase()}@${FAKE_EMAIL_DOMAIN}`;

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (signInError) {
      setError('Sai tên đăng nhập hoặc mật khẩu.');
      return;
    }

    router.push('/dashboard');
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white border border-gray-200 rounded-2xl shadow-lg p-8"
      >
        <h1 className="text-xl font-bold text-brand-dark mb-1">Quản lý Nhân sự</h1>
        <p className="text-sm text-gray-500 mb-6">Đăng nhập để tiếp tục</p>

        <label className="block text-sm font-medium mb-1">Tên đăng nhập</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          autoFocus
          className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 outline-none focus:border-brand"
        />

        <label className="block text-sm font-medium mb-1">Mật khẩu</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 outline-none focus:border-brand"
        />

        {error && (
          <p className="text-sm text-red-600 mb-4">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand hover:bg-brand-dark text-white font-semibold rounded-lg py-2.5 transition disabled:opacity-50"
        >
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>

        <p className="text-xs text-gray-400 mt-4">
          Chưa có tài khoản? Liên hệ Admin để được cấp.
        </p>
      </form>
    </div>
  );
}
