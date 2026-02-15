import { useQuery } from '@tanstack/react-query';
import { promotionApi } from '@/lib/api/promotion-client';
import { CartItem } from '@/shared/types/cart';

/**
 * 購物車專用的價格計算 Hook (v3.1)
 *
 * 設計原則（Single Source of Truth）：
 * - 後端 cart API 的 enrichWithPricing 已包含完整促銷計算（Flash Sale + Campaign），
 *   回傳 promotionName / discountAmount / originalPrice / promotionType。
 * - 本 Hook 的唯一職責：疊加「即時 Flash Sale 覆蓋層」。
 *   當閃購場次在頁面停留期間啟動或結束時，價格能即時反映，不需等待 cart refetch。
 * - 促銷名稱一律由後端 / API 決定，前端不硬編碼任何活動名稱。
 *
 * Priority: Flash Sale Overlay (即時) > Backend Cart Data (enrichWithPricing)
 */
export function useCartPriceCalculation(items: CartItem[] = []) {

    // 查詢當前 Flash Sale Session（與詳情頁完全一致）
    const { data: flashSale, isLoading: isFlashSaleLoading } = useQuery({
        queryKey: ['flash-sale-current'],
        queryFn: () => promotionApi.getCurrentFlashSaleSession(),
        staleTime: 60000, // 1 分鐘快取
    });

    // 一般活動/特賣活動皆透過後端計價 API 動態重算，避免依賴舊快照
    const priceCheckItems = items.map(item => ({
        productId: item.productId,
        variantId: item.variantId,
        categoryId: item.categoryId,
        originalPrice: item.originalPrice ?? item.price,
    }));

    const { data: dynamicPrices } = useQuery({
        queryKey: ['cart-price-calculate', priceCheckItems],
        queryFn: () => promotionApi.calculatePrices(priceCheckItems),
        enabled: priceCheckItems.length > 0,
        staleTime: 30000,
    });

    const dynamicPriceMap = new Map((dynamicPrices || [])
        .filter(p => p.variantId !== undefined && p.variantId !== null)
        .map(p => [p.variantId as number, p]));

    // 合併邏輯：Flash Sale 覆蓋 > 後端 Cart 資料
    const calculatedItems = items.map(item => {
        // Priority 1: 檢查是否命中當前 Flash Sale session（即時覆蓋層）
        const flashSaleItem = flashSale?.products?.find(p =>
            p.productId === item.productId &&
            p.variantId === item.variantId
        );

        const isFlashSaleActive = !!flashSaleItem && flashSaleItem.stockStatus !== '售罄';

        if (isFlashSaleActive && flashSaleItem) {
            const flashPrice = flashSaleItem.flashPrice ?? flashSaleItem.flashSalePrice ?? item.price;
            const originalPrice = flashSaleItem.originalPrice ?? item.originalPrice ?? item.price;
            const flashPromotionName = item.promotionType === 'FLASH_SALE' && item.promotionName
                ? item.promotionName
                : (flashSale?.name || item.promotionName);

            return {
                ...item,
                originalPrice: originalPrice,
                price: flashPrice,
                // 活動名稱只取自後端計價結果或當前場次 API，不使用硬編碼
                promotionName: flashPromotionName,
                promotionType: 'FLASH_SALE',
                isDiscounted: flashPrice < originalPrice,
                discountAmount: Math.max(0, originalPrice - flashPrice)
            };
        }

        // Priority 2: 使用促銷計價 API 動態結果（支援一般活動與特賣）
        const dynamic = dynamicPriceMap.get(item.variantId);
        if (dynamic && dynamic.finalPrice !== undefined && dynamic.finalPrice !== null) {
            const originalPrice = dynamic.originalPrice ?? item.originalPrice ?? item.price;
            const finalPrice = dynamic.finalPrice;
            return {
                ...item,
                originalPrice,
                price: finalPrice,
                promotionName: dynamic.promotionName,
                promotionType: dynamic.promotionType,
                discountAmount: Math.max(0, originalPrice - finalPrice)
            };
        }

        // Priority 3: fallback 到 cart 快照
        return item;
    });

    const totalAmount = calculatedItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const totalDiscount = calculatedItems.reduce((acc, item) => acc + ((item.discountAmount || 0) * item.quantity), 0);

    return {
        calculatedItems,
        totalAmount,
        totalDiscount,
        isLoading: isFlashSaleLoading
    };
}
