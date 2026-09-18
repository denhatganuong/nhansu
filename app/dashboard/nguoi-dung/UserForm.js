'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UserForm() {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ username: '', password: '', full_name: '', is_admin: false });
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const res = await fetch('/api/admin/create-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const result = await res.json();

    setSaving(false);

    if (!res.ok) {
      setError(result.error || 'Có lỗi xảy ra');
      return;
    }

    setForm({ username: '', password: '', full_name: '', is_admin: false });
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="bg-brand hover:bg-brand-dark text-white text-sm font-semibold rounded-lg px-4 py-2"
      >
        + Tạo tài khoản
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 w-full max-w-sm space-y-3 shadow-xl">
        <h3 className="font-bold text-base mb-2">Tạo tài khoản mới</h3>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Tên đăng nhập</label>
          <input
            required
            value={form.username}
            onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-brand"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Mật khẩu</label>
          <input
            required
            type="password"
            minLength={6}
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-brand"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Họ tên</label>
          <input
            value={form.full_name}
            onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-brand"
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.is_admin}
            onChange={(e) => setForm((f) => ({ ...f, is_admin: e.target.checked }))}
          />
          Cấp quyền Admin (toàn quyền mọi Tab)
        </label>

        {error && <p className="text-xs text-red-600">{error}</p>}

        <div className="flex gap-2 pt-2">
          <button type="button" onClick={() => setOpen(false)} className="flex-1 border border-gray-300 rounded-lg py-2 text-sm font-semibold">
            Huỷ
          </button>
          <button type="submit" disabled={saving} className="flex-1 bg-brand hover:bg-brand-dark text-white rounded-lg py-2 text-sm font-semibold disabled:opacity-50">
            {saving ? 'Đang tạo...' : 'Tạo'}
          </button>
        </div>
      </form>
    </div>
  );
}
