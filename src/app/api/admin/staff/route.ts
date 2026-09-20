import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { requireOwner } from '@/lib/auth';

// GET: Fetch staff list & calculate sales leaderboard
export async function GET(request: Request) {
  const unauthorized = requireOwner(request);
  if (unauthorized) return unauthorized;

  try {
    const { data: staff, error: staffError } = await supabaseServer
      .from('users')
      .select('id, full_name, phone_number, role')
      .in('role', ['STAFF', 'KITCHEN']);
    if (staffError) {
      console.error('Unable to load admin staff:', staffError);
      return NextResponse.json({ error: staffError.message }, { status: 500 });
    }

    const { data: orders, error: ordersError } = await supabaseServer
      .from('orders')
      .select('staff_id, staff_name, total_amount')
      .eq('status', 'COMPLETED');
    if (ordersError) {
      console.error('Unable to load completed orders for staff sales:', ordersError);
      return NextResponse.json({ error: ordersError.message }, { status: 500 });
    }

    return NextResponse.json((staff ?? []).map((member) => {
      const userSales = (orders ?? [])
        .filter((order) =>
          (order.staff_id !== null && String(order.staff_id) === String(member.id))
          || (order.staff_name !== null
            && order.staff_name.trim().toLowerCase() === member.full_name.trim().toLowerCase()),
        )
        .reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0);
      return { ...member, totalSalesGHS: userSales };
    }));
  } catch (error) {
    console.error('Unexpected error loading admin staff:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to load staff.' },
      { status: 500 },
    );
  }
}

// POST: Register new staff account
export async function POST(request: Request) {
  const unauthorized = requireOwner(request);
  if (unauthorized) return unauthorized;

  try {
    const body: unknown = await request.json();
    if (typeof body !== 'object' || body === null || Array.isArray(body)) {
      return NextResponse.json({ error: 'Request body must be a JSON object.' }, { status: 400 });
    }
    const { name, phone, role, password } = body as Record<string, unknown>;
    if (typeof name !== 'string' || !name.trim()
      || typeof phone !== 'string' || !phone.trim()
      || !['STAFF', 'KITCHEN'].includes(String(role))
      || typeof password !== 'string' || password.length < 4) {
      return NextResponse.json(
        { error: 'Provide a name, phone, valid staff role, and password of at least four characters.' },
        { status: 400 },
      );
    }

    const { data, error } = await supabaseServer.from('users').insert({
      full_name: name.trim(),
      phone_number: phone.trim(),
      role,
      password_hash: password,
    }).select('id, full_name, phone_number, role').single();
    if (error) {
      console.error('Unable to create staff account:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ success: true, newStaff: data }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error creating staff account:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to create staff account.' },
      { status: 500 },
    );
  }
}

// PUT: Edit existing staff details (Phone, Name, Role, or Reset Password)
export async function PUT(request: Request) {
  const unauthorized = requireOwner(request);
  if (unauthorized) return unauthorized;

  try {
    const body: unknown = await request.json();
    if (typeof body !== 'object' || body === null || Array.isArray(body)) {
      return NextResponse.json({ error: 'Request body must be a JSON object.' }, { status: 400 });
    }
    const { id, name, phone, role, password } = body as Record<string, unknown>;
    if ((typeof id !== 'string' && typeof id !== 'number') || !String(id).trim()
      || typeof name !== 'string' || !name.trim()
      || typeof phone !== 'string' || !phone.trim()
      || !['STAFF', 'KITCHEN'].includes(String(role))
      || (password !== undefined && typeof password !== 'string')) {
      return NextResponse.json({ error: 'Valid staff ID, name, phone number, and role are required.' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {
      full_name: name.trim(),
      phone_number: phone.trim(),
      role,
    };
    if (typeof password === 'string' && password.trim()) {
      if (password.length < 4) return NextResponse.json({ error: 'Password must be at least four characters.' }, { status: 400 });
      updateData.password_hash = password;
    }

    const { data, error } = await supabaseServer
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select('id, full_name, phone_number, role')
      .maybeSingle();

    if (error) {
      console.error('Unable to update staff details:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (!data) return NextResponse.json({ error: 'Staff account not found.' }, { status: 404 });
    return NextResponse.json({ success: true, updatedStaff: data });
  } catch (error) {
    console.error('Unexpected error updating staff details:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update staff details.' },
      { status: 500 },
    );
  }
}

// DELETE: Remove staff account
export async function DELETE(request: Request) {
  const unauthorized = requireOwner(request);
  if (unauthorized) return unauthorized;

  const { searchParams } = new URL(request.url);
  const staffId = searchParams.get('id');

  if (!staffId) return NextResponse.json({ error: 'Staff ID required' }, { status: 400 });

  try {
    const { data, error } = await supabaseServer
      .from('users')
      .delete()
      .eq('id', staffId)
      .select('id')
      .maybeSingle();
    if (error) {
      console.error('Unable to remove staff account:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (!data) return NextResponse.json({ error: 'Staff account not found.' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error removing staff account:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to remove staff account.' },
      { status: 500 },
    );
  }
}