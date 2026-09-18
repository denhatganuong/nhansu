'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function EmployeeForm() {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    ma_nv: '', ho_ten: '', chuc_danh: '', ho_kinh_doanh: '', chi_nhanh: '', dien_thoai: '',
  });
  const router = useRouter();

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const supabase = createClient();
    const { error: insertError } = await supabase.from('employees').insert(form);

    setSaving(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setForm({ ma_nv: '', ho_ten: '', chuc_danh: '', ho_kinh_doanh: '', chi_nhanh: '', dien_thoai: '' });
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="bg-brand hover:bg-brand-dark text-white text-sm font-semibold rounded-lg px-4 py-2"
      >
        + Thêm nhân viên
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl p-6 w-full max-w-md space-y-3 shadow-xl"
      >
        <h3 className="font-bold text-base mb-2">Thêm nhân viên</h3>

        {[
          ['ma_nv', 'Mã NV'],
          ['ho_ten', 'Họ tên'],
          ['chuc_danh', 'Chức danh'],
          ['ho_kinh_doanh', 'Hộ kinh doanh'],
          ['chi_nhanh', 'Chi nhánh'],
          ['dien_thoai', 'Điện thoại'],
        ].map(([field, label]) => (
          <div key={field}>
            <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
            <input
              required={field === 'ma_nv' || field === 'ho_ten'}
              value={form[field]}
              onChange={(e) => update(field, e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-brand"
            />
          </div>
        ))}

        {error && <p className="text-xs text-red-600">{error}</p>}

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex-1 border border-gray-300 rounded-lg py-2 text-sm font-semibold"
          >
            Huỷ
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-brand hover:bg-brand-dark text-white rounded-lg py-2 text-sm font-semibold disabled:opacity-50"
          >
            {saving ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </form>
    </div>
  );
}
