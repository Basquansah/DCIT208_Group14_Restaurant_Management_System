import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { requireOwner } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const unauthorized = requireOwner(request);
  if (unauthorized) return unauthorized;

  const { data: orders, error } = await supabaseServer
    .from('orders')
    .select('order_number, total_amount, created_at')
    .eq('status', 'COMPLETED')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const completedOrders = orders ?? [];
  const totalSalesGHS = completedOrders.reduce((sum, order) => sum + Number(order.total_amount), 0);
  const ghanaDateFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Accra',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const todayInGhana = ghanaDateFormatter.format(new Date());
  const todaySalesGHS = completedOrders.reduce((sum, order) => {
    if (!order.created_at) return sum;
    const orderDate = ghanaDateFormatter.format(new Date(order.created_at));

    return orderDate === todayInGhana ? sum + Number(order.total_amount) : sum;
  }, 0);

  return NextResponse.json({
    totalSalesGHS,
    todaySalesGHS,
    completedOrders: completedOrders.length,
    averageOrderGHS: completedOrders.length ? totalSalesGHS / completedOrders.length : 0,
    recentSales: completedOrders.slice(0, 5),
  });
}
