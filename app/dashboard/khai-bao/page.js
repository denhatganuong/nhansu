import { createClient } from '@/lib/supabase/server';
import SimpleAddForm from './SimpleAddForm';

export default async function KhaiBaoPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from('profiles').select('is_admin').eq('id', user.id).single();

  let canEdit = profile?.is_admin || false;
  if (!canEdit) {
    const { data: perm } = await supabase
      .from('tab_permissions')
      .select('can_edit')
      .eq('user_id', user.id)
      .eq('tab_key', 'khai-bao')
      .maybeSingle();
    canEdit = perm?.can_edit || false;
  }

  const [{ data: jobTitles }, { data: shifts }, { data: stores }, { data: employees }] = await Promise.all([
    supabase.from('job_titles').select('*').order('ten'),
    supabase.from('shifts').select('*').order('ma_ca'),
    supabase.from('stores').select('*').order('ten_cua_hang'),
    supabase.from('employees').select('ma_nv, ho_ten').order('ho_ten'),
  ]);

  return (
    <div className="space-y-8">
      {/* Chức danh */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Chức danh</h2>
          {canEdit && (
            <SimpleAddForm
              table="job_titles"
              title="Thêm chức danh"
              fields={[{ name: 'ten', label: 'Tên chức danh', required: true }]}
            />
          )}
        </div>
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr><th className="px-4 py-2">Chức danh</th></tr>
            </thead>
            <tbody>
              {(jobTitles || []).map((j) => (
                <tr key={j.id} className="border-t border-gray-100">
                  <td className="px-4 py-2">{j.ten}</td>
                </tr>
              ))}
              {(!jobTitles || jobTitles.length === 0) && (
                <tr><td className="px-4 py-6 text-center text-gray-400">Chưa có chức danh nào.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Ca làm */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Ca làm</h2>
          {canEdit && (
            <SimpleAddForm
              table="shifts"
              title="Thêm ca làm"
              fields={[
                { name: 'ma_ca', label: 'Mã ca', required: true },
                { name: 'ten_ca', label: 'Tên ca', required: true },
                { name: 'bat_dau', label: 'Bắt đầu', type: 'time' },
                { name: 'ket_thuc', label: 'Kết thúc', type: 'time' },
                { name: 'loai_ca', label: 'Loại ca (VD: Ca 1, Ca 2, Ca đặc biệt)' },
              ]}
            />
          )}
        </div>
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-4 py-2">Mã ca</th>
                <th className="px-4 py-2">Tên ca</th>
                <th className="px-4 py-2">Bắt đầu</th>
                <th className="px-4 py-2">Kết thúc</th>
                <th className="px-4 py-2">Loại ca</th>
              </tr>
            </thead>
            <tbody>
              {(shifts || []).map((s) => (
                <tr key={s.id} className="border-t border-gray-100">
                  <td className="px-4 py-2 font-medium">{s.ma_ca}</td>
                  <td className="px-4 py-2">{s.ten_ca}</td>
                  <td className="px-4 py-2">{s.bat_dau || '—'}</td>
                  <td className="px-4 py-2">{s.ket_thuc || '—'}</td>
                  <td className="px-4 py-2">{s.loai_ca || '—'}</td>
                </tr>
              ))}
              {(!shifts || shifts.length === 0) && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-400">Chưa có ca làm nào.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Cửa hàng */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Cửa hàng</h2>
          {canEdit && (
            <SimpleAddForm
              table="stores"
              title="Thêm cửa hàng"
              fields={[
                { name: 'ten_cua_hang', label: 'Tên cửa hàng', required: true },
                {
                  name: 'quan_ly_truc_tiep',
                  label: 'Quản lý trực tiếp (Mã NV)',
                  type: 'select',
                  options: (employees || []).map((e) => ({ value: e.ma_nv, label: `${e.ma_nv} - ${e.ho_ten}` })),
                },
              ]}
            />
          )}
        </div>
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-4 py-2">Cửa hàng</th>
                <th className="px-4 py-2">Quản lý trực tiếp</th>
              </tr>
            </thead>
            <tbody>
              {(stores || []).map((s) => {
                const mgr = (employees || []).find((e) => e.ma_nv === s.quan_ly_truc_tiep);
                return (
                  <tr key={s.id} className="border-t border-gray-100">
                    <td className="px-4 py-2 font-medium">{s.ten_cua_hang}</td>
                    <td className="px-4 py-2">{mgr ? `${mgr.ma_nv} - ${mgr.ho_ten}` : '—'}</td>
                  </tr>
                );
              })}
              {(!stores || stores.length === 0) && (
                <tr><td colSpan={2} className="px-4 py-6 text-center text-gray-400">Chưa có cửa hàng nào.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
