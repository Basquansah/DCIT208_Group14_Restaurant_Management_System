'use client';

import React, { useState, useEffect } from 'react';
import StaffLoginGate from '../../src/components/StaffLoginGate';

interface FoodItem {
  id: string;
  name: string;
  category: 'Staples' | 'Proteins' | 'Stews & Soups';
  isAvailable: boolean;
}

interface Order {
  id: string | number;
  orderNumber: string;
  customerName: string;
  phoneNumber?: string;
  items: string;
  fulfillment: string;
  status: 'PENDING' | 'PREPARING' | 'READY' | 'COMPLETED';
  totalAmount: number;
  time: string;
  dateKey: string; // YYYY-MM-DD format for daily categorization
}

interface KitchenStaff {
  id: string | number;
  name: string;
  department?: string;
  role?: string;
}

const ALL_18_ITEMS: FoodItem[] = [
  // Staples (6)
  { id: '1', name: 'Banku', category: 'Staples', isAvailable: true },
  { id: '2', name: 'Jollof Rice', category: 'Staples', isAvailable: true },
  { id: '3', name: 'Plain Rice', category: 'Staples', isAvailable: true },
  { id: '4', name: 'Waakye', category: 'Staples', isAvailable: true },
  { id: '5', name: 'Kenkey', category: 'Staples', isAvailable: false },
  { id: '6', name: 'Fufu', category: 'Staples', isAvailable: true },

  // Proteins (5)
  { id: '7', name: 'Fish', category: 'Proteins', isAvailable: true },
  { id: '8', name: 'Chicken', category: 'Proteins', isAvailable: true },
  { id: '9', name: 'Gizzard', category: 'Proteins', isAvailable: true },
  { id: '10', name: 'Sausages', category: 'Proteins', isAvailable: true },
  { id: '11', name: 'Meat (Assorted)', category: 'Proteins', isAvailable: true },

  // Stews & Soups (7)
  { id: '12', name: 'Tomato Stew', category: 'Stews & Soups', isAvailable: true },
  { id: '13', name: 'Other Stews', category: 'Stews & Soups', isAvailable: true },
  { id: '14', name: 'Goat Soup', category: 'Stews & Soups', isAvailable: true },
  { id: '15', name: 'Chicken Soup', category: 'Stews & Soups', isAvailable: true },
  { id: '16', name: 'Fish Soup', category: 'Stews & Soups', isAvailable: true },
  { id: '17', name: 'Groundnut / Palm Soup', category: 'Stews & Soups', isAvailable: true },
  { id: '18', name: 'Pepper (Shito & Fresh)', category: 'Stews & Soups', isAvailable: true },
];

