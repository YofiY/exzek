'use client';
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

export type User = {
  id?: string;
  email?: string;
  // …any other user fields
  walletAddress?: string;
} | null;

export type UserContextType = {
  user: User;
  setUser: (user: User) => void;
  setWalletAddress: (address: string) => void;
};

export const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  setWalletAddress: () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const router = useRouter();

  // // on mount, fetch current user (without wallet)
  // useEffect(() => {
  //   async function fetchMe() {
  //     try {
  //       const res = await fetch('/api/auth/me');
  //       if (res.ok) {
  //         const data = await res.json();
  //         setUser(data.user);
  //       } else {
  //         setUser(null);
  //       }
  //     } catch {
  //       setUser(null);
  //     }
  //   }
  //   fetchMe();
  // }, []);

  // if not logged in, redirect to /login
  // useEffect(() => {
  //   if (user === null) {
  //     console.log('redirecting to login', user);
  //     router.replace('/login');
  //   }
  // }, [user, router]);

  // helper to merge walletAddress into user object
  const setWalletAddress = (address: string) => {
    setUser(prev => ({
      ...(prev ?? {}),
      walletAddress: address,
    }));

    console.log('setWalletAddress', user);
  };

  return (
    <UserContext.Provider value={{ user, setUser, setWalletAddress }}>
      {children}
    </UserContext.Provider>
  );
}
