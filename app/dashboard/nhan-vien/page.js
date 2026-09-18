import { createClient } from '@/lib/supabase/server';
import EmployeeForm from './EmployeeForm';

export default async function NhanVienPage() {
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
      .eq('tab_key', 'nhan-vien')
      .maybeSingle();
    canEdit = perm?.can_edit || false;
  }

  const { data: employees, error } = await supabase
    .from('employees')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Danh sách nhân viên</h2>
        {canEdit && <EmployeeForm />}
      </div>

      {error && (
        <p className="text-sm text-red-600">
          Không tải được dữ liệu: {error.message}
        </p>
      )}

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3">Mã NV</th>
              <th className="px-4 py-3">Họ tên</th>
              <th className="px-4 py-3">Chức danh</th>
              <th className="px-4 py-3">Hộ KD</th>
              <th className="px-4 py-3">Chi nhánh</th>
              <th className="px-4 py-3">Điện thoại</th>
            </tr>
          </thead>
          <tbody>
            {(employees || []).map((e) => (
              <tr key={e.id} className="border-t border-gray-100">
                <td className="px-4 py-3 font-medium">{e.ma_nv}</td>
                <td className="px-4 py-3">{e.ho_ten}</td>
                <td className="px-4 py-3">{e.chuc_danh || '—'}</td>
                <td className="px-4 py-3">{e.ho_kinh_doanh || '—'}</td>
                <td className="px-4 py-3">{e.chi_nhanh || '—'}</td>
                <td className="px-4 py-3">{e.dien_thoai || '—'}</td>
              </tr>
            ))}
            {(!employees || employees.length === 0) && !error && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  Chưa có nhân viên nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
