'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoadingState from '@/components/ui/LoadingState';
import UserSidebar from '@/features/dashboard/components/UserSidebar';
import { useAuth } from '@/features/auth/components/AuthProvider';

export default function DashboardLayout({ children }: { children: React.ReactNode }) { const router = useRouter(); const { user, loading } = useAuth(); useEffect(() => { if (!loading && !user) router.replace('/login'); }, [loading, user, router]); if (loading || !user) return <LoadingState label="Checking your session…"/>; return <div className="min-h-screen md:flex"><UserSidebar/><main className="min-w-0 flex-1">{children}</main></div>; }
