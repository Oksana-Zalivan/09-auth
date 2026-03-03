'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { checkSession, getMe, logout } from '@/lib/api/clientApi';
import { useAuthStore } from '@/lib/store/authStore';

const PRIVATE_ROUTES = ['/profile', '/notes'];

function isPrivatePath(pathname: string) {
  return PRIVATE_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/'));
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  const setUser = useAuthStore(s => s.setUser);
  const clearIsAuthenticated = useAuthStore(s => s.clearIsAuthenticated);

  useEffect(() => {
    let isMounted = true;

    async function run() {
      const needGuard = isPrivatePath(pathname);
      if (!needGuard) return;

      setLoading(true);

      try {
        const ok = await checkSession();
        if (!ok) throw new Error('No session');

        const user = await getMe();
        setUser(user);
      } catch {
        clearIsAuthenticated();
        try {
          await logout();
        } catch {}
        router.replace('/sign-in');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    run();
    return () => {
      isMounted = false;
    };
  }, [pathname, router, setUser, clearIsAuthenticated]);

  if (loading && isPrivatePath(pathname)) {
    return <p>Loading...</p>;
  }

  return <>{children}</>;
}
