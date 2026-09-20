import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function POST(request: Request) {
  const { ingredientName, action, quantity, unit, staffName } = await request.json();

  const { data, error } = await supabaseServer.from('inventory_logs').insert([
    {
      ingredient_name: ingredientName,
      action: action, // 'RECEIVED' or 'ISSUED_TO_KITCHEN'
      quantity: quantity,
      unit: unit,
      staff_name: staffName,
    }
  ]).select();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true, log: data[0] });
}