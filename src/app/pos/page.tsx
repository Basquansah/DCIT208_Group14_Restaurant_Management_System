'use client';
import StaffLoginGate from '../../src/components/StaffLoginGate';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  description?: string;
  image_url?: string;
  available: boolean;
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
  cashier_name?: string;
  staff_id?: number | string;
  created_at: string;
}

interface StaffUser {
  id: number | string;
  name: string;
  role?: string;
  department?: string;
  pin?: string | number;
  password?: string;
  phone?: string;
}

interface ActiveTabCart {
  tabId: number;
  name: string;
  cart: { [key: string]: number };
  customerName: string;
  phoneNumber: string;
  fulfillment: 'DINE-IN' | 'TAKEAWAY';
  paymentMethod: 'CASH' | 'MOMO';
  cashTendered: string;
  momoReference: string;
  specialNotes: string;
}

interface POSPageProps {
  initialStaff: StaffUser | null;
  onLock: () => void;
}

function POSPage({ initialStaff, onLock }: POSPageProps) {
  const router = useRouter();

  // Multi-Staff Terminal State
  const [staffList, setStaffList] = useState<StaffUser[]>([]);
  const [activeStaff, setActiveStaff] = useState<StaffUser | null>(initialStaff);
  const [isCashierInitialized, setIsCashierInitialized] = useState<boolean>(false);
  const [showSummaryModal, setShowSummaryModal] = useState<boolean>(false);
  const [isSessionSuspended, setIsSessionSuspended] = useState<boolean>(false);
  const [suspendedStaffNames, setSuspendedStaffNames] = useState<string[]>([]);
  const [staffPendingUnlock, setStaffPendingUnlock] = useState<StaffUser | null>(null);
  const [showResumePinModal, setShowResumePinModal] = useState<boolean>(false);
  const [resumePinInput, setResumePinInput] = useState<string>('');
  const [resumePinError, setResumePinError] = useState('');

  const handleResumeStaff = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const credentials = [staffPendingUnlock?.pin, staffPendingUnlock?.password, staffPendingUnlock?.phone]
      .filter((credential) => credential !== undefined && credential !== null && String(credential).length > 0);

    if (credentials.some((credential) => String(credential) === resumePinInput)) {
      if (staffPendingUnlock) {
        setActiveStaff(staffPendingUnlock);
        setSuspendedStaffNames((currentNames) =>
          currentNames.filter((name) => name !== staffPendingUnlock.name)
        );
      }
      setIsSessionSuspended(false);
      setShowResumePinModal(false);
      setStaffPendingUnlock(null);
      setResumePinInput('');
      setResumePinError('');
    } else {
      setResumePinError(
        credentials.length > 0
          ? 'Incorrect PIN or password.'
          : 'No PIN or password is configured for this staff account.'
      );
    }
  };

  // Menu Catalog State
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Staff-Specific Customer Tabs State: Map of Staff Name -> Array of Tabs
  const [staffTabsMap, setStaffTabsMap] = useState<{ [staffName: string]: ActiveTabCart[] }>({});
  const [activeTabIdMap, setActiveTabIdMap] = useState<{ [staffName: string]: number }>({});

  // Get current staff name or default
  const staffNameKey = activeStaff?.name || 'Default Staff';

  // Initialize or retrieve tabs for the active staff member
  const currentStaffTabs = staffTabsMap[staffNameKey] || [
    { tabId: 1, name: 'Customer 1', cart: {}, customerName: 'Walk-in Customer', phoneNumber: '', fulfillment: 'DINE-IN', paymentMethod: 'CASH', cashTendered: '', momoReference: '', specialNotes: '' },
  ];

  const currentActiveTabId = activeTabIdMap[staffNameKey] !== undefined ? activeTabIdMap[staffNameKey] : currentStaffTabs[0].tabId;

  const currentTab = currentStaffTabs.find((t) => t.tabId === currentActiveTabId) || currentStaffTabs[0];

  // Helper to update tabs for the currently active staff
  const updateCurrentStaffTabs = (updatedTabs: ActiveTabCart[], newActiveId?: number) => {
    setStaffTabsMap((prev) => ({
      ...prev,
      [staffNameKey]: updatedTabs,
    }));
    if (newActiveId !== undefined) {
      setActiveTabIdMap((prev) => ({
        ...prev,
        [staffNameKey]: newActiveId,
      }));
    }
  };

  const updateCurrentTab = (updates: Partial<ActiveTabCart>) => {
    const updatedTabs = currentStaffTabs.map((tab) =>
      tab.tabId === currentActiveTabId ? { ...tab, ...updates } : tab
    );
    updateCurrentStaffTabs(updatedTabs);
  };

  const handleAddNewTab = () => {
    const nextId = currentStaffTabs.length > 0 ? Math.max(...currentStaffTabs.map(t => t.tabId)) + 1 : 1;
    const newTabName = `Customer ${nextId}`;
    const newTab: ActiveTabCart = {
      tabId: nextId,
      name: newTabName,
      cart: {},
      customerName: 'Walk-in Customer',
      phoneNumber: '',
      fulfillment: 'DINE-IN',
      paymentMethod: 'CASH',
      cashTendered: '',
      momoReference: '',
      specialNotes: ''
    };
    const updatedTabs = [...currentStaffTabs, newTab];
    updateCurrentStaffTabs(updatedTabs, nextId);
  };

  const handleCloseTab = (tabIdToClose: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentStaffTabs.length <= 1) {
      alert('You must maintain at least one active customer tab.');
      return;
    }
    const remainingTabs = currentStaffTabs.filter(t => t.tabId !== tabIdToClose);
    const newActiveId = currentActiveTabId === tabIdToClose ? remainingTabs[0].tabId : currentActiveTabId;
    updateCurrentStaffTabs(remainingTabs, newActiveId);
  };

  // Submission & Receipt Modal
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [printableOrder, setPrintableOrder] = useState<any | null>(null);

  // Cross-Portal Orders & Live Kitchen Status
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState<boolean>(false);

  // Category Color Config
  const getCategoryTheme = (category: string) => {
    switch (category) {
      case 'Staples':
        return { border: '#6b213a', bg: '#fdf2f8', badgeBg: '#6b213a', badgeText: '#ffffff', priceColor: '#9d174d' };
      case 'Proteins':
        return { border: '#ea580c', bg: '#fff7ed', badgeBg: '#ea580c', badgeText: '#ffffff', priceColor: '#c2410c' };
      case 'Stews & Soups':
        return { border: '#059669', bg: '#ecfdf5', badgeBg: '#059669', badgeText: '#ffffff', priceColor: '#047857' };
      default:
        return { border: '#475569', bg: '#f8fafc', badgeBg: '#475569', badgeText: '#ffffff', priceColor: '#1e293b' };
    }
  };

  // Fetch Live Staff from Supabase / API
  const fetchStaff = async () => {
    try {
      const response = await fetch('/api/staff', { cache: 'no-store' });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          const posStaff = data.filter((s: any) => 
            !s.department || 
            s.department.toLowerCase().includes('pos') || 
            s.department.toLowerCase().includes('front') ||
            s.department.toLowerCase().includes('management')
          );
          
          if (posStaff.length > 0) {
            const availableStaff = initialStaff
              ? [initialStaff, ...posStaff.filter((staff) => staff.name !== initialStaff.name)]
              : posStaff;
            setStaffList(availableStaff);
            if (!isCashierInitialized) {
              if (!initialStaff) {
                setActiveStaff((currentStaff) => currentStaff ?? availableStaff[0]);
              }
              setIsCashierInitialized(true);
            }
            return;
          }
        }
      }
    } catch (error) {
      console.error('Error fetching staff from API:', error);
    }

    const defaultTeam: StaffUser[] = [
      { id: 101, name: 'Kwame (POS Cashier)', role: 'POS Operator' },
      { id: 102, name: 'Akosua (Cashier)', role: 'POS Operator' },
      { id: 103, name: 'Adesua (Cashier)', role: 'POS Operator' },
      { id: 104, name: 'Sarah (Manager)', role: 'Owner' },
    ];
    const availableStaff = initialStaff
      ? [initialStaff, ...defaultTeam.filter((staff) => staff.name !== initialStaff.name)]
      : defaultTeam;
    setStaffList(availableStaff);
    if (!isCashierInitialized) {
      if (!initialStaff) {
        setActiveStaff((currentStaff) => currentStaff ?? availableStaff[0]);
      }
      setIsCashierInitialized(true);
    }
  };

  // Fetch Live Menu Items
  const fetchMenu = async () => {
    try {
      const response = await fetch('/api/menu', { cache: 'no-store' });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setMenuItems(data);
        }
      }
    } catch (error) {
      console.error('Error fetching menu:', error);
    }
  };

  // Fetch Live Orders
  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const response = await fetch('/api/orders', { cache: 'no-store' });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setOrders(data);
        }
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchStaff();
    fetchMenu();
    fetchOrders();
    const interval = setInterval(() => {
      fetchStaff();
      fetchMenu();
      fetchOrders();
    }, 4000);
    return () => clearInterval(interval);
  }, [isCashierInitialized]);
