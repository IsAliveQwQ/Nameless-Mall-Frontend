import api from '@/lib/api/client';
import { FlashSaleSessionVO } from '@/features/promotions/types';

export const promotionApi = {
    // 獲取當前秒殺場次
    getCurrentFlashSaleSession: () => {
        return api.get<FlashSaleSessionVO>('/promotions/flash-sales/current');
    },

    // 獲取所有行銷活動
    getCampaigns: () => {
        return api.get<import('@/features/promotions/types').MarketingCampaignVO[]>('/promotions/campaigns');
    },

    // 根據 Code 獲取單個活動
    getCampaignByCode: (code: string) => {
        return api.get<import('@/features/promotions/types').MarketingCampaignVO>(`/promotions/campaigns/${code}`);
    },

    // 計算商品最佳價格 (支援批量)
    calculatePrices: (items: import('@/features/promotions/types').ProductPriceCheckDTO[]) => {
        return api.post<import('@/features/promotions/types').ProductPriceResultDTO[]>('/promotions/price/calculate', items);
    }
};
