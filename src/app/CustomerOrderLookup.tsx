'use client';

import { useCallback, useEffect, useState } from 'react';

interface CustomerOrder {
  id: string;
  orderNumber: string | number;
  customerName: string;
  status: string;
  totalAmount: number;
  fulfillment: string;
}

export default function CustomerOrderLookup() {
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [myOrders, setMyOrders] = useState<CustomerOrder[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    const normalizedName = customerName.trim();
    const normalizedPhone = phoneNumber.trim();
    if (!normalizedName || !normalizedPhone) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        name: normalizedName,
        phone: normalizedPhone,
      });
      const response = await fetch(`/api/orders?${params.toString()}`, { cache: 'no-store' });
      const data: unknown = await response.json();

      if (!response.ok) {
        const message = typeof data === 'object' && data !== null && 'error' in data
          ? String(data.error)
          : `Server returned status ${response.status}.`;
        throw new Error(message);
      }
      if (!Array.isArray(data)) throw new Error('Orders response must be an array.');

      setMyOrders(data
        .filter((order): order is Record<string, unknown> =>
          typeof order === 'object' && order !== null && !Array.isArray(order),
        )
        .map((order) => ({
          id: String(order.id ?? ''),
          orderNumber: (order.orderNumber ?? order.order_number ?? '—') as string | number,
          customerName: String(order.customerName ?? order.customer_name ?? normalizedName),
          status: String(order.status ?? 'PENDING').toUpperCase(),
          totalAmount: Number(order.totalAmount ?? order.total_amount ?? 0) || 0,
          fulfillment: String(order.fulfillment ?? order.fulfillment_type ?? 'Takeaway'),
        }))
        .filter((order) => order.id.length > 0));
      setError(null);
      setSearched(true);
    } catch (lookupError) {
      console.error('Customer order lookup failed:', lookupError);
      setError(lookupError instanceof Error ? lookupError.message : String(lookupError));
      setSearched(true);
    } finally {
      setLoading(false);
    }
  }, [customerName, phoneNumber]);

  useEffect(() => {
    if (!searched || error) return;
    const interval = setInterval(() => {
      void fetchOrders();
    }, 10000);
    return () => clearInterval(interval);
  }, [error, fetchOrders, searched]);

  const handleLookup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await fetchOrders();
  };

  return (
    <section
      aria-labelledby="customer-order-lookup-title"
      style={{ width: '100%', maxWidth: '600px', boxSizing: 'border-box', margin: '24px 0 0', padding: '16px', background: '#f8fafc', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}
    >
      <h2 id="customer-order-lookup-title" style={{ textAlign: 'center', margin: '0 0 8px', color: '#0f172a' }}>
        Track Your Orders
      </h2>
      <p style={{ textAlign: 'center', color: '#64748b', fontSize: '14px', margin: '0 0 16px' }}>
        Enter the name and phone number used at checkout.
      </p>
      <form onSubmit={handleLookup} style={{ display: 'grid', gap: '12px' }}>
        <label style={{ display: 'grid', gap: '5px', color: '#334155', fontSize: '13px', fontWeight: 600 }}>
          Name
          <input
            type="text"
            autoComplete="name"
            placeholder="Enter your name"
            value={customerName}
            onChange={(event) => setCustomerName(event.target.value)}
            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', font: 'inherit' }}
            required
          />
        </label>
        <label style={{ display: 'grid', gap: '5px', color: '#334155', fontSize: '13px', fontWeight: 600 }}>
          Phone number
          <input
            type="tel"
            autoComplete="tel"
            placeholder="Enter your phone number"
            value={phoneNumber}
            onChange={(event) => setPhoneNumber(event.target.value)}
            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', font: 'inherit' }}
            required
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          style={{ background: '#6b213a', color: '#fff', border: 'none', padding: '11px', borderRadius: '6px', fontWeight: 'bold', cursor: loading ? 'wait' : 'pointer' }}
        >
          {loading ? 'Looking up orders…' : 'View My Orders'}
        </button>
      </form>

      {error && <p role="alert" style={{ marginTop: '16px', color: '#b91c1c' }}>Unable to look up orders: {error}</p>}
      {loading && <p role="status" style={{ textAlign: 'center', color: '#64748b' }}>Loading orders…</p>}
      {searched && !loading && !error && (
        <div aria-live="polite" style={{ marginTop: '20px' }}>
          {myOrders.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#64748b' }}>No orders found for that name and phone number.</p>
          ) : (
            myOrders.map((order) => (
              <article
                key={order.id}
                style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', marginBottom: '10px', border: '1px solid #e2e8f0' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', fontWeight: 'bold' }}>
                  <span>Order #{order.orderNumber}</span>
                  <span style={{ color: order.status === 'READY' || order.status === 'COMPLETED' ? '#16a34a' : '#d97706' }}>
                    {order.status === 'WEB_PENDING' ? 'AWAITING STAFF APPROVAL' : order.status}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                  Total: GHS {order.totalAmount.toFixed(2)} ({order.fulfillment})
                </div>
              </article>
            ))
          )}
        </div>
      )}
    </section>
  );
}
