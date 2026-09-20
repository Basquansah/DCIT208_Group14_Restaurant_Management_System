import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// GET: Fetch inventory items and stock ledger history
export async function GET() {
  try {
    const { data: items, error: errItems } = await supabase
      .from('inventory_items')
      .select('*')
      .order('created_at', { ascending: false });

    const { data: ledger, error: errLedger } = await supabase
      .from('inventory_ledger')
      .select('*')
      .order('created_at', { ascending: false });

    if (errItems) {
      console.error('SUPABASE GET ITEMS ERROR:', errItems);
      throw errItems;
    }
    if (errLedger) {
      console.error('SUPABASE GET LEDGER ERROR:', errLedger);
      throw errLedger;
    }

    return NextResponse.json({ items: items || [], ledger: ledger || [] });
  } catch (err: any) {
    console.error('INVENTORY API GET SERVER ERROR:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Handle Inventory Actions (CREATE item, RESTOCK, or ISSUE to kitchen)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'CREATE') {
      const { data, error } = await supabase
        .from('inventory_items')
        .insert([
          {
            item_name: body.item_name,
            quantity: Number(body.quantity) || 0,
            unit: body.unit || 'Portions',
            min_threshold: Number(body.min_threshold) || 5,
          },
        ])
        .select();

      if (error) throw error;
      return NextResponse.json({ success: true, item: data[0] });
    }

    if (action === 'RESTOCK' || action === 'ISSUE') {
      const { itemId, quantity, handledBy, recipient, notes } = body;

      const { data: currentItem, error: fetchErr } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('id', itemId)
        .single();

      if (fetchErr || !currentItem) {
        return NextResponse.json({ success: false, error: 'Inventory item not found.' }, { status: 404 });
      }

      let newQty = Number(currentItem.quantity);
      const changeQty = Number(quantity);

      if (action === 'RESTOCK') {
        newQty += changeQty;
      } else if (action === 'ISSUE') {
        if (newQty < changeQty) {
          return NextResponse.json({ success: false, error: 'Insufficient stock available.' }, { status: 400 });
        }
        newQty -= changeQty;
      }

      const { error: updateErr } = await supabase
        .from('inventory_items')
        .update({ quantity: newQty })
        .eq('id', itemId);

      if (updateErr) throw updateErr;

      const { error: ledgerErr } = await supabase
        .from('inventory_ledger')
        .insert([
          {
            item_id: itemId,
            transaction_type: action === 'RESTOCK' ? 'RECEIVE' : 'ISSUE',
            quantity: changeQty,
            unit: currentItem.unit,
            handled_by_staff: handledBy || 'Storekeeper',
            recipient_staff: recipient || null,
            notes: notes || null,
          },
        ]);

      if (ledgerErr) throw ledgerErr;

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action specified.' }, { status: 400 });
  } catch (err: any) {
    console.error('INVENTORY API POST SERVER ERROR:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}