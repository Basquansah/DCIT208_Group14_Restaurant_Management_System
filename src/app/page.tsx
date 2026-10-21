'use client';

import React, { useState, useEffect } from 'react';
import CustomerOrderLookup from './CustomerOrderLookup';
import { calculateOrderPricing } from '../utils/deliveryCalculator';
import {
  applyMenuAvailability,
  MENU_AVAILABILITY_STORAGE_KEY,
  readMenuAvailability,
} from '../utils/menuAvailability';

interface MenuItem {
  id: string;
  name: string;
  category: 'Staples' | 'Proteins' | 'Stews & Soups';
  price: number;
  description: string;
  image: string;
  isAvailable: boolean;
}

const DEFAULT_MENU_ITEMS: MenuItem[] = [
  { id: '1', name: 'Jollof Rice & Chicken', category: 'Staples', price: 45.00, description: 'Classic Ghanaian spicy rice served with fried chicken', image: '/images/jollof.jpg', isAvailable: true },
  { id: '2', name: 'Banku & Tilapia', category: 'Staples', price: 60.00, description: 'Hot banku with grilled tilapia and hot pepper', image: '/images/banku.jpg', isAvailable: true },
  { id: '3', name: 'Fried Plantain & Beans (Red Red)', category: 'Staples', price: 30.00, description: 'Ripe sweet plantains with rich stewed beans', image: '/images/waakye.jpg', isAvailable: true },
  { id: '4', name: 'Fufu & Light Soup', category: 'Staples', price: 55.00, description: 'Pounded cassava and plantain with goat meat soup', image: '/images/fufu.jpg', isAvailable: true },
];

