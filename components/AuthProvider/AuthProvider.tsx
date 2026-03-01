'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { checkSession, logout } from '@/lib/api/clientApi';
import { useAuthStore } from '@/lib/store/authStore';

type Props = { children: React.ReactNode };

function isPrivatePath(pathname: string) {
  return pathname.startsWith('/profile') || pathname.startsWith('/notes');
}

export default function AuthProvider({ children }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  const { setUser, clearAuth } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      if (!isPrivatePath(pathname)) {
        setLoading(false);
        return;
      }

      try {
        let user = null;

        try {
          user = await checkSession();
        } catch {
          user = null;
        }

        if (!user) {
          await logout().catch(() => {});
          clearAuth();
          router.replace('/sign-in');
          return;
        }

        setUser(user);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [pathname, setUser, clearAuth, router]);

  if (loading && isPrivatePath(pathname)) {
    return <div style={{ padding: 24 }}>Loading...</div>;
  }

  return <>{children}</>;
}
