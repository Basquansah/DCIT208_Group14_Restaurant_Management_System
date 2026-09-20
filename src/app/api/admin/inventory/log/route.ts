import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { requireOwner } from '@/lib/auth';

export async function GET(request: Request) {
  const unauthorized = requireOwner(request);
  if (unauthorized) return unauthorized;

  try {
    const { data, error } = await supabaseServer
      .from('inventory_logs')
      .select('id, ingredient_name, action, quantity, unit, staff_name, created_at')
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) {
      console.error('Unable to load inventory movement history:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data ?? []);
  } catch (error) {
    console.error('Unexpected error loading inventory movement history:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to load inventory movement history.' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const unauthorized = requireOwner(request);
  if (unauthorized) return unauthorized;

  try {
    const body: unknown = await request.json();
    if (typeof body !== 'object' || body === null || Array.isArray(body)) {
      return NextResponse.json({ error: 'Request body must be a JSON object.' }, { status: 400 });
    }
    const input = body as Record<string, unknown>;
    const ingredientId = input.ingredientId;
    const action = input.action;
    const quantity = Number(input.quantity);
    const staffName = String(input.staffName ?? '').trim();
    if ((typeof ingredientId !== 'string' && typeof ingredientId !== 'number')
      || !['RECEIVED', 'ISSUED_TO_KITCHEN'].includes(String(action))
      || !Number.isFinite(quantity) || quantity <= 0 || !staffName) {
      return NextResponse.json(
        { error: 'A valid ingredient, movement type, positive quantity, and staff name are required.' },
        { status: 400 },
      );
    }

    const { data, error } = await supabaseServer.rpc('record_inventory_movement', {
      p_ingredient_id: String(ingredientId),
      p_action: String(action),
      p_quantity: quantity,
      p_staff_name: staffName,
    });
    if (error) {
      console.error('Unable to record inventory movement atomically:', error);
      const status = error.message.includes('Ingredient not found') ? 404
        : error.code === 'P0001' ? 400
          : 500;
      return NextResponse.json(
        { error: error.message },
        { status },
      );
    }
    const updated = Array.isArray(data) ? data[0] : data;
    if (!updated) {
      console.error('Inventory movement RPC returned no updated ingredient.');
      return NextResponse.json({ error: 'Inventory movement did not return an updated ingredient.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      ingredient: {
        id: String(updated.id),
        name: updated.name,
        unit: updated.unit,
        currentStock: Number(updated.current_stock) || 0,
        minimumThreshold: Number(updated.minimum_threshold) || 0,
      },
    });
  } catch (error) {
    console.error('Unexpected error recording inventory movement:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to record inventory movement.' },
      { status: 500 },
    );
  }
}
