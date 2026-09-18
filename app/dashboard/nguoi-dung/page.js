import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import UserForm from './UserForm';

export default async function NguoiDungPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from('profiles').select('is_admin').eq('id', user.id).single();

  if (!profile?.is_admin) redirect('/dashboard');

  const { data: users } = await supabase
    .from('profiles')
    .select('id, username, full_name, is_admin, created_at')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Quản lý người dùng</h2>
        <UserForm />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3">Tên đăng nhập</th>
              <th className="px-4 py-3">Họ tên</th>
              <th className="px-4 py-3">Vai trò</th>
            </tr>
          </thead>
          <tbody>
            {(users || []).map((u) => (
              <tr key={u.id} className="border-t border-gray-100">
                <td className="px-4 py-3 font-medium">{u.username}</td>
                <td className="px-4 py-3">{u.full_name || '—'}</td>
                <td className="px-4 py-3">{u.is_admin ? 'Admin' : 'Nhân viên'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-400">
        Gán quyền chi tiết theo từng Tab: mở bảng <code>tab_permissions</code> trong Supabase Table Editor,
        thêm dòng với user_id + tab_key (vd. "nhan-vien") + can_view/can_edit. Bản nâng cấp sau sẽ có
        giao diện gán quyền ngay trong trang này.
      </p>
    </div>
  );
}
