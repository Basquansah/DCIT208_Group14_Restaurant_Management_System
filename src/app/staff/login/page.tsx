'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function StaffLoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/staff/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, pinCode }),
      });

      const result = await response.json();

      if (result.success) {
        // Store session in localStorage for POS & Kitchen reference
        localStorage.setItem('staff_user', JSON.stringify(result.staff));
        localStorage.setItem('staff_session_id', String(result.sessionId));

        // Redirect based on role
        if (result.staff.role === 'Kitchen Staff') {
          router.push('/kitchen');
        } else {
          router.push('/pos');
        }
      } else {
        setError(result.error || 'Invalid credentials.');
      }
    } catch (err) {
      setError('Network error connecting to authentication server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#fcfcfc', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'system-ui, sans-serif', padding: '20px' }}>
      <div style={{ backgroundColor: '#ffffff', padding: '35px', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.08)', width: '100%', maxWidth: '400px', border: '1px solid #f1f5f9' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <h1 style={{ color: '#6b213a', fontSize: '24px', fontWeight: '800', margin: '0 0 6px 0' }}>Staff Portal 🔑</h1>
          <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>Sarah's Tasty Foods Management System</p>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '10px', borderRadius: '8px', fontSize: '13px', marginBottom: '15px', textAlign: 'center', fontWeight: '600' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleStaffLogin}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Staff Phone Number</label>
            <input 
              type="tel" 
              required 
              placeholder="e.g. 0240000001" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '14px' }} 
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Security PIN Code</label>
            <input 
              type="password" 
              required 
              maxLength={6}
              placeholder="Enter PIN (e.g. 1111)" 
              value={pinCode} 
              onChange={(e) => setPinCode(e.target.value)} 
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '14px' }} 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ width: '100%', padding: '14px', backgroundColor: '#6b213a', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '800', cursor: 'pointer' }}
          >
            {loading ? 'Logging in...' : 'Sign In to Shift 🚀'}
          </button>
        </form>

        <div style={{ marginTop: '20px', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', fontSize: '12px', color: '#64748b', textAlign: 'center' }}>
          <strong>Default Test PINs:</strong><br/>
          Cashier (Kwame): <code>0240000001</code> / PIN: <code>1111</code><br/>
          Kitchen (Ama): <code>0240000002</code> / PIN: <code>2222</code>
        </div>

      </div>
    </div>
  );
}