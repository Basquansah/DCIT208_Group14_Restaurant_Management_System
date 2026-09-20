import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

// GET: Fetch all menu items from Supabase
export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from('menu_items')
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

// POST: Create a new menu item
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, category, price, description, image_url, available } = body;

    const { data, error } = await supabaseServer
      .from('menu_items')
      .insert([{ name, category, price, description, image_url, available: available ?? true }])
      .select();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, item: data?.[0] });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

// PUT: Update an existing menu item (name, price, category, image, description)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, category, price, description, image_url, available } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Item ID is required for update' }, { status: 400 });
    }

    const updatePayload: any = {};
    if (name !== undefined) updatePayload.name = name;
    if (category !== undefined) updatePayload.category = category;
    if (price !== undefined) updatePayload.price = price;
    if (description !== undefined) updatePayload.description = description;
    if (image_url !== undefined) updatePayload.image_url = image_url;
    if (available !== undefined) updatePayload.available = available;

    const { data, error } = await supabaseServer
      .from('menu_items')
      .update(updatePayload)
      .eq('id', id)
      .select();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, item: data?.[0] });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

// PATCH: Toggle availability of a specific menu item
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, available, isAvailable } = body;

    // Accepts either 'available' or 'isAvailable' from client payload
    const availabilityValue = available !== undefined ? available : isAvailable;

    if (id === undefined || id === null) {
      return NextResponse.json({ success: false, error: 'Item ID is required' }, { status: 400 });
    }

    const { data, error } = await supabaseServer
      .from('menu_items')
      .update({ available: Boolean(availabilityValue) })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Supabase menu update error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, item: data?.[0] });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

// DELETE: Remove a menu item
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Item ID is required' }, { status: 400 });
    }

    const { error } = await supabaseServer
      .from('menu_items')
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