-- ============================================================
-- CHẠY FILE NÀY TRONG: Supabase Dashboard → SQL Editor → New query
-- Dán toàn bộ nội dung file này vào rồi bấm "Run"
-- ============================================================

-- 1) Bảng hồ sơ người dùng (gắn với tài khoản đăng nhập)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  full_name text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

-- 2) Bảng phân quyền theo từng Tab (mở rộng thêm tab nào thì thêm dòng, không cần đổi cấu trúc)
create table if not exists public.tab_permissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  tab_key text not null,       -- ví dụ: 'nhan-vien', 'lich-lam', 'cham-cong'...
  can_view boolean not null default true,
  can_edit boolean not null default false,
  unique (user_id, tab_key)
);

-- 3) Bảng Nhân viên (module đầu tiên)
create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  ma_nv text unique not null,
  ho_ten text not null,
  chuc_danh text,
  ho_kinh_doanh text,
  chi_nhanh text,
  dien_thoai text,
  ngay_vao_lam date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4) Hàm kiểm tra "có phải admin không" — dùng SECURITY DEFINER để tránh đệ quy trong RLS
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select coalesce(
    (select is_admin from public.profiles where id = auth.uid()),
    false
  );
$$;

-- 5) Hàm kiểm tra quyền xem / sửa 1 tab cụ thể
create or replace function public.can_view_tab(p_tab_key text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select public.is_admin() or coalesce(
    (select can_view from public.tab_permissions
     where user_id = auth.uid() and tab_key = p_tab_key),
    false
  );
$$;

create or replace function public.can_edit_tab(p_tab_key text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select public.is_admin() or coalesce(
    (select can_edit from public.tab_permissions
     where user_id = auth.uid() and tab_key = p_tab_key),
    false
  );
$$;

-- 6) Bật Row Level Security (bắt buộc — nếu không bật, ai có anon key cũng đọc được hết)
alter table public.profiles enable row level security;
alter table public.tab_permissions enable row level security;
alter table public.employees enable row level security;

-- 7) Policy cho profiles: ai đã đăng nhập cũng xem được danh sách người dùng (cần cho trang Admin);
--    việc tạo/sửa/xoá tài khoản chỉ làm qua Route Handler phía server (dùng secret key, bỏ qua RLS)
create policy "profiles_select_authenticated" on public.profiles
  for select to authenticated using (true);

-- 8) Policy cho tab_permissions: user xem quyền của chính mình; admin xem/sửa tất cả
create policy "tab_permissions_select_own" on public.tab_permissions
  for select to authenticated using (user_id = auth.uid() or public.is_admin());

create policy "tab_permissions_admin_all" on public.tab_permissions
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- 9) Policy cho employees: theo quyền tab 'nhan-vien'
create policy "employees_select" on public.employees
  for select to authenticated using (public.can_view_tab('nhan-vien'));

create policy "employees_insert" on public.employees
  for insert to authenticated with check (public.can_edit_tab('nhan-vien'));

create policy "employees_update" on public.employees
  for update to authenticated using (public.can_edit_tab('nhan-vien')) with check (public.can_edit_tab('nhan-vien'));

create policy "employees_delete" on public.employees
  for delete to authenticated using (public.can_edit_tab('nhan-vien'));

-- ============================================================
-- Sau khi chạy xong, tạo TÀI KHOẢN ADMIN ĐẦU TIÊN bằng cách:
-- 1. Vào Authentication → Users → Add user → nhập email dạng
--    admin@hrapp.internal và 1 mật khẩu
-- 2. Copy "User UID" vừa tạo
-- 3. Chạy tiếp lệnh dưới đây (thay UID và username thật vào):
--
-- insert into public.profiles (id, username, full_name, is_admin)
-- values ('DÁN-UID-VÀO-ĐÂY', 'admin', 'Quản trị viên', true);
-- ============================================================
