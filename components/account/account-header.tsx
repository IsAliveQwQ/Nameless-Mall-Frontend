'use client';

import { useUser } from '@/features/user/hooks/use-user';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Fingerprint } from 'lucide-react';

export function AccountHeader() {
    const { user, isLoading } = useUser();
    const pathname = usePathname();
    const isEditPage = pathname === '/profile/edit';

    if (isLoading) {
        return <AccountHeaderSkeleton />;
    }

    const displayUser = {
        name: user?.nickname || user?.username || "NAMELSS Member",
        email: user?.email || "尚未綁定信箱",
        id: user?.id?.toString() || "---",
        avatar: user?.avatar || "https://placehold.co/150x150/e2e8f0/475569.svg?text=U",
        memberStatus: "PRO MEMBER", // Mock status
        since: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "---",
    };

    return (
        <div className="relative overflow-hidden bg-white border border-zinc-200/50 rounded-xl px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-8 shadow-[0_1px_3px_rgba(0,0,0,0.05)] w-full transition-all duration-500 hover:shadow-[0_4px_20px_-5px_rgba(0,0,0,0.05)] group/card">
            {/* Subtle Gradient Decor */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-zinc-50 to-transparent -mr-24 -mt-24 rounded-full opacity-40 pointer-events-none group-hover/card:scale-125 transition-transform duration-1000" />

            <div className="flex items-center gap-6 w-full relative z-10">
                {/* Avatar - More Compact */}
                <div className="relative group/avatar shrink-0">
                    <div className="size-20 rounded-full bg-zinc-50 ring-1 ring-zinc-100 p-1.5 overflow-hidden transition-all duration-500 group-hover/card:ring-zinc-900/5">
                        <img
                            alt="Profile"
                            className="w-full h-full object-cover rounded-full grayscale contrast-[1.1] transition-all duration-700 group-hover/avatar:grayscale-0 group-hover/avatar:scale-105"
                            src={displayUser.avatar}
                        />
                    </div>
                </div>

                {/* User Info - More Compressed but Elegant */}
                <div className="flex flex-col gap-2 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight leading-none">
                            {displayUser.name}
                        </h1>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-zinc-900 text-white uppercase tracking-[0.2em]">
                            {displayUser.memberStatus}
                        </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                        <div className="flex items-center gap-1.5 group/uid">
                            <Fingerprint className="size-3.5 text-zinc-300 group-hover/uid:text-zinc-900 transition-colors" />
                            <span className="text-[12px] font-mono text-zinc-400 font-medium tracking-tight">
                                UID: <span className="text-zinc-600 transition-colors group-hover/uid:text-zinc-900">{displayUser.id}</span>
                            </span>
                        </div>
                        <div className="hidden sm:block w-px h-3 bg-zinc-200"></div>
                        <div className="text-[10px] font-bold text-zinc-300 uppercase tracking-[0.15em] flex items-center gap-2">
                            MEMBER SINCE <span className="text-zinc-500 font-mono tracking-normal">{displayUser.since}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Area - Refined Button */}
            {!isEditPage && (
                <div className="shrink-0 pt-6 md:pt-0 border-t md:border-t-0 border-zinc-50 w-full md:w-auto relative z-10">
                    <Link
                        href="/profile/edit"
                        className="inline-flex items-center justify-center text-xs font-bold text-zinc-500 border border-zinc-200 rounded-full px-8 py-2.5 transition-all duration-300 hover:border-zinc-900 hover:text-zinc-900 active:scale-95 min-w-[140px]"
                    >
                        編輯個人資料
                    </Link>
                </div>
            )}
        </div>
    );
}

function AccountHeaderSkeleton() {
    return (
        <div className="bg-white border border-[#E4E4E7] rounded-[6px] p-8 flex items-center gap-6 w-full">
            <div className="size-20 rounded-full bg-zinc-100 animate-pulse shrink-0" />
            <div className="flex flex-col gap-3 w-full">
                <div className="h-7 bg-zinc-100 rounded w-48 animate-pulse" />
                <div className="h-4 bg-zinc-100 rounded w-64 animate-pulse" />
            </div>
        </div>
    );
}
