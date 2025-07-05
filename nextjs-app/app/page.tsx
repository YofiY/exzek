'use client';

import React, { useContext } from 'react';
import { UserContext } from './UserContext';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const { user } = useContext(UserContext);

  // While we fetch the user, you might show a loader
  if (user === undefined) return <p>Loading...</p>;

  // If user is null, go to login page
  if (!user) {
    router.replace('/login');
    return null;
  }

  return <>Hello, {user.email}!</>;
}
