'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function SimpleAddForm({ table, title, fields }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState(() => Object.fromEntries(fields.map((f) => [f.name, ''])));
  const router = useRouter();

  function update(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');

    // Loại bỏ field rỗng để không ghi đè giá trị mặc định / null hợp lệ
    const payload = Object.fromEntries(
      Object.entries(form).filter(([, v]) => v !== '')
    );

    const supabase = createClient();
    const { error: insertError } = await supabase.from(table).insert(payload);

    setSaving(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setForm(Object.fromEntries(fields.map((f) => [f.name, ''])));
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="bg-brand hover:bg-brand-dark text-white text-sm font-semibold rounded-lg px-4 py-2"
      >
        + {title}
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 w-full max-w-sm space-y-3 shadow-xl">
        <h3 className="font-bold text-base mb-2">{title}</h3>

        {fields.map((f) => (
          <div key={f.name}>
            <label className="block text-xs font-medium text-gray-500 mb-1">{f.label}</label>
            {f.type === 'select' ? (
              <select
                required={f.required}
                value={form[f.name]}
                onChange={(e) => update(f.name, e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-brand"
              >
                <option value="">— Chọn —</option>
                {(f.options || []).map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            ) : (
              <input
                type={f.type || 'text'}
                required={f.required}
                value={form[f.name]}
                onChange={(e) => update(f.name, e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-brand"
              />
            )}
          </div>
        ))}

        {error && <p className="text-xs text-red-600">{error}</p>}

        <div className="flex gap-2 pt-2">
          <button type="button" onClick={() => setOpen(false)} className="flex-1 border border-gray-300 rounded-lg py-2 text-sm font-semibold">
            Huỷ
          </button>
          <button type="submit" disabled={saving} className="flex-1 bg-brand hover:bg-brand-dark text-white rounded-lg py-2 text-sm font-semibold disabled:opacity-50">
            {saving ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </form>
    </div>
  );
}
