import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { createSessionToken, setSessionCookie } from '@/lib/auth';
import { hashPassword } from '@/lib/password';

export async function GET() {
  try {
    const { data: owner, error } = await supabaseServer
      .from('users')
      .select('id')
      .eq('role', 'OWNER')
      .limit(1)
      .maybeSingle();
    if (error) {
      console.error('Unable to check owner registration availability:', error);
      return NextResponse.json({ error: 'Unable to check registration availability.' }, { status: 500 });
    }
    return NextResponse.json({ registrationAvailable: !owner });
  } catch (error) {
    console.error('Unexpected error checking owner registration availability:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to check registration availability.' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    if (typeof body !== 'object' || body === null || Array.isArray(body)) {
      return NextResponse.json({ error: 'Request body must be a JSON object.' }, { status: 400 });
    }

    const input = body as Record<string, unknown>;
    const fullName = String(input.fullName ?? '').trim();
    const phone = String(input.phone ?? '').trim();
    const password = input.password;
    const phoneDigits = phone.replace(/[\s()+-]/g, '');

    if (!fullName || fullName.length > 120) {
      return NextResponse.json({ error: 'Enter your name (up to 120 characters).' }, { status: 400 });
    }
    if (!/^\d{7,15}$/.test(phoneDigits)) {
      return NextResponse.json({ error: 'Enter a valid phone number.' }, { status: 400 });
    }
    if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
      return NextResponse.json({ error: 'Password must be between 8 and 128 characters.' }, { status: 400 });
    }

    const { data: existingOwner, error: ownerLookupError } = await supabaseServer
      .from('users')
      .select('id')
      .eq('role', 'OWNER')
      .limit(1)
      .maybeSingle();
    if (ownerLookupError) {
      console.error('Unable to check whether owner registration is available:', ownerLookupError);
      return NextResponse.json({ error: 'Unable to verify owner registration. Please try again.' }, { status: 500 });
    }
    if (existingOwner) {
      return NextResponse.json(
        { error: 'The restaurant owner account is already registered. Please sign in instead.' },
        { status: 409 },
      );
    }

    const { data: existingPhone, error: phoneLookupError } = await supabaseServer
      .from('users')
      .select('id')
      .eq('phone_number', phone)
      .limit(1)
      .maybeSingle();
    if (phoneLookupError) {
      console.error('Unable to check owner phone number:', phoneLookupError);
      return NextResponse.json({ error: 'Unable to verify this phone number. Please try again.' }, { status: 500 });
    }
    if (existingPhone) {
      return NextResponse.json({ error: 'This phone number is already registered.' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const { data: user, error: insertError } = await supabaseServer
      .from('users')
      .insert({
        full_name: fullName,
        phone_number: phone,
        role: 'OWNER',
        password_hash: passwordHash,
      })
      .select('id, full_name, phone_number, role')
      .single();

    if (insertError || !user) {
      console.error('Unable to create restaurant owner account:', insertError);
      return NextResponse.json(
        { error: insertError?.code === '23505'
          ? 'This phone number or owner account is already registered.'
          : insertError?.message ?? 'Unable to create the owner account.' },
        { status: insertError?.code === '23505' ? 409 : 500 },
      );
    }

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, name: user.full_name, phone: user.phone_number, role: user.role },
    }, { status: 201 });
    setSessionCookie(response, createSessionToken(user.id, user.role));
    return response;
  } catch (error) {
    console.error('Unexpected error registering restaurant owner:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to register owner account.' },
      { status: 500 },
    );
  }
}
