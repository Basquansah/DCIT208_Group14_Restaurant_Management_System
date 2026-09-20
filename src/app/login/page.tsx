'use client';

import React, { useEffect, useState } from 'react';

export default function LoginPage() {
  const [role, setRole] = useState<'STAFF' | 'KITCHEN'>('STAFF');
  const [phone, setPhone] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('role') === 'OWNER') {
      window.location.replace('/admin/login');
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password, role }),
      });
      const result = await response.json();

      if (!response.ok) {
        setLoginError(result.error || 'Unable to sign in. Please check your details.');
        return;
      }

      if (result.user.role === 'OWNER') {
        window.location.href = '/admin';
      } else if (result.user.role === 'STAFF') {
        window.location.href = '/pos';
      } else if (result.user.role === 'KITCHEN') {
        window.location.href = '/kitchen';
      } else {
        setLoginError('This account does not have access to a staff portal.');
      }
    } catch (error) {
      console.error('Unable to sign in.', error);
      setLoginError('Unable to connect to the server. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#451426', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', maxWidth: '420px', width: '100%', padding: '30px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <h1 style={{ color: '#6b213a', margin: 0, fontSize: '24px', fontWeight: '800' }}>Sarah's Tasty Foods 🍲</h1>
          <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0 0' }}>Staff & Portal Management Login</p>
        </div>

        <form onSubmit={handleLogin}>
          {/* Role Selection Tabs */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>Select Portal Role:</label>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                onClick={() => setRole('STAFF')}
                style={{ flex: 1, padding: '8px 4px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '11px', fontWeight: '700', backgroundColor: role === 'STAFF' ? '#6b213a' : '#f8fafc', color: role === 'STAFF' ? '#ffffff' : '#334155', cursor: 'pointer' }}
              >
                🖥️ POS Staff
              </button>
              <button
                type="button"
                onClick={() => setRole('KITCHEN')}
                style={{ flex: 1, padding: '8px 4px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '11px', fontWeight: '700', backgroundColor: role === 'KITCHEN' ? '#6b213a' : '#f8fafc', color: role === 'KITCHEN' ? '#ffffff' : '#334155', cursor: 'pointer' }}
              >
                🍳 Kitchen
              </button>
              <button
                type="button"
                onClick={() => window.location.assign('/admin/login')}
                style={{ flex: 1, padding: '8px 4px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '11px', fontWeight: '700', backgroundColor: '#f8fafc', color: '#334155', cursor: 'pointer' }}
              >
                👑 Admin
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Phone Number</label>
            <input
              type="tel"
              required
              placeholder="e.g. 0241234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>

          {loginError && (
            <p role="alert" style={{ color: '#b91c1c', fontSize: '13px', margin: '0 0 14px' }}>
              {loginError}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            style={{ width: '100%', padding: '12px', backgroundColor: '#6b213a', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '800', cursor: isSubmitting ? 'wait' : 'pointer', boxShadow: '0 4px 12px rgba(107, 33, 58, 0.3)' }}
          >
            {isSubmitting ? 'Signing In…' : 'Sign In to Dashboard 🚀'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '15px' }}>
          <a href="/" style={{ color: '#64748b', fontSize: '12px', textDecoration: 'none' }}>← Back to Public Customer Website</a>
        </div>

      </div>
    </div>
  );
}