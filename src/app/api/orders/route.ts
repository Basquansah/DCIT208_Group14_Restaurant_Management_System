import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from('orders')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json(data || []);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const orderNumber = 'SF-' + Math.floor(1000 + Math.random() * 9000);
    const phoneValue = body.phoneNumber || body.phone || body.phonenumber || 'N/A';

    // Using lowercase 'phonenumber' to match PostgreSQL's internal column identifier
    const insertPayload = {
      order_number: orderNumber,
      customer_name: body.customerName || 'Walk-in Customer',
      phonenumber: phoneValue,
      order_source: body.orderSource || 'POS',
      fulfillment: body.fulfillment || 'DINE-IN',
      payment_method: body.paymentMethod || 'CASH',
      payment_status: body.paymentStatus || 'Pending',
      total_amount: Number(body.totalAmount || 0),
      status: body.status || 'Pending',
      items: body.items || '',
      special_notes: body.specialNotes || '',
      handled_by_staff: body.handledByStaff || 'POS Staff',
    };

    const { data, error } = await supabaseServer
      .from('orders')
      .insert([insertPayload])
      .select()
      .single();

    if (error) {
      console.error('Supabase order insert error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, order: data });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { orderId, status, handledByStaff } = await request.json();

    if (!orderId) {
      return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 });
    }

    const updateFields: any = {};
    if (status) updateFields.status = status;
    if (handledByStaff) updateFields.handled_by_staff = handledByStaff;

    const { data, error } = await supabaseServer
      .from('orders')
      .update(updateFields)
      .eq('id', orderId)
      .select();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, order: data[0] });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}