// Auto-sync offline orders when internet connection is restored
  useEffect(() => {
    const syncOfflineOrders = async () => {
      if (typeof navigator !== 'undefined' && !navigator.onLine) return;
      const offlineQueue = JSON.parse(localStorage.getItem('offline_orders') || '[]');
      if (offlineQueue.length === 0) return;

      const remainingQueue = [];

      for (const ord of offlineQueue) {
        try {
          const res = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ord),
          });
          if (!res.ok) {
            remainingQueue.push(ord);
          }
        } catch (e) {
          remainingQueue.push(ord);
        }
      }

      localStorage.setItem('offline_orders', JSON.stringify(remainingQueue));
      if (offlineQueue.length > remainingQueue.length) {
        alert('✅ Offline orders successfully synced to the cloud server!');
        fetchOrders();
      }
    };

    window.addEventListener('online', syncOfflineOrders);
    const syncInterval = setInterval(syncOfflineOrders, 15000);

    return () => {
      window.removeEventListener('online', syncOfflineOrders);
      clearInterval(syncInterval);
    };
  }, []);
  // Cart Functions for Current Tab
  const addToCart = (id: string) => {
    const item = menuItems.find((m) => String(m.id) === String(id));
    if (!item?.available) return;
    const updatedCart = { ...currentTab.cart, [id]: (currentTab.cart[id] || 0) + 1 };
    updateCurrentTab({ cart: updatedCart });
  };

  const removeFromCart = (id: string) => {
    const updatedCart = { ...currentTab.cart };
    if (updatedCart[id] > 1) updatedCart[id] -= 1;
    else delete updatedCart[id];
    updateCurrentTab({ cart: updatedCart });
  };

  const cartSubtotal = Object.entries(currentTab.cart).reduce((sum, [id, qty]) => {
    const item = menuItems.find((m) => String(m.id) === String(id));
    return sum + (item ? Number(item.price) * qty : 0);
  }, 0);

  const parsedCash = parseFloat(currentTab.cashTendered) || 0;
  const changeDue = Math.max(0, parsedCash - cartSubtotal);
