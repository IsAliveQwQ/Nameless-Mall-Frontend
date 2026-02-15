'use client';

import { useUser } from '@/features/user/hooks/use-user';
import Link from 'next/link';

export function DashboardHeader() {
    const { user, isLoading } = useUser();

    if (isLoading) {
        return <DashboardHeaderSkeleton />;
    }

    const displayUser = {
        name: user?.nickname || user?.username || "NAMELSS Member",
        email: user?.email || "尚未綁定信箱",
        id: user?.id?.toString() || "---",
        avatar: user?.avatar || "https://placehold.co/150x150/e2e8f0/475569.svg?text=U" // 預設頭像
    };

    return (
        <div className="w-full p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 bg-white border border-slate-200/60 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
            <div
                className="size-20 rounded-full bg-slate-100 overflow-hidden border border-slate-100 flex-shrink-0 bg-cover bg-center shadow-inner relative"
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={displayUser.avatar}
                    alt={displayUser.name}
                    className="w-full h-full object-cover"
                />
            </div>

            <div className="flex-1 text-center sm:text-left">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">歡迎回來，{displayUser.name}。</h2>
                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 mt-2 text-slate-500 text-sm font-medium">
                    <span>{displayUser.email}</span>
                    <span className="hidden sm:inline w-px h-3 bg-slate-300"></span>
                    <span className="font-mono text-slate-400">UID: {displayUser.id}</span>
                </div>
            </div>

            <div className="flex-shrink-0 pt-1">
                <Link
                    href="/profile/edit"
                    className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded px-5 py-2 transition-colors bg-white hover:bg-slate-50 hover:border-slate-300"
                >
                    編輯個人資料
                </Link>
            </div>
        </div>
    );
}

function DashboardHeaderSkeleton() {
    return (
        <div className="w-full p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 bg-white border border-slate-200/60 rounded-lg shadow-sm">
            <div className="size-20 rounded-full bg-slate-100 animate-pulse flex-shrink-0" />
            <div className="flex-1 text-center sm:text-left space-y-3">
                <div className="h-8 bg-slate-100 rounded w-48 mx-auto sm:mx-0 animate-pulse" />
                <div className="h-4 bg-slate-100 rounded w-32 mx-auto sm:mx-0 animate-pulse" />
            </div>
        </div>
    );
}
