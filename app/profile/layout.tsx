'use client';

import { AuthGuard } from '@/features/auth/components/auth-guard';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { SidebarNav } from '@/components/dashboard/sidebar-nav';

export default function ProfileLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthGuard>
            <div className="flex flex-col min-h-screen bg-[#FBFBFB]">
                <SiteHeader />

                <div className="flex-1 w-full max-w-[1440px] mx-auto px-6 py-10 flex flex-col lg:flex-row gap-8">
                    <SidebarNav />

                    <main className="flex-1 min-w-0 flex flex-col gap-8">
                        {/* Page Content */}
                        {children}
                    </main>
                </div>

                <SiteFooter />
            </div>
        </AuthGuard>
    );
}
