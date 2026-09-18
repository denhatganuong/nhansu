-- ============================================================
-- MIGRATION 2: Khai báo (chức danh, ca làm, cửa hàng)
-- Chạy TIẾP file này trong SQL Editor (không cần chạy lại schema.sql cũ)
-- ============================================================

create table if not exists public.job_titles (
  id uuid primary key default gen_random_uuid(),
  ten text unique not null,
  created_at timestamptz not null default now()
);

create table if not exists public.shifts (
  id uuid primary key default gen_random_uuid(),
  ma_ca text unique not null,
  ten_ca text not null,
  bat_dau time,
  ket_thuc time,
  loai_ca text,
  created_at timestamptz not null default now()
);

create table if not exists public.stores (
  id uuid primary key default gen_random_uuid(),
  ten_cua_hang text unique not null,
  quan_ly_truc_tiep text references public.employees(ma_nv) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.job_titles enable row level security;
alter table public.shifts enable row level security;
alter table public.stores enable row level security;

-- Cả 3 bảng dùng chung quyền tab 'khai-bao'
create policy "job_titles_select" on public.job_titles
  for select to authenticated using (public.can_view_tab('khai-bao'));
create policy "job_titles_write" on public.job_titles
  for all to authenticated using (public.can_edit_tab('khai-bao')) with check (public.can_edit_tab('khai-bao'));

create policy "shifts_select" on public.shifts
  for select to authenticated using (public.can_view_tab('khai-bao'));
create policy "shifts_write" on public.shifts
  for all to authenticated using (public.can_edit_tab('khai-bao')) with check (public.can_edit_tab('khai-bao'));

create policy "stores_select" on public.stores
  for select to authenticated using (public.can_view_tab('khai-bao'));
create policy "stores_write" on public.stores
  for all to authenticated using (public.can_edit_tab('khai-bao')) with check (public.can_edit_tab('khai-bao'));