export default function KitchenQueuePage() {
  const [menuItems, setMenuItems] = useState<FoodItem[]>(ALL_18_ITEMS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | number | null>(null);
  const [activeKitchenStaff, setActiveKitchenStaff] = useState<KitchenStaff | null>(null);
  const [isKitchenSuspended, setIsKitchenSuspended] = useState(false);
  const [suspendedKitchenStaffName, setSuspendedKitchenStaffName] = useState('');

  // Helper to get today's date in YYYY-MM-DD format
  const getTodayDateKey = () => new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateKey());

  const lockKitchen = () => {
    if (!activeKitchenStaff) return;
    setSuspendedKitchenStaffName(activeKitchenStaff.name);
    setActiveKitchenStaff(null);
    setIsKitchenSuspended(true);
    localStorage.setItem('kitchen_session_suspended', 'true');
    localStorage.removeItem('kitchen_station_staff');
  };

  // 1. Fetch live menu items from Supabase DB to reflect real-time availability
  const fetchMenuFromBackend = async () => {
    try {
      const response = await fetch('/api/menu', { cache: 'no-store' });
      if (!response.ok) return;
      const data = await response.json();
      
      if (Array.isArray(data) && data.length > 0) {
        const updatedList = ALL_18_ITEMS.map((defaultItem) => {
          const serverMatch = data.find((d: any) => 
            String(d.id) === String(defaultItem.id) || 
            d.name?.toLowerCase() === defaultItem.name.toLowerCase()
          );
          return {
            ...defaultItem,
            isAvailable: serverMatch ? Boolean(serverMatch.available) : defaultItem.isAvailable
          };
        });
        setMenuItems(updatedList);
      }
    } catch (error) {
      console.error('Unable to fetch menu availability from server:', error);
    }
  };

  // 2. Fetch Live Orders from Backend API & Normalize Database Fields
  const fetchOrdersFromBackend = async () => {
    try {
      const response = await fetch('/api/orders', { cache: 'no-store' });
      if (!response.ok) return;
      const data = await response.json();

      if (Array.isArray(data)) {
        const parsedOrders: Order[] = data.map((item: any) => {
          let rawStatus = String(item.status || 'PENDING').toUpperCase();
          if (rawStatus === 'PREPARING') rawStatus = 'PREPARING';
          else if (rawStatus === 'READY') rawStatus = 'READY';
          else if (rawStatus === 'COMPLETED') rawStatus = 'COMPLETED';
          else rawStatus = 'PENDING';

          const orderDateObj = item.created_at ? new Date(item.created_at) : new Date();
          const dateKey = orderDateObj.toISOString().split('T')[0];
          const createdTime = orderDateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          return {
            id: item.id,
            orderNumber: item.order_number || item.orderNumber || 'SF-0000',
            customerName: item.customer_name || item.customerName || 'Walk-in Customer',
            phoneNumber: item.phoneNumber || item.phone || item.phonenumber || 'N/A',
            items: item.items || '',
            fulfillment: item.fulfillment || 'DINE-IN',
            status: rawStatus as Order['status'],
            totalAmount: Number(item.total_amount || item.totalAmount || 0),
            time: createdTime,
            dateKey
          };
        });

        setOrders(parsedOrders);
      }
    } catch (err) {
      console.error('Error fetching kitchen orders:', err);
    }
  };

  useEffect(() => {
    fetchMenuFromBackend();
    fetchOrdersFromBackend();

    const interval = setInterval(() => {
      fetchMenuFromBackend();
      fetchOrdersFromBackend();
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  // 3. Toggle Food Availability & Sync with Live Database
  const toggleItemAvailability = async (id: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;

    setMenuItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isAvailable: nextStatus } : item))
    );

    try {
      const response = await fetch('/api/menu', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          available: nextStatus,
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        fetchMenuFromBackend();
      }
    } catch (error) {
      console.error('Failed to sync availability toggle to server:', error);
      fetchMenuFromBackend();
    }
  };

  // 4. Update Order Status in Supabase DB
  const updateOrderStatus = async (id: string | number, nextStatus: Order['status']) => {
    setUpdatingOrderId(id);

    const backendStatusFormat = nextStatus.charAt(0) + nextStatus.slice(1).toLowerCase();

    try {
      const response = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: id, status: backendStatusFormat }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setOrders((prev) =>
          prev.map((order) => (order.id === id ? { ...order, status: nextStatus } : order))
        );
      } else {
        alert('Could not update order status on server.');
        fetchOrdersFromBackend();
      }
    } catch (error) {
      console.error('Unable to update order status:', error);
      alert('Network error updating order status.');
      fetchOrdersFromBackend();
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'PENDING': return '#fef3c7';
      case 'PREPARING': return '#e0f2fe';
      case 'READY': return '#dcfce7';
      case 'COMPLETED': return '#f3f4f6';
    }
  };

  // Filter orders by the selected date interface
  const filteredOrdersByDate = orders.filter((o) => o.dateKey === selectedDate);

  // Extract unique available date keys from orders for quick selection
  const availableDates = Array.from(new Set(orders.map((o) => o.dateKey))).sort().reverse();
  if (!availableDates.includes(getTodayDateKey())) {
    availableDates.unshift(getTodayDateKey());
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: '20px', maxWidth: '1280px', margin: '0 auto', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      
      {activeKitchenStaff && !isKitchenSuspended && (
      <header style={{ borderBottom: '3px solid #6b213a', paddingBottom: '12px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h1 style={{ color: '#6b213a', margin: 0, fontSize: '24px', fontWeight: '900' }}>
            Sarah's Tasty Foods — Kitchen Control Board 🍳
          </h1>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '13px', fontWeight: '600' }}>
            Live Food Availability Management & Daily Preparation Queue Archives
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={fetchOrdersFromBackend}
            style={{ backgroundColor: '#6b213a', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}
          >
            🔄 Refresh Orders
          </button>
        </div>
      </header>
      )}

      <main style={{ position: 'relative' }}>
      {/* SECTION 1: LIVE 18-ITEM AVAILABILITY TOGGLES */}
      <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', marginBottom: '25px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
          <h2 style={{ fontSize: '17px', color: '#0f172a', margin: 0, fontWeight: '900' }}>
            Kitchen Food Availability Controls (Live Sync to POS & Website)
          </h2>
          <span style={{ fontSize: '12px', color: '#ea580c', fontWeight: '700' }}>Tap item to toggle Availability state</span>
        </div>

        {['Staples', 'Proteins', 'Stews & Soups'].map((category) => (
          <div key={category} style={{ marginBottom: '15px' }}>
            <h3 style={{ fontSize: '12px', color: '#6b213a', textTransform: 'uppercase', margin: '0 0 8px 0', fontWeight: '900', letterSpacing: '0.5px' }}>
              {category}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '10px' }}>
              {menuItems.filter((i) => i.category === category).map((item) => (
                <button
                  key={item.id}
                  onClick={() => toggleItemAvailability(item.id, item.isAvailable)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '2px solid ' + (item.isAvailable ? '#86efac' : '#fca5a5'),
                    backgroundColor: item.isAvailable ? '#f0fdf4' : '#fef2f2',
                    color: item.isAvailable ? '#15803d' : '#b91c1c',
                    fontWeight: '800',
                    fontSize: '12px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                  }}
                >
                  <span>{item.name}</span>
                  <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '6px', backgroundColor: item.isAvailable ? '#22c55e' : '#ef4444', color: '#fff', fontWeight: '900' }}>
                    {item.isAvailable ? 'AVAILABLE' : 'FINISHED'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* SECTION 2: DAILY ARCHIVE SELECTOR & KITCHEN ORDER PREPARATION QUEUE */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
        <h2 style={{ fontSize: '18px', color: '#0f172a', margin: 0, fontWeight: '900' }}>
          Kitchen Preparation Queue (Live Orders)
        </h2>

        {/* Daily Archive Date Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#ffffff', padding: '6px 12px', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
          <span style={{ fontSize: '12px', fontWeight: '800', color: '#6b213a' }}>📅 Daily Interface Date:</span>
          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ backgroundColor: '#f8fafc', color: '#0f172a', border: '1px solid #cbd5e1', padding: '4px 8px', borderRadius: '6px', fontWeight: '800', fontSize: '12px', cursor: 'pointer' }}
          >
            {availableDates.map((dateStr) => (
              <option key={dateStr} value={dateStr}>
                {dateStr === getTodayDateKey() ? `Today (${dateStr})` : dateStr}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
        {(['PENDING', 'PREPARING', 'READY', 'COMPLETED'] as const).map((colStatus) => {
          const columnOrders = filteredOrdersByDate.filter((o) => o.status === colStatus);

          return (
            <div key={colStatus} style={{ border: '2px solid #e2e8f0', borderRadius: '14px', padding: '16px', backgroundColor: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '2px solid #f1f5f9', paddingBottom: '6px' }}>
                <h3 style={{ fontSize: '15px', margin: 0, color: '#0f172a', fontWeight: '900' }}>
                  {colStatus}
                </h3>
                <span style={{ backgroundColor: '#6b213a', color: '#ffffff', fontSize: '11px', fontWeight: '900', padding: '2px 8px', borderRadius: '10px' }}>
                  {columnOrders.length}
                </span>
              </div>

              {columnOrders.length === 0 ? (
                <p style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', padding: '20px 0' }}>
                  No orders in {colStatus.toLowerCase()} for {selectedDate}
                </p>
              ) : (
                columnOrders.map((order) => (
                  <div
                    key={order.id}
                    style={{
                      backgroundColor: getStatusColor(order.status),
                      borderRadius: '10px',
                      padding: '14px',
                      marginBottom: '12px',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                      border: '1px solid rgba(0,0,0,0.1)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '900', fontSize: '13px', color: '#0f172a' }}>
                      <span>Order #{order.orderNumber}</span>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>{order.time}</span>
                    </div>

                    <p style={{ margin: '4px 0 8px', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
                      👤 {order.customerName} ({order.phoneNumber})
                    </p>

                    <div style={{ fontSize: '13px', margin: '8px 0', fontWeight: '700', color: '#1e293b', whiteSpace: 'pre-wrap', backgroundColor: '#ffffff', padding: '8px', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.05)' }}>
                      <span style={{ display: 'block', marginBottom: '4px', fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: '900' }}>Items & Special Instructions</span>
                      {order.items}
                    </div>

                    <div style={{ fontSize: '12px', marginBottom: '12px', color: '#334155', fontWeight: '700' }}>
                      <span>Type: <strong>{order.fulfillment}</strong></span> | <span>GHS {order.totalAmount.toFixed(2)}</span>
                    </div>

                    {order.status === 'PENDING' && (
                      <button 
                        disabled={updatingOrderId === order.id} 
                        onClick={() => updateOrderStatus(order.id, 'PREPARING')} 
                        style={{ width: '100%', padding: '10px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', cursor: updatingOrderId === order.id ? 'wait' : 'pointer', fontWeight: '900', fontSize: '12px' }}
                      >
                        Start Preparing 🍳
                      </button>
                    )}
                    {order.status === 'PREPARING' && (
                      <button 
                        disabled={updatingOrderId === order.id} 
                        onClick={() => updateOrderStatus(order.id, 'READY')} 
                        style={{ width: '100%', padding: '10px', backgroundColor: '#22c55e', color: '#fff', border: 'none', borderRadius: '8px', cursor: updatingOrderId === order.id ? 'wait' : 'pointer', fontWeight: '900', fontSize: '12px' }}
                      >
                        Mark Ready 🟢
                      </button>
                    )}
                    {order.status === 'READY' && (
                      <button 
                        disabled={updatingOrderId === order.id} 
                        onClick={() => updateOrderStatus(order.id, 'COMPLETED')} 
                        style={{ width: '100%', padding: '10px', backgroundColor: '#6b7280', color: '#fff', border: 'none', borderRadius: '8px', cursor: updatingOrderId === order.id ? 'wait' : 'pointer', fontWeight: '900', fontSize: '12px' }}
                      >
                        Complete Order ✅
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          );
        })}
      </div>

      {(!activeKitchenStaff || isKitchenSuspended) && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10 }}>
          <StaffLoginGate
            title="Kitchen"
            allowedDepartments={['Kitchen', 'General']}
            storageKey="kitchen_station_staff"
            onAuthorized={(staff) => {
              setActiveKitchenStaff({
                id: staff.id,
                name: staff.name,
                department: staff.department,
                role: staff.role,
              });
              setIsKitchenSuspended(false);
              setSuspendedKitchenStaffName('');
              localStorage.removeItem('kitchen_session_suspended');
            }}
          >
            <></>
          </StaffLoginGate>
        </div>
      )}
      </main>

    </div>
  );
}