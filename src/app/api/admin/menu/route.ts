import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { requireOwner } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function menuCategory(value: unknown): string {
  const category = String(value ?? '').trim();
  return ['Staples', 'Proteins', 'Stews & Soups'].includes(category) ? category : '';
}

function validationError(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

async function categoryIdFor(category: string) {
  const { data, error } = await supabaseServer
    .from('categories')
    .select('id')
    .eq('name', category)
    .maybeSingle();

  if (error && error.code !== '42P01' && error.code !== 'PGRST205') throw error;
  return data?.id;
}

export async function GET(request: Request) {
  const unauthorized = requireOwner(request);
  if (unauthorized) return unauthorized;

  try {
    let { data, error } = await supabaseServer
      .from('menu_items')
      .select('*, categories(name)')
      .order('name', { ascending: true });
    if (error && (error.code === 'PGRST200' || error.code === 'PGRST204' || error.code === '42703')) {
      ({ data, error } = await supabaseServer
        .from('menu_items')
        .select('*')
        .order('name', { ascending: true }));
    }
    if (error) {
      console.error('Unable to load admin menu:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data ?? []);
  } catch (error) {
    console.error('Unexpected error loading admin menu:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to load menu.' },
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
      return validationError('Request body must be a JSON object.');
    }
    const input = body as Record<string, unknown>;
    const name = String(input.name ?? '').trim();
    const category = menuCategory(input.category);
    const price = Number(input.price);
    if (!name || !category || !Number.isFinite(price) || price < 0) {
      return validationError('A name, supported category, and non-negative price are required.');
    }

    const categoryId = await categoryIdFor(category);
    const payload: Record<string, unknown> = {
      name,
      category,
      price,
      description: String(input.description ?? '').trim(),
      image_url: String(input.imageUrl ?? '').trim() || null,
      is_available: true,
    };
    if (categoryId) payload.category_id = categoryId;

    let { data, error } = await supabaseServer.from('menu_items').insert(payload).select().single();
    if (error && (error.code === 'PGRST204' || error.code === '42703')) {
      const message = error.message.toLowerCase();
      const missingField = ['category_id', 'image_url', 'is_available', 'description', 'category']
        .find((field) => message.includes(field) && field in payload);
      if (missingField) {
        delete payload[missingField];
        ({ data, error } = await supabaseServer.from('menu_items').insert(payload).select().single());
      }
    }
    if (error) {
      console.error('Unable to create menu item:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, item: data }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error creating menu item:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to create menu item.' },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  const unauthorized = requireOwner(request);
  if (unauthorized) return unauthorized;

  try {
    const body: unknown = await request.json();
    if (typeof body !== 'object' || body === null || Array.isArray(body)) {
      return validationError('Request body must be a JSON object.');
    }
    const input = body as Record<string, unknown>;
    const id = input.id;
    const name = String(input.name ?? '').trim();
    const category = menuCategory(input.category);
    const price = Number(input.price);
    if ((typeof id !== 'string' && typeof id !== 'number') || !String(id).trim()
      || !name || !category || !Number.isFinite(price) || price < 0) {
      return validationError('A valid item ID, name, supported category, and non-negative price are required.');
    }

    const categoryId = await categoryIdFor(category);
    const updates: Record<string, unknown> = {
      name,
      category,
      price,
      description: String(input.description ?? '').trim(),
      image_url: String(input.imageUrl ?? '').trim() || null,
    };
    if (categoryId) updates.category_id = categoryId;
    if (typeof input.isAvailable === 'boolean') updates.is_available = input.isAvailable;

    let { data, error } = await supabaseServer
      .from('menu_items')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error && (error.code === 'PGRST204' || error.code === '42703')) {
      const missingField = ['category_id', 'image_url', 'description', 'category']
        .find((field) => error?.message.toLowerCase().includes(field) && field in updates);
      if (
        error.message.toLowerCase().includes('is_available')
        && typeof input.isAvailable === 'boolean'
      ) {
        delete updates.is_available;
        updates.isAvailable = input.isAvailable;
        ({ data, error } = await supabaseServer
          .from('menu_items')
          .update(updates)
          .eq('id', id)
          .select()
          .maybeSingle());
      } else if (missingField) {
        delete updates[missingField];
        ({ data, error } = await supabaseServer
          .from('menu_items')
          .update(updates)
          .eq('id', id)
          .select()
          .maybeSingle());
      }
    }
    if (error) {
      console.error('Unable to update menu item:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) return NextResponse.json({ error: 'Menu item not found.' }, { status: 404 });

    return NextResponse.json({ success: true, item: data });
  } catch (error) {
    console.error('Unexpected error updating menu item:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to update menu item.' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  const unauthorized = requireOwner(request);
  if (unauthorized) return unauthorized;

  const id = new URL(request.url).searchParams.get('id');
  if (!id?.trim()) return validationError('Menu item ID is required.');

  try {
    const { data, error } = await supabaseServer
      .from('menu_items')
      .delete()
      .eq('id', id)
      .select('id')
      .maybeSingle();
    if (error) {
      console.error('Unable to delete menu item:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) return NextResponse.json({ error: 'Menu item not found.' }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error deleting menu item:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to delete menu item.' },
      { status: 500 },
    );
  }
}
