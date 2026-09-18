import { createClient, createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const FAKE_EMAIL_DOMAIN = 'hrapp.internal';

export async function POST(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles').select('is_admin').eq('id', user.id).single();
  if (!profile?.is_admin) {
    return NextResponse.json({ error: 'Chỉ Admin mới được tạo tài khoản' }, { status: 403 });
  }

  const { username, password, full_name, is_admin } = await request.json();
  if (!username || !password) {
    return NextResponse.json({ error: 'Thiếu tên đăng nhập hoặc mật khẩu' }, { status: 400 });
  }

  const admin = createAdminClient();
  const email = `${username.trim().toLowerCase()}@${FAKE_EMAIL_DOMAIN}`;

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createError) {
    return NextResponse.json({ error: createError.message }, { status: 400 });
  }

  const { error: profileError } = await admin.from('profiles').insert({
    id: created.user.id,
    username: username.trim().toLowerCase(),
    full_name: full_name || null,
    is_admin: !!is_admin,
  });

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, id: created.user.id });
}
