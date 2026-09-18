import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import TabNav from '@/components/TabNav';

// Danh sách Tab của hệ thống — thêm module mới thì thêm 1 dòng ở đây
const ALL_TABS = [
  { key: 'khai-bao', label: 'Khai báo', href: '/dashboard/khai-bao' },
  { key: 'nhan-vien', label: 'Nhân viên', href: '/dashboard/nhan-vien' },
  // { key: 'lich-lam', label: 'Lịch làm', href: '/dashboard/lich-lam' },
  // { key: 'cham-cong', label: 'Chấm công', href: '/dashboard/cham-cong' },
];

export default async function DashboardLayout({ children }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, full_name, is_admin')
    .eq('id', user.id)
    .single();

  let visibleTabs = ALL_TABS;
  if (!profile?.is_admin) {
    const { data: perms } = await supabase
      .from('tab_permissions')
      .select('tab_key, can_view')
      .eq('user_id', user.id);
    const viewableKeys = new Set((perms || []).filter((p) => p.can_view).map((p) => p.tab_key));
    visibleTabs = ALL_TABS.filter((t) => viewableKeys.has(t.key));
  }

  if (profile?.is_admin) {
    visibleTabs = [...visibleTabs, { key: 'nguoi-dung', label: 'Người dùng', href: '/dashboard/nguoi-dung' }];
  }

  return (
    <div className="min-h-screen">
      <header className="bg-gradient-to-r from-brand-dark to-brand text-white px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-lg">Quản lý Nhân sự</h1>
          <p className="text-xs opacity-80">
            {profile?.full_name || profile?.username} {profile?.is_admin && '· Admin'}
          </p>
        </div>
        <form action="/api/auth/signout" method="post">
          <button className="text-sm bg-white/15 hover:bg-white/25 rounded-lg px-3 py-1.5">
            Đăng xuất
          </button>
        </form>
      </header>

      <TabNav tabs={visibleTabs} />

      <main className="max-w-6xl mx-auto px-6 py-6">{children}</main>
    </div>
  );
}
