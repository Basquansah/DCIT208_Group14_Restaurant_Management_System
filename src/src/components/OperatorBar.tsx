'use client';
import { useState, useEffect } from 'react';

// List of your restaurant staff/operators
const STAFF_MEMBERS = ['Kofi Mensah', 'Ama Serwaa', 'Yaw Boateng', 'Esi Arthur', 'Manager'];

export default function OperatorBar({ onOperatorChange }: { onOperatorChange: (name: string) => void }) {
  const [selectedStaff, setSelectedStaff] = useState('');

  useEffect(() => {
    // Load previously saved operator from session/local storage
    const saved = localStorage.getItem('pos_operator');
    if (saved) {
      setSelectedStaff(saved);
      onOperatorChange(saved);
    }
  }, [onOperatorChange]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const name = e.target.value;
    setSelectedStaff(name);
    localStorage.setItem('pos_operator', name);
    onOperatorChange(name);
  };

  return (
    <div style={{ background: '#1e293b', color: '#fff', padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '8px', marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '14px', color: '#94a3b8' }}>Active POS Operator:</span>
        <select
          value={selectedStaff}
          onChange={handleChange}
          style={{ padding: '6px 12px', borderRadius: '4px', background: '#334155', color: '#fff', border: '1px solid #475569', fontWeight: 'bold', cursor: 'pointer' }}
        >
          <option value="" disabled>-- Select Staff Member --</option>
          {STAFF_MEMBERS.map((staff) => (
            <option key={staff} value={staff}>{staff}</option>
          ))}
        </select>
      </div>
      <div>
        {selectedStaff ? (
          <span style={{ fontSize: '13px', background: '#16a34a', padding: '4px 10px', borderRadius: '12px' }}>
            Active Session: {selectedStaff}
          </span>
        ) : (
          <span style={{ fontSize: '13px', background: '#dc2626', padding: '4px 10px', borderRadius: '12px' }}>
            ⚠️ Select Operator to Take Orders
          </span>
        )}
      </div>
    </div>
  );
}