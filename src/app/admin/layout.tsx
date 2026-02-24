'use client';

import { usePathname } from 'next/navigation';
import { AuthProvider } from '@/context/AuthContext';
import AdminGuard from '@/components/admin/AdminGuard';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLoginPage = pathname === '/admin/login';

    // Login page doesn't need the guard or sidebar
    if (isLoginPage) {
        return (
            <AuthProvider>
                {children}
            </AuthProvider>
        );
    }

    return (
        <AuthProvider>
            <AdminGuard>
                <div className="min-h-screen bg-gray-50 flex">
                    <AdminSidebar />
                    <div className="flex-1 min-w-0">
                        {children}
                    </div>
                </div>
            </AdminGuard>
        </AuthProvider>
    );
}
