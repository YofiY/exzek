'use client';
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

export type User = {
  id?: string; // TODO: unused
  email?: string; // TODO: unused
  walletAddress?: string;
  // certificate that user owns an agent
  agentCertificate?: {
    agentAddress: string;
    signature: string;
  };
} | null;

export type UserContextType = {
  user: User;
  setUser: (user: User) => void;
  setWalletAddress: (address: string) => void;
  setAgentCertificate: (agentAddress: string, signature: string) => void;
};

export const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  setWalletAddress: () => {},
  setAgentCertificate: () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const router = useRouter();

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

  const setAgentCertificate = (agentAddress: string, signature: string) => {
    setUser(prev => ({
      ...(prev ?? {}),
      agentCertificate: {
        agentAddress,
        signature,
      },
    }));

    console.log('setAgentCertificate', user);
  };

  return (
    <UserContext.Provider value={{ user, setUser, setWalletAddress, setAgentCertificate }}>
      {children}
    </UserContext.Provider>
  );
}
