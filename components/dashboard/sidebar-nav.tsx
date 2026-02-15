'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutGrid, User, Package2, MapPin, Ticket } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/use-auth';

const NAV_ITEMS = [
    { icon: LayoutGrid, label: "帳戶總覽", href: "/profile" },
    { icon: User, label: "個人資料", href: "/profile/edit" },
    { icon: Package2, label: "訂單紀錄", href: "/profile/orders" },
    { icon: MapPin, label: "地址管理", href: "/profile/addresses" },
    { icon: Ticket, label: "我的優惠券", href: "/profile/coupons" },
];

export function SidebarNav() {
    const pathname = usePathname();
    const { logout } = useAuth();

    return (
        <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="sticky top-24">
                <h3 className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest mb-6 px-4">My Account</h3>
                <nav className="flex flex-col space-y-1">
                    {NAV_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all rounded-r-md border-l-2",
                                    isActive
                                        ? "text-zinc-900 bg-white border-zinc-900 shadow-sm font-bold"
                                        : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 border-transparent"
                                )}
                            >
                                <Icon className={cn("size-[18px]", isActive ? "text-zinc-900" : "text-zinc-400 group-hover:text-zinc-900")} />
                                <span className={isActive ? "font-bold" : "font-medium"}>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* 分隔線：左右擴大邊距 mx-16，維持加深顏色與原有總間距 */}
                <div className="mt-6 ml-4 w-24 h-px bg-zinc-200/80" />

                <div className="mt-6 px-4">
                    <h3 className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest mb-4">Support</h3>
                    <div className="flex flex-col space-y-1">
                        <Link
                            href="/help"
                            className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors py-1 w-full text-left"
                        >
                            <span>幫助中心</span>
                        </Link>
                        <button
                            onClick={() => logout()}
                            className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-red-600 transition-colors py-1 w-full text-left group"
                        >
                            <span className="group-hover:text-red-600">登出</span>
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    );
}
