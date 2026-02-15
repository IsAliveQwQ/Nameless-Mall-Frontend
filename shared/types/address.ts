export interface Address {
    id: number;
    userId: number;
    receiverName: string;
    receiverPhone: string;
    city: string;
    district: string;
    detailAddress: string;
    postalCode?: string;
    isDefault: number; // 0 or 1
    tag?: string;
    createdAt?: string;
}

export interface AddressInput {
    receiverName: string;
    receiverPhone: string;
    city: string;
    district: string;
    detailAddress: string;
    isDefault: number; // 0 or 1
}
