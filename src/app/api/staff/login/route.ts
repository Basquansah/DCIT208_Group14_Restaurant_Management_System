import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function POST(request: Request) {
  try {
    const { phone, pinCode } = await request.json();

    if (!phone || !pinCode) {
      return NextResponse.json(
        { success: false, error: 'Phone number and PIN are required.' },
        { status: 400 }
      );
    }

    const { data: staff, error } = await supabaseServer
      .from('staff_users')
      .select('*')
      .eq('phone', phone)
      .eq('pin_code', pinCode)
      .maybeSingle();

    if (error) {
      console.error('Supabase query error:', error);
      return NextResponse.json(
        { success: false, error: 'Database query failed: ' + error.message },
        { status: 500 }
      );
    }

    if (!staff) {
      return NextResponse.json(
        { success: false, error: 'Invalid phone number or PIN code.' },
        { status: 401 }
      );
    }

    let sessionId = null;
    try {
      const { data: session } = await supabaseServer
        .from('staff_sessions')
        .insert({
          staff_id: staff.id,
          staff_name: staff.name,
        })
        .select()
        .maybeSingle();

      if (session) {
        sessionId = session.id;
      }
    } catch (sessionErr) {
      console.warn('Session logging failed, but staff authenticated:', sessionErr);
    }

    return NextResponse.json({
      success: true,
      staff: { id: staff.id, name: staff.name, role: staff.role },
      sessionId,
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { success: false, error: 'Server error: ' + errorMessage },
      { status: 500 }
    );
  }
}