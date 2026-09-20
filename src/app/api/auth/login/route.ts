import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { createSessionToken, setSessionCookie } from '@/lib/auth';
import { verifyPassword } from '@/lib/password';

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    if (typeof body !== 'object' || body === null || Array.isArray(body)) {
      return NextResponse.json({ error: 'Request body must be a JSON object.' }, { status: 400 });
    }
    const { phone, password, role, fullName } = body as {
      phone?: unknown;
      password?: unknown;
      role?: unknown;
      fullName?: unknown;
    };
    const loginPhone = typeof phone === 'string' ? phone.trim() : '';
    if (!loginPhone
      || typeof password !== 'string' || !password
      || typeof role !== 'string' || !['OWNER', 'STAFF', 'KITCHEN'].includes(role)) {
      return NextResponse.json({ error: 'Phone number, password, and a valid role are required.' }, { status: 400 });
    }
    if (role === 'OWNER' && (typeof fullName !== 'string' || !fullName.trim())) {
      return NextResponse.json({ error: 'Owner name is required.' }, { status: 400 });
    }
    const ownerName = typeof fullName === 'string' ? fullName.trim() : '';

    let user;
    let error;
    if (role === 'OWNER') {
      const { data: owners, error: ownerLookupError } = await supabaseServer
        .from('users')
        .select('id, full_name, phone_number, role, password_hash')
        .eq('role', 'OWNER')
        .limit(100);
      error = ownerLookupError;

      if (!ownerLookupError) {
        const normalizedPhone = loginPhone.replace(/[\s()+-]/g, '');
        user = (owners ?? []).find((owner) =>
          String(owner.full_name ?? '').trim().toLocaleLowerCase() === ownerName.toLocaleLowerCase()
          && String(owner.phone_number ?? '').replace(/[\s()+-]/g, '') === normalizedPhone,
        ) ?? null;
      }
    } else {
      const result = await supabaseServer
        .from('users')
        .select('id, full_name, phone_number, role, password_hash')
        .eq('phone_number', loginPhone)
        .eq('role', role)
        .maybeSingle();
      user = result.data;
      error = result.error;
    }

    if (error || !user) {
      return NextResponse.json({ error: 'Invalid phone number or password.' }, { status: 401 });
    }

    if (role === 'OWNER' && typeof fullName === 'string' && fullName.trim()
      && fullName.trim().toLocaleLowerCase() !== String(user.full_name ?? '').trim().toLocaleLowerCase()) {
      return NextResponse.json({ error: 'Invalid owner name, phone number, or password.' }, { status: 401 });
    }

    if (typeof user.password_hash !== 'string' || !await verifyPassword(password, user.password_hash)) {
      return NextResponse.json({ error: 'Invalid phone number or password.' }, { status: 401 });
    }

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, name: user.full_name, phone: user.phone_number, role: user.role }
    });
    setSessionCookie(response, createSessionToken(user.id, user.role));
    return response;
  } catch (error) {
    console.error('Unable to authenticate user.', error);
    return NextResponse.json({ error: 'Server authentication error.' }, { status: 500 });
  }
}