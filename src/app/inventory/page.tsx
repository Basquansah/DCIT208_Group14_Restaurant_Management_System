'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StaffLoginGate from '../../src/components/StaffLoginGate';

interface InventoryItem {
  id: number;
  item_name: string;
  quantity: number;
  unit: string;
  min_threshold: number;
}

interface InventoryLog {
  id: number;
  item_id: number;
  transaction_type: string;
  quantity: number;
  unit: string;
  handled_by_staff: string;
  recipient_staff?: string;
  notes?: string;
  created_at: string;
}

interface StaffUser {
  id: string | number;
  name: string;
  department: string;
  role?: string;
}

export default function InventoryTerminalPage() {
  const router = useRouter();
  const [activeInventoryStaff, setActiveInventoryStaff] = useState<StaffUser | null>(null);
  const [isInventorySuspended, setIsInventorySuspended] = useState(false);

  // Station Staff Selection State
  const [staffList, setStaffList] = useState<StaffUser[]>([]);
  const [activeStorekeeper, setActiveStorekeeper] = useState<string>('Inventory Storekeeper');
  const [isStaffInitialized, setIsStaffInitialized] = useState<boolean>(false);

  // Inventory & Ledger State
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [inventoryLog, setInventoryLog] = useState<InventoryLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modal Controls
  const [showReceiveModal, setShowReceiveModal] = useState<boolean>(false);
  const [showIssueModal, setShowIssueModal] = useState<boolean>(false);

  // Form States
  const [receiveForm, setReceiveForm] = useState({ itemId: '', quantity: '', notes: '' });
  const [issueForm, setIssueForm] = useState({ itemId: '', quantity: '', recipientStaff: 'Chef Kofi', notes: '' });
  const todayISO = new Date().toISOString().split('T')[0];
  const [selectedLogDate, setSelectedLogDate] = useState<string>(todayISO);

  // Fetch Inventory and Staff from API / Supabase
  const fetchData = async () => {
    try {
      // 1. Fetch Inventory Items & Ledger from API
      const res = await fetch('/api/inventory', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.items) setInventoryItems(data.items);
        if (data.ledger) setInventoryLog(data.ledger);
      }

      // 2. Fetch Live Staff for Storekeeper & Kitchen dropdowns
      const staffRes = await fetch('/api/staff', { cache: 'no-store' });
      if (staffRes.ok) {
        const staffData = await staffRes.json();
        if (Array.isArray(staffData)) {
          setStaffList(staffData);
          if (!isStaffInitialized && staffData.length > 0) {
            setActiveStorekeeper(staffData[0].name);
            setIsStaffInitialized(true);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching inventory data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 6000);
    return () => clearInterval(interval);
  }, [isStaffInitialized]);

  // 1. Receive Stock (IN) Workflow -> Calls Supabase API
  const handleReceiveStock = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'RESTOCK',
          itemId: Number(receiveForm.itemId),
          quantity: Number(receiveForm.quantity),
          handledBy: activeStorekeeper,
          notes: receiveForm.notes,
        }),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        alert('Stock successfully received and recorded! 📦');
        setShowReceiveModal(false);
        setReceiveForm({ itemId: '', quantity: '', notes: '' });
        fetchData(); // Refresh inventory data instantly
      } else {
        alert('Error receiving stock: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Network error receiving stock:', error);
      alert('Network error connecting to inventory API.');
    }
  };

  // 2. Issue Stock to Kitchen (OUT) Workflow -> Calls Supabase API
  const handleIssueStock = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ISSUE',
          itemId: Number(issueForm.itemId),
          quantity: Number(issueForm.quantity),
          handledBy: activeStorekeeper,
          recipient: issueForm.recipientStaff,
          notes: issueForm.notes,
        }),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        alert(`Successfully issued stock to ${issueForm.recipientStaff}! 👨‍🍳`);
        setShowIssueModal(false);
        setIssueForm({ itemId: '', quantity: '', recipientStaff: 'Chef Kofi', notes: '' });
        fetchData(); // Refresh inventory data instantly
      } else {
        alert('Error issuing stock: ' + (result.error || 'Insufficient stock or invalid input'));
      }
    } catch (error) {
      console.error('Network error issuing stock:', error);
      alert('Network error connecting to inventory API.');
    }
  };

  const dailyInventoryLog = inventoryLog.filter((log) => log.created_at.startsWith(selectedLogDate));

  if (!activeInventoryStaff || isInventorySuspended) {
    return (
      <StaffLoginGate
        title="Inventory"
        allowedDepartments={['Inventory']}
        storageKey="inventory_current_staff"
        onAuthorized={(staff) => {
          setActiveInventoryStaff({
            id: staff.id,
            name: staff.name,
            department: staff.department || '',
            role: staff.role,
          });
          setActiveStorekeeper(staff.name);
          setIsInventorySuspended(false);
        }}
      >
        <></>
      </StaffLoginGate>
    );
  }

  return (
    <div style={{ backgroundColor: '#f1f5f9', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* HEADER & STATION SELECTOR */}
      <header style={{ backgroundColor: '#6b213a', color: '#ffffff', padding: '16px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', boxShadow: '0 4px 16px rgba(107, 33, 58, 0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ backgroundColor: '#ea580c', padding: '10px 14px', borderRadius: '12px', fontSize: '22px' }}>
            📦
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '900' }}>
              Sarah's Inventory Terminal
            </h1>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#fbcfe8', fontWeight: '600' }}>
              Storekeeper Station Mode | Daily Stock In & Out Ledger
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <label style={{ backgroundColor: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', padding: '8px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: '800', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            📅 Daily Interface Date:
            <input
              type="date"
              value={selectedLogDate}
              max={todayISO}
              onChange={(event) => setSelectedLogDate(event.target.value)}
              aria-label="Select inventory log date"
              style={{ border: 'none', borderRadius: '6px', padding: '5px 7px', color: '#6b213a', fontWeight: '800', fontSize: '12px' }}
            />
          </label>
          
          {/* Storekeeper Selection Dropdown */}
          <div style={{ backgroundColor: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', padding: '6px 12px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: '#fbcfe8', fontWeight: '700' }}>Storekeeper:</span>
            <select
              value={activeStorekeeper}
              onChange={(e) => setActiveStorekeeper(e.target.value)}
              style={{ backgroundColor: '#ffffff', color: '#6b213a', border: 'none', padding: '6px 10px', borderRadius: '6px', fontWeight: '800', fontSize: '13px', cursor: 'pointer' }}
            >
              <option value="Inventory Storekeeper">👤 Inventory Storekeeper</option>
              {staffList.map((s) => (
                <option key={s.id} value={s.name}>👤 {s.name} ({s.department})</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => router.push('/admin')}
            style={{ backgroundColor: '#ea580c', color: '#ffffff', border: 'none', padding: '9px 16px', borderRadius: '8px', fontWeight: '800', fontSize: '13px', cursor: 'pointer' }}
          >
            👑 Owner Admin Panel
          </button>
        </div>
      </header>

      {/* ACTION BUTTON BAR */}
      <div style={{ backgroundColor: '#ffffff', borderBottom: '2px solid #e2e8f0', padding: '14px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <h2 style={{ fontSize: '18px', color: '#0f172a', fontWeight: '900', margin: 0 }}>
          Current Stock Levels & Store Room Balance
        </h2>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setShowReceiveModal(true)}
            style={{ backgroundColor: '#16a34a', color: '#ffffff', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: '900', fontSize: '13px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(22, 163, 74, 0.3)' }}
          >
            + Receive Stock (IN) 📦
          </button>
          <button
            onClick={() => setShowIssueModal(true)}
            style={{ backgroundColor: '#ea580c', color: '#ffffff', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: '900', fontSize: '13px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(234, 88, 12, 0.3)' }}
          >
            ➔ Issue to Kitchen (OUT) 👨‍🍳
          </button>
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div style={{ padding: '24px 28px', maxWidth: '1400px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        
        {/* LEFT COLUMN: INVENTORY TABLE */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '2px solid #e2e8f0', overflow: 'hidden', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: '16px', color: '#0f172a', fontWeight: '900', marginTop: 0, marginBottom: '14px' }}>
            Available Ingredients & Portions
          </h3>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: '900' }}>
                  <th style={{ padding: '10px 14px' }}>Item Name</th>
                  <th style={{ padding: '10px 14px' }}>Quantity</th>
                  <th style={{ padding: '10px 14px' }}>Unit</th>
                  <th style={{ padding: '10px 14px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {inventoryItems.map((item) => {
                  const isLow = item.quantity <= item.min_threshold;
                  return (
                    <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 14px', fontWeight: '900', color: '#0f172a' }}>{item.item_name}</td>
                      <td style={{ padding: '12px 14px', fontWeight: '900', color: isLow ? '#dc2626' : '#ea580c' }}>
                        {item.quantity}
                      </td>
                      <td style={{ padding: '12px 14px', fontWeight: '700', color: '#64748b' }}>{item.unit}</td>
                      <td style={{ padding: '12px 14px', fontWeight: '900' }}>
                        <span style={{ backgroundColor: isLow ? '#fee2e2' : '#dcfce7', color: isLow ? '#dc2626' : '#16a34a', padding: '3px 8px', borderRadius: '6px', fontSize: '11px' }}>
                          {isLow ? '⚠️ Low Stock' : 'In Stock'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT COLUMN: STOCK MOVEMENT AUDIT LEDGER */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '2px solid #e2e8f0', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: '16px', color: '#0f172a', fontWeight: '900', marginTop: 0, marginBottom: '14px' }}>
            Live Stock Movement Ledger (IN / OUT)
          </h3>

          {dailyInventoryLog.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8', fontStyle: 'italic', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
              No stock transactions recorded during this session.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '380px', overflowY: 'auto' }}>
              {dailyInventoryLog.map((log) => {
                const isReceive = log.transaction_type === 'RECEIVE';
                const targetItem = inventoryItems.find(i => i.id === log.item_id);
                return (
                  <div key={log.id} style={{ padding: '12px 14px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '13px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontWeight: '900', color: isReceive ? '#16a34a' : '#ea580c' }}>
                        {isReceive ? '📦 RECEIVED (IN)' : '👨‍🍳 ISSUED TO KITCHEN (OUT)'}
                      </span>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <div style={{ color: '#0f172a', fontWeight: '800' }}>
                      {log.quantity} {log.unit} of {targetItem?.item_name || 'Item'}
                    </div>

                    <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>
                      Handler: <strong>{log.handled_by_staff}</strong>
                      {log.recipient_staff && <span> | Recipient: <strong>{log.recipient_staff}</strong></span>}
                      {log.notes && <div style={{ fontStyle: 'italic', color: '#64748b', marginTop: '2px' }}>Note: {log.notes}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* MODAL: RECEIVE STOCK (IN) */}
      {showReceiveModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', maxWidth: '460px', width: '100%', padding: '28px', position: 'relative' }}>
            <button onClick={() => setShowReceiveModal(false)} style={{ position: 'absolute', top: '16px', right: '16px', border: 'none', backgroundColor: '#f1f5f9', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
            <h2 style={{ fontSize: '18px', fontWeight: '900', marginBottom: '16px', color: '#16a34a' }}>Receive Stock (Restock IN)</h2>
            
            <form onSubmit={handleReceiveStock} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', marginBottom: '4px' }}>Select Ingredient / Item</label>
                <select required value={receiveForm.itemId} onChange={(e) => setReceiveForm({ ...receiveForm, itemId: e.target.value })} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}>
                  <option value="">-- Choose Item --</option>
                  {inventoryItems.map(i => (
                    <option key={i.id} value={i.id}>{i.item_name} (Current: {i.quantity} {i.unit})</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', marginBottom: '4px' }}>Quantity Received</label>
                <input type="number" step="0.5" required placeholder="e.g. 20" value={receiveForm.quantity} onChange={(e) => setReceiveForm({ ...receiveForm, quantity: e.target.value })} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', marginBottom: '4px' }}>Notes / Supplier (Optional)</label>
                <input type="text" placeholder="e.g. Delivered fresh from market" value={receiveForm.notes} onChange={(e) => setReceiveForm({ ...receiveForm, notes: e.target.value })} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
              </div>
              <button type="submit" style={{ marginTop: '10px', padding: '12px', backgroundColor: '#16a34a', color: '#ffffff', border: 'none', borderRadius: '10px', fontWeight: '900', cursor: 'pointer' }}>
                Confirm Stock Received 📦
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ISSUE STOCK TO KITCHEN (OUT) */}
      {showIssueModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', maxWidth: '460px', width: '100%', padding: '28px', position: 'relative' }}>
            <button onClick={() => setShowIssueModal(false)} style={{ position: 'absolute', top: '16px', right: '16px', border: 'none', backgroundColor: '#f1f5f9', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
            <h2 style={{ fontSize: '18px', fontWeight: '900', marginBottom: '16px', color: '#ea580c' }}>Issue Stock to Kitchen (OUT)</h2>
            
            <form onSubmit={handleIssueStock} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', marginBottom: '4px' }}>Select Ingredient / Item</label>
                <select required value={issueForm.itemId} onChange={(e) => setIssueForm({ ...issueForm, itemId: e.target.value })} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}>
                  <option value="">-- Choose Item --</option>
                  {inventoryItems.map(i => (
                    <option key={i.id} value={i.id}>{i.item_name} (Available: {i.quantity} {i.unit})</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', marginBottom: '4px' }}>Quantity to Issue</label>
                <input type="number" step="0.5" required placeholder="e.g. 5" value={issueForm.quantity} onChange={(e) => setIssueForm({ ...issueForm, quantity: e.target.value })} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', marginBottom: '4px' }}>Kitchen Staff Recipient</label>
                <input type="text" required value={issueForm.recipientStaff} onChange={(e) => setIssueForm({ ...issueForm, recipientStaff: e.target.value })} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', marginBottom: '4px' }}>Notes (Optional)</label>
                <input type="text" placeholder="e.g. Afternoon shift prep batch" value={issueForm.notes} onChange={(e) => setIssueForm({ ...issueForm, notes: e.target.value })} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
              </div>
              <button type="submit" style={{ marginTop: '10px', padding: '12px', backgroundColor: '#ea580c', color: '#ffffff', border: 'none', borderRadius: '10px', fontWeight: '900', cursor: 'pointer' }}>
                Confirm Stock Issuance 👨‍🍳
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}