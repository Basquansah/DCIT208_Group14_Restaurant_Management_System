'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import StaffLoginGate from '../../../src/components/StaffLoginGate';

const DEFAULT_ADMIN_LOGIN_BACKGROUND = '/images/Jollof.jpg';

export default function AdminLogin() {
  const [loginBackground, setLoginBackground] = useState(DEFAULT_ADMIN_LOGIN_BACKGROUND);
  const router = useRouter();

  useEffect(() => {
    setLoginBackground(localStorage.getItem('admin_login_bg') || DEFAULT_ADMIN_LOGIN_BACKGROUND);
  }, []);

  return (
    <StaffLoginGate
      title="Admin"
      allowedDepartments={[]}
      allowedRoles={['admin', 'owner', 'manager', 'superadmin']}
      storageKey="admin_staff_login"
      backgroundImage={loginBackground}
      onAuthorized={() => {
        router.replace('/admin');
        router.refresh();
      }}
    >
      <></>
    </StaffLoginGate>
  );
}
