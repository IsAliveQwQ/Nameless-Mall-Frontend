import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';

/**
 * Hook: 商品過濾器狀態管理 (基於 URL SearchParams)
 * 嚴格遵循 Next.js 14 App Router 導航規範，支援 SEO 與深層連結
 */
export function useProductFilters() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // 1. 解析當前參數
    const filters = useMemo(() => {
        return {
            categoryId: searchParams.get('categoryId') ? Number(searchParams.get('categoryId')) : undefined,
            keyword: searchParams.get('keyword') || undefined,
            page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
            sort: searchParams.get('sort') || 'newest',
            minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
            maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
        };
    }, [searchParams]);

    /**
     * 更新過濾器參數 (內部處理 URL 平滑導航)
     */
    const setFilters = useCallback((newFilters: Partial<typeof filters>) => {
        const params = new URLSearchParams(searchParams.toString());

        Object.entries(newFilters).forEach(([key, value]) => {
            if (value === undefined || value === null || value === '') {
                params.delete(key);
            } else {
                params.set(key, String(value));
            }
        });

        // 只要變更了篩選條件（非分頁操作），自動重置頁碼回第一頁
        if (!newFilters.page) {
            params.set('page', '1');
        }

        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }, [pathname, router, searchParams]);

    /**
     * 重置所有過濾器
     */
    const clearFilters = useCallback(() => {
        router.push(pathname, { scroll: false });
    }, [pathname, router]);

    return {
        filters,
        setFilters,
        clearFilters,
    };
}