// Helper to handle offline order submission & auto-sync queue
  const submitOrderWithOfflineSupport = async (orderPayload: any) => {
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

    if (!isOnline) {
      const existingQueue = JSON.parse(localStorage.getItem('offline_orders') || '[]');
      const offlineOrder = {
        ...orderPayload,
        local_id: 'OFFLINE-' + Date.now(),
        created_at: new Date().toISOString()
      };
      localStorage.setItem('offline_orders', JSON.stringify([...existingQueue, offlineOrder]));
      
      alert('⚠️ No internet connection! Order saved locally and will sync automatically when online.');
      return { success: true, offline: true, order: offlineOrder };
    }

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });
      const result = await response.json();
      return result;
    } catch (err) {
      const existingQueue = JSON.parse(localStorage.getItem('offline_orders') || '[]');
      const offlineOrder = {
        ...orderPayload,
        local_id: 'OFFLINE-' + Date.now(),
        created_at: new Date().toISOString()
      };
      localStorage.setItem('offline_orders', JSON.stringify([...existingQueue, offlineOrder]));
      
      alert('⚠️ Network error! Order saved locally to offline queue.');
      return { success: true, offline: true, order: offlineOrder };
    }
  };
  // 1. Send Order to Kitchen as PENDING (with Offline Support)
 const handleSendToKitchen = async () => {
    if (Object.keys(currentTab.cart).length === 0) {
      alert('Cart is empty. Select menu items first.');
      return;
    }

    setIsSubmitting(true);

    const itemDetails = Object.entries(currentTab.cart).map(([id, qty]) => {
      const m = menuItems.find((item) => String(item.id) === String(id));
      return `${qty}x ${m?.name}`;
    }).join(', ');

    const activeCashierName = activeStaff?.name || 'POS Staff';

    const orderPayload = {
      customerName: currentTab.customerName || 'Walk-in Customer',
      phoneNumber: currentTab.phoneNumber || 'N/A',
      items: itemDetails,
      fulfillment: currentTab.fulfillment,
      paymentMethod: currentTab.paymentMethod,
      orderSource: 'POS',
      specialNotes: currentTab.specialNotes ? `[Notes: ${currentTab.specialNotes}] ${currentTab.momoReference ? `MoMo Ref: ${currentTab.momoReference}` : ''}` : (currentTab.momoReference ? `MoMo Ref: ${currentTab.momoReference}` : ''),
      totalAmount: cartSubtotal,
      handledByStaff: activeCashierName,
      status: 'Pending'
    };

    try {
      const result = await submitOrderWithOfflineSupport(orderPayload);

      if (result.success) {
        if (result.offline) {
          alert('Order saved offline! Will sync when internet returns.');
        } else {
          alert(`Order #${result.order?.order_number || ''} sent to Kitchen queue as PENDING! 👨‍🍳`);
        }
        fetchOrders();
      } else {
        alert('Order submission failed: ' + result.error);
      }
    } catch (error) {
      alert('Network error sending order to kitchen.');
    } finally {
      setIsSubmitting(false);
    }
  };
  // 2. Complete Order, Credit Sales & Print Receipt (with Offline Support)
  const handleCompleteAndPrint = async () => {
    if (Object.keys(currentTab.cart).length === 0) {
      alert('Cart is empty. Cannot process empty receipt.');
      return;
    }

    if (currentTab.paymentMethod === 'CASH' && parsedCash < cartSubtotal) {
      if (!confirm(`Cash given (GHS ${parsedCash.toFixed(2)}) is less than total bill (GHS ${cartSubtotal.toFixed(2)}). Continue anyway?`)) {
        return;
      }
    }

    setIsSubmitting(true);

    const activeCashierName = activeStaff?.name || 'POS Cashier';

    const itemDetailsArray = Object.entries(currentTab.cart).map(([id, qty]) => {
      const m = menuItems.find((item) => String(item.id) === String(id));
      return {
        name: m?.name || 'Item',
        qty,
        price: Number(m?.price || 0),
        total: Number(m?.price || 0) * qty,
      };
    });

    const itemDetailsString = itemDetailsArray.map((i) => `${i.qty}x ${i.name}`).join(', ');

    const orderPayload = {
      customerName: currentTab.customerName || 'Walk-in Customer',
      phoneNumber: currentTab.phoneNumber || 'N/A',
      items: itemDetailsString,
      fulfillment: currentTab.fulfillment,
      paymentMethod: currentTab.paymentMethod,
      orderSource: 'POS',
      specialNotes: currentTab.specialNotes ? `[Notes: ${currentTab.specialNotes}] ${currentTab.momoReference ? `MoMo Ref: ${currentTab.momoReference}` : ''}` : (currentTab.momoReference ? `MoMo Ref: ${currentTab.momoReference}` : ''),
      totalAmount: cartSubtotal,
      handledByStaff: activeCashierName,
      status: 'Completed'
    };

    try {
      const result = await submitOrderWithOfflineSupport(orderPayload);

      if (result.success) {
        setPrintableOrder({
          orderNumber: result.order?.order_number || 'POS-ORDER',
          customerName: currentTab.customerName,
          phoneNumber: currentTab.phoneNumber,
          fulfillment: currentTab.fulfillment,
          paymentMethod: currentTab.paymentMethod,
          items: itemDetailsArray,
          totalAmount: cartSubtotal,
          cashTendered: currentTab.paymentMethod === 'CASH' ? parsedCash : null,
          changeDue: currentTab.paymentMethod === 'CASH' ? changeDue : null,
          momoReference: currentTab.paymentMethod === 'MOMO' ? currentTab.momoReference : null,
          specialNotes: currentTab.specialNotes,
          date: new Date().toLocaleString([], { 
            month: 'numeric', 
            day: 'numeric', 
            year: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          cashier: activeCashierName
        });

        updateCurrentTab({
          cart: {},
          customerName: 'Walk-in Customer',
          phoneNumber: '',
          cashTendered: '',
          momoReference: '',
          specialNotes: ''
        });

        fetchOrders();
      } else {
        alert('Order processing failed: ' + result.error);
      }
    } catch (error) {
      alert('Network error completing order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Accept Website Order & Forward to Kitchen as PENDING + Credit Sales
  const handleAcceptWebsiteOrder = async (order: Order) => {
    const activeCashierName = activeStaff?.name || 'POS Cashier';

    try {
      const response = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          status: 'Pending',
          handledByStaff: activeCashierName,
        }),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        alert(`Order #${order.order_number} accepted and forwarded to the kitchen queue! 🚀`);
        fetchOrders();
      } else {
        alert('Could not accept order.');
      }
    } catch (error) {
      console.error('Error accepting website order:', error);
    }
  };

  const categories = ['All', 'Staples', 'Proteins', 'Stews & Soups'];
  const filteredMenuItems = selectedCategory === 'All'
    ? menuItems
    : menuItems.filter((item) => item.category === selectedCategory);

  // Online orders disappear from the banner once accepted and assigned to a staff member
  const pendingOnlineOrders = orders.filter((o) => {
    const source = String(o.order_source || '').toUpperCase() === 'ONLINE';
    const status = String(o.status || '').toUpperCase() === 'PENDING';
    const unhandled = !o.handled_by_staff || o.handled_by_staff === 'System' || o.handled_by_staff.trim() === '';
    return source && status && unhandled;
  });

  const liveKitchenOrders = orders.filter((o) => {
    const st = String(o.status || '').toLowerCase();
    return st !== 'completed' && st !== 'cancelled';
  });

  const cashierCompletedOrders = activeStaff
    ? orders.filter((order) =>
        String(order.status).toLowerCase() === 'completed' &&
        (order.cashier_name === activeStaff.name ||
          order.handled_by_staff === activeStaff.name ||
          (order.staff_id !== undefined && String(order.staff_id) === String(activeStaff.id)))
      )
    : [];
  const cashierSalesTotal = cashierCompletedOrders.reduce(
    (total, order) => total + Number(order.total_amount || 0),
    0
  );
  const cashierCashSales = cashierCompletedOrders
    .filter((order) => String(order.payment_method || '').toUpperCase() === 'CASH')
    .reduce((total, order) => total + Number(order.total_amount || 0), 0);
  const cashierMomoSales = cashierCompletedOrders
    .filter((order) => ['MOMO', 'MOBILE MONEY'].includes(String(order.payment_method || '').toUpperCase()))
    .reduce((total, order) => total + Number(order.total_amount || 0), 0);
  const cashierItemsSold = cashierCompletedOrders.reduce((total, order) => {
    const quantities = order.items.matchAll(/\b(\d+)\s*x\b/gi);
    return total + Array.from(quantities).reduce((itemTotal, match) => itemTotal + Number(match[1]), 0);
  }, 0);

  return (
    <div style={{ backgroundColor: '#f1f5f9', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* VIBRANT TOP HEADER & MULTI-STAFF SWITCHER */}
      <header style={{ backgroundColor: '#6b213a', color: '#ffffff', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', boxShadow: '0 4px 16px rgba(107, 33, 58, 0.3)' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ backgroundColor: '#ea580c', padding: '10px 14px', borderRadius: '12px', fontSize: '22px', fontWeight: 'bold' }}>
            🍲
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '900', letterSpacing: '-0.3px' }}>
              Sarah's POS Terminal
            </h1>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#fbcfe8', fontWeight: '600' }}>
              Multi-Staff Terminal
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          
          <div style={{ backgroundColor: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', padding: '6px 12px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: '#fbcfe8', fontWeight: '700' }}>Serving Cashier:</span>
            <select
              value={isSessionSuspended ? '' : activeStaff?.name || ''}
              onChange={(e) => {
                const selected = staffList.find((s) => s.name === e.target.value);
                if (selected) {
                  setResumePinInput('');
                  setResumePinError('');

                  if (suspendedStaffNames.includes(selected.name)) {
                    setStaffPendingUnlock(selected);
                    setIsSessionSuspended(true);
                    setShowResumePinModal(true);
                  } else {
                    setActiveStaff(selected);
                    setIsSessionSuspended(false);
                    setShowResumePinModal(false);
                    setStaffPendingUnlock(null);
                  }
                }
              }}
              style={{ backgroundColor: '#ffffff', color: '#6b213a', border: 'none', padding: '6px 10px', borderRadius: '6px', fontWeight: '800', fontSize: '13px', cursor: 'pointer' }}
            >
              {(isSessionSuspended || !activeStaff) && (
                <option value="" disabled>
                  {isSessionSuspended ? 'Select cashier to resume' : 'Select cashier'}
                </option>
              )}
              {staffList.map((s) => (
                <option key={s.id} value={s.name}>
                  👤 {s.name} {s.department ? `(${s.department})` : ''}
                </option>
              ))}
            </select>
          </div>

          <button 
            onClick={() => setShowSummaryModal(true)}
            style={{ backgroundColor: '#ea580c', color: '#ffffff', border: 'none', padding: '10px 16px', borderRadius: '10px', fontWeight: '800', fontSize: '13px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(234, 88, 12, 0.4)' }}
          >
            📊 End of Day Summary
          </button>

          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              if (activeStaff) {
                setSuspendedStaffNames((currentNames) =>
                  currentNames.includes(activeStaff.name)
                    ? currentNames
                    : [...currentNames, activeStaff.name]
                );
              }
              setIsSessionSuspended(true);
              setResumePinInput('');
              setResumePinError('');
              setStaffPendingUnlock(null);
              setShowResumePinModal(false);
            }}
            style={{ 
              backgroundColor: '#991b1b', 
              color: '#ffffff', 
              border: 'none', 
              padding: '10px 16px', 
              borderRadius: '10px', 
              fontWeight: '800', 
              fontSize: '13px', 
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(153, 27, 27, 0.4)',
              zIndex: 100
            }}
          >
            🔒 Logout / Switch Staff
          </button>

          <button 
            onClick={() => router.push('/admin')}
            style={{ backgroundColor: 'rgba(255,255,255,0.18)', color: '#ffffff', border: 'none', padding: '10px 14px', borderRadius: '10px', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}
          >
            👑 Admin Panel
          </button>
        </div>
      </header>

      {/* PROMINENT BOLD WHITE BACKGROUND NOTIFICATION BAR FOR ONLINE ORDERS */}
      {pendingOnlineOrders.length > 0 && (
        <div style={{ backgroundColor: '#ffffff', borderBottom: '3px solid #ef4444', padding: '14px 24px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '20px' }}>🔔</span>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '900', letterSpacing: '0.3px', color: '#7f1d1d' }}>
                  INCOMING WEBSITE ORDERS ({pendingOnlineOrders.length} PENDING PAYMENT & CONFIRMATION):
                </h3>
              </div>
              <span style={{ fontSize: '11px', backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', padding: '4px 10px', borderRadius: '6px', fontWeight: '800' }}>
                Confirm payment with customer before forwarding to kitchen
              </span>
            </div>

            {/* Scrollable list of pending online orders */}
            <div style={{ display: 'flex', gap: '14px', overflowX: 'auto', paddingBottom: '4px' }}>
              {pendingOnlineOrders.map((order) => {
                const customerPhone = order.phoneNumber || order.phone || order.phonenumber || 'N/A';
                return (
                  <div 
                    key={order.id} 
                    style={{ 
                      backgroundColor: '#f8fafc', 
                      color: '#0f172a', 
                      borderRadius: '12px', 
                      padding: '14px 16px', 
                      minWidth: '310px', 
                      maxWidth: '360px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                      border: '2px solid #cbd5e1',
                      flexShrink: 0
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <strong style={{ fontSize: '14px', color: '#6b213a', fontWeight: '900' }}>
                        Order #{order.order_number}
                      </strong>
                      <span style={{ fontSize: '11px', backgroundColor: '#e2e8f0', color: '#334155', padding: '2px 6px', borderRadius: '4px', fontWeight: '900' }}>
                        {order.fulfillment}
                      </span>
                    </div>

                    <div style={{ fontSize: '13px', fontWeight: '800', marginBottom: '4px' }}>
                      👤 {order.customer_name} ({customerPhone})
                    </div>

                    <div style={{ fontSize: '12px', color: '#475569', marginBottom: '8px', backgroundColor: '#ffffff', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                      <strong>Items:</strong> {order.items}
                      {order.special_notes && <div style={{ color: '#ea580c', marginTop: '3px' }}><strong>Note:</strong> {order.special_notes}</div>}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '900', color: '#16a34a' }}>
                        GHS {Number(order.total_amount).toFixed(2)}
                      </span>
                      <button
                        onClick={() => handleAcceptWebsiteOrder(order)}
                        style={{
                          backgroundColor: '#16a34a',
                          color: '#ffffff',
                          border: 'none',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: '900',
                          cursor: 'pointer',
                          boxShadow: '0 2px 6px rgba(22, 163, 74, 0.3)'
                        }}
                      >
                        Accept & Send to Kitchen 🚀
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      )}

      {/* STAFF-SPECIFIC TABS & KITCHEN MONITOR BAR */}
      <div style={{ backgroundColor: '#ffffff', borderBottom: '2px solid #e2e8f0', padding: '10px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', overflowX: 'auto', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', fontWeight: '800', color: '#64748b', marginRight: '4px' }}>
            {activeStaff?.name.split(' ')[0]}'s Tabs:
          </span>
          {currentStaffTabs.map((tab) => {
            const itemCount = Object.values(tab.cart).reduce((a, b) => a + b, 0);
            const isSelected = tab.tabId === currentActiveTabId;
            return (
              <button
                key={tab.tabId}
                onClick={() => updateCurrentStaffTabs(currentStaffTabs, tab.tabId)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '10px',
                  border: isSelected ? '2px solid #6b213a' : '1px solid #cbd5e1',
                  backgroundColor: isSelected ? '#fdf2f8' : '#ffffff',
                  color: isSelected ? '#6b213a' : '#334155',
                  fontWeight: '900',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: isSelected ? '0 2px 6px rgba(107, 33, 58, 0.15)' : 'none'
                }}
              >
                <span>{tab.name}</span>
                {itemCount > 0 && (
                  <span style={{ backgroundColor: '#ea580c', color: '#ffffff', fontSize: '10px', padding: '1px 5px', borderRadius: '6px' }}>
                    {itemCount}
                  </span>
                )}
                {currentStaffTabs.length > 1 && (
                  <span 
                    onClick={(e) => handleCloseTab(tab.tabId, e)}
                    style={{ fontSize: '10px', color: '#94a3b8', marginLeft: '4px', fontWeight: 'bold' }}
                    title="Close Tab"
                  >
                    ✕
                  </span>
                )}
              </button>
            );
          })}

          <button
            onClick={handleAddNewTab}
            style={{
              padding: '7px 12px',
              borderRadius: '10px',
              border: '1px dashed #ea580c',
              backgroundColor: '#fff7ed',
              color: '#ea580c',
              fontWeight: '900',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            + Add Customer ➕
          </button>
        </div>

      </div>

      {/* LIVE KITCHEN STATUS MONITOR ON POS */}
      <div style={{ backgroundColor: '#1e293b', color: '#ffffff', padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '14px', overflowX: 'auto', borderBottom: '1px solid #334155' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          <span style={{ fontSize: '16px' }}>🍳</span>
          <span style={{ fontSize: '12px', fontWeight: '900', letterSpacing: '0.5px', color: '#cbd5e1' }}>LIVE KITCHEN MONITOR:</span>
        </div>

        {liveKitchenOrders.length === 0 ? (
          <span style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>No active kitchen orders right now.</span>
        ) : (
          <div style={{ display: 'flex', gap: '10px', overflowX: 'auto' }}>
            {liveKitchenOrders.map((ord) => {
              const st = String(ord.status || 'Pending').toUpperCase();
              let badgeColor = '#3b82f6';
              if (st === 'PENDING') badgeColor = '#eab308';
              if (st === 'PREPARING') badgeColor = '#f97316';
              if (st === 'READY') badgeColor = '#16a34a';

              return (
                <div key={ord.id} style={{ backgroundColor: '#334155', padding: '6px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0, border: '1px solid #475569' }}>
                  <span style={{ fontSize: '12px', fontWeight: '900', color: '#f8fafc' }}>#{ord.order_number} ({ord.customer_name})</span>
                  <span style={{ fontSize: '10px', fontWeight: '900', backgroundColor: badgeColor, color: '#ffffff', padding: '2px 8px', borderRadius: '6px' }}>
                    {ord.status}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MAIN CONTENT AREA */}
      <div style={{ padding: '20px', position: 'relative' }}>
        
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          
          {/* Left Column: Colorful Menu Catalog */}
          <div style={{ flex: '2', minWidth: '340px' }}>
            
            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '10px 22px',
                    borderRadius: '25px',
                    border: 'none',
                    backgroundColor: selectedCategory === cat ? '#6b213a' : '#ffffff',
                    color: selectedCategory === cat ? '#ffffff' : '#334155',
                    fontWeight: '800',
                    fontSize: '13px',
                    cursor: 'pointer',
                    boxShadow: selectedCategory === cat ? '0 4px 12px rgba(107, 33, 58, 0.35)' : '0 2px 6px rgba(0,0,0,0.06)',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(195px, 1fr))', gap: '16px' }}>
              {filteredMenuItems.map((item) => {
                const theme = getCategoryTheme(item.category);
                return (
                  <div
                    key={item.id}
                    onClick={() => item.available && addToCart(String(item.id))}
                    style={{
                      backgroundColor: item.available ? theme.bg : '#f1f5f9',
                      border: `2px solid ${item.available ? theme.border : '#cbd5e1'}`,
                      borderRadius: '16px',
                      padding: '16px',
                      cursor: item.available ? 'pointer' : 'not-allowed',
                      opacity: item.available ? 1 : 0.6,
                      boxShadow: '0 4px 10px rgba(0,0,0,0.04)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'transform 0.15s ease, boxShadow 0.15s ease',
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '10px', fontWeight: '900', backgroundColor: theme.badgeBg, color: theme.badgeText, padding: '3px 8px', borderRadius: '6px', textTransform: 'uppercase' }}>
                        {item.category}
                      </span>
                      <h4 style={{ margin: '10px 0 4px', fontSize: '16px', color: '#0f172a', fontWeight: '900' }}>
                        {item.name}
                      </h4>
                    </div>

                    <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '900', color: theme.priceColor, fontSize: '16px' }}>
                        GHS {Number(item.price).toFixed(2)}
                      </span>
                      <span style={{ fontSize: '12px', fontWeight: '900', color: item.available ? '#16a34a' : '#dc2626', backgroundColor: '#ffffff', padding: '4px 10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                        {item.available ? '+ Add' : 'Sold Out'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Receipt Checkout Panel for Active Tab */}
          <div style={{ flex: '1', minWidth: '340px', backgroundColor: '#ffffff', borderRadius: '20px', padding: '24px', border: '2px solid #e2e8f0', boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}>
            
            <div style={{ borderBottom: '2px solid #f1f5f9', paddingBottom: '12px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#6b213a', fontWeight: '900' }}>
                {currentTab.name} Receipt 📝
              </h3>
            </div>

            {/* Customer Details Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#6b213a', marginBottom: '3px' }}>Customer Name</label>
                <input
                  type="text"
                  value={currentTab.customerName}
                  onChange={(e) => updateCurrentTab({ customerName: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: '700', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#6b213a', marginBottom: '3px' }}>Phone Number</label>
                <input
                  type="tel"
                  placeholder="024XXXXXXX"
                  value={currentTab.phoneNumber}
                  onChange={(e) => updateCurrentTab({ phoneNumber: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: '700', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#6b213a', marginBottom: '3px' }}>Fulfillment</label>
                  <select
                    value={currentTab.fulfillment}
                    onChange={(e: any) => updateCurrentTab({ fulfillment: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: '800', backgroundColor: '#fff' }}
                  >
                    <option value="DINE-IN">Dine-In</option>
                    <option value="TAKEAWAY">Takeaway</option>
                  </select>
                </div>

                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#6b213a', marginBottom: '3px' }}>Payment</label>
                  <select
                    value={currentTab.paymentMethod}
                    onChange={(e: any) => updateCurrentTab({ paymentMethod: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: '800', backgroundColor: '#fff' }}
                  >
                    <option value="CASH">Cash</option>
                    <option value="MOMO">Mobile Money</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Cart Items List */}
            <div style={{ minHeight: '160px', maxHeight: '240px', overflowY: 'auto', borderBottom: '2px solid #f1f5f9', paddingBottom: '12px', marginBottom: '16px' }}>
              {Object.keys(currentTab.cart).length === 0 ? (
                <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px 0', fontSize: '13px', fontStyle: 'italic' }}>
                  Cart is empty. Tap items from the menu.
                </div>
              ) : (
                Object.entries(currentTab.cart).map(([id, qty]) => {
                  const item = menuItems.find((m) => String(m.id) === String(id));
                  if (!item) return null;
                  const lineTotal = Number(item.price) * qty;
                  return (
                    <div key={id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', fontSize: '13px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '900', color: '#0f172a' }}>{item.name}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>GHS {Number(item.price).toFixed(2)} each</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          onClick={() => removeFromCart(id)}
                          style={{ width: '24px', height: '24px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                          -
                        </button>
                        <span style={{ fontWeight: '900', width: '20px', textAlign: 'center' }}>{qty}</span>
                        <button
                          onClick={() => addToCart(id)}
                          style={{ width: '24px', height: '24px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                          +
                        </button>
                        <span style={{ fontWeight: '900', color: '#ea580c', width: '65px', textAlign: 'right' }}>
                          GHS {lineTotal.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Payment Details Input */}
            {currentTab.paymentMethod === 'CASH' ? (
              <div style={{ marginBottom: '16px', display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#6b213a', marginBottom: '3px' }}>Cash Tendered (GHS)</label>
                  <input
                    type="number"
                    step="0.50"
                    placeholder="0.00"
                    value={currentTab.cashTendered}
                    onChange={(e) => updateCurrentTab({ cashTendered: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: '700', boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#6b213a', marginBottom: '3px' }}>Change Due</label>
                  <div style={{ padding: '8px 10px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: '900', color: '#ea580c' }}>
                    GHS {changeDue.toFixed(2)}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#6b213a', marginBottom: '3px' }}>MoMo Reference / Transaction ID</label>
                <input
                  type="text"
                  placeholder="Enter MoMo transaction ref"
                  value={currentTab.momoReference}
                  onChange={(e) => updateCurrentTab({ momoReference: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: '700', boxSizing: 'border-box' }}
                />
              </div>
            )}

            {/* Special Notes */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#6b213a', marginBottom: '3px' }}>Special Instructions / Notes</label>
              <input
                type="text"
                placeholder="e.g. Less pepper, extra shito"
                value={currentTab.specialNotes}
                onChange={(e) => updateCurrentTab({ specialNotes: e.target.value })}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: '700', boxSizing: 'border-box' }}
              />
            </div>

            {/* Total Calculation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', fontSize: '18px', fontWeight: '900', color: '#6b213a' }}>
              <span>Total Bill:</span>
              <span style={{ color: '#ea580c' }}>GHS {cartSubtotal.toFixed(2)}</span>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={handleSendToKitchen}
                disabled={isSubmitting || Object.keys(currentTab.cart).length === 0}
                style={{ width: '100%', padding: '12px', backgroundColor: '#6b213a', color: '#ffffff', border: 'none', borderRadius: '10px', fontWeight: '900', fontSize: '14px', cursor: 'pointer', opacity: Object.keys(currentTab.cart).length === 0 ? 0.6 : 1 }}
              >
                🍳 Send to Kitchen (Pending)
              </button>

              <button
                onClick={handleCompleteAndPrint}
                disabled={isSubmitting || Object.keys(currentTab.cart).length === 0}
                style={{ width: '100%', padding: '12px', backgroundColor: '#ea580c', color: '#ffffff', border: 'none', borderRadius: '10px', fontWeight: '900', fontSize: '14px', cursor: 'pointer', opacity: Object.keys(currentTab.cart).length === 0 ? 0.6 : 1 }}
              >
                🖨️ Complete Sale & Print Receipt
              </button>
            </div>

          </div>

          {isSessionSuspended && (
            <div
              role="status"
              style={{ position: 'absolute', inset: 0, zIndex: 10, backgroundColor: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(2px)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
                {suspendedStaffNames.map((staffName) => {
                  const staff = staffList.find((staffMember) => staffMember.name === staffName);
                  return (
                    <div key={staffName} style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '18px 24px', textAlign: 'center', boxShadow: '0 8px 24px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                      <strong style={{ display: 'block', color: '#6b213a', marginBottom: '6px' }}>
                        POS session suspended{staffName ? `: ${staffName}` : ''}
                      </strong>
                      <button
                        type="button"
                        disabled={!staff}
                        onClick={() => {
                          if (!staff) return;
                          setStaffPendingUnlock(staff);
                          setActiveStaff(staff);
                          setResumePinInput('');
                          setResumePinError('');
                          setShowResumePinModal(true);
                        }}
                        style={{ backgroundColor: '#ea580c', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '8px 12px', fontWeight: '800', cursor: staff ? 'pointer' : 'not-allowed', opacity: staff ? 1 : 0.6 }}
                      >
                        🔓 Login / Enter PIN
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

      </div>

      {showResumePinModal && staffPendingUnlock && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10000, backgroundColor: 'rgba(15, 23, 42, 0.65)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
          <form onSubmit={handleResumeStaff} style={{ backgroundColor: '#ffffff', borderRadius: '16px', maxWidth: '380px', width: '100%', padding: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
            <h2 style={{ margin: '0 0 8px', color: '#6b213a', fontSize: '20px', fontWeight: '900' }}>
              Resume POS Session
            </h2>
            <p style={{ margin: '0 0 18px', color: '#64748b', fontSize: '13px' }}>
              Enter the PIN or password for {staffPendingUnlock.name}.
            </p>
            <input
              type="password"
              autoComplete="current-password"
              autoFocus
              required
              value={resumePinInput}
              onChange={(e) => {
                setResumePinInput(e.target.value);
                setResumePinError('');
              }}
              placeholder="PIN or password"
              aria-label="PIN or password"
              style={{ width: '100%', boxSizing: 'border-box', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '15px', marginBottom: '10px' }}
            />
            {resumePinError && (
              <p role="alert" style={{ margin: '0 0 12px', color: '#dc2626', fontSize: '13px', fontWeight: '700' }}>
                {resumePinError}
              </p>
            )}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  setShowResumePinModal(false);
                  setStaffPendingUnlock(null);
                  setResumePinInput('');
                  setResumePinError('');
                }}
                style={{ flex: 1, padding: '11px', backgroundColor: '#e2e8f0', color: '#334155', border: 'none', borderRadius: '8px', fontWeight: '800', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{ flex: 1, padding: '11px', backgroundColor: '#6b213a', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: '800', cursor: 'pointer' }}
              >
                Resume Session
              </button>
            </div>
          </form>
        </div>
      )}

      {/* RECEIPT PRINT MODAL */}
      {printableOrder && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, padding: '20px' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', maxWidth: '380px', width: '100%', padding: '24px', fontFamily: 'monospace', color: '#0f172a', border: '3px solid #6b213a' }}>
            
            <div style={{ textAlign: 'center', borderBottom: '2px dashed #6b213a', paddingBottom: '12px', marginBottom: '12px' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#6b213a' }}>SARAH'S TASTY FOODS</h2>
              <div style={{ fontSize: '11px', color: '#ea580c', fontWeight: 'bold' }}>Traditional Ghanaian Delicacies</div>
              <div style={{ fontSize: '12px', fontWeight: 'bold', marginTop: '6px', color: '#6b213a' }}>RECEIPT / INVOICE</div>
            </div>

            <div style={{ fontSize: '12px', marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <div><strong>Order #:</strong> {printableOrder.orderNumber}</div>
              <div><strong>Date/Time:</strong> {printableOrder.date}</div>
              <div><strong>Customer:</strong> {printableOrder.customerName} ({printableOrder.phoneNumber})</div>
              <div><strong>Fulfillment:</strong> {printableOrder.fulfillment}</div>
              <div><strong>Payment:</strong> {printableOrder.paymentMethod}</div>
              <div><strong>Cashier:</strong> {printableOrder.cashier}</div>
            </div>

            <div style={{ borderTop: '1px dashed #6b213a', borderBottom: '1px dashed #6b213a', padding: '8px 0', marginBottom: '12px', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '6px', color: '#6b213a' }}>
                <span style={{ flex: 2 }}>Item</span>
                <span style={{ flex: 1, textAlign: 'center' }}>Qty</span>
                <span style={{ flex: 1, textAlign: 'right' }}>Price</span>
              </div>
              {printableOrder.items.map((it: any, idx: number) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ flex: 2 }}>{it.name}</span>
                  <span style={{ flex: 1, textAlign: 'center' }}>{it.qty}</span>
                  <span style={{ flex: 1, textAlign: 'right' }}>{it.total.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '16px', borderBottom: '2px dashed #6b213a', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '900', fontSize: '15px', color: '#ea580c' }}>
                <span>TOTAL:</span>
                <span>GHS {printableOrder.totalAmount.toFixed(2)}</span>
              </div>
              {printableOrder.cashTendered !== null && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Cash Tendered:</span>
                    <span>GHS {printableOrder.cashTendered.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Change Due:</span>
                    <span>GHS {printableOrder.changeDue.toFixed(2)}</span>
                  </div>
                </>
              )}
              {printableOrder.momoReference && (
                <div style={{ fontSize: '11px' }}>
                  <span>MoMo Ref: {printableOrder.momoReference}</span>
                </div>
              )}
              {printableOrder.specialNotes && (
                <div style={{ fontSize: '11px', fontStyle: 'italic', color: '#ea580c' }}>
                  Note: {printableOrder.specialNotes}
                </div>
              )}
            </div>

            <div style={{ textAlign: 'center', fontSize: '11px', color: '#6b213a', fontWeight: 'bold', marginBottom: '16px' }}>
              Thank you for dining with Sarah's Tasty Foods!<br/>Please come again.
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => window.print()}
                style={{ flex: 1, padding: '10px', backgroundColor: '#ea580c', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Print 🖨️
              </button>
              <button
                onClick={() => setPrintableOrder(null)}
                style={{ flex: 1, padding: '10px', backgroundColor: '#6b213a', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Close ✕
              </button>
            </div>

          </div>
        </div>
      )}

      {/* END OF DAY SUMMARY MODAL */}
      {showSummaryModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, padding: '20px' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', maxWidth: '450px', width: '100%', padding: '24px' }}>
            <h2 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: '900', color: '#6b213a' }}>
              📊 End of Day Summary Report
            </h2>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
              Shift Summary for: {activeStaff?.name || 'No cashier selected'}
            </p>
            <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #cbd5e1', marginBottom: '20px', fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div><strong>Completed Orders:</strong> {cashierCompletedOrders.length}</div>
              <div><strong>Total Sales:</strong> GHS {cashierSalesTotal.toFixed(2)}</div>
              <div><strong>Cash Sales:</strong> GHS {cashierCashSales.toFixed(2)}</div>
              <div><strong>MoMo Sales:</strong> GHS {cashierMomoSales.toFixed(2)}</div>
              <div><strong>Total Items Sold:</strong> {cashierItemsSold}</div>
            </div>
            <button
              onClick={() => setShowSummaryModal(false)}
              style={{ width: '100%', padding: '12px', backgroundColor: '#6b213a', color: '#ffffff', border: 'none', borderRadius: '10px', fontWeight: '900', cursor: 'pointer' }}
            >
              Close Summary
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default function ProtectedPOSPage() {
  const [isLocked, setIsLocked] = useState(false);
  const [loggedInStaff, setLoggedInStaff] = useState<StaffUser | null>(null);

  const handleLockStation = () => {
    localStorage.removeItem('pos_current_staff');
    setIsLocked(true);
  };

  if (isLocked) {
    return (
      <StaffLoginGate
        title="POS Front-of-House"
        allowedDepartments={['POS / Front-of-House', 'POS', 'Front-of-House']}
        onAuthorized={(staff) => {
          setLoggedInStaff(staff);
          setIsLocked(false);
        }}
      >
        <POSPage initialStaff={loggedInStaff} onLock={handleLockStation} />
      </StaffLoginGate>
    );
  }

  return (
    <StaffLoginGate
      title="POS Front-of-House"
      allowedDepartments={['POS / Front-of-House', 'POS', 'Front-of-House']}
      onAuthorized={(staff) => setLoggedInStaff(staff)}
    >
      <POSPage initialStaff={loggedInStaff} onLock={handleLockStation} />
    </StaffLoginGate>
  );
}