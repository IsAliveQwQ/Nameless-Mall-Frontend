import api from '@/lib/api/client';
import { PageResult } from '@/shared/types/api';

import { ApplicableCouponVO, CouponCardVO, UserCouponDTO, CouponCalculationResult } from '@/features/coupons/types';


export const couponApi = {
    // 獲取首頁優惠券卡片列表
    getAvailableCards: () => {
        return api.get<CouponCardVO[]>('/coupons/cards');
    },

    // 領取優惠券
    claimCoupon: (templateId: number) => {
        return api.post<void>(`/coupons/${templateId}/claim`);
    },

    // 獲取我的優惠券
    getMyCoupons: (page = 1, size = 10) => {
        return api.get<PageResult<UserCouponDTO>>('/coupons/my', {
            params: { pageNum: page, pageSize: size }
        });
    },

    // 取得結帳可用優惠券
    getApplicableCoupons: (amount: number) => {
        // 使用 POST 傳遞 DTO，對應後端 CouponController.getApplicableCoupons
        return api.post<ApplicableCouponVO[]>('/coupons/applicable', {
            orderTotalAmount: amount,
            // userId 會由後端從 Context 獲取，無需傳遞
        });
    },

    // 試算優惠券折扣 (後端驅動)
    calculateDiscount: (userCouponId: number, amount: number) => {
        return api.post<CouponCalculationResult>('/coupons/internal/calculate', {
            userCouponId,
            orderTotalAmount: amount,
            shippingFee: 100 // 暫時固定，後續應從 checkout state 傳入
        });
    }
};
