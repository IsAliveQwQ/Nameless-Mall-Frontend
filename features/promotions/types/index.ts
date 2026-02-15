export interface FlashSaleProductVO {
    id: number; // skuId/id
    productId: number;
    variantId: number; // Added to match backend
    name: string;
    imageUrl: string; // Backend sends imageUrl
    originalPrice: number;
    flashPrice: number; // Added to match backend
    discountLabel: string; // Added to match backend
    stockStatus: string; // Added to match backend

    // Legacy fields for backward compatibility if needed, though backend removed them
    // Keeping loosely to avoid breakages if other components use them
    image?: string;
    flashSalePrice?: number;
    discountRateDisplay?: string;
    stockStatusText?: string;
    soldPercentage?: number;
}

export interface FlashSaleSessionVO {
    id: number;
    name: string;
    startTime: string;
    endTime: string;
    statusText: string;
    bannerImage?: string; // Mapped from backend
    countdownSeconds: number;
    products: FlashSaleProductVO[];
}

export interface MarketingCampaignVO {
    id: number;
    title: string;
    description: string;
    period: string; // "2024.11.15 — 2024.12.31"
    code: string; // "winter-24"
    status: 'ONGOING' | 'ENDING_SOON' | 'UPCOMING' | 'ENDED';
    imageUrl: string;
    type?: string;
    displayOrder: number;
    categoryId?: number;
    discountRate?: number;
}

export interface ProductPriceCheckDTO {
    productId: number;
    categoryId?: number;
    variantId?: number; // Optional
    originalPrice: number;
}

export interface ProductPriceResultDTO {
    productId: number;
    variantId?: number;
    originalPrice: number;
    finalPrice: number;
    promotionName?: string;
    promotionType?: string;
    description?: string;
}
