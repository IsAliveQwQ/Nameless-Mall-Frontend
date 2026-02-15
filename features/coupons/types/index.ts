export interface CouponCardVO {
    id: number;
    templateId: number;
    name: string;
    description: string;
    amountDisplay: string;
    thresholdDisplay: string;
    statusText: string;
    isClaimable: boolean;
    progress: number;
    validityPeriod: string;
    endTime: string;
}

export enum CouponType {
    CASH = 1,
    DISCOUNT = 2,
    FREE_SHIPPING = 3
}

export interface UserCouponDTO {
    id: number;
    userId: number;
    templateId: number;
    couponName: string;
    type: CouponType; // 1=cash, 2=discount, 3=free_shipping
    threshold: number;
    discount: number;
    status: number; // 0=unused, 1=used, 2=expired

    // Backend API fields
    expireTime?: string;
    createdAt?: string;
    usedAt?: string;
    orderSn?: string;

    // Legacy fields (optional if still used elsewhere)
    validStartTime?: string;
    validEndTime?: string;
}

export interface ApplicableCouponVO {
    id: number;
    templateId: number;
    couponName: string;
    type: CouponType;
    threshold: number;
    value: number; // Discount Value (e.g. 100 or 0.9)
    startTime: string;
    endTime: string;
    usable: boolean;
    reason?: string;
    estimatedDiscount?: number;
}

export interface CouponCalculationResult {
    discountAmount: number;
    couponName: string;
    couponType: CouponType;
    finalAmount: number;
}
