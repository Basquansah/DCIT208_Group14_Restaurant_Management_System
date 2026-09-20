import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { requireOwner } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const unauthorized = requireOwner(request);
  if (unauthorized) return unauthorized;

  try {
    const { data, error } = await supabaseServer
      .from('ingredients')
      .select('id, name, unit, current_stock, minimum_threshold')
      .order('name', { ascending: true });
    if (error) {
      console.error('Unable to load ingredient inventory:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json((data ?? []).map((ingredient) => ({
      id: String(ingredient.id),
      name: ingredient.name,
      unit: ingredient.unit,
      currentStock: Number(ingredient.current_stock) || 0,
      minimumThreshold: Number(ingredient.minimum_threshold) || 0,
    })));
  } catch (error) {
    console.error('Unexpected error loading inventory:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to load inventory.' },
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
    const name = String(input.name ?? '').trim();
    const unit = String(input.unit ?? '').trim().toLowerCase();
    const currentStock = Number(input.currentStock ?? 0);
    const minimumThreshold = Number(input.minimumThreshold ?? 0);
    if (!name || !['kg', 'litres'].includes(unit)
      || !Number.isFinite(currentStock) || currentStock < 0
      || !Number.isFinite(minimumThreshold) || minimumThreshold < 0) {
      return NextResponse.json(
        { error: 'Provide a name, kg/litres unit, and non-negative stock and alert threshold.' },
        { status: 400 },
      );
    }

    const { data, error } = await supabaseServer
      .from('ingredients')
      .insert({
        name,
        unit,
        current_stock: currentStock,
        minimum_threshold: minimumThreshold,
      })
      .select('id, name, unit, current_stock, minimum_threshold')
      .single();
    if (error) {
      console.error('Unable to create ingredient:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      ingredient: {
        id: String(data.id),
        name: data.name,
        unit: data.unit,
        currentStock: Number(data.current_stock) || 0,
        minimumThreshold: Number(data.minimum_threshold) || 0,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error creating ingredient:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to create ingredient.' },
      { status: 500 },
    );
  }
}
