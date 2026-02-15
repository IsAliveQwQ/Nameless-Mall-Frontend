'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        // 預設緩存時間
                        staleTime: 60 * 1000, // 1 分鐘內不重新 fetch
                        retry: 1, // 失敗重試 1 次
                        refetchOnWindowFocus: false, // 切換視窗不重抓 (減少請求)
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            {/* DevTools 僅在開發環境顯示，生產環境會自動移除 */}
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
}
