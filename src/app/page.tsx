'use client';

import React, { useState } from 'react';
import { calculateOrderPricing } from '../utils/deliveryCalculator';

interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
}

const MENU_ITEMS: MenuItem[] = [
  { id: '1', name: 'Banku with Tilapia', category: 'Staples', price: 45.00, description: 'Fresh corn and cassava dough served with grilled tilapia and pepper.' },
  { id: '2', name: 'Jollof Rice with Grilled Chicken', category: 'Staples', price: 40.00, description: 'Spiced Ghanaian jollof rice served with fried plantain and chicken.' },
  { id: '3', name: 'Waakye Special', category: 'Staples', price: 35.00, description: 'Rice and beans served with shito, boiled egg, meat, and spaghetti.' },
  { id: '4', name: 'Fufu with Goat Soup', category: 'Staples', price: 50.00, description: 'Pounded cassava and plantain served in rich light goat soup.' },
  { id: '5', name: 'Fried Fish Portion', category: 'Proteins', price: 20.00, description: 'Crispy seasoned red fish.' },
  { id: '6', name: 'Assorted Meat Portion', category: 'Proteins', price: 25.00, description: 'Selection of goat, beef, and cow hide.' },
];

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [fulfillment, setFulfillment] = useState<'PICKUP' | 'DELIVERY'>('DELIVERY');
  const [distanceKm, setDistanceKm] = useState<number>(3.5);

  const addToCart = (id: string) => {
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
    const item = MENU_ITEMS.find((m) => m.id === id);
    return sum + (item ? item.price * qty : 0);
  }, 0);

  const pricing = calculateOrderPricing({
    fulfillment,
    distanceKm: fulfillment === 'DELIVERY' ? distanceKm : 0,
    foodSubtotal,
  });

  const filteredItems = selectedCategory === 'All'
    ? MENU_ITEMS
    : MENU_ITEMS.filter((item) => item.category === selectedCategory);

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '20px', maxWidth: '1100px', margin: '0 auto' }}>
      <header style={{ borderBottom: '2px solid #ea580c', paddingBottom: '10px', marginBottom: '20px' }}>
        <h1 style={{ color: '#ea580c', margin: 0 }}>Sarah's Tasty Foods</h1>
        <p style={{ margin: '5px 0 0 0', color: '#555' }}>Authentic Ghanaian Cuisine - Fast & Reliable</p>
      </header>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        <div style={{ flex: '2', minWidth: '300px' }}>
          <h2>Menu Catalog</h2>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            {['All', 'Staples', 'Proteins'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: 'none',
                  backgroundColor: selectedCategory === cat ? '#ea580c' : '#e5e7eb',
                  color: selectedCategory === cat ? '#fff' : '#000',
                  cursor: 'pointer',
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '15px' }}>
            {filteredItems.map((item) => (
              <div key={item.id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px' }}>
                <h3 style={{ margin: '0 0 5px 0' }}>{item.name}</h3>
                <p style={{ fontSize: '12px', color: '#666', height: '35px' }}>{item.description}</p>
                <p style={{ fontWeight: 'bold', color: '#ea580c' }}>GHS {item.price.toFixed(2)}</p>
                <button
                  onClick={() => addToCart(item.id)}
                  style={{ width: '100%', padding: '8px', backgroundColor: '#ea580c', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                >
                  Add to Order
                </button>
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex: '1', minWidth: '280px', border: '1px solid #ccc', borderRadius: '8px', padding: '15px', backgroundColor: '#f9fafb' }}>
          <h2>Your Order Summary</h2>
          {Object.keys(cart).length === 0 ? (
            <p style={{ color: '#888' }}>Your cart is empty. Add items from the menu.</p>
          ) : (
            <>
              {Object.entries(cart).map(([id, qty]) => {
                const item = MENU_ITEMS.find((m) => m.id === id);
                if (!item) return null;
                return (
                  <div key={id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div>
                      <strong>{item.name}</strong> x {qty}
                    </div>
                    <div>
                      <span>GHS {(item.price * qty).toFixed(2)}</span>
                      <button onClick={() => removeFromCart(id)} style={{ marginLeft: '8px', cursor: 'pointer' }}>-</button>
                    </div>
                  </div>
                );
              })}

              <hr />

              <h3>Fulfillment Option</h3>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ marginRight: '15px' }}>
                  <input
                    type="radio"
                    name="fulfillment"
                    checked={fulfillment === 'DELIVERY'}
                    onChange={() => setFulfillment('DELIVERY')}
                  /> Home Delivery
                </label>
                <label>
                  <input
                    type="radio"
                    name="fulfillment"
                    checked={fulfillment === 'PICKUP'}
                    onChange={() => setFulfillment('PICKUP')}
                  /> Self-Pickup
                </label>
              </div>

              {fulfillment === 'DELIVERY' && (
                <div style={{ marginBottom: '10px' }}>
                  <label>Delivery Distance (km): </label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={distanceKm}
                    onChange={(e) => setDistanceKm(parseFloat(e.target.value) || 1)}
                    style={{ width: '60px', padding: '4px' }}
                  />
                </div>
              )}

              <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#fff', borderRadius: '5px', border: '1px solid #e5e7eb' }}>
                <p style={{ margin: '4px 0' }}>Food Subtotal: <strong>GHS {pricing.foodSubtotal.toFixed(2)}</strong></p>
                <p style={{ margin: '4px 0' }}>Delivery Fee: <strong>GHS {pricing.deliveryFee.toFixed(2)}</strong></p>
                <h3 style={{ margin: '8px 0 0 0', color: '#ea580c' }}>Total: GHS {pricing.totalAmount.toFixed(2)}</h3>
              </div>

              <button
                onClick={() => alert(`Order Confirmed! Total Paid: GHS ${pricing.totalAmount.toFixed(2)}`)}
                style={{ width: '100%', marginTop: '15px', padding: '12px', backgroundColor: '#16a34a', color: '#fff', border: 'none', borderRadius: '5px', fontSize: '16px', cursor: 'pointer' }}
              >
                Checkout & Confirm
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
