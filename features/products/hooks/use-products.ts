import { useQuery, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { productService } from '../api/product-service';
import { Product, SearchResponse } from '@/shared/types/product';

/**
 * 商品模組查詢鍵名 (Query Keys)
 */
export const productKeys = {
    all: ['products'] as const,
    lists: () => [...productKeys.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...productKeys.lists(), filters] as const,
    details: () => [...productKeys.all, 'detail'] as const,
    detail: (id: number) => [...productKeys.details(), id] as const,
    categories: ['categories'] as const,
};

/**
 * Hook: 獲取分類樹
 */
export function useCategories() {
    return useQuery({
        queryKey: productKeys.categories,
        queryFn: () => productService.getCategoryTree(),
        staleTime: 1000 * 60 * 60, // 1 小時 (分類不常變動)
    });
}

/**
 * Hook: 獲取商品列表 (專業搜尋版)
 */
export function useSearchProducts(params: {
    categoryId?: number;
    keyword?: string;
    tag?: string;      // 新增標籤支持
    page?: number;
    size?: number;
    sort?: string;
    minPrice?: number;
    maxPrice?: number;
    brand?: string;
    attrs?: string;
}) {
    return useQuery<SearchResponse>({
        queryKey: productKeys.list(params),
        queryFn: () => productService.searchProducts(params),
        // [Performance] 側邊欄切換時保留舊數據，避免畫面閃爍
        placeholderData: (previousData) => previousData,
    });
}

/**
 * Hook: 無限加載商品列表 (用於首頁或瀑布流)
 */
export function useInfiniteProducts(params: { categoryId?: number; size?: number }) {
    return useInfiniteQuery({
        queryKey: [...productKeys.lists(), 'infinite', params],
        queryFn: ({ pageParam = 1 }) =>
            productService.searchProducts({ ...params, page: pageParam as number }),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            const { pageNum, totalPages } = lastPage;
            return pageNum < totalPages ? pageNum + 1 : undefined;
        },
    });
}

/**
 * Hook: 獲取商品詳情
 */
export function useProductDetail(id: number) {
    return useQuery({
        queryKey: productKeys.detail(id),
        queryFn: () => productService.getProductDetail(id),
        enabled: !!id,
        staleTime: 1000 * 60 * 5, // 5 分鐘
    });
}

/**
 * Prefetch: 預載商品詳情
 * 用於懸停在商品卡片上時，提升「零延遲」感知
 */
export function usePrefetchProduct() {
    const queryClient = useQueryClient();

    const prefetch = (id: number) => {
        queryClient.prefetchQuery({
            queryKey: productKeys.detail(id),
            queryFn: () => productService.getProductDetail(id),
            staleTime: 1000 * 60 * 5,
        });
    };

    return { prefetch };
}
