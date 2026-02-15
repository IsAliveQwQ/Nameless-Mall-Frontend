export type OrderStatus = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface OrderVO {
    id: number;
    orderSn: string;
    totalAmount: number;
    payAmount: number;
    discountAmount: number;
    shippingFee: number;
    status: OrderStatus;
    statusName: string;
    payType: number;
    payTypeName: string;
    shippingMethod: number;
    createdAt: string;
    userCouponId?: number;
    failReason?: string;
}

export interface OrderItemVO {
    id: number;
    productId: number;
    variantId: number;
    productVariantName?: string;
    productName: string;
    productImage: string;
    productPrice: number;
    quantity: number;
    // New: Promotion Snapshot Fields
    originalPrice?: number;
    promotionName?: string;
    promotionAmount?: number;
}

export interface ShipmentVO {
    receiverName: string;
    receiverPhone: string;
    receiverAddress: string;
    trackingNumber?: string;
    shippedAt?: string;
}

export interface OrderDetailVO extends OrderVO {
    items: OrderItemVO[];
    shippingMethod: number;
    paymentAccountInfo?: string;
    shipment: ShipmentVO;
    note?: string;
    paidAt?: string;
}

export interface Page<T> {
    records: T[];
    total: number;
    size: number;
    current: number;
}

export interface OrderSubmitInput {
    cartItemIds: number[];
    receiverName: string;
    receiverPhone: string;
    receiverAddress: string;
    payType: number; // 1: LINE Pay, 2: 綠界支付 (ECPay)
    shippingMethod: number; // 1: 宅配, 2: 7-11
    paymentAccountInfo?: string;
    orderToken: string;
    userCouponId?: number;
    note?: string;
}