export default function HomePage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(DEFAULT_MENU_ITEMS);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [fulfillment, setFulfillment] = useState<'PICKUP' | 'DELIVERY'>('DELIVERY');
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  // Modal & Form State
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState<boolean>(false);
  const [customerName, setCustomerName] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'MOMO' | 'CASH'>('MOMO');
  const [specialNotes, setSpecialNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  const [orderConfirmation, setOrderConfirmation] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const fetchServerAvailability = async () => {
      try {
        const response = await fetch('/api/menu', { cache: 'no-store' });
        if (!response.ok) throw new Error(`Server returned status ${response.status}.`);
        const data: unknown = await response.json();
        if (active && Array.isArray(data)) {
          const categories: MenuItem['category'][] = ['Staples', 'Proteins', 'Stews & Soups'];
          const formattedItems: MenuItem[] = data.map((serverItem: any) => {
            const catName = String(serverItem.category || 'Staples');
            const category = categories.includes(catName as any) ? catName : 'Staples';
            return {
              id: String(serverItem.id),
              name: String(serverItem.name || ''),
              category: category as any,
              price: Number(serverItem.price) || 0,
              description: String(serverItem.description || ''),
              image: serverItem.image_url || '/images/jollof.jpg',
              isAvailable: serverItem.available !== false,
            };
          });
          setMenuItems(formattedItems);
        }
      } catch (error) {
        console.error('Unable to sync customer menu with the server.', error);
      }
    };

    const syncAvailability = () => {
      try {
        const availability = readMenuAvailability();
        setMenuItems((currentItems) => applyMenuAvailability(currentItems, availability));
      } catch (error) {
        console.error('Unable to sync customer menu availability.', error);
      }
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === MENU_AVAILABILITY_STORAGE_KEY || event.key === null) {
        syncAvailability();
      }
    };

    const refreshAvailability = () => {
      if (document.visibilityState === 'visible') {
        fetchServerAvailability();
      }
    };

    syncAvailability();
    fetchServerAvailability();
    window.addEventListener('storage', handleStorage);
    window.addEventListener('focus', refreshAvailability);
    document.addEventListener('visibilitychange', refreshAvailability);
    return () => {
      active = false;
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', refreshAvailability);
      document.removeEventListener('visibilitychange', refreshAvailability);
    };
  }, []);

  const addToCart = (id: string) => {
    const item = menuItems.find((menuItem) => menuItem.id === id);
    if (!item?.isAvailable) return;
    setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => {
      const updated = { ...prev };
      if (updated[id] > 1) updated[id] -= 1;
      else delete updated[id];
      return updated;
    });
  };

  const foodSubtotal = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = menuItems.find((m) => m.id === id);
    return sum + (item ? item.price * qty : 0);
  }, 0);

  const pricing = calculateOrderPricing({
    fulfillment,
    foodSubtotal,
  });

  const categories = ['All', 'Staples', 'Proteins', 'Stews & Soups'];

  const filteredItems = selectedCategory === 'All'
    ? menuItems
    : menuItems.filter((item) => item.category === selectedCategory);

  const handleFinalOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const unavailableItems = Object.keys(cart).filter((id) =>
      !menuItems.find((item) => item.id === id)?.isAvailable
    );

    if (unavailableItems.length > 0) {
      alert('Remove out-of-stock items from your order before checkout.');
      return;
    }
    if (!customerName || !phoneNumber) {
      alert('Please fill in your Name and Phone Number.');
      return;
    }

    setIsSubmitting(true);

    const itemDetails = Object.entries(cart).map(([id, qty]) => {
      const m = menuItems.find((item) => item.id === id);
      return `${qty}x ${m?.name}`;
    }).join(', ');

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          phoneNumber,
          items: itemDetails,
          fulfillment,
          paymentMethod,
          orderSource: 'ONLINE',
          specialNotes,
          totalAmount: pricing.totalAmount,
          status: 'Pending' // Online orders go to POS for confirmation first
        }),
      });

      const result = await response.json();

      if (result.success) {
        const orderNumber = result.order?.order_number ?? result.order?.orderNumber;
        setOrderConfirmation(
          `Order #${orderNumber || ''} submitted successfully! Please wait for a confirmation call from our staff.`
        );
        setIsCheckoutModalOpen(false);
        setCart({});
        setCustomerName('');
        setPhoneNumber('');
        setSpecialNotes('');
      } else {
        alert('Order submission failed: ' + result.error);
      }
    } catch (error) {
      alert('Network error connecting to backend server API.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#fdfbfb', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      
      {/* Top Banner */}
      <div style={{ backgroundColor: '#451426', color: '#f8fafc', padding: '8px 20px', fontSize: '13px', borderBottom: '3px solid #6b213a' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <span>📍 <strong>Location:</strong> Graphic Road (Accra)</span>
            <span>🕒 <strong>Opening Hours:</strong> Mon - Sat: 7:30 AM – 4:00 PM</span>
          </div>
          <div>
            <span>📞 <strong>Hotline:</strong> +233 (0) 244520750</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header style={{ backgroundColor: '#ffffff', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)', padding: '20px', marginBottom: '25px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <h1 style={{ color: '#6b213a', margin: 0, fontSize: '28px', fontWeight: '900', letterSpacing: '-0.5px' }}>
              Sarah's Tasty Foods 🍲
            </h1>
            <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px', fontWeight: '600' }}>
              Authentic Ghanaian Cuisine — Prepared Fresh Daily
            </p>
          </div>
          <div style={{ backgroundColor: '#fdf2f8', border: '1px solid #fbcfe8', padding: '8px 16px', borderRadius: '20px', color: '#9d174d', fontSize: '12px', fontWeight: '800' }}>
            📞 Orders confirmed by phone call before preparation
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 40px 20px' }}>
        <div style={{ display: 'flex', gap: '25px', flexWrap: 'wrap' }}>
          
          {/* Left Column: Menu Catalog Grid with Enhanced Shadows & Styling */}
          <div style={{ flex: '2', minWidth: '320px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h2 style={{ fontSize: '22px', color: '#0f172a', margin: 0, fontWeight: '800' }}>Menu Catalog</h2>
              <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>Showing {filteredItems.length} items</span>
            </div>
            
            {/* Category Filter Chips */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '9px 20px',
                    borderRadius: '25px',
                    border: 'none',
                    backgroundColor: selectedCategory === cat ? '#6b213a' : '#ffffff',
                    color: selectedCategory === cat ? '#ffffff' : '#334155',
                    fontWeight: '800',
                    fontSize: '13px',
                    cursor: 'pointer',
                    boxShadow: selectedCategory === cat ? '0 4px 14px rgba(107, 33, 58, 0.35)' : '0 2px 6px rgba(0,0,0,0.05)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Menu Cards Grid with 360px Height & Elevated Container Shadows */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '22px' }}>
              {filteredItems.map((item) => {
                const isHovered = hoveredCard === item.id;
                return (
                  <div
                    key={item.id}
                    onMouseEnter={() => setHoveredCard(item.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '18px',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      boxShadow: isHovered 
                        ? '0 16px 32px -6px rgba(107, 33, 58, 0.18), 0 8px 16px -4px rgba(0, 0, 0, 0.08)' 
                        : '0 4px 14px rgba(0, 0, 0, 0.06)',
                      transform: isHovered ? 'translateY(-6px)' : 'translateY(0)',
                      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                      border: '1px solid #f1f5f9',
                    }}
                  >
                    {/* Food Picture with 360px Vertical Height */}
                    <div style={{ position: 'relative', height: '360px', overflow: 'hidden', backgroundColor: '#f1f5f9' }}>
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover',
                          transition: 'transform 0.5s ease',
                          transform: isHovered ? 'scale(1.04)' : 'scale(1)',
                        }} 
                      />
                      <span style={{ 
                        position: 'absolute', 
                        top: '12px', 
                        right: '12px', 
                        fontSize: '11px', 
                        fontWeight: '900', 
                        padding: '4px 12px', 
                        borderRadius: '20px', 
                        backgroundColor: item.isAvailable ? 'rgba(22, 163, 74, 0.95)' : 'rgba(220, 38, 38, 0.95)', 
                        color: '#ffffff',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                        backdropFilter: 'blur(4px)',
                      }}>
                        {item.isAvailable ? 'AVAILABLE' : 'FINISHED'}
                      </span>
                    </div>

                    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, justifyContent: 'space-between' }}>
                      <div>
                        <span style={{ fontSize: '10px', backgroundColor: '#fdf2f8', color: '#9d174d', padding: '3px 8px', borderRadius: '6px', fontWeight: '900', textTransform: 'uppercase' }}>
                          {item.category}
                        </span>
                        <h3 style={{ margin: '8px 0 4px 0', fontSize: '17px', color: '#0f172a', fontWeight: '900' }}>{item.name}</h3>
                        <p style={{ fontSize: '12px', color: '#64748b', margin: '0', lineHeight: '1.4' }}>{item.description}</p>
                      </div>

                      <div style={{ marginTop: '10px' }}>
                        <p style={{ fontWeight: '900', color: '#6b213a', fontSize: '17px', margin: '0 0 10px 0' }}>GHS {item.price.toFixed(2)}</p>
                        <button
                          disabled={!item.isAvailable}
                          onClick={() => addToCart(item.id)}
                          style={{ 
                            width: '100%', 
                            padding: '10px', 
                            backgroundColor: item.isAvailable ? '#6b213a' : '#cbd5e1', 
                            color: '#ffffff', 
                            border: 'none', 
                            borderRadius: '10px', 
                            cursor: item.isAvailable ? 'pointer' : 'not-allowed', 
                            fontWeight: '800', 
                            fontSize: '13px',
                            boxShadow: item.isAvailable ? '0 4px 10px rgba(107, 33, 58, 0.25)' : 'none',
                          }}
                        >
                          {item.isAvailable ? 'Add to Order +' : 'Out of Stock'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Order Summary & Tracking */}
          <div style={{ flex: '1', minWidth: '300px', backgroundColor: '#ffffff', borderRadius: '20px', padding: '22px', boxShadow: '0 12px 28px rgba(0, 0, 0, 0.08)', border: '1px solid #f1f5f9', height: 'fit-content', position: 'sticky', top: '20px' }}>
            
            <h2 style={{ fontSize: '18px', color: '#0f172a', margin: '0 0 15px 0', fontWeight: '900', borderBottom: '2px solid #f1f5f9', paddingBottom: '10px' }}>
              Your Order Summary 🛒
            </h2>

            {Object.keys(cart).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '28px 10px', color: '#94a3b8', backgroundColor: '#f8fafc', borderRadius: '14px', marginBottom: '16px' }}>
                <div style={{ fontSize: '36px', marginBottom: '8px' }}>🍲</div>
                <p style={{ fontSize: '13px', margin: 0, fontWeight: '700' }}>Your cart is empty.</p>
              </div>
            ) : (
              <>
                <div style={{ maxHeight: '220px', overflowY: 'auto', paddingRight: '5px' }}>
                  {Object.entries(cart).map(([id, qty]) => {
                    const item = menuItems.find((m) => m.id === id);
                    if (!item) return null;
                    return (
                      <div key={id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', paddingBottom: '8px', borderBottom: '1px dashed #f1f5f9' }}>
                        <div>
                          <strong style={{ fontSize: '13px', color: '#1e293b' }}>{item.name}</strong>
                          <div style={{ fontSize: '12px', color: '#ea580c', fontWeight: '800' }}>GHS {(item.price * qty).toFixed(2)}</div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#f1f5f9', padding: '3px 6px', borderRadius: '6px' }}>
                          <button onClick={() => removeFromCart(id)} style={{ backgroundColor: '#e2e8f0', border: 'none', borderRadius: '4px', width: '24px', height: '24px', cursor: 'pointer', fontWeight: 'bold' }}>-</button>
                          <span style={{ fontWeight: '900', fontSize: '13px', padding: '0 4px' }}>{qty}</span>
                          <button disabled={!item.isAvailable} onClick={() => addToCart(id)} style={{ backgroundColor: item.isAvailable ? '#6b213a' : '#cbd5e1', color: '#fff', border: 'none', borderRadius: '4px', width: '24px', height: '24px', cursor: item.isAvailable ? 'pointer' : 'not-allowed', fontWeight: 'bold' }}>+</button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Fulfillment Selection */}
                <div style={{ marginTop: '15px', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: '#334155', display: 'block', marginBottom: '8px' }}>Select Fulfillment Option:</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <label style={{ flex: 1, backgroundColor: fulfillment === 'DELIVERY' ? '#6b213a' : '#ffffff', color: fulfillment === 'DELIVERY' ? '#ffffff' : '#334155', border: '1px solid #cbd5e1', padding: '9px', borderRadius: '8px', textAlign: 'center', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}>
                      <input type="radio" name="fulfillment" checked={fulfillment === 'DELIVERY'} onChange={() => setFulfillment('DELIVERY')} style={{ display: 'none' }} /> 🚚 Delivery
                    </label>
                    <label style={{ flex: 1, backgroundColor: fulfillment === 'PICKUP' ? '#6b213a' : '#ffffff', color: fulfillment === 'PICKUP' ? '#ffffff' : '#334155', border: '1px solid #cbd5e1', padding: '9px', borderRadius: '8px', textAlign: 'center', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}>
                      <input type="radio" name="fulfillment" checked={fulfillment === 'PICKUP'} onChange={() => setFulfillment('PICKUP')} style={{ display: 'none' }} /> 🏃 Self-Pickup
                    </label>
                  </div>

                  {/* Delivery Notice */}
                  {fulfillment === 'DELIVERY' && (
                    <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#fff7ed', border: '1px solid #ffedd5', borderRadius: '8px', fontSize: '11px', color: '#c2410c', fontWeight: '700', lineHeight: '1.4' }}>
                      ⚠️ <strong>Note on Delivery:</strong> Customers must arrange their own delivery rider (e.g. via Yango, Bolt, or Uber) after payment confirmation.
                    </div>
                  )}
                </div>

                <div style={{ marginTop: '15px', padding: '12px', backgroundColor: '#fdf2f8', borderRadius: '12px', border: '1px solid #fbcfe8' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: '900', color: '#6b213a' }}>
                    <span>Total Amount:</span>
                    <span>GHS {pricing.totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={() => setIsCheckoutModalOpen(true)}
                  style={{ width: '100%', marginTop: '15px', padding: '14px', backgroundColor: '#16a34a', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '15px', cursor: 'pointer', fontWeight: '900', boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)' }}
                >
                  Proceed to Checkout 📝
                </button>
              </>
            )}

            {/* Success Banner Placed DIRECTLY ABOVE Order Lookup */}
            {orderConfirmation && (
              <div role="status" style={{ margin: '20px 0 15px', padding: '14px', backgroundColor: '#ecfdf5', color: '#166534', border: '1.5px solid #86efac', borderRadius: '12px', fontSize: '13px', fontWeight: '800', lineHeight: '1.4', boxShadow: '0 4px 10px rgba(22, 163, 74, 0.1)' }}>
                🎉 {orderConfirmation}
              </div>
            )}

            {/* Customer Order Tracker */}
            <div style={{ marginTop: orderConfirmation ? '10px' : '20px' }}>
              <CustomerOrderLookup />
            </div>

          </div>

        </div>
      </main>

      {/* CUSTOMER CHECKOUT POPUP MODAL */}
      {isCheckoutModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', maxWidth: '480px', width: '100%', padding: '26px', position: 'relative', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)' }}>
            
            <button onClick={() => setIsCheckoutModalOpen(false)} style={{ position: 'absolute', top: '16px', right: '16px', border: 'none', backgroundColor: '#f1f5f9', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>

            <form onSubmit={handleFinalOrderSubmit}>
              <h2 style={{ fontSize: '20px', color: '#0f172a', margin: '0 0 6px 0', fontWeight: '900' }}>Customer Checkout</h2>
              <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: '#64748b' }}>
                Fill in your contact info below. Our cashier will call you to confirm your order details and collect payment.
              </p>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#334155', marginBottom: '4px' }}>Full Name *</label>
                <input type="text" required placeholder="e.g. Kwame Mensah" value={customerName} onChange={(e) => setCustomerName(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '13px', fontWeight: '600' }} />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#334155', marginBottom: '4px' }}>Phone Number *</label>
                <input type="tel" required placeholder="e.g. 0241234567" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '13px', fontWeight: '600' }} />
              </div>

              {/* Special Instructions & Food Notes */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#334155', marginBottom: '4px' }}>Special Instructions / Food Notes (Optional)</label>
                <textarea 
                  rows={2} 
                  placeholder="e.g. Extra shito, make stew separate..." 
                  value={specialNotes} 
                  onChange={(e) => setSpecialNotes(e.target.value)} 
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '12px', fontFamily: 'inherit' }} 
                />
              </div>

              {/* Payment Option */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#334155', marginBottom: '6px' }}>Preferred Payment Method</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <label style={{ flex: 1, padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', textAlign: 'center', fontSize: '12px', fontWeight: '800', backgroundColor: paymentMethod === 'MOMO' ? '#fdf2f8' : '#ffffff', color: paymentMethod === 'MOMO' ? '#9d174d' : '#334155', cursor: 'pointer' }}>
                    <input type="radio" name="payment" checked={paymentMethod === 'MOMO'} onChange={() => setPaymentMethod('MOMO')} style={{ display: 'none' }} /> 📲 MoMo
                  </label>
                  <label style={{ flex: 1, padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', textAlign: 'center', fontSize: '12px', fontWeight: '800', backgroundColor: paymentMethod === 'CASH' ? '#fdf2f8' : '#ffffff', color: paymentMethod === 'CASH' ? '#9d174d' : '#334155', cursor: 'pointer' }}>
                    <input type="radio" name="payment" checked={paymentMethod === 'CASH'} onChange={() => setPaymentMethod('CASH')} style={{ display: 'none' }} /> 💵 Cash
                  </label>
                </div>
              </div>

              {/* Pre-payment Call Alert Banner */}
              <div style={{ backgroundColor: '#fff7ed', padding: '12px', borderRadius: '10px', border: '1px solid #ffedd5', marginBottom: '18px', fontSize: '11px', color: '#c2410c', fontWeight: '700', lineHeight: '1.4' }}>
                📞 <strong>Important:</strong> Our cashier will call this phone number to confirm your order and receive payment before food preparation begins.
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '10px', marginBottom: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: '800' }}>Total Payable:</span>
                <span style={{ fontSize: '18px', fontWeight: '900', color: '#6b213a' }}>GHS {pricing.totalAmount.toFixed(2)}</span>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                style={{ width: '100%', padding: '14px', backgroundColor: isSubmitting ? '#cbd5e1' : '#6b213a', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '900', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
              >
                {isSubmitting ? 'Submitting Order...' : 'Confirm & Submit Order 🚀'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{ backgroundColor: '#ffffff', color: '#64748b', padding: '20px', textAlign: 'center', fontSize: '12px', borderTop: '1px solid #f1f5f9', marginTop: '40px' }}>
        <p style={{ margin: 0 }}>© 2026 Sarah's Tasty Foods. Prepared fresh daily on Legon Campus & Accra.</p>
      </footer>

    </div>
  );
}