'use client';

import { BrandName } from '@/components/ui/logo';
import Link from 'next/link';
import { Search, User, ShoppingBag, LayoutGrid, Package2, MapPin, Ticket } from 'lucide-react';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MainNav } from './main-nav';
import { useCartStore } from '@/features/cart/stores/cart-store';
import { useCart } from '@/features/cart/hooks/use-cart';
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { useAuth } from '@/features/auth/hooks/use-auth';

export function SiteHeader() {
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();
    const { setOpen } = useCartStore();
    const { cart } = useCart();
    const totalQuantity = cart?.totalQuantity || 0;

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            router.push(`/products?keyword=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery(''); // 清空搜尋框
        }
    };

    return (
        <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-border/40 supports-[backdrop-filter]:bg-background/80">
            <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between gap-8">
                {/* Left: Brand + Nav */}
                <div className="flex items-center gap-10 shrink-0">
                    <Link href="/" className="flex items-center gap-2 group transition-opacity hover:opacity-80">
                        <BrandName className="text-lg font-bold tracking-tight hidden lg:block" />
                    </Link>

                    <MainNav />
                </div>

                {/* Center: Search Bar - Functional */}
                <div className="hidden md:flex flex-1 max-w-md group">
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-foreground transition-colors" />
                        <input
                            type="text"
                            placeholder="搜尋傢俱、燈具..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-full bg-secondary/50 hover:bg-secondary/80 focus:bg-background text-sm text-foreground rounded-full py-2 pl-10 pr-12 border-none focus:ring-1 focus:ring-foreground transition-all placeholder:text-muted-foreground/70 h-10"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-focus-within:opacity-100 transition-opacity">
                            <span className="text-[10px] text-muted-foreground mr-1 hidden lg:block">按 Enter 搜尋</span>
                            <kbd className="hidden lg:inline-flex items-center justify-center h-5 px-1.5 text-[10px] font-mono font-medium text-muted-foreground bg-background rounded border border-border shadow-sm">↵</kbd>
                        </div>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-3 shrink-0">
                    <AuthButton />

                    {/* Cart Trigger with Dynamic Badge */}
                    <button
                        onClick={() => setOpen(true)}
                        className="relative p-2 text-foreground hover:bg-secondary/50 rounded-full transition-colors group"
                        aria-label="購物車"
                    >
                        <ShoppingBag className="h-6 w-6" />
                        {totalQuantity > 0 && (
                            <span className="absolute top-1 right-1 size-4 bg-destructive text-[10px] font-bold text-white flex items-center justify-center rounded-full border-2 border-background animate-in zoom-in">
                                {totalQuantity > 99 ? '99+' : totalQuantity}
                            </span>
                        )}
                        {totalQuantity === 0 && (
                            <span className="absolute top-1.5 right-1.5 size-2.5 bg-zinc-200 rounded-full border-2 border-background"></span>
                        )}
                    </button>
                </div>
            </div>
        </header>
    );
}

function AuthButton() {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const { logout } = useAuth();

    if (isAuthenticated) {
        return (
            <HoverCard openDelay={0} closeDelay={100}>
                <HoverCardTrigger asChild>
                    <Link
                        href="/profile"
                        className="p-2 text-foreground hover:bg-secondary/50 rounded-full transition-colors relative group block"
                        aria-label="會員中心"
                    >
                        <User className="h-6 w-6 text-primary" />
                    </Link>
                </HoverCardTrigger>
                <HoverCardContent align="center" className="w-[145px] p-2 ring-1 ring-zinc-200 shadow-lg border-none" sideOffset={8}>
                    <div className="flex flex-col gap-1">
                        <Link
                            href="/profile"
                            className="group flex items-center gap-3 px-3 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 rounded-md transition-all active:scale-95"
                        >
                            <LayoutGrid className="size-4 text-zinc-400 group-hover:text-zinc-900 transition-colors" />
                            帳戶總覽
                        </Link>
                        <Link
                            href="/profile/edit"
                            className="group flex items-center gap-3 px-3 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 rounded-md transition-all active:scale-95"
                        >
                            <User className="size-4 text-zinc-400 group-hover:text-zinc-900 transition-colors" />
                            個人資料
                        </Link>
                        <Link
                            href="/profile/orders"
                            className="group flex items-center gap-3 px-3 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 rounded-md transition-all active:scale-95"
                        >
                            <Package2 className="size-4 text-zinc-400 group-hover:text-zinc-900 transition-colors" />
                            訂單紀錄
                        </Link>
                        <Link
                            href="/profile/addresses"
                            className="group flex items-center gap-3 px-3 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 rounded-md transition-all active:scale-95"
                        >
                            <MapPin className="size-4 text-zinc-400 group-hover:text-zinc-900 transition-colors" />
                            地址管理
                        </Link>
                        <Link
                            href="/profile/coupons"
                            className="group flex items-center gap-3 px-3 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 rounded-md transition-all active:scale-95"
                        >
                            <Ticket className="size-4 text-zinc-400 group-hover:text-zinc-900 transition-colors" />
                            我的優惠券
                        </Link>

                        <div className="h-px bg-zinc-100 my-2" />

                        <button
                            onClick={() => logout()}
                            className="group flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-all active:scale-95 w-full text-left"
                        >
                            <div className="size-4 flex items-center justify-center">
                                <div className="size-1.5 rounded-full bg-red-400 group-hover:bg-red-600 transition-colors" />
                            </div>
                            登出
                        </button>
                    </div>
                </HoverCardContent>
            </HoverCard>
        );
    }

    return (
        <Link href="/login" className="p-2 text-foreground hover:bg-secondary/50 rounded-full transition-colors relative group" aria-label="登入帳號">
            <User className="h-6 w-6" />
        </Link>
    );
}
