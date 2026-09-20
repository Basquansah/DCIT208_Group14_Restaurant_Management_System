'use client';

import React, { useState, useEffect } from 'react';

interface StaffLoginGateProps {
  title: string;
  allowedDepartments: string[];
  allowedRoles?: string[];
  storageKey?: string;
  authMode?: 'staff' | 'owner';
  backgroundImage?: string;
  onAuthorized?: (staff: any) => void;
  children: React.ReactNode;
}

export default function StaffLoginGate({
  title,
  allowedDepartments,
  allowedRoles,
  storageKey = 'pos_current_staff',
  authMode = 'staff',
  backgroundImage,
  onAuthorized,
  children,
}: StaffLoginGateProps) {
  const [staffName, setStaffName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [authorizedStaff, setAuthorizedStaff] = useState<any | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [registrationAvailable, setRegistrationAvailable] = useState(false);
  const [isRegisteringOwner, setIsRegisteringOwner] = useState(false);

  // Check if already authenticated in this session
  useEffect(() => {
    if (authMode === 'owner') {
      let isCurrent = true;
      fetch('/api/auth/register', { cache: 'no-store' })
        .then(async (response) => {
          const result = await response.json();
          if (!response.ok) throw new Error('Unable to check owner registration availability.');
          if (isCurrent && result.registrationAvailable === true) {
            setRegistrationAvailable(true);
            setIsRegisteringOwner(true);
          }
        })
        .catch((registrationError) => {
          console.error('Unable to check owner registration availability:', registrationError);
        });
      return () => {
        isCurrent = false;
      };
    }

    const savedStaff = localStorage.getItem(storageKey);
    if (savedStaff) {
      try {
        const staffObj = JSON.parse(savedStaff);
        verifyAndAuthorize(staffObj, false);
      } catch (e) {
        localStorage.removeItem(storageKey);
      }
    }
  }, [authMode, storageKey]);

  const verifyAndAuthorize = (found: any, saveSession = true) => {
    const dept = (found.department || '').toLowerCase();
    const role = (found.role || '').toLowerCase();
    
    const isAllowedByDepartment = allowedDepartments.some((d) => dept.includes(d.toLowerCase()));
    const isAllowedByRole = allowedRoles
      ? allowedRoles.some((allowedRole) => role === allowedRole.toLowerCase())
      : role.includes('owner') || role.includes('admin') || role.includes('manager');
    const isAllowed = isAllowedByDepartment || isAllowedByRole;

    if (isAllowed) {
      setAuthorizedStaff(found);
      if (saveSession) {
        localStorage.setItem(storageKey, JSON.stringify(found));
      }
      if (onAuthorized) onAuthorized(found);
    } else {
      setError(`Access denied. Your department (${found.department || 'N/A'}) is not authorized for ${title}.`);
      localStorage.removeItem(storageKey);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (authMode === 'owner') {
      try {
        const isRegistration = isRegisteringOwner && registrationAvailable;
        const response = await fetch(isRegistration ? '/api/auth/register' : '/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName: staffName.trim(),
            phone: phone.trim(),
            password,
            ...(isRegistration ? {} : { role: 'OWNER' }),
          }),
        });
        const result = await response.json();
        if (!response.ok) {
          if (response.status === 409 && isRegistration) {
            setRegistrationAvailable(false);
            setIsRegisteringOwner(false);
          }
          setError(typeof result.error === 'string' ? result.error : 'Unable to continue. Check your details and try again.');
          return;
        }

        if (!result.user || result.user.role !== 'OWNER') {
          setError('Owner authentication returned an invalid account.');
          return;
        }
        setAuthorizedStaff(result.user);
        onAuthorized?.(result.user);
      } catch (authError) {
        console.error('Unable to authenticate the restaurant owner:', authError);
        setError('Unable to connect to the server. Please try again.');
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      if (title === 'Admin') {
        console.info('Authenticating Admin:', { name: staffName.trim() });
      }
      const res = await fetch('/api/staff', { cache: 'no-store' });
      const staffList: unknown = await res.json();
      if (!res.ok) {
        throw new Error('Could not fetch staff authentication records.');
      }

      if (Array.isArray(staffList)) {
        const normalizedName = staffName.trim().toLocaleLowerCase();
        const enteredCredential = password.trim();
        const found = staffList.find((record: any) => {
          const normalizedRole = String(record.role || '').trim().toLowerCase();
          const roleAllowed = allowedRoles
            ? allowedRoles.some((allowedRole) => normalizedRole === allowedRole.toLowerCase())
            : true;
          const nameMatches = String(record.name || '').trim().toLocaleLowerCase() === normalizedName;
          const credentialMatches = [record.pin, record.password, record.phone]
            .some((credential) => credential != null && String(credential).trim() === enteredCredential);
          return roleAllowed && nameMatches && credentialMatches;
        });

        if (title === 'Admin') {
          console.info('Supabase Result:', { matchedStaffRecord: Boolean(found), error: null });
        }

        if (found) {
          verifyAndAuthorize(found, true);
        } else {
          setError(title === 'Admin'
            ? 'Invalid Admin Name or Password/PIN'
            : 'Invalid staff name or password/PIN. Please check your credentials.');
        }
      } else {
        setError('Could not fetch staff authentication records.');
      }
    } catch (err) {
      console.error('Unable to verify staff credentials:', err);
      setError(err instanceof Error ? err.message : 'Network error verifying staff credentials.');
    } finally {
      setLoading(false);
    }
  };

  if (authorizedStaff) {
    return <>{children}</>;
  }

  return (
    <div style={{
      backgroundColor: '#f1f5f9',
      backgroundImage: backgroundImage
        ? `linear-gradient(rgba(0, 0, 0, 0.42), rgba(0, 0, 0, 0.42)), url("${backgroundImage}")`
        : undefined,
      backgroundSize: backgroundImage ? 'cover' : undefined,
      backgroundPosition: backgroundImage ? 'center' : undefined,
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: 'system-ui, sans-serif',
      padding: '20px',
      boxSizing: 'border-box',
    }}>
      <div style={{ backgroundColor: backgroundImage ? 'rgba(255, 255, 255, 0.94)' : '#ffffff', backdropFilter: backgroundImage ? 'blur(4px)' : undefined, padding: '32px', borderRadius: '20px', maxWidth: '400px', width: '100%', boxShadow: '0 10px 25px rgba(0,0,0,0.08)', border: '2px solid #e2e8f0' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ backgroundColor: '#6b213a', color: '#fff', width: '54px', height: '54px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', margin: '0 auto 12px' }}>
            🔒
          </div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '900', color: '#0f172a' }}>
            {authMode === 'owner' ? 'Owner Sign In' : `${title} Station Access`}
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b', fontWeight: '600' }}>
            {authMode === 'owner' ? 'Sign in with your owner name, phone number, and password / PIN' : 'Enter your staff name and password / PIN'}
          </p>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '800', marginBottom: '16px', border: '1px solid #fca5a5' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#475569', marginBottom: '4px' }}>
              {authMode === 'owner' ? 'Owner Name' : 'Staff Name'}
            </label>
            <input
              type="text"
              required
              placeholder={authMode === 'owner' ? 'Enter your full name' : title === 'Admin' ? 'e.g. Owner / Admin Name' : 'e.g. Akosua Mensah'}
              value={staffName}
              onChange={(e) => setStaffName(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: '700', boxSizing: 'border-box' }}
            />
          </div>

          {authMode === 'owner' && (
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#475569', marginBottom: '4px' }}>Phone Number</label>
              <input
                type="tel"
                autoComplete="tel"
                required
                placeholder="e.g. 0241234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: '700', boxSizing: 'border-box' }}
              />
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#475569', marginBottom: '4px' }}>
              {authMode === 'owner' && isRegisteringOwner ? 'Password' : 'Password / PIN / Phone'}
            </label>
            <input
              type="password"
              required
              minLength={authMode === 'owner' && isRegisteringOwner ? 8 : undefined}
              maxLength={authMode === 'owner' ? 128 : undefined}
              placeholder="Enter your password or PIN"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: '700', boxSizing: 'border-box' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '12px', backgroundColor: '#ea580c', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '900', fontSize: '14px', cursor: 'pointer' }}
          >
            {loading ? 'Verifying...' : authMode === 'owner' ? (isRegisteringOwner ? 'Register Owner Account' : 'Authenticate Station 🚀') : 'Authenticate Station 🚀'}
          </button>
        </form>

        {authMode === 'owner' && registrationAvailable && (
          <button
            type="button"
            onClick={() => {
              setError('');
              setIsRegisteringOwner((registering) => !registering);
            }}
            style={{ display: 'block', margin: '16px auto 0', border: 'none', background: 'none', color: '#6b213a', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}
          >
            {isRegisteringOwner ? 'Already registered? Sign in' : 'First time here? Register as owner'}
          </button>
        )}

        {authMode !== 'owner' && <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <button
            onClick={() => setShowResetModal(true)}
            style={{ background: 'none', border: 'none', color: '#6b213a', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}
          >
            Forgot Password / Reset Access?
          </button>
        </div>}

        {authMode !== 'owner' && showResetModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', zIndex: 3000 }}>
            <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '16px', maxWidth: '340px', width: '100%' }}>
              <h3 style={{ margin: '0 0 10px', fontSize: '16px', fontWeight: '900', color: '#6b213a' }}>Reset Station Credentials</h3>
              <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px', lineHeight: '1.4' }}>
                Please inform Sarah (Owner/Manager) to update your credentials under the <strong>Staff & Department Control</strong> tab in the Admin Panel.
              </p>
              <button
                onClick={() => setShowResetModal(false)}
                style={{ width: '100%', padding: '10px', backgroundColor: '#6b213a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}