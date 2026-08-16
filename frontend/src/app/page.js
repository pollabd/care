'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = window.localStorage.getItem('token');
    const user = window.localStorage.getItem('user');
    let role = 'user';
    if (user) {
      try {
        role = JSON.parse(user).role;
      } catch (err) {
        role = 'user';
      }
    }
    router.replace(token ? (role === 'admin' ? '/admin' : '/dashboard') : '/login');
  }, [router]);

  return null;
}
