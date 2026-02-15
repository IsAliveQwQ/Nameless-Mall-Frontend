'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../stores/auth-store';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
    children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const _hasHydrated = useAuthStore((state) => state._hasHydrated);
    const router = useRouter();

    useEffect(() => {
        // 只有當 Hydration 完成後，才進行權限判斷
        if (_hasHydrated && !isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, _hasHydrated, router]);

    // 1. Storage 還在載入中 (Hydrating)
    // 2. Storage 載入完成但未登入 (Redirecting)
    if (!_hasHydrated || !isAuthenticated) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return <>{children}</>;
}
