'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoadingState from '@/components/ui/LoadingState';
import AdminSidebar from '@/features/admin/components/AdminSidebar';
import { useAuth } from '@/features/auth/components/AuthProvider';

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) { const router = useRouter(); const { user, loading } = useAuth(); useEffect(() => { if (!loading && !user) router.replace('/admin'); }, [loading, user, router]); if (loading || !user) return <LoadingState label="Checking admin session…"/>; return <div className="min-h-screen md:flex"><AdminSidebar/><main className="min-w-0 flex-1">{children}</main></div>; }
