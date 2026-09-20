'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StaffLoginGate from '../../src/components/StaffLoginGate';

interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  description?: string;
  image_url?: string;
  available: boolean;
}

interface StaffMember {
  id: string;
  name: string;
  department: string;
  phone: string;
  role: string;
}

interface InventoryItem {
  id: string;
  item_name: string;
  quantity: number;
  unit: string;
  min_threshold: number;
}

interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  phoneNumber?: string;
  phone?: string;
  phonenumber?: string;
  order_source: string;
  fulfillment: string;
  payment_method: string;
  payment_status: string;
  total_amount: number;
  status: string;
  items: string;
  special_notes?: string;
  handled_by_staff?: string;
  created_at: string;
}

type AdminTab = 'OVERVIEW' | 'MENU' | 'STAFF' | 'INVENTORY' | 'ORDERS';

export default function AdminDashboardPage() {
  const router = useRouter();
  const defaultLoginBackground = '/images/Jollof.jpg';

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<AdminTab>('OVERVIEW');
  const [adminAuthStatus, setAdminAuthStatus] = useState<'checking' | 'unauthenticated' | 'authorized' | 'error'>('checking');
  const [adminAuthError, setAdminAuthError] = useState('');
  const [adminAuthRetry, setAdminAuthRetry] = useState(0);
  const [showBackgroundModal, setShowBackgroundModal] = useState(false);
  const [backgroundDraft, setBackgroundDraft] = useState('');
  const [backgroundError, setBackgroundError] = useState('');
  const [adminLoginBackground, setAdminLoginBackground] = useState(defaultLoginBackground);

  // Data States
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modal & Form States for Menu Editing/Adding
  const [showMenuModal, setShowMenuModal] = useState<boolean>(false);
  const [editingMenuId, setEditingMenuId] = useState<string | null>(null);
  const [menuForm, setMenuForm] = useState({ name: '', category: 'Staples', price: '', description: '', image_url: '' });

  // Modal & Form States for Staff Editing/Adding
  const [showStaffModal, setShowStaffModal] = useState<boolean>(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [staffForm, setStaffForm] = useState({ name: '', department: 'POS / Front-of-House', phone: '', role: 'Cashier' });

  // Modal & Form States for Inventory Adding/Editing
  const [showInventoryModal, setShowInventoryModal] = useState<boolean>(false);
  const [inventoryForm, setInventoryForm] = useState({ item_name: '', quantity: '', unit: 'Portions', min_threshold: '5' });

  // Staff & Timeframe Filter States for Master Order History
  const [selectedStaffFilter, setSelectedStaffFilter] = useState<string>('ALL');
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('ALL'); // '1M', '3M', '6M', '1Y', 'ALL'

  useEffect(() => {
    let isCurrent = true;

    const verifyAdminSession = async () => {
      try {
        const response = await fetch('/api/auth/session', { cache: 'no-store' });
        if (response.status === 401 || response.status === 403) {
          const savedAdmin = localStorage.getItem('active_admin_staff');
          if (savedAdmin) {
            try {
              const staff = JSON.parse(savedAdmin) as { name?: unknown; role?: unknown };
              const role = String(staff.role || '').toLowerCase();
              if (typeof staff.name === 'string' && ['admin', 'owner', 'manager', 'superadmin'].includes(role)) {
                if (isCurrent) setAdminAuthStatus('authorized');
                return;
              }
            } catch {
              localStorage.removeItem('active_admin_staff');
            }
          }
          if (isCurrent) setAdminAuthStatus('unauthenticated');
          return;
        }
        if (!response.ok) {
          throw new Error('Unable to verify the owner session.');
        }
        if (isCurrent) setAdminAuthStatus('authorized');
      } catch (error) {
        console.error('Unable to verify the Admin dashboard session:', error);
        if (isCurrent) {
          setAdminAuthError('Could not verify your owner session. Check your connection and try again.');
          setAdminAuthStatus('error');
        }
      }
    };

    void verifyAdminSession();
    return () => {
      isCurrent = false;
    };
  }, [adminAuthRetry]);

  useEffect(() => {
    const savedBackground = localStorage.getItem('admin_login_bg') || defaultLoginBackground;
    setAdminLoginBackground(savedBackground);
    setBackgroundDraft(savedBackground);
  }, []);

  const handleLoginBackgroundUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setBackgroundError('Choose a valid image file.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setBackgroundError('Choose an image smaller than 2 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setBackgroundDraft(reader.result);
        setBackgroundError('');
      }
    };
    reader.onerror = () => setBackgroundError('Could not read the selected image.');
    reader.readAsDataURL(file);
  };

  const saveLoginBackground = () => {
    const imageUrl = backgroundDraft.trim();
    if (!imageUrl) {
      setBackgroundError('Enter an image URL or select an image file.');
      return;
    }
    if (!imageUrl.startsWith('data:image/') && !/^https?:\/\//i.test(imageUrl) && !imageUrl.startsWith('/')) {
      setBackgroundError('Use an http(s) image URL, a site-relative image path, or upload an image.');
      return;
    }

    try {
      localStorage.setItem('admin_login_bg', imageUrl);
      setAdminLoginBackground(imageUrl);
      setBackgroundError('');
      setShowBackgroundModal(false);
    } catch (error) {
      console.error('Unable to save admin login background:', error);
      setBackgroundError('Could not save this image. Try a smaller image file.');
    }
  };

  const resetLoginBackground = () => {
    localStorage.removeItem('admin_login_bg');
    setBackgroundDraft(defaultLoginBackground);
    setAdminLoginBackground(defaultLoginBackground);
    setBackgroundError('');
    setShowBackgroundModal(false);
  };

  // Fetch Data
  const fetchData = async () => {
    try {
      const [menuRes, orderRes, staffRes, invRes] = await Promise.all([
        fetch('/api/menu', { cache: 'no-store' }),
        fetch('/api/orders', { cache: 'no-store' }),
        fetch('/api/staff', { cache: 'no-store' }),
        fetch('/api/inventory', { cache: 'no-store' }),
      ]);

      if (menuRes.ok) {
        const data = await menuRes.json();
        if (Array.isArray(data)) setMenuItems(data);
      }
      if (orderRes.ok) {
        const data = await orderRes.json();
        if (Array.isArray(data)) setOrders(data);
      }
      if (staffRes.ok) {
        const data = await staffRes.json();
        if (Array.isArray(data)) setStaffMembers(data);
      }
      if (invRes.ok) {
        const data = await invRes.json();
        if (data.items && Array.isArray(data.items)) setInventoryItems(data.items);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminAuthStatus !== 'authorized') return;
    fetchData();
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, [adminAuthStatus]);

  // --- MENU CRUD HANDLERS ---
  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMenuForm((prev) => ({ ...prev, image_url: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    const formattedId = editingMenuId 
      ? (isNaN(Number(editingMenuId)) ? editingMenuId : Number(editingMenuId)) 
      : undefined;

    const payload = {
      id: formattedId,
      name: menuForm.name,
      category: menuForm.category,
      price: parseFloat(menuForm.price) || 0,
      description: menuForm.description,
      image_url: menuForm.image_url || '/images/banku.jpg',
      available: true,
    };

    try {
      const method = editingMenuId ? 'PUT' : 'POST';
      const res = await fetch('/api/menu', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setShowMenuModal(false);
        setEditingMenuId(null);
        setMenuForm({ name: '', category: 'Staples', price: '', description: '', image_url: '' });
        fetchData();
      } else {
        alert('Failed to save menu item: ' + (data.error || res.statusText));
      }
    } catch (err) {
      console.error('Error saving menu:', err);
      alert('Network error saving menu item.');
    }
  };

  const handleDeleteMenu = async (id: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;
    try {
      const res = await fetch(`/api/menu?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
      else alert('Failed to delete item.');
    } catch (err) {
      console.error('Error deleting menu:', err);
    }
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    try {
      await fetch('/api/menu', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, available: !item.available }),
      });
      fetchData();
    } catch (err) {
      console.error('Error toggling availability:', err);
    }
  };

  // --- STAFF CRUD HANDLERS ---
  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    const formattedStaffId = editingStaffId 
      ? (isNaN(Number(editingStaffId)) ? editingStaffId : Number(editingStaffId)) 
      : undefined;

    try {
      const method = editingStaffId ? 'PUT' : 'POST';
      const res = await fetch('/api/staff', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: formattedStaffId, ...staffForm }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setShowStaffModal(false);
        setEditingStaffId(null);
        setStaffForm({ name: '', department: 'POS / Front-of-House', phone: '', role: 'Cashier' });
        fetchData();
      } else {
        alert('Failed to save staff member: ' + (data.error || res.statusText));
      }
    } catch (err) {
      console.error('Error saving staff:', err);
      alert('Network error saving staff member.');
    }
  };

  const handleDeleteStaff = async (id: string) => {
    if (!confirm('Remove staff member?')) return;
    try {
      const res = await fetch(`/api/staff?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
      else alert('Failed to remove staff member.');
    } catch (err) {
      console.error('Error deleting staff:', err);
    }
  };

  // --- INVENTORY CRUD HANDLERS ---
  const handleSaveInventory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CREATE',
          item_name: inventoryForm.item_name,
          quantity: Number(inventoryForm.quantity) || 0,
          unit: inventoryForm.unit,
          min_threshold: Number(inventoryForm.min_threshold) || 5,
        }),
      });
      if (res.ok) {
        setShowInventoryModal(false);
        setInventoryForm({ item_name: '', quantity: '', unit: 'Portions', min_threshold: '5' });
        fetchData();
      } else {
        alert('Failed to create inventory item.');
      }
    } catch (err) {
      console.error('Error saving inventory:', err);
    }
  };

  // Financial Metrics for Overview
  const completedOrders = orders.filter((o) => String(o.status || '').toLowerCase() === 'completed');
  const totalRevenue = completedOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
  const cashRevenue = completedOrders.filter((o) => String(o.payment_method || '').toUpperCase() === 'CASH').reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
  const momoRevenue = completedOrders.filter((o) => String(o.payment_method || '').toUpperCase() === 'MOMO').reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

  // --- FILTER LOGIC FOR MASTER ORDER HISTORY & PERFORMANCE ---
  const now = new Date();
  const filteredOrders = orders.filter((ord) => {
    if (selectedStaffFilter !== 'ALL' && (ord.handled_by_staff || 'Unassigned') !== selectedStaffFilter) {
      return false;
    }

    if (selectedTimeframe !== 'ALL' && ord.created_at) {
      const orderDate = new Date(ord.created_at);
      const diffTime = now.getTime() - orderDate.getTime();
      const diffDays = diffTime / (1000 * 3600 * 24);

      if (selectedTimeframe === '1M' && diffDays > 30) return false;
      if (selectedTimeframe === '3M' && diffDays > 90) return false;
      if (selectedTimeframe === '6M' && diffDays > 180) return false;
      if (selectedTimeframe === '1Y' && diffDays > 365) return false;
    }

    return true;
  });

  const staffPerformanceRevenue = filteredOrders
    .filter((o) => String(o.status || '').toLowerCase() === 'completed')
    .reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
  const staffPerformanceCount = filteredOrders.filter((o) => String(o.status || '').toLowerCase() === 'completed').length;

  if (adminAuthStatus === 'unauthenticated') {
    return (
      <StaffLoginGate
        title="Admin"
        allowedDepartments={[]}
        allowedRoles={['admin', 'owner', 'manager', 'superadmin']}
        storageKey="active_admin_staff"
        backgroundImage={adminLoginBackground}
        onAuthorized={(staff) => {
          localStorage.setItem('active_admin_staff', JSON.stringify(staff));
          setAdminAuthError('');
          setAdminAuthStatus('authorized');
        }}
      >
        <></>
      </StaffLoginGate>
    );
  }

  if (adminAuthStatus !== 'authorized') {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: '#f1f5f9', fontFamily: 'system-ui, sans-serif' }}>
        <section style={{ width: '100%', maxWidth: '420px', padding: '28px', borderRadius: '16px', background: '#fff', textAlign: 'center', boxShadow: '0 12px 32px rgba(15, 23, 42, 0.12)' }}>
          <h1 style={{ margin: '0 0 8px', color: '#4a0e17', fontSize: '20px', fontWeight: 900 }}>
            {adminAuthStatus === 'checking' ? 'Verifying Admin Session' : 'Admin Session Check Failed'}
          </h1>
          <p role={adminAuthStatus === 'error' ? 'alert' : 'status'} style={{ margin: '0 0 18px', color: adminAuthStatus === 'error' ? '#b91c1c' : '#64748b', fontSize: '13px' }}>
            {adminAuthStatus === 'checking' ? 'Please wait while we verify your owner login.' : adminAuthError}
          </p>
          {adminAuthStatus === 'error' && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  setAdminAuthError('');
                  setAdminAuthStatus('checking');
                  setAdminAuthRetry((retry) => retry + 1);
                }}
                style={{ padding: '10px 14px', border: 0, borderRadius: '8px', background: '#6b213a', color: '#fff', fontWeight: 800, cursor: 'pointer' }}
              >
                Retry
              </button>
              <button
                type="button"
                onClick={() => {
                  setAdminAuthError('');
                  setAdminAuthStatus('unauthenticated');
                }}
                style={{ padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', background: '#fff', color: '#334155', fontWeight: 800, cursor: 'pointer' }}
              >
                Sign In
              </button>
            </div>
          )}
        </section>
      </main>
    );
  }

  return (
    <div className="admin-shell" style={{ backgroundColor: '#f1f5f9', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      <style>{`
        @keyframes blinkWarning {
          0% { background-color: #fef2f2; border-color: #ef4444; }
          50% { background-color: #fee2e2; border-color: #b91c1c; box-shadow: 0 0 10px rgba(239, 68, 68, 0.6); }
          100% { background-color: #fef2f2; border-color: #ef4444; }
        }
        .blinking-low-stock {
          animation: blinkWarning 1.5s infinite ease-in-out;
        }
        .admin-shell {
          display: flex;
        }
        .admin-sidebar {
          box-sizing: border-box;
          width: 280px;
          min-height: 100vh;
          flex: 0 0 280px;
          position: sticky;
          top: 0;
          height: 100vh;
          overflow-y: auto;
          padding: 24px 16px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          color: #fff;
          background: #4a0e17;
        }
        .admin-main {
          flex: 1;
          min-width: 0;
        }
        .admin-nav-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .admin-nav-button {
          width: 100%;
          display: flex;
          align-items: center;
          text-align: left;
          padding: 13px 12px;
          border: 0;
          border-left: 4px solid transparent;
          border-radius: 8px;
          background: transparent;
          color: #f8e9d0;
          font-weight: 850;
          font-size: 13px;
          cursor: pointer;
        }
        .admin-nav-button.active {
          border-left-color: #f4c76b;
          background: #6b1422;
          color: #fff;
        }
        @media (max-width: 800px) {
          .admin-shell {
            flex-direction: column;
          }
          .admin-sidebar {
            width: 100%;
            min-height: auto;
            height: auto;
            flex-basis: auto;
            position: static;
          }
          .admin-nav-list {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
          }
        }
      `}</style>

      <aside className="admin-sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ backgroundColor: '#ea580c', padding: '10px 12px', borderRadius: '12px', fontSize: '22px' }}>👑</div>
          <div>
            <h1 style={{ margin: 0, fontSize: '16px', lineHeight: 1.3, fontWeight: '900', color: '#fff' }}>Sarah&apos;s Tasty Foods</h1>
            <p style={{ margin: '4px 0 0', color: '#f4c76b', fontSize: '11px', fontWeight: '800' }}>Owner Control Center</p>
          </div>
        </div>

        <nav className="admin-nav-list" aria-label="Admin sections">
        {[
          { id: 'OVERVIEW', label: '📈 Executive Overview' },
          { id: 'MENU', label: '🍲 Menu & Portions Management' },
          { id: 'STAFF', label: '👥 Staff & Department Control' },
          { id: 'INVENTORY', label: '📦 Inventory Control' },
          { id: 'ORDERS', label: '📋 Master Order History' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as AdminTab)}
            aria-current={activeTab === tab.id ? 'page' : undefined}
            className={`admin-nav-button${activeTab === tab.id ? ' active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
        </nav>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', marginTop: 'auto' }}>
          <button
            onClick={() => {
              setBackgroundDraft(localStorage.getItem('admin_login_bg') || defaultLoginBackground);
              setBackgroundError('');
              setShowBackgroundModal(true);
            }}
            style={{ width: '100%', padding: '11px 12px', border: '1px solid rgba(244,199,107,0.45)', borderRadius: '8px', background: '#3b0a11', color: '#f4c76b', textAlign: 'left', fontSize: '12px', fontWeight: '850', cursor: 'pointer' }}
          >
            🖼️ Change Login Background
          </button>
          <button
            onClick={() => router.push('/pos')}
            style={{ width: '100%', padding: '10px 12px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', background: 'rgba(255,255,255,0.08)', color: '#fff', textAlign: 'left', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}
          >
            🖥️ Go to POS Terminal
          </button>
          <button
            onClick={() => router.push('/')}
            style={{ width: '100%', padding: '10px 12px', border: 'none', borderRadius: '8px', background: '#ea580c', color: '#fff', textAlign: 'left', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}
          >
            🌐 View Customer Portal
          </button>
        </div>
      </aside>

      <div className="admin-main">
      {/* CONTENT AREA */}
      <div style={{ padding: '24px 28px', maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* TAB 1: EXECUTIVE OVERVIEW */}
        {activeTab === 'OVERVIEW' && (
          <div>
            <h2 style={{ fontSize: '20px', color: '#0f172a', fontWeight: '900', marginBottom: '16px' }}>
              Today's Financial Summary
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '28px' }}>
              <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '16px', border: '2px solid #e2e8f0' }}>
                <span style={{ fontSize: '12px', fontWeight: '800', color: '#64748b' }}>TOTAL REVENUE</span>
                <div style={{ fontSize: '28px', fontWeight: '900', color: '#6b213a', marginTop: '6px' }}>GHS {totalRevenue.toFixed(2)}</div>
              </div>
              <div style={{ backgroundColor: '#fff7ed', padding: '20px', borderRadius: '16px', border: '2px solid #ffedd5' }}>
                <span style={{ fontSize: '12px', fontWeight: '800', color: '#c2410c' }}>💵 CASH REVENUE</span>
                <div style={{ fontSize: '28px', fontWeight: '900', color: '#c2410c', marginTop: '6px' }}>GHS {cashRevenue.toFixed(2)}</div>
              </div>
              <div style={{ backgroundColor: '#fef2f2', padding: '20px', borderRadius: '16px', border: '2px solid #fee2e2' }}>
                <span style={{ fontSize: '12px', fontWeight: '800', color: '#b91c1c' }}>📲 MOMO REVENUE</span>
                <div style={{ fontSize: '28px', fontWeight: '900', color: '#b91c1c', marginTop: '6px' }}>GHS {momoRevenue.toFixed(2)}</div>
              </div>
              <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '16px', border: '2px solid #e2e8f0' }}>
                <span style={{ fontSize: '12px', fontWeight: '800', color: '#64748b' }}>COMPLETED ORDERS</span>
                <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginTop: '6px' }}>{completedOrders.length} Orders</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MENU & PORTIONS MANAGEMENT */}
        {activeTab === 'MENU' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', color: '#0f172a', fontWeight: '900', margin: 0 }}>
                Menu Catalog & Traditional Portions Management ({menuItems.length} Items)
              </h2>
              <button
                onClick={() => {
                  setEditingMenuId(null);
                  setMenuForm({ name: '', category: 'Staples', price: '', description: '', image_url: '' });
                  setShowMenuModal(true);
                }}
                style={{ backgroundColor: '#ea580c', color: '#ffffff', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: '900', cursor: 'pointer' }}
              >
                + Add New Menu Item 🍲
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
              {menuItems.map((item) => (
                <div key={item.id} style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '18px', border: '2px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    {item.image_url && (
                      <div style={{ width: '100%', height: '140px', borderRadius: '10px', overflow: 'hidden', marginBottom: '12px', backgroundColor: '#f1f5f9' }}>
                        <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '10px', fontWeight: '900', backgroundColor: '#6b213a', color: '#ffffff', padding: '3px 8px', borderRadius: '6px', textTransform: 'uppercase' }}>
                        {item.category}
                      </span>
                      <span style={{ fontSize: '14px', fontWeight: '900', color: '#ea580c' }}>
                        GHS {Number(item.price).toFixed(2)}
                      </span>
                    </div>

                    <h3 style={{ margin: '6px 0 4px', fontSize: '16px', fontWeight: '900', color: '#0f172a' }}>{item.name}</h3>
                    <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#64748b', fontStyle: 'italic' }}>
                      {item.description || 'Traditional corn and cassava dough portion with rich accompaniments.'}
                    </p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                    <button
                      onClick={() => handleToggleAvailability(item)}
                      style={{ fontSize: '11px', fontWeight: '900', color: item.available ? '#16a34a' : '#dc2626', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer' }}
                    >
                      {item.available ? '● Available' : '✕ Sold Out'}
                    </button>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => {
                          setEditingMenuId(item.id);
                          setMenuForm({ name: item.name, category: item.category, price: String(item.price), description: item.description || '', image_url: item.image_url || '' });
                          setShowMenuModal(true);
                        }}
                        style={{ backgroundColor: '#3b82f6', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                      >
                        Edit ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteMenu(item.id)}
                        style={{ backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                      >
                        Delete 🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: STAFF & DEPARTMENT CONTROL */}
        {activeTab === 'STAFF' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', color: '#0f172a', fontWeight: '900', margin: 0 }}>
                Staff Management & Department Assignments (Passwordless Station Access)
              </h2>
              <button
                onClick={() => {
                  setEditingStaffId(null);
                  setStaffForm({ name: '', department: 'POS / Front-of-House', phone: '', role: 'Cashier' });
                  setShowStaffModal(true);
                }}
                style={{ backgroundColor: '#ea580c', color: '#ffffff', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: '900', cursor: 'pointer' }}
              >
                + Add Staff Member 👤
              </button>
            </div>

            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '2px solid #e2e8f0', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: '900' }}>
                    <th style={{ padding: '14px 18px' }}>Staff Name</th>
                    <th style={{ padding: '14px 18px' }}>Department</th>
                    <th style={{ padding: '14px 18px' }}>Login Phone Number</th>
                    <th style={{ padding: '14px 18px' }}>Role</th>
                    <th style={{ padding: '14px 18px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {staffMembers.map((staff) => (
                    <tr key={staff.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 18px', fontWeight: '900', color: '#0f172a' }}>{staff.name}</td>
                      <td style={{ padding: '14px 18px', fontWeight: '800', color: '#6b213a' }}>{staff.department}</td>
                      <td style={{ padding: '14px 18px', fontWeight: '800', color: '#16a34a' }}>📞 {staff.phone}</td>
                      <td style={{ padding: '14px 18px', fontWeight: '700', color: '#475569' }}>{staff.role}</td>
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <button
                          onClick={() => {
                            setEditingStaffId(staff.id);
                            setStaffForm({ name: staff.name, department: staff.department, phone: staff.phone, role: staff.role });
                            setShowStaffModal(true);
                          }}
                          style={{ backgroundColor: '#3b82f6', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', marginRight: '6px' }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteStaff(staff.id)}
                          style={{ backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: INVENTORY CONTROL */}
        {activeTab === 'INVENTORY' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '20px', color: '#0f172a', fontWeight: '900', margin: 0 }}>
                Restaurant Ingredient & Stock Inventory (Low Stock Alerts)
              </h2>
              <button
                onClick={() => setShowInventoryModal(true)}
                style={{ backgroundColor: '#ea580c', color: '#ffffff', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: '900', cursor: 'pointer' }}
              >
                + Add New Inventory Item 📦
              </button>
            </div>

            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '2px solid #e2e8f0', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: '900' }}>
                    <th style={{ padding: '14px 18px' }}>Item / Ingredient</th>
                    <th style={{ padding: '14px 18px' }}>Stock Quantity</th>
                    <th style={{ padding: '14px 18px' }}>Unit</th>
                    <th style={{ padding: '14px 18px' }}>Min Threshold</th>
                    <th style={{ padding: '14px 18px' }}>Stock Status</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryItems.map((inv) => {
                    const isLow = Number(inv.quantity) <= Number(inv.min_threshold || 5);
                    return (
                      <tr key={inv.id} className={isLow ? 'blinking-low-stock' : ''} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '14px 18px', fontWeight: '900', color: '#0f172a' }}>{inv.item_name}</td>
                        <td style={{ padding: '14px 18px', fontWeight: '900', color: isLow ? '#dc2626' : '#ea580c' }}>{inv.quantity}</td>
                        <td style={{ padding: '14px 18px', fontWeight: '700', color: '#64748b' }}>{inv.unit}</td>
                        <td style={{ padding: '14px 18px', fontWeight: '700', color: '#64748b' }}>{inv.min_threshold || 5}</td>
                        <td style={{ padding: '14px 18px', fontWeight: '900' }}>
                          <span style={{ backgroundColor: isLow ? '#fee2e2' : '#dcfce7', color: isLow ? '#dc2626' : '#16a34a', padding: '4px 10px', borderRadius: '6px', fontSize: '12px' }}>
                            {isLow ? '⚠️ LOW STOCK ALERT' : 'In Stock'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: MASTER ORDER HISTORY & STAFF PERFORMANCE */}
        {activeTab === 'ORDERS' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <h2 style={{ fontSize: '20px', color: '#0f172a', fontWeight: '900', margin: 0 }}>
                Master Order History & Staff Performance Audit
              </h2>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '800', color: '#475569' }}>Staff:</span>
                  <select
                    value={selectedStaffFilter}
                    onChange={(e) => setSelectedStaffFilter(e.target.value)}
                    style={{ padding: '7px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: '800', backgroundColor: '#ffffff', fontSize: '13px' }}
                  >
                    <option value="ALL">All Staff Members</option>
                    {staffMembers.map((s) => (
                      <option key={s.id} value={s.name}>{s.name} ({s.role})</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '800', color: '#475569' }}>Timeframe:</span>
                  <select
                    value={selectedTimeframe}
                    onChange={(e) => setSelectedTimeframe(e.target.value)}
                    style={{ padding: '7px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: '800', backgroundColor: '#ffffff', fontSize: '13px' }}
                  >
                    <option value="1M">Past 1 Month</option>
                    <option value="3M">Past 3 Months</option>
                    <option value="6M">Past 6 Months</option>
                    <option value="1Y">Past 1 Year</option>
                    <option value="ALL">All Time</option>
                  </select>
                </div>
              </div>
            </div>

            {selectedStaffFilter !== 'ALL' && (
              <div style={{ backgroundColor: '#fff7ed', border: '2px solid #ffedd5', padding: '16px 20px', borderRadius: '14px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <span style={{ fontSize: '12px', fontWeight: '800', color: '#c2410c', textTransform: 'uppercase' }}>Performance Metrics for: {selectedStaffFilter}</span>
                  <div style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a', marginTop: '2px' }}>
                    Completed Orders: {staffPerformanceCount} | Total Revenue Generated: GHS {staffPerformanceRevenue.toFixed(2)}
                  </div>
                </div>
              </div>
            )}

            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '2px solid #e2e8f0', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: '900' }}>
                    <th style={{ padding: '12px 16px' }}>Order #</th>
                    <th style={{ padding: '12px 16px' }}>Source</th>
                    <th style={{ padding: '12px 16px' }}>Customer</th>
                    <th style={{ padding: '12px 16px' }}>Items</th>
                    <th style={{ padding: '12px 16px' }}>Fulfillment</th>
                    <th style={{ padding: '12px 16px' }}>Payment</th>
                    <th style={{ padding: '12px 16px' }}>Total (GHS)</th>
                    <th style={{ padding: '12px 16px' }}>Status</th>
                    <th style={{ padding: '12px 16px' }}>Handled By</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((ord) => (
                    <tr key={ord.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 16px', fontWeight: '900', color: '#6b213a' }}>#{ord.order_number}</td>
                      <td style={{ padding: '12px 16px', fontWeight: '800' }}>
                        <span style={{ fontSize: '10px', backgroundColor: ord.order_source === 'ONLINE' ? '#eff6ff' : '#fdf2f8', color: ord.order_source === 'ONLINE' ? '#1d4ed8' : '#9d174d', padding: '2px 6px', borderRadius: '4px' }}>
                          {ord.order_source || 'POS'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: '800' }}>{ord.customer_name}</td>
                      <td style={{ padding: '12px 16px', color: '#475569', maxWidth: '220px' }}>{ord.items}</td>
                      <td style={{ padding: '12px 16px', fontWeight: '700' }}>{ord.fulfillment}</td>
                      <td style={{ padding: '12px 16px', fontWeight: '700' }}>{ord.payment_method}</td>
                      <td style={{ padding: '12px 16px', fontWeight: '900', color: '#16a34a' }}>GHS {Number(ord.total_amount).toFixed(2)}</td>
                      <td style={{ padding: '12px 16px', fontWeight: '900' }}>
                        <span style={{ backgroundColor: ord.status === 'Completed' ? '#dcfce7' : '#fef3c7', color: ord.status === 'Completed' ? '#16a34a' : '#d97706', padding: '3px 8px', borderRadius: '6px' }}>
                          {ord.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: '800', color: '#6b213a' }}>{ord.handled_by_staff || 'Unassigned'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
      </div>

      {/* MENU MODAL */}
      {showMenuModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, padding: '20px' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', maxWidth: '440px', width: '100%', padding: '24px' }}>
            <h2 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: '900', color: '#0f172a' }}>
              {editingMenuId ? 'Edit Menu Item' : 'Add New Menu Item'}
            </h2>
            <form onSubmit={handleSaveMenu} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748b', marginBottom: '4px' }}>Item Name</label>
                <input
                  type="text"
                  required
                  value={menuForm.name}
                  onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: '700', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748b', marginBottom: '4px' }}>Category</label>
                  <select
                    value={menuForm.category}
                    onChange={(e) => setMenuForm({ ...menuForm, category: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: '800', backgroundColor: '#fff' }}
                  >
                    <option value="Staples">Staples</option>
                    <option value="Proteins">Proteins</option>
                    <option value="Stews & Soups">Stews & Soups</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748b', marginBottom: '4px' }}>Price (GHS)</label>
                  <input
                    type="number"
                    step="0.50"
                    required
                    value={menuForm.price}
                    onChange={(e) => setMenuForm({ ...menuForm, price: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: '700', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748b', marginBottom: '4px' }}>Description</label>
                <input
                  type="text"
                  value={menuForm.description}
                  onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: '700', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748b', marginBottom: '4px' }}>Device Image Picker</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImagePick}
                  style={{ width: '100%', fontSize: '12px' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" style={{ flex: 1, padding: '12px', backgroundColor: '#ea580c', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '900', cursor: 'pointer' }}>Save Item</button>
                <button type="button" onClick={() => setShowMenuModal(false)} style={{ flex: 1, padding: '12px', backgroundColor: '#cbd5e1', color: '#0f172a', border: 'none', borderRadius: '10px', fontWeight: '900', cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STAFF MODAL */}
      {showStaffModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, padding: '20px' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', maxWidth: '440px', width: '100%', padding: '24px' }}>
            <h2 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: '900', color: '#0f172a' }}>
              {editingStaffId ? 'Edit Staff Member' : 'Add New Staff Member'}
            </h2>
            <form onSubmit={handleSaveStaff} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748b', marginBottom: '4px' }}>Staff Name</label>
                <input
                  type="text"
                  required
                  value={staffForm.name}
                  onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: '700', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748b', marginBottom: '4px' }}>Department</label>
                <select
                  value={staffForm.department}
                  onChange={(e) => setStaffForm({ ...staffForm, department: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: '800', backgroundColor: '#fff' }}
                >
                  <option value="POS / Front-of-House">POS / Front-of-House</option>
                  <option value="Kitchen Display">Kitchen Display</option>
                  <option value="Inventory Control">Inventory Control</option>
                  <option value="Executive Management">Executive Management</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748b', marginBottom: '4px' }}>Login Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 0241234567"
                  value={staffForm.phone}
                  onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: '700', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748b', marginBottom: '4px' }}>Role / Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cashier / Chef"
                  value={staffForm.role}
                  onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: '700', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" style={{ flex: 1, padding: '12px', backgroundColor: '#ea580c', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '900', cursor: 'pointer' }}>Save Staff</button>
                <button type="button" onClick={() => setShowStaffModal(false)} style={{ flex: 1, padding: '12px', backgroundColor: '#cbd5e1', color: '#0f172a', border: 'none', borderRadius: '10px', fontWeight: '900', cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INVENTORY MODAL */}
      {showInventoryModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, padding: '20px' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', maxWidth: '440px', width: '100%', padding: '24px' }}>
            <h2 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: '900', color: '#0f172a' }}>
              Add New Inventory Stock Item
            </h2>
            <form onSubmit={handleSaveInventory} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748b', marginBottom: '4px' }}>Item Name / Ingredient</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Banku Dough, Tilapia, Yam"
                  value={inventoryForm.item_name}
                  onChange={(e) => setInventoryForm({ ...inventoryForm, item_name: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: '700', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748b', marginBottom: '4px' }}>Quantity</label>
                  <input
                    type="number"
                    required
                    value={inventoryForm.quantity}
                    onChange={(e) => setInventoryForm({ ...inventoryForm, quantity: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: '700', boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748b', marginBottom: '4px' }}>Unit</label>
                  <input
                    type="text"
                    required
                    value={inventoryForm.unit}
                    onChange={(e) => setInventoryForm({ ...inventoryForm, unit: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: '700', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748b', marginBottom: '4px' }}>Min Threshold (Blinking Alert)</label>
                <input
                  type="number"
                  required
                  value={inventoryForm.min_threshold}
                  onChange={(e) => setInventoryForm({ ...inventoryForm, min_threshold: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: '700', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" style={{ flex: 1, padding: '12px', backgroundColor: '#ea580c', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '900', cursor: 'pointer' }}>Create Item</button>
                <button type="button" onClick={() => setShowInventoryModal(false)} style={{ flex: 1, padding: '12px', backgroundColor: '#cbd5e1', color: '#0f172a', border: 'none', borderRadius: '10px', fontWeight: '900', cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showBackgroundModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 3000, backgroundColor: 'rgba(15, 23, 42, 0.75)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
          <section role="dialog" aria-modal="true" aria-labelledby="admin-background-title" style={{ backgroundColor: '#fff', borderRadius: '16px', maxWidth: '480px', width: '100%', padding: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.25)' }}>
            <h2 id="admin-background-title" style={{ margin: '0 0 8px', color: '#4a0e17', fontSize: '19px', fontWeight: '900' }}>Admin Login Background</h2>
            <p style={{ margin: '0 0 18px', color: '#64748b', fontSize: '13px' }}>Paste an image URL or upload an image for the owner sign-in screen.</p>
            <label style={{ display: 'block', marginBottom: '14px', color: '#334155', fontSize: '12px', fontWeight: '800' }}>
              Image URL
              <input
                type="text"
                value={backgroundDraft.startsWith('data:image/') ? '' : backgroundDraft}
                onChange={(event) => {
                  setBackgroundDraft(event.target.value);
                  setBackgroundError('');
                }}
                placeholder="https://example.com/restaurant.jpg or /images/Jollof.jpg"
                style={{ boxSizing: 'border-box', display: 'block', width: '100%', marginTop: '5px', padding: '11px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px' }}
              />
            </label>
            <label style={{ display: 'block', marginBottom: '14px', color: '#334155', fontSize: '12px', fontWeight: '800' }}>
              Or upload image (max 2 MB)
              <input
                type="file"
                accept="image/*"
                onChange={handleLoginBackgroundUpload}
                style={{ boxSizing: 'border-box', display: 'block', width: '100%', marginTop: '5px', fontSize: '13px' }}
              />
            </label>
            {backgroundDraft && (
              <div style={{ height: '140px', marginBottom: '14px', borderRadius: '10px', backgroundImage: `url("${backgroundDraft}")`, backgroundPosition: 'center', backgroundSize: 'cover', border: '1px solid #e2e8f0' }} />
            )}
            {backgroundError && <p role="alert" style={{ margin: '0 0 14px', color: '#b91c1c', fontSize: '12px', fontWeight: '700' }}>{backgroundError}</p>}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <button type="button" onClick={saveLoginBackground} style={{ flex: 1, padding: '11px', border: 0, borderRadius: '8px', background: '#6b213a', color: '#fff', fontWeight: '900', cursor: 'pointer' }}>Save Background</button>
              <button type="button" onClick={resetLoginBackground} style={{ padding: '11px', border: '1px solid #cbd5e1', borderRadius: '8px', background: '#fff', color: '#334155', fontWeight: '800', cursor: 'pointer' }}>Reset Default</button>
              <button type="button" onClick={() => setShowBackgroundModal(false)} style={{ padding: '11px', border: 'none', borderRadius: '8px', background: '#e2e8f0', color: '#334155', fontWeight: '800', cursor: 'pointer' }}>Close</button>
            </div>
          </section>
        </div>
      )}

    </div>
  );
}