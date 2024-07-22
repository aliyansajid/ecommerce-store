"use client";

import React from 'react';
import { useSession, signOut } from 'next-auth/react';

const DashboardPage = () => {
    const { data: session, status } = useSession();

    if (status === "loading") {
        return <div>Loading...</div>;
    }

    if (status === "unauthenticated") {
        return <div>You are not authenticated</div>;
    }

    return (
        <div>
            <h1>Dashboard</h1>
            <p>Welcome, {session?.user?.name}</p>
            <button onClick={() => signOut({ callbackUrl: '/' })}>Sign Out</button>
        </div>
    );
};

export default DashboardPage;