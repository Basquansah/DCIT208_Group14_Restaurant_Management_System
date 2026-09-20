import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

// GET: Fetch all staff members
export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from('staff')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json(data || []);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

// POST: Add a new staff member
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, department, phone, role } = body;

    const { data, error } = await supabaseServer
      .from('staff')
      .insert([{ name, department, phone, role }])
      .select();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, staff: data?.[0] });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

// PUT: Update an existing staff member (department, role, name, phone)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, department, phone, role } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Staff ID is required for update' }, { status: 400 });
    }

    const updatePayload: any = {};
    if (name !== undefined) updatePayload.name = name;
    if (department !== undefined) updatePayload.department = department;
    if (phone !== undefined) updatePayload.phone = phone;
    if (role !== undefined) updatePayload.role = role;

    const { data, error } = await supabaseServer
      .from('staff')
      .update(updatePayload)
      .eq('id', id)
      .select();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, staff: data?.[0] });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

// DELETE: Remove a staff member
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Staff ID is required' }, { status: 400 });
    }

    const { error } = await supabaseServer
      .from('staff')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}